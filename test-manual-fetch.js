const puppeteer = require('puppeteer');
require('dotenv').config();

async function testManualFetch() {
  console.log('🧪 Testing manual Instagram fetch for @nike...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to Instagram profile
    const profileUrl = `https://www.instagram.com/nike/`;
    console.log(`🌐 Navigating to: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('accounts/login') || currentUrl.includes('login')) {
      console.log(`⚠️  Hit login page, attempting to login with credentials...`);
      
      if (process.env.INSTAGRAM_USERNAME && process.env.INSTAGRAM_PASSWORD) {
        try {
          // Navigate to login page
          await page.goto('https://www.instagram.com/accounts/login/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Fill in username
          await page.type('input[name="username"]', process.env.INSTAGRAM_USERNAME);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fill in password
          await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Click login button
          await page.click('button[type="submit"]');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Navigate back to the profile
          await page.goto(`https://www.instagram.com/nike/`, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          console.log(`✅ Successfully logged in and navigated to @nike`);
        } catch (loginError) {
          console.log(`❌ Login failed:`, loginError.message);
        }
      }
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-nike-login.png', fullPage: true });
    console.log(`📸 Screenshot saved as debug-nike-login.png`);
    
    // Extract posts
    const posts = await page.evaluate(() => {
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
            permalink: permalink || `https://instagram.com/nike`
          });
        }
      });
      
      console.log(`Found ${postData.length} posts`);
      return postData;
    });
    
    console.log(`📸 Posts found: ${posts.length}`);
    if (posts.length > 0) {
      console.log(`First post:`, posts[0]);
    }
    
    return posts;
    
  } finally {
    await browser.close();
  }
}

testManualFetch()
  .then(result => {
    console.log('✅ Test completed!');
    console.log('Result:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  }); 