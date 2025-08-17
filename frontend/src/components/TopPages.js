import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import apiService from '../api/apiService';

const TopPages = () => {
  const [loading, setLoading] = useState(true);
  const [topPagesData, setTopPagesData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTopPages();
        
        if (response.success) {
          const data = response.data;
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
      } catch (error) {
        console.error('Error fetching top pages:', error);
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
      <h1>Top Pages</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {topPagesData && (
          <Bar 
            data={topPagesData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Visits'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Page URL'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Most Visited Pages',
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
      
      {/* Table view of the same data */}
      {topPagesData && (
        <div className="table-container" style={{ marginTop: '30px' }}>
          <h2>Detailed Top Pages List</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>URL</th>
                <th>Visit Count</th>
              </tr>
            </thead>
            <tbody>
              {topPagesData.labels.map((url, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{url}</td>
                  <td>{topPagesData.datasets[0].data[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopPages;
