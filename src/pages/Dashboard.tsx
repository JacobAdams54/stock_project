import Sidebar from '../components/layout/Sidebar.tsx';
import StockDetail from './StockDetail.tsx';
import React from 'react';
/**
 * Dashboard component displaying the main user interface for logged-in users.
 * Includes a sidebar, stock details, and a placeholder for additional widgets.
 * @returns {JSX.Element} Rendered Dashboard component
 */
const Dashboard: React.FC = () => {
  return (
    <div
      className="dashboard-container"
      style={{ display: 'flex', height: '100vh' }}
    >
      {/* Sidebar for navigation */}
      <Sidebar open={true} onClose={() => {}} />

      {/* Main content area */}
      <div className="dashboard-content" style={{ flex: 1, padding: '20px' }}>
        <h1>Welcome to the Dashboard</h1>
        <p>Select a stock to view details or explore other features.</p>

        {/* Stock detail section */}
        <StockDetail />

        {/* Placeholder for additional widgets */}
        <div className="dashboard-widgets" style={{ marginTop: '20px' }}>
          <p>Additional widgets or features can go here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
