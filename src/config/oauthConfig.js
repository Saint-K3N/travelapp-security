export const oauthConfig = {
  twitter: {
    clientId: 'b1dlR3E1M0FqZWZXajRvLTl3UG46MTpjaQ',
    clientSecret: '8FsIvQZlZc9Etq1CmzNDi8E8YADnZwC41gcr4hruyen2hJu5N9',
    apiKey: 'M5lPMU0U5rw2ChjbuKkSr',
    apiSecret: 'lCkmzVH77w4XjYxdEr3Mu3RL0uSw1MYtUhFxwFr0NbuKkSr',
    redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/twitterCallback',
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
  },
  facebook: {
    appId: '838116569084762',
    appSecret: '075e9e80543564e98b18207fa3f37daf',
    redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/facebookCallback',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    graphApiUrl: 'https://graph.facebook.com/v18.0',
    scope: ['public_profile', 'email', 'pages_manage_posts', 'pages_read_engagement']
  },
  instagram: {
  appId: '838116569084762',
  appSecret: '075e9e80543564e98b18207fa3f37daf',
  redirectUri: 'https://us-central1-travelapp-security.cloudfunctions.net/instagramCallback',
  authorizationUrl: 'https://api.instagram.com/oauth/authorize', 
  tokenUrl: 'https://api.instagram.com/oauth/access_token', 
  scope: ['user_profile', 'user_media']
}
};

export default oauthConfig;