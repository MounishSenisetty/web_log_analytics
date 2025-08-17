import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

const UserSessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserSessions();
        
        if (response.success) {
          setSessions(response.data);
        }
      } catch (error) {
        console.error('Error fetching user sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDuration = (minutes) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>User Sessions</h1>
      
      <div className="session-stats" style={{ margin: '20px 0', display: 'flex', gap: '20px' }}>
        <div className="stat-card" style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3>Total Sessions</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sessions.length}</div>
        </div>
        
        <div className="stat-card" style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3>Average Session Duration</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatDuration(sessions.reduce((acc, session) => acc + session.duration_minutes, 0) / sessions.length)}
          </div>
        </div>
        
        <div className="stat-card" style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3>Average Page Views</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {(sessions.reduce((acc, session) => acc + session.page_views, 0) / sessions.length).toFixed(1)}
          </div>
        </div>
      </div>
      
      <h2>Session List</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Page Views</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.session_id}>
                <td>{session.session_id}</td>
                <td>{formatDateTime(session.start_time)}</td>
                <td>{formatDateTime(session.end_time)}</td>
                <td>{formatDuration(session.duration_minutes)}</td>
                <td>{session.page_views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSessions;
