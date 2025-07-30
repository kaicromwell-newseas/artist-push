# Instagram Basic Display API Setup Guide

## 🎯 Overview
Instagram Basic Display API allows you to access your own Instagram content and content from users who have authorized your app.

## 📋 Prerequisites
- Facebook Developer Account
- Instagram Account
- Domain for your app (can use localhost for development)

## 🚀 Step-by-Step Setup

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Consumer" app type
4. Fill in app details and create

### 2. Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Follow the setup wizard

### 3. Configure App Settings
1. **Basic Settings**:
   - App Domains: Add your domain (e.g., `localhost` for development)
   - Privacy Policy URL: Required (can use placeholder for now)
   - Terms of Service URL: Required (can use placeholder for now)

2. **Instagram Basic Display Settings**:
   - Client OAuth Settings:
     - Valid OAuth Redirect URIs: `http://localhost:3000/auth/instagram/callback`
     - Deauthorize Callback URL: `http://localhost:3000/auth/instagram/deauthorize`
     - Data Deletion Request URL: `http://localhost:3000/auth/instagram/data-deletion`

### 4. Get App Credentials
1. Note your **App ID** and **App Secret**
2. Add them to your `.env` file:
   ```
   INSTAGRAM_APP_ID=your_app_id_here
   INSTAGRAM_APP_SECRET=your_app_secret_here
   ```

### 5. User Authorization Flow
The Instagram Basic Display API requires users to authorize your app to access their data.

#### Authorization URL Structure:
```
https://api.instagram.com/oauth/authorize
  ?client_id={app-id}
  &redirect_uri={redirect-uri}
  &scope=user_profile,user_media
  &response_type=code
```

#### Required Scopes:
- `user_profile`: Access to profile information
- `user_media`: Access to user's media

### 6. Exchange Code for Access Token
After user authorization, exchange the code for an access token:

```javascript
const response = await axios.post('https://api.instagram.com/oauth/access_token', {
  client_id: process.env.INSTAGRAM_APP_ID,
  client_secret: process.env.INSTAGRAM_APP_SECRET,
  grant_type: 'authorization_code',
  redirect_uri: 'http://localhost:3000/auth/instagram/callback',
  code: authorizationCode
});
```

## 🔧 Implementation in Your App

### 1. Add Authorization Endpoints
Your app needs these endpoints:
- `/auth/instagram` - Start authorization flow
- `/auth/instagram/callback` - Handle authorization callback
- `/auth/instagram/deauthorize` - Handle user deauthorization

### 2. Store Access Tokens
- Store user access tokens securely
- Refresh tokens when needed
- Handle token expiration

### 3. Fetch Instagram Data
Use the access token to fetch:
- User profile: `https://graph.instagram.com/me?fields=id,username&access_token={access-token}`
- User media: `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token={access-token}`

## ⚠️ Important Limitations

### What You Can Access:
- ✅ Your own Instagram content
- ✅ Content from users who authorized your app
- ✅ Public profile information (with permission)

### What You Cannot Access:
- ❌ Content from users who haven't authorized your app
- ❌ Private accounts (unless they authorize your app)
- ❌ Real-time updates (API has rate limits)

## 🎯 For Your Use Case

Since you want to monitor specific Instagram accounts, you'll need:
1. **Those accounts to authorize your app** (they need to log in and grant permission)
2. **Or use the accounts' own access tokens** (if you manage those accounts)

## 🔄 Alternative Approach

If you can't get other users to authorize your app, consider:
1. **Use your own Instagram account** for testing
2. **Ask friends/family to authorize** your app for their accounts
3. **Focus on accounts you manage** (business accounts)

## 📝 Next Steps

1. Create your Facebook app
2. Configure Instagram Basic Display
3. Update your `.env` file with credentials
4. Implement the authorization flow in your app
5. Test with your own Instagram account

Would you like me to help implement the authorization flow in your app? 