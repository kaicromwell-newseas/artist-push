const axios = require('axios');

const RAPIDAPI_KEY = '896d2e14a1msh59a3fa455128fbfp124238jsn594aa7cbc1de';

// Test different Instagram API endpoints
const apiTests = [
  {
    name: 'Instagram Basic Display API',
    url: 'https://instagram-basic-display.p.rapidapi.com/me/media',
    params: { access_token: 'test' },
    host: 'instagram-basic-display.p.rapidapi.com'
  },
  {
    name: 'Instagram Scraper 2022',
    url: 'https://instagram-scraper-2022.p.rapidapi.com/user_posts',
    params: { user: 'instagram' },
    host: 'instagram-scraper-2022.p.rapidapi.com'
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
  },
  {
    name: 'Instagram Bulk Profile Scrapper',
    url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_username',
    params: { ig: 'instagram' },
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com'
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
      },
      timeout: 10000
    };

    const response = await axios.request(options);
    
    console.log(`✅ ${api.name} - SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response type: ${typeof response.data}`);
    
    if (typeof response.data === 'object') {
      console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
      
      if (response.data.data) {
        console.log(`   Posts found: ${Array.isArray(response.data.data) ? response.data.data.length : 'N/A'}`);
      }
      
      if (response.data.response) {
        console.log(`   Response data: ${Object.keys(response.data.response).join(', ')}`);
      }
    }
    
    return { success: true, api: api.name, data: response.data };
    
  } catch (error) {
    console.log(`❌ ${api.name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      if (error.response.data && typeof error.response.data === 'object') {
        console.log(`   Error data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      } else {
        console.log(`   Error message: ${error.response.data}`);
      }
    }
    
    return { success: false, api: api.name, error: error.message };
  }
}

async function findWorkingAPIs() {
  console.log('🔍 Finding working Instagram APIs...\n');
  
  const results = [];
  
  for (const api of apiTests) {
    const result = await testAPI(api);
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Results Summary:');
  console.log('==================');
  
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
    console.log('\n🎉 Found working Instagram APIs!');
    console.log('You can use these in your app.');
    
    // Show details of the first working API
    const firstWorking = workingAPIs[0];
    console.log(`\n📋 Recommended API: ${firstWorking.api}`);
    console.log('Update your server.js to use this API.');
  } else {
    console.log('\n⚠️  No working Instagram APIs found.');
    console.log('The app will use mock data instead.');
    console.log('\n💡 Alternative options:');
    console.log('1. Subscribe to different Instagram APIs on RapidAPI');
    console.log('2. Use Instagram Basic Display API (requires user authorization)');
    console.log('3. Use web scraping (educational purposes only)');
  }
}

// Run the test
findWorkingAPIs().catch(console.error); 