import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// API endpoints
const endpoints = {
  trafficOverview: `${API_BASE_URL}/traffic/overview`,
  topPages: `${API_BASE_URL}/top-pages`,
  geoDistribution: `${API_BASE_URL}/geo-distribution`,
  browserStats: `${API_BASE_URL}/browser-stats`,
  deviceStats: `${API_BASE_URL}/device-stats`,
  statusCodes: `${API_BASE_URL}/status-codes`,
  userSessions: `${API_BASE_URL}/user-sessions`,
  anomalies: `${API_BASE_URL}/anomalies`
};

// API service
const apiService = {
  // Get traffic overview data
  getTrafficOverview: async () => {
    try {
      const response = await axios.get(endpoints.trafficOverview);
      return response.data;
    } catch (error) {
      console.error('Error fetching traffic overview:', error);
      throw error;
    }
  },
  
  // Get top pages
  getTopPages: async () => {
    try {
      const response = await axios.get(endpoints.topPages);
      return response.data;
    } catch (error) {
      console.error('Error fetching top pages:', error);
      throw error;
    }
  },
  
  // Get geographic distribution
  getGeoDistribution: async () => {
    try {
      const response = await axios.get(endpoints.geoDistribution);
      return response.data;
    } catch (error) {
      console.error('Error fetching geo distribution:', error);
      throw error;
    }
  },
  
  // Get browser statistics
  getBrowserStats: async () => {
    try {
      const response = await axios.get(endpoints.browserStats);
      return response.data;
    } catch (error) {
      console.error('Error fetching browser stats:', error);
      throw error;
    }
  },
  
  // Get device statistics
  getDeviceStats: async () => {
    try {
      const response = await axios.get(endpoints.deviceStats);
      return response.data;
    } catch (error) {
      console.error('Error fetching device stats:', error);
      throw error;
    }
  },
  
  // Get HTTP status codes
  getStatusCodes: async () => {
    try {
      const response = await axios.get(endpoints.statusCodes);
      return response.data;
    } catch (error) {
      console.error('Error fetching status codes:', error);
      throw error;
    }
  },
  
  // Get user sessions
  getUserSessions: async () => {
    try {
      const response = await axios.get(endpoints.userSessions);
      return response.data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  },
  
  // Get anomalies
  getAnomalies: async () => {
    try {
      const response = await axios.get(endpoints.anomalies);
      return response.data;
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw error;
    }
  }
};

export default apiService;
