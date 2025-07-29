const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_KEY = '896d2e14a1msh59a3fa455128fbfp124238jsn594aa7cbc1de';

// List of Instagram APIs to test
const apis = [
  {
    name: 'Instagram Scraper 2022',
    url: 'https://instagram-scraper-2022.p.rapidapi.com/user_posts',
    params: { user: 'instagram' },
    host: 'instagram-scraper-2022.p.rapidapi.com'
  },
  {
    name: 'Instagram Basic Display',
    url: 'https://instagram-basic-display.p.rapidapi.com/me/media',
    params: { access_token: 'test' },
    host: 'instagram-basic-display.p.rapidapi.com'
  },
  {
    name: 'Instagram Profile Scraper',
    url: 'https://instagram-profile-scraper.p.rapidapi.com/profile',
    params: { username: 'instagram' },
    host: 'instagram-profile-scraper.p.rapidapi.com'
  },
  {
    name: 'Instagram Media Scraper',
    url: 'https://instagram-media-scraper.p.rapidapi.com/media',
    params: { url: 'https://www.instagram.com/instagram/' },
    host: 'instagram-media-scraper.p.rapidapi.com'
  }
];

async function testAPI(api) {
  try {
    console.log(`\n🧪 Testing ${api.name}...`);
    
    const options = {
      method: 'GET',
      url: api.url,
      params: api.params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': api.host
      }
    };

    const response = await axios.request(options);
    
    console.log(`✅ ${api.name} - SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
    
    if (response.data.data) {
      console.log(`   Posts found: ${response.data.data.length || 'N/A'}`);
    }
    
    return { success: true, api: api.name, data: response.data };
    
  } catch (error) {
    console.log(`❌ ${api.name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'No message'}`);
    }
    
    return { success: false, api: api.name, error: error.message };
  }
}

async function testAllAPIs() {
  console.log('🔍 Testing Instagram APIs with your RapidAPI key...\n');
  
  const results = [];
  
  for (const api of apis) {
    const result = await testAPI(api);
    results.push(result);
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const workingAPIs = results.filter(r => r.success);
  const failedAPIs = results.filter(r => !r.success);
  
  console.log(`✅ Working APIs: ${workingAPIs.length}`);
  workingAPIs.forEach(result => {
    console.log(`   - ${result.api}`);
  });
  
  console.log(`❌ Failed APIs: ${failedAPIs.length}`);
  failedAPIs.forEach(result => {
    console.log(`   - ${result.api}: ${result.error}`);
  });
  
  if (workingAPIs.length > 0) {
    console.log('\n🎉 Great! You have working Instagram APIs!');
    console.log('The app will use these to fetch real Instagram data.');
  } else {
    console.log('\n⚠️  No working APIs found.');
    console.log('The app will use mock data instead.');
    console.log('You may need to subscribe to different Instagram APIs on RapidAPI.');
  }
}

// Run the test
testAllAPIs().catch(console.error); 