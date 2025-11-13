import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaLink, FaImage, FaCheckCircle, FaLock, FaCopy, FaCheck } from 'react-icons/fa';
import { 
  FacebookIcon,
  TwitterIcon
} from 'react-share';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getSocialConnections, disconnectTwitter, disconnectFacebook, disconnectInstagram } from '../services/socialService';import { initiateTwitterAuth } from '../services/twitterOAuthService';
import { initiateFacebookAuth } from '../services/facebookOAuthService';
import '../styles/Share.css';
import OAuthWarningModal from '../components/OAuthWarningModal';
import { initiateInstagramAuth } from '../services/instagramOAuthService';

function Share() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    facebook: false,
    instagram: false,
    twitter: false
  });

  const [postData, setPostData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState(null);

  // Check login status and load social connections
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Load social connections from Firestore
        try {
          const connections = await getSocialConnections(user.uid);
          setConnectedPlatforms(connections);
        } catch (err) {
          console.error('Error loading connections:', err);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle success/error messages from callback
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }

    if (location.state?.error) {
      setErrorMessage(location.state.error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleConnectTwitter = async () => {
    if (!currentUser) return;

    try {
      // If already connected, ask to disconnect
      if (connectedPlatforms.twitter) {
        const confirm = window.confirm('Do you want to disconnect Twitter?');
        if (confirm) {
          await disconnectTwitter(currentUser.uid);
          setConnectedPlatforms({ ...connectedPlatforms, twitter: false });
          setSuccessMessage('Twitter disconnected successfully!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
        return;
      }

      // Start OAuth flow
      await initiateTwitterAuth();
    } catch (err) {
      console.error('Error connecting Twitter:', err);
      setErrorMessage('Failed to connect Twitter. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleConnectFacebook = async () => {
    if (!currentUser) return;

    try {
      // If already connected, ask to disconnect
      if (connectedPlatforms.facebook) {
        const confirm = window.confirm('Do you want to disconnect Facebook?');
        if (confirm) {
          await disconnectFacebook(currentUser.uid);
          setConnectedPlatforms({ ...connectedPlatforms, facebook: false });
          setSuccessMessage('Facebook disconnected successfully!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
        return;
      }

      // Start OAuth flow (full redirect like Twitter)
      await initiateFacebookAuth();
    } catch (err) {
      console.error('Error connecting Facebook:', err);
      setErrorMessage('Failed to connect Facebook. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleConnectInstagram = async () => {
  if (!currentUser) return;

  try {
    // If already connected, ask to disconnect
    if (connectedPlatforms.instagram) {
      const confirm = window.confirm('Do you want to disconnect Instagram?');
      if (confirm) {
        await disconnectInstagram(currentUser.uid);
        setConnectedPlatforms({ ...connectedPlatforms, instagram: false });
        setSuccessMessage('Instagram disconnected successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      return;
    }

    // Start OAuth flow (full redirect)
    await initiateInstagramAuth();
  } catch (err) {
    console.error('Error connecting Instagram:', err);
    setErrorMessage('Failed to connect Instagram. Please try again.');
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }
};

  const handleConnect = async (platform) => {
  // If already connected, handle disconnect
  if (connectedPlatforms[platform]) {
    if (platform === 'twitter') {
      await handleConnectTwitter();
    } else if (platform === 'facebook') {
      await handleConnectFacebook();
    } else if (platform === 'instagram') {
      await handleConnectInstagram();
    }
    return;
  }

  // Show warning modal for new connections
  setPendingPlatform(platform);
  setShowOAuthModal(true);
};

  const handleOAuthConfirm = async () => {
  setShowOAuthModal(false);
  
  if (pendingPlatform === 'twitter') {
    await handleConnectTwitter();
  } else if (pendingPlatform === 'facebook') {
    await handleConnectFacebook();
  } else if (pendingPlatform === 'instagram') {
    await handleConnectInstagram();
  } else {
    alert(`${pendingPlatform} OAuth integration coming soon!`);
  }
  
  setPendingPlatform(null);
};

  const handleOAuthCancel = () => {
    setShowOAuthModal(false);
    setPendingPlatform(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };
  
  const copyPostToClipboard = () => {
    const text = `${postData.title}

${postData.description}

${postData.imageUrl ? `📷 ${postData.imageUrl}` : ''}
${postData.link ? `🔗 ${postData.link}` : ''}

#TravelCompanion #Travel`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
    
  const handleShareToTwitter = async () => {
    if (!connectedPlatforms.twitter) {
      alert('Please connect to Twitter first!');
      return;
    }

    if (!postData.title || !postData.description) {
      alert('Please fill in at least the title and description!');
      return;
    }

    setPosting(true);

    try {
      // Prepare tweet text (max 280 characters)
      let tweetText = `${postData.title}\n\n${postData.description}`;
      
      if (postData.link) {
        tweetText += `\n\n${postData.link}`;
      }
      
      tweetText += '\n\n#TravelCompanion #Travel';

      // Truncate if too long
      if (tweetText.length > 280) {
        tweetText = tweetText.substring(0, 277) + '...';
      }

      // Call Cloud Function via HTTP
      const response = await fetch('https://us-central1-travelapp-security.cloudfunctions.net/postTweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tweetText: tweetText,
          userId: currentUser.uid
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Successfully posted to Twitter!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Clear form
        setPostData({
          title: '',
          description: '',
          imageUrl: '',
          link: ''
        });
      } else {
        throw new Error(result.error || 'Failed to post tweet');
      }
    } catch (err) {
      console.error('Error posting to Twitter:', err);
      setErrorMessage(err.message || 'Failed to post to Twitter. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setPosting(false);
    }
  };

  const handleShareToFacebook = async () => {
    if (!connectedPlatforms.facebook) {
      alert('Please connect to Facebook first!');
      return;
    }

    if (!postData.title || !postData.description) {
      alert('Please fill in at least the title and description!');
      return;
    }

    setPosting(true);

    try {
      // Prepare Facebook post message
      let message = `${postData.title}\n\n${postData.description}`;
      
      if (postData.link) {
        message += `\n\n${postData.link}`;
      }
      
      message += '\n\n#TravelCompanion #Travel';

      // Call Cloud Function via HTTP
      const response = await fetch('https://us-central1-travelapp-security.cloudfunctions.net/postFacebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          userId: currentUser.uid
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Successfully posted to Facebook!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Clear form
        setPostData({
          title: '',
          description: '',
          imageUrl: '',
          link: ''
        });
      } else {
        throw new Error(result.error || 'Failed to post to Facebook');
      }
    } catch (err) {
      console.error('Error posting to Facebook:', err);
      setErrorMessage(err.message || 'Failed to post to Facebook. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setPosting(false);
    }
  };

  const handleShare = (platform) => {
    if (!connectedPlatforms[platform]) {
      alert(`Please connect to ${platform} first!`);
      return;
    }

    if (!postData.title || !postData.description) {
      alert('Please fill in at least the title and description!');
      return;
    }

    if (platform === 'twitter') {
      handleShareToTwitter();
      return;
    }

    if (platform === 'facebook') {
      handleShareToFacebook();
      return;
    }

    // For other platforms
    setSuccessMessage(`${platform} posting coming soon!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const shareUrl = postData.link || 'https://travelcompanion.com';
  const shareTitle = postData.title || 'Check out my travel adventure!';

  if (loading) {
    return (
      <div className="share-page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="share-page">
        <div className="container">
          <div className="login-required">
            <FaLock className="lock-icon" />
            <h2>Login Required</h2>
            <p>Please login to share your travel posts</p>
            <button className="btn-primary" onClick={() => navigate('/profile')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="share-page">
      <div className="container">
        <div className="page-header">
          <h1>Share Your Journey</h1>
          <p>Connect your social media accounts and share your travel experiences</p>
        </div>

        {showSuccess && (
          <div className="success-message">
            <FaCheckCircle /> {successMessage}
          </div>
        )}

        {showError && (
          <div className="error-message">
            ✗ {errorMessage}
          </div>
        )}

        <div className="share-content">
          {/* Platform Connection Section */}
          <div className="platforms-section">
            <h2>Connect Social Media</h2>
            <p className="section-description">
              Connect your social media accounts to share your travel posts
            </p>

            <div className="platforms-grid">
              <div className="platform-card">
                <div className="platform-header">
                  <FaFacebook className="platform-icon facebook" />
                  <h3>Facebook</h3>
                </div>
                <p>Share your adventures with friends and family on Facebook</p>
                <button 
                  className={`btn-connect ${connectedPlatforms.facebook ? 'connected' : ''}`}
                  onClick={() => handleConnect('facebook')}
                >
                  {connectedPlatforms.facebook ? (
                    <>
                      <FaCheckCircle /> Connected
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>

              <div className="platform-card">
                <div className="platform-header">
                  <FaInstagram className="platform-icon instagram" />
                  <h3>Instagram</h3>
                </div>
                <p>Share stunning travel photos and stories on Instagram</p>
                <button 
                  className={`btn-connect ${connectedPlatforms.instagram ? 'connected' : ''}`}
                  onClick={() => handleConnect('instagram')}
                >
                  {connectedPlatforms.instagram ? (
                    <>
                      <FaCheckCircle /> Connected
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>

              <div className="platform-card">
                <div className="platform-header">
                  <FaTwitter className="platform-icon twitter" />
                  <h3>Twitter (X)</h3>
                </div>
                <p>Tweet about your travel experiences and discoveries</p>
                <button 
                  className={`btn-connect ${connectedPlatforms.twitter ? 'connected' : ''}`}
                  onClick={() => handleConnect('twitter')}
                  disabled={posting}
                >
                  {connectedPlatforms.twitter ? (
                    <>
                      <FaCheckCircle /> Connected
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Create Post Section */}
          <div className="create-post-section">
            <h2>Create a Post</h2>
            <p className="section-description">
              Share your travel moments with your followers
            </p>

            <form className="post-form">
              <div className="form-group">
                <label htmlFor="title">Post Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={postData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazing day in Paris!"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={postData.description}
                  onChange={handleInputChange}
                  placeholder="Share your travel experience..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">
                  <FaImage /> Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={postData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="link">
                  <FaLink /> Link (Optional)
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={postData.link}
                  onChange={handleInputChange}
                  placeholder="https://your-blog.com"
                />
              </div>
            </form>

            {/* Post Preview */}
            {(postData.title || postData.description) && (
              <div className="post-preview">
                <h3>Post Preview</h3>
                <div className="preview-card">
                  {postData.imageUrl && (
                    <img 
                      src={postData.imageUrl} 
                      alt="Preview" 
                      className="preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {postData.title && <h4>{postData.title}</h4>}
                  {postData.description && <p>{postData.description}</p>}
                  {postData.link && (
                    <a href={postData.link} target="_blank" rel="noopener noreferrer">
                      {postData.link}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="share-buttons">
              <h3>Share To:</h3>
              
              <button 
                className="btn-copy-post"
                onClick={copyPostToClipboard}
                disabled={!postData.title || !postData.description}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Post Content'}</span>
              </button>

              <div className="share-divider">
                <span>Or share directly</span>
              </div>

              <div className="share-buttons-grid">
                <button 
                  className={`btn-share facebook ${!connectedPlatforms.facebook ? 'disabled' : ''}`}
                  onClick={() => handleShare('facebook')}
                  disabled={!connectedPlatforms.facebook}
                >
                  <FacebookIcon size={32} round />
                  <span>Share on Facebook</span>
                </button>

                <button 
                  className={`btn-share instagram ${!connectedPlatforms.instagram ? 'disabled' : ''}`}
                  onClick={() => handleShare('instagram')}
                >
                  <FaInstagram size={32} />
                  <span>Share on Instagram</span>
                </button>

                <button 
                  className={`btn-share twitter ${(!connectedPlatforms.twitter || posting) ? 'disabled' : ''}`}
                  onClick={() => handleShare('twitter')}
                  disabled={!connectedPlatforms.twitter || posting}
                >
                  <TwitterIcon size={32} round />
                  <span>{posting ? 'Posting...' : 'Share on Twitter'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showOAuthModal && (
          <OAuthWarningModal
            platform={pendingPlatform?.charAt(0).toUpperCase() + pendingPlatform?.slice(1)}
            onConfirm={handleOAuthConfirm}
            onCancel={handleOAuthCancel}
          />
        )}
      </div>
    </div>
  );
}

export default Share;