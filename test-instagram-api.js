const { IgApiClient } = require('instagram-private-api');
require('dotenv').config();

async function testInstagramAPI() {
  console.log('🧪 Testing Instagram Private API...\n');
  
  // Check if credentials are provided
  if (!process.env.INSTAGRAM_USERNAME || !process.env.INSTAGRAM_PASSWORD) {
    console.log('❌ Instagram credentials not found in .env file');
    console.log('Please add your Instagram credentials:');
    console.log('INSTAGRAM_USERNAME=your_username');
    console.log('INSTAGRAM_PASSWORD=your_password');
    return;
  }
  
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
    
    console.log('🔐 Logging into Instagram...');
    await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
    console.log('✅ Successfully logged into Instagram');
    
    // Test with a popular public account
    const testUsername = 'instagram';
    console.log(`\n🔍 Testing with @${testUsername}...`);
    
    const user = await ig.user.searchExact(testUsername);
    if (user) {
      console.log(`✅ Found user: @${user.username}`);
      console.log(`   Full name: ${user.full_name}`);
      console.log(`   Followers: ${user.follower_count}`);
      console.log(`   Following: ${user.following_count}`);
      console.log(`   Posts: ${user.media_count}`);
      
      // Get recent posts
      const userFeed = ig.feed.user(user.pk);
      const posts = await userFeed.items();
      
      console.log(`\n📸 Found ${posts.length} recent posts`);
      
      if (posts.length > 0) {
        const latestPost = posts[0];
        console.log('\n📱 Latest post:');
        console.log(`   ID: ${latestPost.id}`);
        console.log(`   Type: ${latestPost.media_type === 1 ? 'Image' : latestPost.media_type === 2 ? 'Video' : 'Carousel'}`);
        console.log(`   Caption: ${latestPost.caption?.text?.substring(0, 100)}...`);
        console.log(`   Date: ${new Date(latestPost.taken_at * 1000).toLocaleString()}`);
      }
      
      console.log('\n🎉 Instagram Private API is working correctly!');
      console.log('Your app can now fetch real Instagram data.');
      
    } else {
      console.log(`❌ Could not find user @${testUsername}`);
    }
    
  } catch (error) {
    console.log('❌ Error testing Instagram API:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('challenge')) {
      console.log('\n🔐 Instagram requires verification:');
      console.log('1. Log into Instagram manually');
      console.log('2. Complete any verification steps');
      console.log('3. Try again');
    } else if (error.message.includes('password')) {
      console.log('\n🔑 Login failed:');
      console.log('1. Check your username and password');
      console.log('2. Make sure your account is not locked');
      console.log('3. Try logging into Instagram manually first');
    }
  }
}

// Run the test
testInstagramAPI().catch(console.error); 