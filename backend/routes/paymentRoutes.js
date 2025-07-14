require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

// Stripe Checkout session
router.post('/create-checkout-session', protect, async (req, res) => {
  const { plan } = req.body;
  let priceId = "";
  if (plan === "monthly") priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
  else if (plan === "yearly") priceId = process.env.STRIPE_PRICE_ID_YEARLY;
  else return res.status(400).json({ error: "Invalid plan" });

  try {
    console.log(`[Stripe Checkout] Creating session for user ${req.user.email}, plan: ${plan}, priceId: ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.user.email,
      allow_promotion_codes: true,
      success_url: `${process.env.FRONTEND_URL}/upgrade?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/upgrade?canceled=1`,
      metadata: { userId: req.user._id.toString() },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout Error]', err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel subscription (user-initiated)
router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.subscriptionId) {
      return res.status(400).json({ message: "No active subscription found." });
    }

    // Cancel at period end (user keeps premium until then)
    const canceled = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    });

    // Update locally
    user.subscriptionStatus = canceled.status; // should still be "active"
    user.cancelAtPeriodEnd = true; // <-- Set this
    await user.save();

    res.json({ message: "Subscription will be canceled at the end of the period." });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});

// Stripe Webhook handler: export as function
const webhookHandler = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`[Stripe Webhook] Event received: ${event.type}`);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const subscriptionId = session.subscription;
      let subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("[Webhook] Retrieved subscription:", subscription.id, "status:", subscription.status);
      } catch (err) {
        console.warn("[Webhook] Could not retrieve subscription:", subscriptionId, err.message);
      }

      await User.findByIdAndUpdate(userId, {
        isSubscribed: true,
        subscriptionStatus: subscription?.status || 'active',
        subscriptionId,
        subscriptionEndsAt: subscription?.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false // <-- Set this!
      });
      console.log(`[Webhook] User ${userId} set to subscribed!`);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const status = subscription.status;
      const subscriptionId = subscription.id;
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;
      console.log(`[Webhook] Subscription ${subscriptionId} updated. New status: ${status}, cancel_at_period_end: ${cancelAtPeriodEnd}`);
      await User.findOneAndUpdate(
        { subscriptionId },
        {
          subscriptionStatus: status,
          subscriptionEndsAt: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,
          cancelAtPeriodEnd: cancelAtPeriodEnd // <-- Set this!
        }
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook Handler Error]', err);
    res.status(500).json({ message: 'Webhook handler error' });
  }
};

module.exports = router;
module.exports.webhookHandler = webhookHandler;
