import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import apiService from '../api/apiService';

// Register Chart.js components
Chart.register(...registerables);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [trafficData, setTrafficData] = useState(null);
  const [topPagesData, setTopPagesData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [browserData, setBrowserData] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [statusCodeData, setStatusCodeData] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          trafficResponse,
          topPagesResponse,
          geoResponse,
          browserResponse,
          deviceResponse,
          statusCodeResponse
        ] = await Promise.all([
          apiService.getTrafficOverview(),
          apiService.getTopPages(),
          apiService.getGeoDistribution(),
          apiService.getBrowserStats(),
          apiService.getDeviceStats(),
          apiService.getStatusCodes()
        ]);
        
        // Process traffic data
        if (trafficResponse.success) {
          const data = trafficResponse.data;
          setTrafficData({
            labels: data.map(item => item.date),
            datasets: [{
              label: 'Requests',
              data: data.map(item => item.request_count),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4
            }]
          });
        }
        
        // Process top pages data
        if (topPagesResponse.success) {
          const data = topPagesResponse.data;
          setTopPagesData({
            labels: data.map(item => item.url),
            datasets: [{
              label: 'Page Views',
              data: data.map(item => item.visit_count),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          });
        }
        
        // Process geo distribution data
        if (geoResponse.success) {
          const data = geoResponse.data;
          setGeoData({
            labels: data.map(item => item.country),
            datasets: [{
              label: 'Requests by Country',
              data: data.map(item => item.request_count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(199, 199, 199, 0.5)',
                'rgba(83, 102, 255, 0.5)',
                'rgba(40, 159, 64, 0.5)',
                'rgba(210, 199, 199, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)',
                'rgba(40, 159, 64, 1)',
                'rgba(210, 199, 199, 1)',
              ],
              borderWidth: 1
            }]
          });
        }
        
        // Process browser data
        if (browserResponse.success) {
          const data = browserResponse.data;
          setBrowserData({
            labels: data.map(item => item.browser),
            datasets: [{
              label: 'Browser Usage',
              data: data.map(item => item.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }]
          });
        }
        
        // Process device data
        if (deviceResponse.success) {
          const data = deviceResponse.data;
          setDeviceData({
            labels: data.map(item => item.device_type),
            datasets: [{
              label: 'Device Type',
              data: data.map(item => item.count),
              backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(255, 206, 86, 0.5)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
            }]
          });
        }
        
        // Process status code data
        if (statusCodeResponse.success) {
          const data = statusCodeResponse.data;
          setStatusCodeData({
            labels: data.map(item => `${item.status_code}`),
            datasets: [{
              label: 'HTTP Status Codes',
              data: data.map(item => item.count),
              backgroundColor: data.map(item => {
                const code = parseInt(item.status_code);
                if (code < 300) return 'rgba(75, 192, 192, 0.5)'; // 2xx
                if (code < 400) return 'rgba(255, 206, 86, 0.5)'; // 3xx
                if (code < 500) return 'rgba(255, 159, 64, 0.5)'; // 4xx
                return 'rgba(255, 99, 132, 0.5)'; // 5xx
              }),
              borderColor: data.map(item => {
                const code = parseInt(item.status_code);
                if (code < 300) return 'rgba(75, 192, 192, 1)'; // 2xx
                if (code < 400) return 'rgba(255, 206, 86, 1)'; // 3xx
                if (code < 500) return 'rgba(255, 159, 64, 1)'; // 4xx
                return 'rgba(255, 99, 132, 1)'; // 5xx
              }),
              borderWidth: 1
            }]
          });
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Web Log Analytics Dashboard</h1>
      
      <div className="dashboard">
        {/* Traffic Overview Chart */}
        <div className="chart-container">
          <h2 className="chart-title">Traffic Overview</h2>
          {trafficData && (
            <Line 
              data={trafficData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Top Pages Chart */}
        <div className="chart-container">
          <h2 className="chart-title">Top Pages</h2>
          {topPagesData && (
            <Bar 
              data={topPagesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Geographic Distribution Chart */}
        <div className="chart-container">
          <h2 className="chart-title">Geographic Distribution</h2>
          {geoData && (
            <Pie 
              data={geoData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Browser Stats Chart */}
        <div className="chart-container">
          <h2 className="chart-title">Browser Statistics</h2>
          {browserData && (
            <Doughnut 
              data={browserData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Device Type Chart */}
        <div className="chart-container">
          <h2 className="chart-title">Device Type</h2>
          {deviceData && (
            <Pie 
              data={deviceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* HTTP Status Codes Chart */}
        <div className="chart-container">
          <h2 className="chart-title">HTTP Status Codes</h2>
          {statusCodeData && (
            <Bar 
              data={statusCodeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
