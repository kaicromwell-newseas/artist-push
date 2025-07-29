# Instagram API Setup Guide

This guide will help you set up real Instagram data integration for your Artist Push app.

## Option 1: RapidAPI Instagram API (Recommended)

### Step 1: Sign up for RapidAPI
1. Go to [RapidAPI](https://rapidapi.com)
2. Create a free account
3. Search for "Instagram API" or "Instagram Scraper"

### Step 2: Subscribe to an Instagram API
Popular options include:
- **Instagram Bulk Profile Scrapper** (used in this app)
- **Instagram Basic Display API**
- **Instagram Graph API**

### Step 3: Get Your API Key
1. Subscribe to your chosen API (many have free tiers)
2. Copy your API key from the RapidAPI dashboard
3. Add it to your `.env` file:
   ```env
   RAPIDAPI_KEY=your_api_key_here
   ```

### Step 4: Test the Integration
1. Restart your server: `npm start`
2. Add an Instagram username in the web interface
3. Check the server logs for API responses

## Option 2: Instagram Basic Display API (Official)

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Instagram Basic Display product

### Step 2: Configure Instagram Basic Display
1. Set up OAuth redirect URIs
2. Get your app ID and secret
3. Add to `.env`:
   ```env
   INSTAGRAM_APP_ID=your_app_id
   INSTAGRAM_APP_SECRET=your_app_secret
   ```

### Step 3: Get User Access Token
1. Users need to authorize your app
2. Exchange code for access token
3. Use token to fetch user data

## Option 3: Web Scraping (Advanced)

### Using Puppeteer
```javascript
const puppeteer = require('puppeteer');

async function scrapeInstagram(username) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`https://www.instagram.com/${username}/`);
  
  // Extract posts data
  const posts = await page.evaluate(() => {
    // JavaScript to extract post data
  });
  
  await browser.close();
  return posts;
}
```

## Current Implementation

The app currently uses **RapidAPI Instagram Bulk Profile Scrapper** with fallback to mock data.

### API Endpoints Used:
- `GET /clients/api/ig/media_by_username` - Get user posts
- Parameters: `ig` (username)

### Response Format:
```json
{
  "response": {
    "full_name": "User Name",
    "profile_pic_url": "https://...",
    "posts": [
      {
        "id": "post_id",
        "media_type": "image",
        "display_url": "https://...",
        "caption": "Post caption",
        "taken_at_timestamp": 1234567890,
        "shortcode": "post_shortcode"
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues:

1. **API Rate Limits**
   - Most APIs have rate limits
   - Implement caching to avoid hitting limits
   - Use free tier limits wisely

2. **Account Privacy**
   - Only public Instagram accounts can be accessed
   - Private accounts will return errors

3. **API Changes**
   - Instagram APIs change frequently
   - Keep your API service updated
   - Monitor for breaking changes

### Error Handling:
The app includes fallback to mock data when API calls fail, so it will always work even without a real API key.

## Next Steps

1. **Get a RapidAPI key** for real Instagram data
2. **Add it to your `.env` file**
3. **Test with a public Instagram account**
4. **Monitor the server logs** for API responses

## Free Alternatives

If you don't want to pay for an API:
1. Use the mock data for testing
2. Implement web scraping (educational purposes only)
3. Use Instagram's official Basic Display API (requires user authorization)

---

**Note**: Always respect Instagram's Terms of Service and rate limits when accessing their data. 