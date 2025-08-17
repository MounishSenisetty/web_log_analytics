import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2>Web Log Analytics</h2>
      </div>
      <nav className="navbar-menu">
        <ul>
          <li className={isActive('/')}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={isActive('/traffic')}>
            <Link to="/traffic">Traffic Overview</Link>
          </li>
          <li className={isActive('/top-pages')}>
            <Link to="/top-pages">Top Pages</Link>
          </li>
          <li className={isActive('/geo')}>
            <Link to="/geo">Geographic Distribution</Link>
          </li>
          <li className={isActive('/browsers')}>
            <Link to="/browsers">Browser Statistics</Link>
          </li>
          <li className={isActive('/devices')}>
            <Link to="/devices">Device Types</Link>
          </li>
          <li className={isActive('/status-codes')}>
            <Link to="/status-codes">HTTP Status Codes</Link>
          </li>
          <li className={isActive('/sessions')}>
            <Link to="/sessions">User Sessions</Link>
          </li>
          <li className={isActive('/anomalies')}>
            <Link to="/anomalies">Anomaly Detection</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
