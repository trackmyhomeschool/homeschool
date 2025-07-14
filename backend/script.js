const fs = require('fs');
const mongoose = require('mongoose');
const HomeschoolResource = require('./models/HomeschoolResource'); // Your Mongoose model

const MONGODB_URI = 'mongodb://localhost:27017/trackmyhomeschool'; // Update if needed

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Load and parse the resource data
    const rawData = fs.readFileSync('resources.json', 'utf-8');
    const resources = JSON.parse(rawData);

    // Normalize data for consistent schema
    const normalized = resources.map(r => {
      let lat = null, lng = null;
      if (r.location && r.location.lat && r.location.lng) {
        lat = r.location.lat;
        lng = r.location.lng;
      } else if (r.lat && r.lng) {
        lat = r.lat;
        lng = r.lng;
      }

      // Pick and clean the fields you care about
      return {
        title: r.title || null,
        address: r.address || null,
        city: r.city || null,
        state: r.state || null,
        postalCode: r.postalCode || null,
        website: r.website || null,
        phone: r.phone || null,
        categoryName: r.categoryName || null,
        location: { lat, lng },
        imageUrl: r.imageUrl || null,
        totalScore: r.totalScore || null,
        reviewsCount: r.reviewsCount || 0,
        openingHours: r.openingHours || [],
        url: r.url || null,
        // Add any other fields you want here
      };
    });

    // Remove all previous resources (optional)
    await HomeschoolResource.deleteMany({});

    // Insert normalized data
    await HomeschoolResource.insertMany(normalized);
    console.log(`Imported ${normalized.length} resources successfully!`);
  } catch (err) {
    console.error('Error importing resources:', err);
  } finally {
    mongoose.disconnect();
  }
}

main();