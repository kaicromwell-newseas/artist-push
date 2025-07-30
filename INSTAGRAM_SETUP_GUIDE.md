# 🚀 Instagram Basic Display API Setup Guide

## 🎯 **Ready to Test with Real Instagram Accounts!**

Your app is now configured to use Instagram Basic Display API. Here's how to set it up:

## 📋 **Step 1: Create Facebook Developer App**

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Click "Create App"**
3. **Choose "Consumer" app type**
4. **Fill in app details:**
   - App Name: `Artist Push`
   - App Contact Email: Your email
   - App Purpose: Personal project
5. **Click "Create App"**

## 🔧 **Step 2: Add Instagram Basic Display**

1. **In your app dashboard, click "Add Product"**
2. **Find "Instagram Basic Display" and click "Set Up"**
3. **Follow the setup wizard**

## ⚙️ **Step 3: Configure App Settings**

### **Basic Settings:**
- **App Domains**: `localhost`
- **Privacy Policy URL**: `http://localhost:3000/privacy` (can use placeholder)
- **Terms of Service URL**: `http://localhost:3000/terms` (can use placeholder)

### **Instagram Basic Display Settings:**
- **Client OAuth Settings**:
  - Valid OAuth Redirect URIs: `http://localhost:3000/auth/instagram/callback`
  - Deauthorize Callback URL: `http://localhost:3000/auth/instagram/deauthorize`
  - Data Deletion Request URL: `http://localhost:3000/auth/instagram/data-deletion`

## 🔑 **Step 4: Get Your Credentials**

1. **Note your App ID and App Secret** from the app dashboard
2. **Update your `.env` file** with these values:

```env
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
```

## 🧪 **Step 5: Test the Integration**

1. **Restart your server**: `npm start`
2. **Open your app**: `http://localhost:3000`
3. **Click "Connect Instagram Account"** button
4. **Authorize your Instagram account**
5. **Add your own Instagram username** to the feed
6. **Watch real Instagram data appear!**

## 🎉 **What You'll See:**

- ✅ **Real Instagram posts** from your account
- ✅ **Actual media content** (images/videos)
- ✅ **Real captions and timestamps**
- ✅ **Live updates** when you post new content

## ⚠️ **Important Notes:**

### **What Works:**
- ✅ Your own Instagram content
- ✅ Content from accounts that authorize your app
- ✅ Real-time updates (with rate limits)

### **What Doesn't Work:**
- ❌ Content from accounts that haven't authorized your app
- ❌ Private accounts (unless they authorize your app)

## 🔄 **For Testing Multiple Accounts:**

To test with other Instagram accounts:
1. **Ask friends/family** to authorize your app
2. **Use their Instagram usernames** in your feed
3. **Their content will appear** in real-time

## 🚀 **Next Steps:**

1. **Set up your Facebook app** (follow steps above)
2. **Update your `.env` file** with credentials
3. **Test with your own Instagram account**
4. **Share with friends** to test multiple accounts

## 📞 **Need Help?**

If you encounter any issues:
1. Check the browser console for errors
2. Verify your app credentials are correct
3. Ensure your Instagram account is public
4. Check that your app is in "Development" mode

**Your app is now ready for real Instagram integration! 🎉** 