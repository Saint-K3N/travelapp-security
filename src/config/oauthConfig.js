export const oauthConfig = {
  twitter: {
    clientId: process.env.REACT_APP_TWITTER_CLIENT_ID,
    clientSecret: process.env.REACT_APP_TWITTER_CLIENT_SECRET,
    apiKey: process.env.REACT_APP_TWITTER_API_KEY || 'M5lPMU0U5rw2ChjbuKkSr',
    apiSecret: process.env.REACT_APP_TWITTER_API_SECRET || 'lCkmzVH77w4XjYxdEr3Mu3RL0uSw1MYtUhFxwFr0NbuKkSr',
    redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/twitterCallback',
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
  },
  facebook: {
    appId: process.env.REACT_APP_FACEBOOK_APP_ID,
    appSecret: process.env.REACT_APP_FACEBOOK_APP_SECRET,
    redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/facebookCallback',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    graphApiUrl: 'https://graph.facebook.com/v18.0',
    scope: ['public_profile', 'email', 'pages_manage_posts', 'pages_read_engagement']
  },
  instagram: {
    appId: process.env.REACT_APP_INSTAGRAM_APP_ID,
    appSecret: process.env.REACT_APP_INSTAGRAM_APP_SECRET,
    redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/instagramCallback',
    authorizationUrl: 'https://api.instagram.com/oauth/authorize', 
    tokenUrl: 'https://api.instagram.com/oauth/access_token', 
    scope: ['user_profile', 'user_media']
  }
};

export default oauthConfig;