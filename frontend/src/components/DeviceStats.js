import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import apiService from '../api/apiService';

const DeviceStats = () => {
  const [loading, setLoading] = useState(true);
  const [deviceData, setDeviceData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDeviceStats();
        
        if (response.success) {
          const data = response.data;
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
      } catch (error) {
        console.error('Error fetching device statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
      <h1>Device Type Statistics</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {deviceData && (
          <Pie 
            data={deviceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Device Type Distribution',
                  font: {
                    size: 16
                  }
                },
                legend: {
                  position: 'right'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        )}
      </div>
      
      {/* Table view of the same data */}
      {deviceData && (
        <div className="table-container" style={{ marginTop: '30px' }}>
          <h2>Detailed Device Type Statistics</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Device Type</th>
                <th>User Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {deviceData.labels.map((deviceType, index) => {
                const total = deviceData.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((deviceData.datasets[0].data[index] / total) * 100).toFixed(2);
                
                return (
                  <tr key={index}>
                    <td>{deviceType}</td>
                    <td>{deviceData.datasets[0].data[index]}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeviceStats;
