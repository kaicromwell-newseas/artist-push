const { fetchInstagramData } = require('./server.js');

async function testFetch() {
  console.log('🧪 Testing manual data fetch...');
  
  try {
    await fetchInstagramData();
    console.log('✅ Data fetch completed!');
  } catch (error) {
    console.error('❌ Data fetch failed:', error);
  }
}

testFetch(); 