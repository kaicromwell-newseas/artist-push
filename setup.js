#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎨 Artist Push - RapidAPI Setup\n');
console.log('This script will help you configure your Instagram API integration.\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Creating from template...');
      const examplePath = path.join(__dirname, 'env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('✅ Created .env file from template');
      } else {
        console.log('❌ env.example not found. Please create .env manually.');
        return;
      }
    }

    // Read current .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('📋 Current configuration:');
    console.log('------------------------');
    
    // Check RapidAPI key
    const rapidApiMatch = envContent.match(/RAPIDAPI_KEY=(.+)/);
    if (rapidApiMatch && rapidApiMatch[1] !== 'your_rapidapi_key_here') {
      console.log('✅ RapidAPI Key: Configured');
    } else {
      console.log('❌ RapidAPI Key: Not configured');
    }
    
    // Check email settings
    const emailMatch = envContent.match(/EMAIL_USER=(.+)/);
    if (emailMatch && emailMatch[1] !== 'your_email@gmail.com') {
      console.log('✅ Email User: Configured');
    } else {
      console.log('❌ Email User: Not configured');
    }
    
    console.log('\n🔧 Configuration Options:');
    console.log('1. Set up RapidAPI key');
    console.log('2. Set up email notifications');
    console.log('3. Test current configuration');
    console.log('4. Exit');
    
    const choice = await question('\nSelect an option (1-4): ');
    
    switch (choice) {
      case '1':
        await setupRapidAPI(envContent, envPath);
        break;
      case '2':
        await setupEmail(envContent, envPath);
        break;
      case '3':
        await testConfiguration();
        break;
      case '4':
        console.log('👋 Setup complete!');
        break;
      default:
        console.log('❌ Invalid option');
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    rl.close();
  }
}

async function setupRapidAPI(envContent, envPath) {
  console.log('\n🔑 RapidAPI Setup');
  console.log('================');
  console.log('1. Go to https://rapidapi.com');
  console.log('2. Sign up for a free account');
  console.log('3. Search for "Instagram Bulk Profile Scrapper"');
  console.log('4. Subscribe to the API (free tier available)');
  console.log('5. Copy your API key from the dashboard\n');
  
  const apiKey = await question('Enter your RapidAPI key: ');
  
  if (apiKey && apiKey.trim() !== '') {
    const newContent = envContent.replace(
      /RAPIDAPI_KEY=.+/,
      `RAPIDAPI_KEY=${apiKey.trim()}`
    );
    
    fs.writeFileSync(envPath, newContent);
    console.log('✅ RapidAPI key saved!');
    
    const testNow = await question('Test the API now? (y/n): ');
    if (testNow.toLowerCase() === 'y') {
      await testRapidAPI(apiKey.trim());
    }
  } else {
    console.log('❌ No API key provided');
  }
}

async function setupEmail(envContent, envPath) {
  console.log('\n📧 Email Setup');
  console.log('=============');
  console.log('For Gmail, you need to:');
  console.log('1. Enable 2-Factor Authentication');
  console.log('2. Generate an App Password');
  console.log('3. Use the App Password below\n');
  
  const emailUser = await question('Enter your Gmail address: ');
  const emailPass = await question('Enter your Gmail App Password: ');
  const notificationEmail = await question('Enter notification email address: ');
  
  if (emailUser && emailPass && notificationEmail) {
    let newContent = envContent
      .replace(/EMAIL_USER=.+/, `EMAIL_USER=${emailUser.trim()}`)
      .replace(/EMAIL_PASS=.+/, `EMAIL_PASS=${emailPass.trim()}`)
      .replace(/NOTIFICATION_EMAIL=.+/, `NOTIFICATION_EMAIL=${notificationEmail.trim()}`);
    
    fs.writeFileSync(envPath, newContent);
    console.log('✅ Email settings saved!');
  } else {
    console.log('❌ Please provide all email settings');
  }
}

async function testRapidAPI(apiKey) {
  console.log('\n🧪 Testing RapidAPI...');
  
  try {
    const axios = require('axios');
    
    const options = {
      method: 'GET',
      url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_username',
      params: {ig: 'instagram'}, // Test with Instagram's official account
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    if (response.data && response.data.response) {
      console.log('✅ API test successful!');
      console.log(`📊 Found ${response.data.response.posts?.length || 0} posts`);
      console.log(`👤 User: ${response.data.response.full_name || 'N/A'}`);
    } else {
      console.log('⚠️  API responded but no data found');
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function testConfiguration() {
  console.log('\n🧪 Testing Configuration...');
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
      console.log('✅ RapidAPI key found');
      await testRapidAPI(process.env.RAPIDAPI_KEY);
    } else {
      console.log('❌ RapidAPI key not configured');
    }
    
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
      console.log('✅ Email user configured');
    } else {
      console.log('❌ Email user not configured');
    }
    
  } catch (error) {
    console.log('❌ Configuration test failed:', error.message);
  }
}

// Run setup
setup(); 