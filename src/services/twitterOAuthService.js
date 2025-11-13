// src/services/twitterOAuthService.js
import oauthConfig from '../config/oauthConfig';
import { auth } from '../config/firebase';


// Generate random string for PKCE (Proof Key for Code Exchange)
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

// Generate code challenge for PKCE
const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// Start Twitter OAuth flow
export const initiateTwitterAuth = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    console.log('🚀 Starting Twitter OAuth...');
    
    // Generate PKCE values
    const codeVerifier = generateRandomString(128);
    console.log('✅ Code verifier generated');
    
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log('✅ Code challenge generated');
    
    const state = generateRandomString(32);
    console.log('✅ State generated');

    // Encode data in state parameter (Twitter will pass this back to us)
    const stateData = {
      state: state,
      userId: currentUser.uid,
      codeVerifier: codeVerifier
    };
    
    const encodedState = btoa(JSON.stringify(stateData));

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauthConfig.twitter.clientId,
      redirect_uri: oauthConfig.twitter.redirectUri,
      scope: oauthConfig.twitter.scope.join(' '),
      state: encodedState,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${oauthConfig.twitter.authorizationUrl}?${params.toString()}`;
    console.log('🔄 Redirecting to Twitter...');
    
    window.location.href = authUrl;
  } catch (error) {
    console.error('❌ Error initiating Twitter auth:', error);
    throw error;
  }
};

// Handle OAuth callback and exchange code for token
export const handleTwitterCallback = async (code, state) => {
  try {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('twitter_state');
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    // Get code verifier
    const codeVerifier = sessionStorage.getItem('twitter_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(oauthConfig.twitter.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${oauthConfig.twitter.clientId}:${oauthConfig.twitter.clientSecret}`)}`
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: oauthConfig.twitter.redirectUri,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
    }

    const tokens = await tokenResponse.json();

    // Clean up session storage
    sessionStorage.removeItem('twitter_code_verifier');
    sessionStorage.removeItem('twitter_state');

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    };
  } catch (error) {
    console.error('Error handling Twitter callback:', error);
    throw error;
  }
};

// Get Twitter user info
export const getTwitterUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting Twitter user info:', error);
    throw error;
  }
};

// Post a tweet
export const postTweet = async (accessToken, tweetText) => {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: tweetText
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to post tweet: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
};

export default {
  initiateTwitterAuth,
  handleTwitterCallback,
  getTwitterUserInfo,
  postTweet
};