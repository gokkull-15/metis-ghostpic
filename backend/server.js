const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Replace <db_password> with your actual password
const MONGO_URI = 'mongodb+srv://emmanuelsk04:Ghostpic-Metis@metis-ghostpic.kecu2md.mongodb.net/?retryWrites=true&w=majority&appName=metis-ghostpic';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schema
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  txHash: { type: String, required: true },
}, { versionKey: false });


const User = mongoose.model('User', userSchema);

// API Route
app.post('/api/save-user', async (req, res) => {
  const { walletAddress, userId, txHash } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      { userId, txHash },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'User saved successfully', user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add this to your existing server.js file
app.get('/api/get-user', async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
