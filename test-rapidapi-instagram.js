const axios = require('axios');

const RAPIDAPI_KEY = '896d2e14a1msh59a3fa455128fbfp124238jsn594aa7cbc1de';

// List of Instagram APIs to test from RapidAPI
const instagramAPIs = [
  {
    name: 'Instagram Scraper 2022',
    host: 'instagram-scraper-2022.p.rapidapi.com',
    endpoint: '/userinfo',
    params: { user: 'nike' }
  },
  {
    name: 'Instagram Basic Display',
    host: 'instagram-basic-display.p.rapidapi.com',
    endpoint: '/me',
    params: {}
  },
  {
    name: 'Instagram Profile Scraper',
    host: 'instagram-profile-scraper.p.rapidapi.com',
    endpoint: '/user',
    params: { username: 'nike' }
  },
  {
    name: 'Instagram Media Scraper',
    host: 'instagram-media-scraper.p.rapidapi.com',
    endpoint: '/user',
    params: { username: 'nike' }
  },
  {
    name: 'Instagram Bulk Profile Scrapper',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    endpoint: '/clients/api/ig/media_by_username',
    params: { ig: 'nike' }
  },
  {
    name: 'Instagram Data Scraper',
    host: 'instagram-data-scraper.p.rapidapi.com',
    endpoint: '/user',
    params: { username: 'nike' }
  },
  {
    name: 'Instagram Profile Data',
    host: 'instagram-profile-data.p.rapidapi.com',
    endpoint: '/user',
    params: { username: 'nike' }
  },
  {
    name: 'Instagram User Info',
    host: 'instagram-user-info.p.rapidapi.com',
    endpoint: '/user',
    params: { username: 'nike' }
  }
];

async function testInstagramAPI(api) {
  try {
    console.log(`🧪 Testing ${api.name}...`);
    
    const response = await axios.get(`https://${api.host}${api.endpoint}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': api.host
      },
      params: api.params,
      timeout: 10000
    });
    
    console.log(`✅ ${api.name} - SUCCESS`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
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
  
  for (const api of instagramAPIs) {
    const result = await testInstagramAPI(api);
    results.push(result);
    console.log(''); // Add spacing between tests
  }
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working APIs: ${working.length}`);
  console.log(`❌ Failed APIs: ${failed.length}`);
  
  if (working.length > 0) {
    console.log('\n🎉 Working APIs found!');
    working.forEach(result => {
      console.log(`   - ${result.api}`);
    });
  } else {
    console.log('\n⚠️  No working APIs found.');
    console.log('The app will use mock data instead.');
    console.log('You may need to subscribe to different Instagram APIs on RapidAPI.');
  }
  
  return results;
}

// Run the tests
testAllAPIs().catch(console.error); 