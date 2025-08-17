import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import apiService from '../api/apiService';

const BrowserStats = () => {
  const [loading, setLoading] = useState(true);
  const [browserData, setBrowserData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBrowserStats();
        
        if (response.success) {
          const data = response.data;
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
      } catch (error) {
        console.error('Error fetching browser statistics:', error);
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
      <h1>Browser Statistics</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {browserData && (
          <Doughnut 
            data={browserData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Browser Usage Distribution',
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
      {browserData && (
        <div className="table-container" style={{ marginTop: '30px' }}>
          <h2>Detailed Browser Statistics</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Browser</th>
                <th>User Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {browserData.labels.map((browser, index) => {
                const total = browserData.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((browserData.datasets[0].data[index] / total) * 100).toFixed(2);
                
                return (
                  <tr key={index}>
                    <td>{browser}</td>
                    <td>{browserData.datasets[0].data[index]}</td>
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

export default BrowserStats;
