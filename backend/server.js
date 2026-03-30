const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const os = require('os');
const { User, Trip, Refill } = require('./db/database');
const { extractMileage } = require('./services/ocr');

const app = express();
app.use(cors());
app.use(express.json());

// Serverless DB Connection Middleware
const mongoose = require('mongoose');
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      if(process.env.MONGODB_URI) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
    } catch (e) {
      console.error('Atlas connection error:', e);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// Serve static React frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    // Return mapped object with 'id' field for frontend compatibility
    res.json(users.map(u => ({ id: u._id.toString(), name: u.name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ocr', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  
  const extractedKm = await extractMileage(req.file.path);
  res.json({ km: extractedKm, imagePath: req.file.path });
});

app.post('/api/trips', async (req, res) => {
  const { userId, startKm, endKm } = req.body;
  if (!userId || !startKm || !endKm) return res.status(400).json({ error: 'Missing fields' });
  
  const distance = endKm - startKm;
  if (distance < 0) return res.status(400).json({ error: 'End KM must be greater than Start KM' });

  try {
    const trip = await Trip.create({ userId, startKm, endKm, distance });
    res.json({ id: trip._id, distance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refills', async (req, res) => {
  const { userId, amountReais, pricePerLiter, fuelType } = req.body;
  if (!userId || !amountReais || !pricePerLiter || !fuelType) return res.status(400).json({ error: 'Missing fields' });
  
  const CONSUMPTION_GASOLINE = 6.0; 
  const CONSUMPTION_ALCOHOL = 4.0;

  const consumption = fuelType === 'Gasoline' ? CONSUMPTION_GASOLINE : CONSUMPTION_ALCOHOL;
  const liters = amountReais / pricePerLiter;
  const equivalentKm = liters * consumption;

  try {
    const refill = await Refill.create({ userId, amountReais, pricePerLiter, litersRefilled: liters, fuelType, equivalentKm });
    res.json({ id: refill._id, liters, equivalentKm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  const days = req.query.days || 30;
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  try {
    const users = await User.find();
    
    // Aggregate over each user
    const stats = await Promise.all(users.map(async (user) => {
      const tripsAggr = await Trip.aggregate([
        { $match: { userId: user._id, timestamp: { $gte: dateLimit } } },
        { $group: { _id: null, total_km_driven: { $sum: "$distance" } } }
      ]);
      const total_km_driven = tripsAggr.length > 0 ? tripsAggr[0].total_km_driven : 0;

      const refillsAggr = await Refill.aggregate([
        { $match: { userId: user._id, timestamp: { $gte: dateLimit } } },
        { $group: { _id: null, total_km_paid: { $sum: "$equivalentKm" }, total_reais_paid: { $sum: "$amountReais" } } }
      ]);
      const total_km_paid = refillsAggr.length > 0 ? refillsAggr[0].total_km_paid : 0;
      const total_reais_paid = refillsAggr.length > 0 ? refillsAggr[0].total_reais_paid : 0;

      return {
        userId: user._id.toString(),
        name: user.name,
        total_km_driven,
        total_km_paid,
        total_reais_paid,
        balance_km: total_km_paid - total_km_driven
      };
    }));
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;

// Catch-all route to serve the SPA for all non-API paths
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log('Backend running on port ' + PORT));
}

module.exports = app;
