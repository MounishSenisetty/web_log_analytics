import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import apiService from '../api/apiService';

const TrafficOverview = () => {
  const [loading, setLoading] = useState(true);
  const [trafficData, setTrafficData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTrafficOverview();
        
        if (response.success) {
          const data = response.data;
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
      } catch (error) {
        console.error('Error fetching traffic overview:', error);
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
      <h1>Traffic Overview</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {trafficData && (
          <Line 
            data={trafficData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Requests'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Daily Traffic Overview',
                  font: {
                    size: 16
                  }
                },
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrafficOverview;
