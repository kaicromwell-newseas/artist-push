const puppeteer = require('puppeteer');

async function testInstagramScraping(username) {
  console.log(`🧪 Testing Instagram scraping for @${username}`);
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to Instagram profile
    const profileUrl = `https://www.instagram.com/${username}/`;
    console.log(`🌐 Navigating to: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: `debug-${username}.png`, fullPage: true });
    console.log(`📸 Screenshot saved as debug-${username}.png`);
    
    // Extract profile information
    const profileData = await page.evaluate((username) => {
      const nameSelectors = ['h2', 'h1', '[data-testid="profile-name"]', 'span[dir="auto"]', 'div[dir="auto"]'];
      let fullName = username;
      
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          fullName = element.textContent.trim();
          console.log(`Found name with selector "${selector}": ${fullName}`);
          break;
        }
      }
      
      const picSelectors = ['img[alt*="profile picture"]', 'img[alt*="profile"]', 'img[alt*="avatar"]'];
      let profilePic = null;
      
      for (const selector of picSelectors) {
        const element = document.querySelector(selector);
        if (element && element.src) {
          profilePic = element.src;
          console.log(`Found profile pic with selector "${selector}": ${profilePic}`);
          break;
        }
      }
      
      return { fullName, profilePic };
    }, username);
    
    console.log(`👤 Profile data:`, profileData);
    
    // Extract posts
    const posts = await page.evaluate((username) => {
      const selectors = [
        'article img[src*="instagram"]',
        'article img[alt*="photo"]',
        'article img[alt*="image"]',
        'article img[alt*="post"]',
        'article img',
        'a[href*="/p/"] img',
        'div[role="button"] img',
        'img[src*="cdninstagram"]',
        'img[src*="scontent"]'
      ];
      
      let postElements = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector "${selector}": found ${elements.length} elements`);
        if (elements.length > 0) {
          postElements = Array.from(elements);
          break;
        }
      }
      
      const postData = [];
      const seenUrls = new Set();
      
      postElements.forEach((img, index) => {
        if (index < 12 && img.src && !seenUrls.has(img.src)) {
          seenUrls.add(img.src);
          
          const link = img.closest('a') || img.closest('article')?.querySelector('a');
          const permalink = link ? link.href : null;
          
          const captionElement = img.closest('article')?.querySelector('[data-testid="post-caption"]') || 
                               img.closest('article')?.querySelector('span') ||
                               img.closest('article')?.querySelector('div[dir="auto"]');
          const caption = captionElement ? captionElement.textContent.trim() : '';
          
          postData.push({
            id: `post_${index}_${Date.now()}`,
            type: 'image',
            media_url: img.src,
            caption: caption || `Post from ${new Date().toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            permalink: permalink || `https://instagram.com/${username}`
          });
        }
      });
      
      console.log(`Found ${postData.length} posts`);
      return postData;
    }, username);
    
    console.log(`📸 Posts found: ${posts.length}`);
    if (posts.length > 0) {
      console.log(`First post:`, posts[0]);
    }
    
    return {
      username: username,
      full_name: profileData.fullName,
      profile_picture: profileData.profilePic,
      posts: posts
    };
    
  } finally {
    await browser.close();
  }
}

// Test with a popular public account
testInstagramScraping('nike')
  .then(result => {
    console.log('✅ Test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  }); 