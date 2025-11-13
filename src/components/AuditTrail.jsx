import React, { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaDownload, 
  FaFilter, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle 
} from 'react-icons/fa';
import { getAuditLogs, exportAuditLogs } from '../services/auditService';
import '../styles/AuditTrail.css';

function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    severity: 'all',
    timeRange: '7days'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters, searchTerm]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const auditLogs = await getAuditLogs({ limit: 200 });
      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(log => log.actionCategory === filters.category);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '1hour': 1 * 60 * 60 * 1000,
        '24hours': 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000
      };
      
      const rangeMs = timeRanges[filters.timeRange];
      if (rangeMs) {
        filtered = filtered.filter(log => {
          const logTime = log.timestamp?.getTime() || 0;
          return now.getTime() - logTime <= rangeMs;
        });
      }
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        return (
          log.adminEmail?.toLowerCase().includes(term) ||
          log.action?.toLowerCase().includes(term) ||
          JSON.stringify(log.details).toLowerCase().includes(term)
        );
      });
    }

    setFilteredLogs(filtered);
  };

  const handleExport = async () => {
    try {
      await exportAuditLogs(filteredLogs);
    } catch (error) {
      alert('Failed to export audit logs');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <FaExclamationTriangle className="severity-icon high" />;
      case 'medium':
        return <FaInfoCircle className="severity-icon medium" />;
      default:
        return <FaCheckCircle className="severity-icon low" />;
    }
  };

  const getSeverityClass = (severity) => {
    return `severity-badge ${severity}`;
  };

  if (loading) {
    return <div className="audit-loading">Loading audit trail...</div>;
  }

  return (
    <div className="audit-trail">
      <div className="audit-header">
        <h2><FaHistory /> Audit Trail</h2>
        <button className="btn-export" onClick={handleExport}>
          <FaDownload /> Export to CSV
        </button>
      </div>

      <div className="audit-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="all">All Categories</option>
            <option value="user_management">User Management</option>
            <option value="role_management">Role Management</option>
            <option value="deletion">Deletions</option>
            <option value="authentication">Authentication</option>
            <option value="access_control">Access Control</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select 
            value={filters.severity} 
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
          >
            <option value="all">All Levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Range:</label>
          <select 
            value={filters.timeRange} 
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
          >
            <option value="all">All Time</option>
            <option value="1hour">Last Hour</option>
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group search-group">
            <label>Search:</label>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="audit-stats">
        <div className="stat">
          <span className="stat-value">{filteredLogs.length}</span>
          <span className="stat-label">Total Entries</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {filteredLogs.filter(l => l.severity === 'high').length}
          </span>
          <span className="stat-label">High Severity</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {filteredLogs.filter(l => !l.success).length}
          </span>
          <span className="stat-label">Failed Actions</span>
        </div>
      </div>

      <div className="audit-logs-container">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">No audit logs found matching your filters</div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className={`audit-log-entry ${log.success ? '' : 'failed'}`}>
              <div className="log-header">
                <div className="log-severity">
                  {getSeverityIcon(log.severity)}
                  <span className={getSeverityClass(log.severity)}>
                    {log.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="log-timestamp">
                  {log.timestamp?.toLocaleString() || 'Unknown time'}
                </div>
              </div>
              
              <div className="log-body">
                <div className="log-action">
                  <strong>Action:</strong> {log.action}
                </div>
                <div className="log-admin">
                  <strong>Performed by:</strong> {log.adminEmail} ({log.adminUsername})
                </div>
                <div className="log-category">
                  <strong>Category:</strong> {log.actionCategory}
                </div>
                {log.ipAddress && (
                  <div className="log-ip">
                    <strong>IP Address:</strong> {log.ipAddress}
                  </div>
                )}
              </div>

              {log.details && Object.keys(log.details).length > 0 && (
                <div className="log-details">
                  <strong>Details:</strong>
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}

              {!log.success && (
                <div className="log-error">
                  <FaExclamationTriangle /> This action failed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditTrail;