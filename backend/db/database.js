const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }
});

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startKm: { type: Number, required: true },
  endKm: { type: Number, required: true },
  distance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const refillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountReais: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  litersRefilled: { type: Number, required: true },
  fuelType: { type: String, required: true },
  equivalentKm: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Trip = mongoose.model('Trip', tripSchema);
const Refill = mongoose.model('Refill', refillSchema);

const initUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Initializing default users in MongoDB...');
      await User.insertMany([
        { name: 'Pais' },
        { name: 'Gu' },
        { name: 'Re' }
      ]);
      console.log('Default users created.');
    }
  } catch (err) {
    console.error('Failed to initialize users:', err);
  }
};

mongoose.connection.once('open', initUsers);

module.exports = { User, Trip, Refill, mongoose };
