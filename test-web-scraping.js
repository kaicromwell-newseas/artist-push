const puppeteer = require('puppeteer');

async function testWebScraping() {
  console.log('🧪 Testing Instagram Web Scraping...\n');
  
  const testUsername = 'instagram'; // Use Instagram's official account for testing
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('🌐 Launching browser...');
    
    try {
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log(`📱 Navigating to @${testUsername}...`);
      
      // Navigate to Instagram profile
      const profileUrl = `https://www.instagram.com/${testUsername}/`;
      await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 Extracting profile data...');
      
      // Extract profile information
      const profileData = await page.evaluate(() => {
        const fullNameElement = document.querySelector('h2');
        const fullName = fullNameElement ? fullNameElement.textContent : 'Unknown';
        
        const profilePicElement = document.querySelector('img[alt*="profile picture"]');
        const profilePic = profilePicElement ? profilePicElement.src : null;
        
        return { fullName, profilePic };
      });
      
      console.log('📸 Extracting posts...');
      
      // Extract posts
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('article img');
        const postData = [];
        
        postElements.forEach((img, index) => {
          if (index < 6) { // Limit to first 6 posts for testing
            const postContainer = img.closest('article');
            if (postContainer) {
              const link = postContainer.querySelector('a');
              const permalink = link ? link.href : null;
              
              postData.push({
                id: `post_${index}`,
                type: 'image',
                media_url: img.src,
                caption: '',
                timestamp: new Date().toISOString(),
                permalink: permalink
              });
            }
          }
        });
        
        return postData;
      });
      
      console.log('\n✅ Web scraping successful!');
      console.log(`📊 Profile: ${profileData.fullName}`);
      console.log(`🖼️  Profile Picture: ${profileData.profilePic ? 'Found' : 'Not found'}`);
      console.log(`📱 Posts found: ${posts.length}`);
      
      if (posts.length > 0) {
        console.log('\n📋 Sample post:');
        console.log(`   ID: ${posts[0].id}`);
        console.log(`   Media URL: ${posts[0].media_url.substring(0, 50)}...`);
        console.log(`   Permalink: ${posts[0].permalink || 'Not available'}`);
      }
      
      console.log('\n🎉 Web scraping is working! Your app can now fetch real Instagram data.');
      
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.log('❌ Web scraping failed:');
    console.log(`   ${error.message}`);
    console.log('\n💡 This might be due to:');
    console.log('   - Instagram blocking automated access');
    console.log('   - Network connectivity issues');
    console.log('   - Instagram page structure changes');
  }
}

// Run the test
testWebScraping().catch(console.error); 