import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Get user's IP address
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

// Main audit logging function
export const logAuditTrail = async (action, details = {}) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const auditEntry = {
      // Who performed the action
      adminId: user.uid,
      adminEmail: user.email,
      adminUsername: user.displayName || 'Unknown',
      
      // What action was performed
      action: action,
      actionCategory: categorizeAction(action),
      
      // Details of the action
      details: details,
      
      // When it happened
      timestamp: serverTimestamp(),
      
      // Where it happened from
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      
      // Additional metadata
      severity: determineSeverity(action),
      success: details.success !== false // Default to true unless specified
    };

    await addDoc(collection(db, 'auditTrail'), auditEntry);
    
    console.log('Audit logged:', action);
  } catch (error) {
    console.error('Error logging audit trail:', error);
    // Don't throw error - audit logging should not break app functionality
  }
};

// Categorize actions for filtering
const categorizeAction = (action) => {
  const categories = {
    'USER_REGISTRATION': 'user_management',
    'USER_LOGIN': 'authentication',
    'USER_LOGOUT': 'authentication',
    'USER_ACCOUNT_DELETE': 'deletion',
    'USER_PROFILE': 'user_management',
    'USER_DELETE': 'deletion',
    'ROLE_': 'role_management',
    'DELETE_': 'deletion',
    'LOGIN_': 'authentication',
    'ADMIN_LOGIN': 'authentication',
    'PASSWORD_RESET': 'authentication',  
    'EMAIL_VERIF': 'authentication',     
    'ACCESS_': 'access_control',
    'SETTINGS_': 'settings'
  };
  
  for (const [prefix, category] of Object.entries(categories)) {
    if (action.startsWith(prefix) || action.includes(prefix)) {
      return category;
    }
  }
  
  return 'general';
};

// Determine severity level
const determineSeverity = (action) => {
  const highSeverity = ['DELETE', 'ROLE_UPDATED', 'PERMISSION', 'ADMIN_LOGIN'];
  const mediumSeverity = ['UPDATE', 'CREATE', 'MODIFY', 'PASSWORD_RESET', 'ROLE_UPDATE'];
  
  if (highSeverity.some(keyword => action.includes(keyword))) return 'high';
  if (mediumSeverity.some(keyword => action.includes(keyword))) return 'medium';
  return 'low';
};

// Retrieve audit logs with filters
export const getAuditLogs = async (filters = {}) => {
  try {
    const logsRef = collection(db, 'auditTrail');
    let q = query(logsRef, orderBy('timestamp', 'desc'));
    
    // Apply filters
    if (filters.adminId) {
      q = query(q, where('adminId', '==', filters.adminId));
    }
    
    if (filters.category) {
      q = query(q, where('actionCategory', '==', filters.category));
    }
    
    if (filters.severity) {
      q = query(q, where('severity', '==', filters.severity));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    } else {
      q = query(q, limit(100)); // Default limit
    }
    
    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Get audit logs for specific user action
export const getUserAuditHistory = async (userId) => {
  try {
    const logsRef = collection(db, 'auditTrail');
    const q = query(
      logsRef,
      where('details.targetUserId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching user audit history:', error);
    throw error;
  }
};

// Export audit logs to CSV
export const exportAuditLogs = async (logs) => {
  try {
    const headers = [
      'Timestamp',
      'Admin Email',
      'Action',
      'Category',
      'Severity',
      'Details',
      'IP Address',
      'Success'
    ];
    
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.timestamp?.toLocaleString() || '',
        log.adminEmail || '',
        log.action || '',
        log.actionCategory || '',
        log.severity || '',
        JSON.stringify(log.details).replace(/,/g, ';'),
        log.ipAddress || '',
        log.success ? 'Yes' : 'No'
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
};