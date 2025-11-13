import oauthConfig from '../config/oauthConfig';
import { auth } from '../config/firebase';

// Generate random string for state
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

// Start Instagram OAuth flow
export const initiateInstagramAuth = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    console.log('🚀 Starting Instagram OAuth...');
    
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
      client_id: oauthConfig.instagram.appId,
      redirect_uri: oauthConfig.instagram.redirectUri,
      scope: oauthConfig.instagram.scope.join(','),
      state: encodedState,
      response_type: 'code'
    });

    const authUrl = `${oauthConfig.instagram.authorizationUrl}?${params.toString()}`;
    console.log('🔄 Redirecting to Instagram OAuth...');
    
    window.location.href = authUrl;
  } catch (error) {
    console.error('❌ Error initiating Instagram auth:', error);
    throw error;
  }
};

export default {
  initiateInstagramAuth
};