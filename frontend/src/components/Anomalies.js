import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import apiService from '../api/apiService';

const Anomalies = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAnomalies();
        
        if (response.success) {
          setAnomalies(response.data);
        }
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  // Prepare chart data
  const anomalyChartData = {
    labels: anomalies.map(item => item.hour),
    datasets: [
      {
        label: 'Actual Traffic',
        data: anomalies.map(item => item.count),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)'
      },
      {
        label: 'Expected Traffic',
        data: anomalies.map(item => item.expected_count),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
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
      <h1>Anomaly Detection</h1>
      
      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>About Anomaly Detection</h3>
        <p>
          This page shows detected anomalies in website traffic patterns. 
          Anomalies are identified using machine learning techniques (K-means clustering) 
          that analyze historical traffic patterns and identify data points that significantly 
          deviate from expected values.
        </p>
      </div>
      
      <div className="chart-container" style={{ height: '400px', marginBottom: '30px' }}>
        <h2>Anomaly Visualization</h2>
        <Line 
          data={anomalyChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Request Count'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Time'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Traffic Anomalies',
                font: {
                  size: 16
                }
              },
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value} requests`;
                  }
                }
              }
            }
          }}
        />
      </div>
      
      <h2>Detected Anomalies</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actual Requests</th>
              <th>Expected Requests</th>
              <th>Deviation</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((anomaly, index) => {
              const deviation = ((anomaly.count - anomaly.expected_count) / anomaly.expected_count * 100).toFixed(2);
              const severity = Math.abs(parseFloat(deviation)) > 80 ? 'High' : 
                             Math.abs(parseFloat(deviation)) > 50 ? 'Medium' : 'Low';
              const severityClass = severity === 'High' ? '#f8d7da' : 
                                  severity === 'Medium' ? '#fff3cd' : '#d1e7dd';
              
              return (
                <tr key={index} style={{ backgroundColor: severityClass }}>
                  <td>{formatDateTime(anomaly.hour)}</td>
                  <td>{anomaly.count}</td>
                  <td>{anomaly.expected_count}</td>
                  <td>{deviation}%</td>
                  <td>{severity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Anomalies;
