const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Twitter OAuth Configuration
const TWITTER_CLIENT_ID = 'b1dlR3E1M0FqZWZXajRvLTl3UG46MTpjaQ';
const TWITTER_CLIENT_SECRET = '8FsIvQZlZc9Etq1CmzNDi8E8YADnZwC41gcr4hruyen2hJu5N9';
const TWITTER_REDIRECT_URI = 'https://us-central1-travelapp-security.cloudfunctions.net/twitterCallback';

// Facebook OAuth Configuration
const FACEBOOK_APP_ID = '838116569084762';
const FACEBOOK_APP_SECRET = '075e9e80543564e98b18207fa3f37daf';
const FACEBOOK_REDIRECT_URI = 'https://us-central1-travelapp-security.cloudfunctions.net/facebookCallback';

// Instagram OAuth Configuration (Uses same Facebook app)
const INSTAGRAM_APP_ID = '838116569084762';
const INSTAGRAM_APP_SECRET = '075e9e80543564e98b18207fa3f37daf';
const INSTAGRAM_REDIRECT_URI = 'https://us-central1-travelapp-security.cloudfunctions.net/instagramCallback';

// Handle Twitter OAuth Callback
exports.twitterCallback = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { code, state: encodedState } = req.query;

      if (!code || !encodedState) {
        return res.status(400).send('Missing required parameters');
      }

      const stateData = JSON.parse(Buffer.from(encodedState, 'base64').toString('utf-8'));
      const { state, userId, codeVerifier } = stateData;

      if (!state || !userId || !codeVerifier) {
        return res.status(400).send('Invalid state parameter');
      }

      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: TWITTER_REDIRECT_URI,
          code_verifier: codeVerifier
        })
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error('Token exchange failed:', error);
        return res.redirect(`http://localhost:3000/share?error=token_exchange_failed`);
      }

      const tokens = await tokenResponse.json();

      await admin.firestore().collection('socialTokens').doc(userId).set({
        twitter: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          tokenType: tokens.token_type,
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });

      await admin.firestore().collection('socialConnections').doc(userId).set({
        twitter: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return res.redirect('http://localhost:3000/share?twitter=connected');

    } catch (error) {
      console.error('Error in Twitter callback:', error);
      return res.redirect(`http://localhost:3000/share?error=${error.message}`);
    }
  });
});

// Handle Facebook OAuth Callback
exports.facebookCallback = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { code, state: encodedState } = req.query;

      if (!code || !encodedState) {
        return res.status(400).send('Missing required parameters');
      }

      const stateData = JSON.parse(Buffer.from(encodedState, 'base64').toString('utf-8'));
      const { state, userId } = stateData;

      if (!state || !userId) {
        return res.status(400).send('Invalid state parameter');
      }

      // Exchange code for access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${FACEBOOK_REDIRECT_URI}&` +
        `code=${code}`;

      const tokenResponse = await fetch(tokenUrl);

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error('Token exchange failed:', error);
        return res.redirect(`http://localhost:3000/share?error=facebook_token_failed`);
      }

      const tokens = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokens.access_token}`
      );

      const userInfo = await userInfoResponse.json();

      // Save tokens to Firestore
      await admin.firestore().collection('socialTokens').doc(userId).set({
        facebook: {
          accessToken: tokens.access_token,
          tokenType: tokens.token_type,
          expiresIn: tokens.expires_in,
          userId: userInfo.id,
          userName: userInfo.name,
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });

      // Update connection status
      await admin.firestore().collection('socialConnections').doc(userId).set({
        facebook: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return res.redirect('http://localhost:3000/share?facebook=connected');

    } catch (error) {
      console.error('Error in Facebook callback:', error);
      return res.redirect(`http://localhost:3000/share?error=${error.message}`);
    }
  });
});

// Handle Instagram OAuth Callback
exports.instagramCallback = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { code, state: encodedState } = req.query;

      if (!code || !encodedState) {
        return res.status(400).send('Missing required parameters');
      }

      const stateData = JSON.parse(Buffer.from(encodedState, 'base64').toString('utf-8'));
      const { state, userId } = stateData;

      if (!state || !userId) {
        return res.status(400).send('Invalid state parameter');
      }

      // Exchange code for access token (uses Facebook Graph API)
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${INSTAGRAM_APP_ID}&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `redirect_uri=${INSTAGRAM_REDIRECT_URI}&` +
        `code=${code}`;

      const tokenResponse = await fetch(tokenUrl);

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error('Token exchange failed:', error);
        return res.redirect(`http://localhost:3000/share?error=instagram_token_failed`);
      }

      const tokens = await tokenResponse.json();

      // Get Facebook user info first
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${tokens.access_token}`
      );

      const userInfo = await userInfoResponse.json();

      // Get user's Instagram Business accounts
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${userInfo.id}/accounts?access_token=${tokens.access_token}`
      );

      const accountsData = await accountsResponse.json();
      let instagramAccountId = null;

      // Try to get Instagram Business Account ID from connected Pages
      if (accountsData.data && accountsData.data.length > 0) {
        for (const page of accountsData.data) {
          const igAccountResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${tokens.access_token}`
          );
          const igAccountData = await igAccountResponse.json();
          
          if (igAccountData.instagram_business_account) {
            instagramAccountId = igAccountData.instagram_business_account.id;
            break;
          }
        }
      }

      // Save tokens to Firestore
      await admin.firestore().collection('socialTokens').doc(userId).set({
        instagram: {
          accessToken: tokens.access_token,
          tokenType: tokens.token_type,
          expiresIn: tokens.expires_in,
          userId: userInfo.id,
          userName: userInfo.name,
          instagramAccountId: instagramAccountId,
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });

      // Update connection status
      await admin.firestore().collection('socialConnections').doc(userId).set({
        instagram: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return res.redirect('http://localhost:3000/share?instagram=connected');

    } catch (error) {
      console.error('Error in Instagram callback:', error);
      return res.redirect(`http://localhost:3000/share?error=${error.message}`);
    }
  });
});

// Post Tweet Function
exports.postTweet = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { tweetText, userId } = req.body;

      if (!tweetText || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const tokenDoc = await admin.firestore().collection('socialTokens').doc(userId).get();
      
      if (!tokenDoc.exists || !tokenDoc.data().twitter) {
        return res.status(403).json({ error: 'Twitter not connected' });
      }

      const accessToken = tokenDoc.data().twitter.accessToken;

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
        console.error('Failed to post tweet:', error);
        return res.status(500).json({ error: `Failed to post tweet: ${JSON.stringify(error)}` });
      }

      const result = await response.json();
      return res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error posting tweet:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Post to Facebook Function
exports.postFacebook = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { message, userId } = req.body;

      if (!message || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const tokenDoc = await admin.firestore().collection('socialTokens').doc(userId).get();
      
      if (!tokenDoc.exists || !tokenDoc.data().facebook) {
        return res.status(403).json({ error: 'Facebook not connected' });
      }

      const accessToken = tokenDoc.data().facebook.accessToken;
      const facebookUserId = tokenDoc.data().facebook.userId;

      // Post to Facebook feed
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${facebookUserId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            access_token: accessToken
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to post to Facebook:', error);
        return res.status(500).json({ error: `Failed to post: ${JSON.stringify(error)}` });
      }

      const result = await response.json();
      return res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error posting to Facebook:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// Post to Instagram Function
exports.postInstagram = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { caption, imageUrl, userId } = req.body;

      if (!caption || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const tokenDoc = await admin.firestore().collection('socialTokens').doc(userId).get();
      
      if (!tokenDoc.exists || !tokenDoc.data().instagram) {
        return res.status(403).json({ error: 'Instagram not connected' });
      }

      const accessToken = tokenDoc.data().instagram.accessToken;
      const instagramAccountId = tokenDoc.data().instagram.instagramAccountId;

      if (!instagramAccountId) {
        return res.status(403).json({ error: 'No Instagram Business account linked' });
      }

      // Note: Instagram Graph API requires image URL for posting
      // This is a simplified version - actual implementation may need media container creation
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            caption: caption,
            image_url: imageUrl,
            access_token: accessToken
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to create Instagram media:', error);
        return res.status(500).json({ error: `Failed to post: ${JSON.stringify(error)}` });
      }

      const mediaData = await response.json();
      
      // Publish the media
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            creation_id: mediaData.id,
            access_token: accessToken
          })
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        console.error('Failed to publish Instagram media:', error);
        return res.status(500).json({ error: `Failed to publish: ${JSON.stringify(error)}` });
      }

      const result = await publishResponse.json();
      return res.status(200).json({ success: true, data: result });

    } catch (error) {
      console.error('Error posting to Instagram:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});