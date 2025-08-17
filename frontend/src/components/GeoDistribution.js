import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import apiService from '../api/apiService';

const GeoDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getGeoDistribution();
        
        if (response.success) {
          const data = response.data;
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
      } catch (error) {
        console.error('Error fetching geographic distribution:', error);
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
      <h1>Geographic Distribution</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {geoData && (
          <Pie 
            data={geoData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Traffic by Country',
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
      {geoData && (
        <div className="table-container" style={{ marginTop: '30px' }}>
          <h2>Detailed Country Distribution</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Request Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {geoData.labels.map((country, index) => {
                const total = geoData.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((geoData.datasets[0].data[index] / total) * 100).toFixed(2);
                
                return (
                  <tr key={index}>
                    <td>{country}</td>
                    <td>{geoData.datasets[0].data[index]}</td>
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

export default GeoDistribution;
