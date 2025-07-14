import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaCalendarAlt, FaDollarSign, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

// Modal for selecting subscription
function PlanModal({ open, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.22)", zIndex: 1002, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, minWidth: 310, maxWidth: 350, boxShadow: "0 2px 28px rgba(36,88,40,0.12)",
        padding: 28, position: "relative", textAlign: "center"
      }}>
        <FaTimesCircle
          onClick={onClose}
          style={{
            position: "absolute", top: 11, right: 13, color: "#aaa", fontSize: 19, cursor: "pointer"
          }}
          title="Close"
        />
        <h3 style={{ color: "#21884f", fontWeight: 700, fontSize: 19, margin: "0 0 10px" }}>Choose Your Subscription</h3>
        <p style={{ color: "#555", fontSize: 14, margin: 0, marginBottom: 20 }}>
          Your first 4 days are <b>free</b>. Cancel anytime.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <button
            onClick={() => onSelect("monthly")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 11, background: "#20a35e", color: "#fff", fontWeight: 600,
              fontSize: 16, border: "none", borderRadius: 8, padding: "13px 0", cursor: "pointer",
              boxShadow: "0 2px 5px rgba(32,163,94,0.07)"
            }}
          >
            <FaDollarSign /> $2.99 <span style={{
              background: "#fff3",
              color: "#e4fff3",
              fontWeight: 400,
              fontSize: 14,
              borderRadius: 4,
              marginLeft: 5,
              padding: "2px 6px"
            }}>per month</span>
          </button>
          <button
            onClick={() => onSelect("yearly")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 11, background: "#e5f8ee", color: "#20a35e", fontWeight: 600,
              fontSize: 16, border: "none", borderRadius: 8, padding: "13px 0", cursor: "pointer"
            }}
          >
            <FaDollarSign /> $20 <span style={{
              background: "#c5edd9",
              color: "#21884f",
              fontWeight: 400,
              fontSize: 14,
              borderRadius: 4,
              marginLeft: 5,
              padding: "2px 6px"
            }}>per year</span>
          </button>
        </div>
        <div style={{ marginTop: 19, color: "#888", fontSize: 12 }}>
          After 4 days, you'll be billed automatically unless you cancel.
        </div>
      </div>
    </div>
  );
}

// Modal for cancel subscription
function CancelModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.23)", zIndex: 1003, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, minWidth: 330, maxWidth: 390,
        boxShadow: "0 2px 28px rgba(36,88,40,0.13)",
        padding: 32, position: "relative", textAlign: "center"
      }}>
        <FaTimesCircle
          onClick={onClose}
          style={{
            position: "absolute", top: 13, right: 17, color: "#aaa", fontSize: 22, cursor: "pointer"
          }}
          title="Close"
        />
        <h3 style={{ color: "#c0392b", fontWeight: 700, fontSize: 20, margin: "0 0 12px" }}>
          Cancel Subscription
        </h3>
        <p style={{ color: "#444", fontSize: 15, marginBottom: 21 }}>
          Are you sure you want to cancel your premium subscription? <br />
          You will keep your benefits until the current period ends.
        </p>
        <button
          onClick={onConfirm}
          style={{
            background: "#c0392b", color: "#fff", fontWeight: 700,
            fontSize: 16, border: "none", borderRadius: 8, padding: "12px 34px", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
          disabled={loading}
        >
          {loading ? "Cancelling..." : "Yes, Cancel Subscription"}
        </button>
        <div style={{ marginTop: 13 }}>
          <button
            onClick={onClose}
            style={{
              background: "#eee", color: "#888", fontWeight: 500,
              fontSize: 14, border: "none", borderRadius: 7, padding: "8px 20px", marginTop: 5, cursor: "pointer"
            }}
          >
            No, Keep Premium
          </button>
        </div>
      </div>
    </div>
  );
}

const getStatus = (user) => {
  if (!user) return { status: "loading" };
  const now = new Date();
  if (user.isSubscribed && user.subscriptionStatus === "active" && user.cancelAtPeriodEnd) {
    // Canceled but still premium until end of period
    return {
      status: "canceled",
      until: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null,
    };
  }
  if (user.isSubscribed && user.subscriptionStatus === "active") {
    return {
      status: "subscribed",
      until: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null,
    };
  }
  if (user.isSubscribed && user.subscriptionStatus === "canceled") {
    return {
      status: "canceled",
      until: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null,
    };
  }
  if (user.trialEndsAt) {
    const trialEnds = new Date(user.trialEndsAt);
    if (now < trialEnds) {
      return { status: "trial", until: trialEnds };
    }
    return { status: "trial_expired", until: trialEnds };
  }
  return { status: "not_started" };
};

const UpgradePremiumPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const { status, until } = getStatus(user);

  const startTrial = async () => {
    setTrialLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/start-trial`, {}, { withCredentials: true });
      await fetchUser();
    } catch (err) {
      alert("Could not start trial. " + (err.response?.data?.message || ""));
    }
    setTrialLoading(false);
  };

  const cancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/cancel-subscription`, {}, { withCredentials: true });
      await fetchUser();
      setCancelModal(false);
    } catch (err) {
      alert("Could not cancel subscription. " + (err.response?.data?.message || ""));
      setCancelModal(false);
    }
    setCancelLoading(false);
  };

  const formatDate = (d) =>
    d
      ? d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const premiumBenefits = [
    "Unlimited students and courses",
    "Advanced reporting and transcript generation",
    "Curriculum planning tools",
    "State requirement compliance tracking",
    "Email and priority support",
  ];

  let title = "";
  let desc = "";
  let note = "";
  let dateBox = null;
  let actions = [];

  if (loading || status === "loading") {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", marginTop: 100, fontSize: 18 }}>
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (status === "subscribed") {
    title = "Premium Subscription Active!";
    desc = "You have full access to all premium features.";
    note = until
      ? `Your subscription will end on ${formatDate(until)}.`
      : "Your subscription is active.";
    dateBox = until ? (
      <div className="trial-date-box">
        <FaCalendarAlt style={{ marginRight: 8, color: "#237ee6" }} />
        Your subscription will end on <b>{formatDate(until)}</b>
      </div>
    ) : null;
    actions = [
      <button
        key="dashboard"
        className="btn btn-primary"
        onClick={() => navigate("/dashboard")}
      >
        Go to Dashboard
      </button>,
      <button
        key="cancel"
        className="btn btn-outline"
        style={{ marginLeft: 10, border: '1.3px solid #e74c3c', color: '#e74c3c', fontWeight: 600 }}
        onClick={() => setCancelModal(true)}
      >
        Cancel Subscription
      </button>,
      <CancelModal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={cancelSubscription}
        loading={cancelLoading}
      />
    ];
  } else if (status === "canceled") {
    title = "Subscription Cancelled";
    desc = "You have cancelled your premium subscription. You will lose premium access after the date below.";
    note = "You will not be charged again.";
    dateBox = until ? (
      <div className="trial-date-box" style={{ color: "#e74c3c" }}>
        <FaCalendarAlt style={{ marginRight: 8 }} />
        You can use premium features until <b>{formatDate(until)}</b>
      </div>
    ) : null;
    actions = [
      <button
        key="dashboard"
        className="btn btn-primary"
        onClick={() => navigate("/dashboard")}
      >
        Go to Dashboard
      </button>
    ];
  } else if (status === "not_started") {
    // User never started trial
    title = "Start Your Free Trial";
    desc = "Try all premium features free for 4 days, no credit card needed!";
    actions = [
      <button
        key="trial"
        className="btn btn-primary"
        disabled={trialLoading}
        onClick={startTrial}
        style={{ minWidth: 165 }}
      >
        {trialLoading ? "Activating..." : "Start Free Trial"}
      </button>,
    ];
  } else if (status === "trial") {
    title = "Free Trial Activated!";
    desc = "Your free trial is now active. You have access to all premium features for a limited period.";
    note = "After your trial ends, you'll be asked to subscribe.";
    dateBox = (
      <div className="trial-date-box">
        <FaCalendarAlt style={{ marginRight: 8, color: "#237ee6" }} />
        Your trial will end on <b>{formatDate(until)}</b>
      </div>
    );
    actions = [
      <button
        key="dashboard"
        className="btn btn-primary"
        onClick={() => navigate("/dashboard")}
      >
        Go to Dashboard
      </button>,
    ];
  } else {
    // trial_expired
    title = "Your Trial Ended";
    desc = "Your free trial has expired. To continue using premium features, please subscribe.";
    dateBox = (
      <div className="trial-date-box" style={{ color: "#e74c3c" }}>
        <FaCalendarAlt style={{ marginRight: 8 }} />
        Your trial ended on <b>{formatDate(until)}</b>
      </div>
    );
    actions = [
      <button
        key="buy"
        className="btn btn-primary"
        style={{ minWidth: 165 }}
        onClick={() => setModalOpen(true)}
      >
        Buy Subscription
      </button>,
      <PlanModal
        key="modal"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={async (plan) => {
          setModalOpen(false);
          try {
            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/payments/create-checkout-session`,
              { plan },
              { withCredentials: true }
            );
            window.location.href = res.data.url;
          } catch (err) {
            alert("Payment setup failed. Please try again.");
          }
        }}
      />
    ];
  }

  return (
    <DashboardLayout>
      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8f9fc",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #b2e8cc",
            borderRadius: 12,
            boxShadow: "0 3px 16px 0 rgba(45,90,45,0.07)",
            padding: 36,
            maxWidth: 440,
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <FaCheckCircle
              color="#44c878"
              size={46}
              style={{ marginBottom: 8 }}
            />
            <h2
              style={{
                color: "#20a35e",
                fontWeight: 700,
                margin: 0,
                marginBottom: 6,
                fontSize: 24,
              }}
            >
              {title}
            </h2>
            <div style={{ color: "#626e77", fontSize: 16, marginBottom: 8 }}>
              {desc}
            </div>
            {dateBox}
            <div
              style={{
                color: "#749e83",
                fontSize: 13,
                marginTop: dateBox ? 10 : 0,
                marginBottom: 10,
              }}
            >
              {note}
            </div>
          </div>

          <div
            style={{
              background: "#f5fff9",
              border: "1px solid #c5edd9",
              borderRadius: 7,
              padding: "15px 16px",
              marginBottom: 22,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Your Premium Benefits:
            </div>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              {premiumBenefits.map((b, i) => (
                <li key={i} style={{ fontSize: 14, marginBottom: 3 }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            {actions}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpgradePremiumPage;
