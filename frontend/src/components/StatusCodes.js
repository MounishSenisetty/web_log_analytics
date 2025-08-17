import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import apiService from '../api/apiService';

const StatusCodes = () => {
  const [loading, setLoading] = useState(true);
  const [statusCodeData, setStatusCodeData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getStatusCodes();
        
        if (response.success) {
          const data = response.data;
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
        console.error('Error fetching status codes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getStatusCodeDescription = (code) => {
    const codeMap = {
      200: 'OK - The request was successful',
      201: 'Created - The request was successful and a resource was created',
      204: 'No Content - The request was successful but there is no content to send',
      301: 'Moved Permanently - The URL has been permanently changed',
      302: 'Found - Temporary redirect to another URL',
      304: 'Not Modified - The client can use cached data',
      400: 'Bad Request - The server could not understand the request',
      401: 'Unauthorized - Authentication is required',
      403: 'Forbidden - The server understood but refuses to authorize',
      404: 'Not Found - The requested resource could not be found',
      500: 'Internal Server Error - The server encountered an unexpected condition',
      502: 'Bad Gateway - The server received an invalid response from an upstream server',
      503: 'Service Unavailable - The server is not ready to handle the request'
    };
    
    return codeMap[code] || `Status code ${code}`;
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
      <h1>HTTP Status Codes</h1>
      <div className="chart-container" style={{ height: '500px' }}>
        {statusCodeData && (
          <Bar 
            data={statusCodeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Count'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'HTTP Status Code'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'HTTP Status Code Distribution',
                  font: {
                    size: 16
                  }
                },
                legend: {
                  display: false
                }
              }
            }}
          />
        )}
      </div>
      
      {/* Table view of the same data with descriptions */}
      {statusCodeData && (
        <div className="table-container" style={{ marginTop: '30px' }}>
          <h2>HTTP Status Code Details</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status Code</th>
                <th>Description</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {statusCodeData.labels.map((code, index) => {
                const total = statusCodeData.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((statusCodeData.datasets[0].data[index] / total) * 100).toFixed(2);
                
                return (
                  <tr key={index}>
                    <td>
                      <span className={`status-badge status-${code.charAt(0)}00`}>
                        {code}
                      </span>
                    </td>
                    <td>{getStatusCodeDescription(parseInt(code))}</td>
                    <td>{statusCodeData.datasets[0].data[index]}</td>
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

export default StatusCodes;
