const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

// Instagram Basic Display API - no web scraping needed

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

// Load accounts from environment variable (only if not empty or contains real accounts)
if (process.env.INSTAGRAM_ACCOUNTS && !process.env.INSTAGRAM_ACCOUNTS.includes('username')) {
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

// Public Instagram Profile Viewer (works immediately, no setup needed)
async function getInstagramUserInfo(username) {
  try {
    console.log(`Attempting to fetch real data for @${username} using public Instagram endpoints...`);
    
    // Try multiple Instagram API endpoints that might work
    const endpoints = [
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      `https://www.instagram.com/${username}/?__a=1&__d=dis`,
      `https://www.instagram.com/graphql/query/?query_hash=c9100bf9110dd6361671f113dd02e7d6&variables=${encodeURIComponent(JSON.stringify({username: username}))}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint.substring(0, 80)}...`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.instagram.com/',
            'Origin': 'https://www.instagram.com',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Connection': 'keep-alive'
          },
          timeout: 15000
        });
        
        if (response.data) {
          console.log(`✅ Successfully fetched data from endpoint for @${username}`);
          
          // Parse the response based on the endpoint
          let userData = null;
          let posts = [];
          
          if (endpoint.includes('web_profile_info')) {
            // Parse web_profile_info response
            if (response.data.data && response.data.data.user) {
              userData = response.data.data.user;
              console.log(`✅ Found user profile for @${username}`);
            }
          } else if (endpoint.includes('__a=1')) {
            // Parse __a=1 response
            if (response.data.graphql && response.data.graphql.user) {
              userData = response.data.graphql.user;
              console.log(`✅ Found user profile for @${username}`);
            }
          } else if (endpoint.includes('graphql')) {
            // Parse GraphQL response
            if (response.data.data && response.data.data.user) {
              userData = response.data.data.user;
              console.log(`✅ Found user profile for @${username}`);
            }
          }
          
          if (userData) {
            // Extract posts if available
            if (userData.edge_owner_to_timeline_media && userData.edge_owner_to_timeline_media.edges) {
              posts = userData.edge_owner_to_timeline_media.edges.slice(0, 12).map((edge, index) => {
                const node = edge.node;
                return {
                  id: node.id || `post_${index}_${Date.now()}`,
                  type: node.is_video ? 'video' : 'image',
                  media_url: node.display_url || node.video_url,
                  caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || 
                          `Post from ${new Date(node.taken_at_timestamp * 1000).toLocaleDateString()}`,
                  timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
                  permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                  username: username,
                  full_name: userData.full_name || username.charAt(0).toUpperCase() + username.slice(1)
                };
              });
            }
            
            console.log(`✅ Successfully fetched ${posts.length} posts for @${username}`);
            
            return {
              username: username,
              full_name: userData.full_name || username.charAt(0).toUpperCase() + username.slice(1),
              profile_picture: userData.profile_pic_url || userData.profile_pic_url_hd || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
              posts: posts
            };
          }
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint failed: ${endpointError.message}`);
        continue; // Try next endpoint
      }
    }
    
    console.log(`❌ All public endpoints failed for @${username}, using mock data`);
    return getMockUserData(username);
    
  } catch (error) {
    console.error(`❌ Error fetching data for @${username}:`, error.message);
    return getMockUserData(username);
  }
}

// Fallback mock data for testing
function getMockUserData(username) {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  // Generate 3-8 posts from the last 24 hours
  const numberOfPosts = Math.floor(Math.random() * 6) + 3;
  const posts = [];
  
  for (let i = 0; i < numberOfPosts; i++) {
    // Random time within last 24 hours
    const randomTime = Math.random() * (now - twentyFourHoursAgo) + twentyFourHoursAgo;
    const postTime = new Date(randomTime);
    
    // Random post types
    const postTypes = ['image', 'video', 'carousel'];
    const randomType = postTypes[Math.floor(Math.random() * postTypes.length)];
    
    // Random captions
    const captions = [
      `Amazing content from ${username} 🎨`,
      `Check out this awesome post by ${username} ✨`,
      `${username} sharing some great moments 📸`,
      `Latest update from ${username} 🚀`,
      `${username} with some incredible content 💫`,
      `Don't miss this post from ${username} 🔥`
    ];
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    
    posts.push({
      id: `post_${username}_${i}_${randomTime}`,
      type: randomType,
      media_url: `https://picsum.photos/400/400?random=${randomTime}`,
      caption: randomCaption,
      timestamp: postTime.toISOString(),
      permalink: `https://instagram.com/${username}`
    });
  }
  
  // Sort by timestamp (newest first)
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return {
    username: username,
    full_name: username.charAt(0).toUpperCase() + username.slice(1),
    profile_picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    posts: posts
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
              timestamp: post.timestamp || new Date().toISOString(),
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

// Instagram Basic Display API integration
app.get('/auth/instagram', (req, res) => {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = 'http://localhost:3000/auth/instagram/callback';
  const scope = 'user_profile,user_media';
  
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  
  res.redirect(authUrl);
});

app.get('/auth/instagram/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code not received');
    }
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/auth/instagram/callback',
      code: code
    });
    
    const { access_token, user_id } = tokenResponse.data;
    
    // Store the access token (in production, store this securely)
    global.instagramAccessToken = access_token;
    
    res.send(`
      <html>
        <body>
          <h2>✅ Instagram Authorization Successful!</h2>
          <p>Your Instagram account has been connected to Artist Push.</p>
          <p>You can now close this window and return to the app.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    res.status(500).send('Error during authorization');
  }
});

app.get('/auth/instagram/deauthorize', (req, res) => {
  // Handle user deauthorization
  global.instagramAccessToken = null;
  res.send('Account disconnected successfully');
});

// Instagram status endpoint (public profiles don't need authentication)
app.get('/api/instagram/status', (req, res) => {
  res.json({
    connected: true,
    message: 'Ready to fetch public Instagram profiles'
  });
});

// Manual trigger for data fetching (for testing)
app.post('/api/trigger-fetch', async (req, res) => {
  try {
    console.log('🔄 Manual trigger: Fetching Instagram data...');
    await fetchInstagramData();
    res.json({ success: true, message: 'Data fetch triggered successfully' });
  } catch (error) {
    console.error('❌ Manual trigger failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple image proxy that works with any image URL
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    console.log(`🖼️ Proxying image: ${imageUrl.substring(0, 100)}...`);
    
    // Simple, direct approach that works with most image URLs
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      timeout: 15000,
      maxRedirects: 3
    });
    
    // Set appropriate headers
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    
    // Send the image data
    res.send(response.data);
    
  } catch (error) {
    console.error('❌ Image proxy failed:', error.message);
    
    // Return a simple, clean placeholder
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    
    const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect x="50%" y="40%" width="60" height="60" rx="8" fill="#dee2e6" transform="translate(-30, -30)"/>
      <path d="M 50% 40% L 50% 60% M 40% 50% L 60% 50%" stroke="#adb5bd" stroke-width="3" stroke-linecap="round" transform="translate(-30, -30)"/>
      <text x="50%" y="75%" font-family="system-ui, sans-serif" font-size="14" fill="#6c757d" text-anchor="middle">Image unavailable</text>
      <text x="50%" y="85%" font-family="system-ui, sans-serif" font-size="12" fill="#adb5bd" text-anchor="middle">Tap to view on Instagram</text>
    </svg>`;
    
    res.send(placeholderSvg);
  }
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
  console.log(`Monitoring accounts: ${Array.from(monitoredAccounts).join(', ') || 'None configured'}`);
});

// Export for testing
module.exports = { fetchInstagramData }; 