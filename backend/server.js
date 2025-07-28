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

const postSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true },
  caption: { type: String, required: true },
  hashtags: { type: [String], default: [] },
  walletAddress: { type: String, required: true },
  imageUrl: { type: String, required: true },
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  comment: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const Post = mongoose.model('Post', postSchema, 'posts');

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

app.post('/api/savePost', async (req, res) => {
  const { caption, hashtags, walletAddress, imageUrl } = req.body;

  // Basic validation
  if (!caption || !walletAddress || !imageUrl) {
    return res.status(400).json({ 
      success: false,
      message: 'Caption, wallet address, and image URL are required' 
    });
  }

  // Generate unique postId
  function generatePostId() {
    return 'POST-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
  const postId = generatePostId();

  try {
    // Ensure postId is unique
    const existing = await Post.findOne({ postId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Post ID already exists, try again.' });
    }
    const newPost = new Post({
      postId,
      caption,
      hashtags: hashtags || [],
      walletAddress,
      imageUrl,
      like: 0,
      dislike: 0,
      comment: [],
      active: true
    });

    await newPost.save();

    res.status(201).json({ 
      success: true,
      message: 'Post saved successfully',
      post: newPost
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.postId, active: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Like a post (toggle)
app.patch('/api/posts/:postId/like', async (req, res) => {
  try {
    const { toggle } = req.body;
    const incValue = toggle ? -1 : 1;
    const post = await Post.findOneAndUpdate(
      { postId: req.params.postId },
      { $inc: { like: incValue } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Dislike a post (toggle)
app.patch('/api/posts/:postId/dislike', async (req, res) => {
  try {
    const { toggle } = req.body;
    const incValue = toggle ? -1 : 1;
    const post = await Post.findOneAndUpdate(
      { postId: req.params.postId },
      { $inc: { dislike: incValue } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});