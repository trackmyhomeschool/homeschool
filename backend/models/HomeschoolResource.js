const mongoose = require("mongoose");

const OpeningHourSchema = new mongoose.Schema({
  day: String,
  hours: String,
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
}, { _id: false });

const HomeschoolResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, default: null },
  categoryName: String,
  address: String,
  neighborhood: String,
  street: String,
  city: String,
  postalCode: String,
  state: String,
  countryCode: String,
  website: String,
  phone: String,
  phoneUnformatted: String,
  claimThisBusiness: Boolean,
  location: LocationSchema,
  totalScore: Number,
  permanentlyClosed: Boolean,
  temporarilyClosed: Boolean,
  placeId: String,
  categories: [String],
  fid: String,
  cid: String,
  reviewsCount: Number,
  imagesCount: Number,
  imageCategories: [String],
  scrapedAt: Date,
  openingHours: [OpeningHourSchema],
  peopleAlsoSearch: [String],
  placesTags: [String],
  reviewsTags: [String],
  additionalInfo: mongoose.Schema.Types.Mixed,
  gasPrices: [mongoose.Schema.Types.Mixed],
  url: String,
  searchPageUrl: String,
  searchString: String,
  language: String,
  rank: Number,
  isAdvertisement: Boolean,
  imageUrl: String,
  kgmid: String,
});

module.exports = mongoose.model("HomeschoolResource", HomeschoolResourceSchema);
