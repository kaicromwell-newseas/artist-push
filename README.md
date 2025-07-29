# Artist Push - Instagram Feed App

A minimal web application that monitors specific Instagram accounts and sends email notifications for new posts. Perfect for staying connected with your favorite artists while reducing social media consumption.

## Features

- 📱 **Live Instagram Feed**: Real-time updates from monitored accounts
- 📧 **Email Notifications**: Get notified instantly when accounts post new content
- 🎨 **Minimal Design**: Clean, distraction-free interface
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: Live feed updates using WebSocket connections
- 🔧 **Customizable**: Adjust notification frequency and email settings

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail account (for email notifications)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd artist-push
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Instagram API Configuration
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
   
   # Email Configuration for Notifications
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   NOTIFICATION_EMAIL=your_notification_email@example.com
   
   # Server Configuration
   PORT=3000
   
   # Instagram accounts to monitor (comma-separated usernames)
   INSTAGRAM_ACCOUNTS=username1,username2,username3
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

### Instagram API Setup

**Important**: Instagram's official API has limited access. You'll need to use a third-party service:

#### Option 1: RapidAPI Instagram API
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to an Instagram API service
3. Get your API key and update the server code

#### Option 2: Social Blade API
1. Sign up at [Social Blade](https://socialblade.com)
2. Get API access for Instagram data
3. Update the API endpoints in `server.js`

#### Option 3: Web Scraping (Advanced)
For educational purposes, you could implement web scraping using Puppeteer or similar tools.

### Email Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Use the app password** in your `.env` file

### Example .env Configuration

```env
# Instagram API (using RapidAPI example)
INSTAGRAM_ACCESS_TOKEN=your_rapidapi_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=your_16_character_app_password
NOTIFICATION_EMAIL=notifications@yourdomain.com

# Server
PORT=3000

# Accounts to monitor
INSTAGRAM_ACCOUNTS=artist1,artist2,designer3
```

## Usage

### Adding Instagram Accounts

1. Open the web interface at `http://localhost:3000`
2. Go to the Settings section in the sidebar
3. Add Instagram usernames (without @) to monitor
4. Save your settings

### Customizing Notifications

- **Email Address**: Set where you want to receive notifications
- **Check Interval**: How often to check for new posts (5 minutes to 1 hour)
- **Real-time Updates**: The feed updates automatically when new posts are detected

### Features

- **Live Feed**: See posts from all monitored accounts in one place
- **Email Alerts**: Get notified immediately when accounts post
- **Direct Links**: Click to view posts on Instagram
- **Copy Links**: Share posts easily
- **Responsive Design**: Works on all devices

## Development

### Project Structure

```
artist-push/
├── server.js          # Main server file
├── package.json       # Dependencies
├── env.example        # Environment variables template
├── public/            # Frontend files
│   ├── index.html     # Main HTML page
│   ├── styles.css     # CSS styles
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload

### Customization

#### Adding New Instagram API

1. Update the `getInstagramUserInfo()` and `getInstagramPosts()` functions in `server.js`
2. Replace the mock data with real API calls
3. Update the data structure to match your API response

#### Styling

- Edit `public/styles.css` to customize the appearance
- The app uses CSS Grid and Flexbox for responsive design
- Color scheme can be modified in the CSS variables

#### Notification Settings

- Modify the email template in `sendEmailNotification()` function
- Add different notification types (SMS, push notifications, etc.)
- Customize the notification frequency

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check your Gmail app password
   - Ensure 2FA is enabled
   - Verify SMTP settings

2. **Instagram API errors**
   - Verify your API key is valid
   - Check API rate limits
   - Ensure accounts are public

3. **Server won't start**
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Check environment variables

### Debug Mode

Run with debug logging:
```bash
DEBUG=* npm start
```

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive data
- Consider using a reverse proxy for production
- Implement rate limiting for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter issues or have questions:
1. Check the troubleshooting section
2. Review the configuration examples
3. Open an issue on GitHub

---

**Note**: This app currently uses mock Instagram data for demonstration. To use with real Instagram data, you'll need to implement a proper Instagram API integration using one of the methods described above. 