const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const INSTAGRAM_ACCOUNTS = process.env.INSTAGRAM_ACCOUNTS ? process.env.INSTAGRAM_ACCOUNTS.split(',') : [];
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// Store for tracking new posts and accounts
let lastPostIds = new Map();
let feedData = [];
let monitoredAccounts = new Set();

// Load accounts from environment variable
if (process.env.INSTAGRAM_ACCOUNTS) {
    process.env.INSTAGRAM_ACCOUNTS.split(',').forEach(username => {
        monitoredAccounts.add(username.trim());
    });
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Instagram API functions - Currently using mock data since APIs are not available
async function getInstagramUserInfo(username) {
  try {
    // For now, we'll use mock data since Instagram APIs are not working
    // In the future, you can implement real Instagram API integration here
    console.log(`Using mock data for @${username}`);
    return getMockUserData(username);
    
  } catch (error) {
    console.error(`Error fetching user info for ${username}:`, error.message);
    return getMockUserData(username);
  }
}

// Fallback mock data for testing
function getMockUserData(username) {
  return {
    username: username,
    full_name: username.charAt(0).toUpperCase() + username.slice(1),
    profile_picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    posts: [
      {
        id: `post_${username}_${Date.now()}`,
        type: 'image',
        media_url: 'https://via.placeholder.com/400x400',
        caption: `Latest post from ${username} 🎨`,
        timestamp: new Date().toISOString(),
        permalink: `https://instagram.com/${username}`
      }
    ]
  };
}

// Mock Instagram data for demonstration
function getMockInstagramData() {
  const mockAccounts = [
    {
      username: 'artist1',
      full_name: 'Artist One',
      profile_picture: 'https://via.placeholder.com/150',
      posts: [
        {
          id: 'post1_' + Date.now(),
          type: 'image',
          media_url: 'https://via.placeholder.com/400x400',
          caption: 'New artwork just finished! 🎨 #art #creative',
          timestamp: new Date().toISOString(),
          permalink: '#'
        }
      ]
    },
    {
      username: 'artist2',
      full_name: 'Artist Two',
      profile_picture: 'https://via.placeholder.com/150',
      posts: [
        {
          id: 'post2_' + Date.now(),
          type: 'video',
          media_url: 'https://via.placeholder.com/400x400',
          caption: 'Working on something exciting! ✨',
          timestamp: new Date().toISOString(),
          permalink: '#'
        }
      ]
    }
  ];

  return mockAccounts;
}

// Fetch Instagram data
async function fetchInstagramData() {
  console.log('Fetching Instagram data...');
  
  if (monitoredAccounts.size === 0) {
    console.log('No accounts to monitor');
    return;
  }
  
  const newFeedData = [];
  
  for (const username of monitoredAccounts) {
    try {
      console.log(`Fetching data for @${username}...`);
      const accountData = await getInstagramUserInfo(username);
      
      if (accountData && accountData.posts) {
        for (const post of accountData.posts) {
          const postKey = `${username}_${post.id}`;
          
          if (!lastPostIds.has(postKey)) {
            // New post detected
            lastPostIds.set(postKey, post.id);
            
            const feedItem = {
              id: post.id,
              username: accountData.username,
              full_name: accountData.full_name,
              profile_picture: accountData.profile_picture,
              media_url: post.media_url || post.display_url || 'https://via.placeholder.com/400x400',
              caption: post.caption || post.text || '',
              timestamp: post.timestamp || post.taken_at_timestamp ? new Date(post.taken_at_timestamp * 1000).toISOString() : new Date().toISOString(),
              permalink: post.permalink || `https://instagram.com/p/${post.shortcode}/`,
              type: post.media_type || 'image'
            };
            
            newFeedData.push(feedItem);
            
            // Send email notification
            await sendEmailNotification(feedItem);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching data for @${username}:`, error.message);
    }
  }
  
  // Add new posts to the beginning of feed
  feedData = [...newFeedData, ...feedData];
  
  // Keep only last 50 posts
  feedData = feedData.slice(0, 50);
  
  // Emit to connected clients
  io.emit('feedUpdate', feedData);
  
  console.log(`Found ${newFeedData.length} new posts`);
}

// Send email notification
async function sendEmailNotification(post) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `New post from ${post.username} on Instagram`,
      html: `
        <h2>New Instagram Post</h2>
        <p><strong>${post.full_name}</strong> (@${post.username}) just posted:</p>
        <p>${post.caption || 'No caption'}</p>
        <p><a href="${post.permalink}">View on Instagram</a></p>
        <p>Posted at: ${new Date(post.timestamp).toLocaleString()}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent for post from ${post.username}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/feed', (req, res) => {
  res.json(feedData);
});

app.get('/api/accounts', (req, res) => {
  const accounts = Array.from(monitoredAccounts).map(username => ({
    username: username,
    full_name: username.charAt(0).toUpperCase() + username.slice(1),
    profile_picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
  }));
  res.json(accounts);
});

app.post('/api/accounts', (req, res) => {
  const { accounts } = req.body;
  if (accounts && Array.isArray(accounts)) {
    const newAccounts = [];
    
    for (const username of accounts) {
      const cleanUsername = username.replace('@', '').trim();
      if (cleanUsername && !monitoredAccounts.has(cleanUsername)) {
        monitoredAccounts.add(cleanUsername);
        newAccounts.push(cleanUsername);
        console.log(`Added account to monitor: @${cleanUsername}`);
      }
    }
    
    // In a real app, you'd save this to a database
    console.log('Updated accounts to monitor:', Array.from(monitoredAccounts));
    res.json({ success: true, accounts: Array.from(monitoredAccounts), added: newAccounts });
  } else {
    res.status(400).json({ error: 'Invalid accounts data' });
  }
});

app.post('/api/accounts/remove', (req, res) => {
  const { username } = req.body;
  if (username) {
    const cleanUsername = username.replace('@', '').trim();
    if (monitoredAccounts.has(cleanUsername)) {
      monitoredAccounts.delete(cleanUsername);
      console.log(`Removed account from monitoring: @${cleanUsername}`);
      res.json({ success: true, message: `Removed @${cleanUsername}` });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } else {
    res.status(400).json({ error: 'Username is required' });
  }
});

app.post('/api/settings', (req, res) => {
  const { notificationEmail, checkInterval } = req.body;
  
  // In a real app, you'd save these to a database
  console.log('Updated settings:', { notificationEmail, checkInterval });
  
  // Update environment variables (for demo purposes)
  if (notificationEmail) {
    process.env.NOTIFICATION_EMAIL = notificationEmail;
  }
  
  res.json({ success: true, settings: { notificationEmail, checkInterval } });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current feed data to new client
  socket.emit('feedUpdate', feedData);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Schedule Instagram data fetching
// Check every 5 minutes
cron.schedule('*/5 * * * *', fetchInstagramData);

// Initial data fetch
fetchInstagramData();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`Monitoring accounts: ${INSTAGRAM_ACCOUNTS.join(', ') || 'None configured'}`);
}); 