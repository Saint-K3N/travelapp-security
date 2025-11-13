// src/services/facebookOAuthService.js
import oauthConfig from '../config/oauthConfig';
import { auth } from '../config/firebase';

// Generate random string for state
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

// Start Facebook OAuth flow
export const initiateFacebookAuth = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    console.log('🚀 Starting Facebook OAuth...');
    
    const state = generateRandomString(32);
    console.log('✅ State generated');

    // Encode data in state parameter
    const stateData = {
      state: state,
      userId: currentUser.uid
    };
    
    const encodedState = btoa(JSON.stringify(stateData));

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: oauthConfig.facebook.appId,
      redirect_uri: oauthConfig.facebook.redirectUri,
      scope: oauthConfig.facebook.scope.join(','),
      state: encodedState,
      response_type: 'code'
    });

    const authUrl = `${oauthConfig.facebook.authorizationUrl}?${params.toString()}`;
    console.log('🔄 Redirecting to Facebook...');
    
    window.location.href = authUrl;
  } catch (error) {
    console.error('❌ Error initiating Facebook auth:', error);
    throw error;
  }
};

export default {
  initiateFacebookAuth
};