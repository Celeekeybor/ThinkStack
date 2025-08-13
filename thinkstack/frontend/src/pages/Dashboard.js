// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../components/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>You need to be logged in to view this page.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card p-4">
            <h1 className="card-title">Welcome, {user.username}!</h1>
            <p className="lead">Here's your personal dashboard.</p>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Profile</h5>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {/* The user role is not displayed as requested */}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <p>You have not completed any challenges yet.</p>
              {/* You can map over user's recent activities here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;