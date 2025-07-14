const HomeschoolResource = require('../models/HomeschoolResource');

// Normalize a resource object
function normalizeResource(r) {
  let lat, lng;
  if (r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number') {
    lat = r.location.lat;
    lng = r.location.lng;
  } else if (typeof r.lat === 'number' && typeof r.lng === 'number') {
    lat = r.lat;
    lng = r.lng;
  }
  return {
    ...r,
    location: { lat, lng },
    state: r.state || null,
    city: r.city || null,
    address: r.address || null,
    title: r.title || null,
    website: r.website || null,
  };
}

// GET /api/homeschoolresources
exports.getAll = async (req, res) => {
  const resources = await HomeschoolResource.find().sort({ title: 1 });
  res.json(resources);
};

// POST /api/homeschoolresources
exports.create = async (req, res) => {
  const data = normalizeResource(req.body);
  const resource = await HomeschoolResource.create(data);
  res.status(201).json(resource);
};

// POST /api/homeschoolresources/bulk
exports.bulkCreate = async (req, res) => {
  let input = Array.isArray(req.body) ? req.body : [req.body];
  const normalized = input.map(normalizeResource);
  await HomeschoolResource.insertMany(normalized);
  res.json({ success: true, count: normalized.length });
};

// PUT /api/homeschoolresources/:id
exports.update = async (req, res) => {
  const data = normalizeResource(req.body);
  const updated = await HomeschoolResource.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(updated);
};

// (Optional) GET single resource
exports.getOne = async (req, res) => {
  const resource = await HomeschoolResource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Not found" });
  res.json(resource);
};
