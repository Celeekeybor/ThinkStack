import React, { useState, useEffect } from "react";
import { 
  FaTasks, 
  FaCog, 
  FaChartBar, 
  FaFileAlt, 
  FaBell, 
  FaDatabase,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';


const DashboardAdmin = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('APPROVED');

  const [updatingChallengeId, setUpdatingChallengeId] = useState(null);


  useEffect(() => {
    fetchChallenges();
  }, []); // Removed statusFilter from dependency array

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/challenges');
      console.log('API response:', response);

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log('Received data:', data);

      setChallenges(data.challenges || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching challenges:', err.response || err.message || err);
      setError(err.message);
      setChallenges([
        { id: 1, title: "AI Innovation Challenge", category: "Tech", prize: 1000, created_by: "admin@example.com" }
      ]);
    } finally {
      setLoading(false);
    }
  };
 
  

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [
    { id: 'dashboard', icon: FaChartBar, label: 'Dashboard' },
    { id: 'users', icon: FaUsers, label: 'User Management' },
    { id: 'challenges', icon: FaTasks, label: 'Challenge Management' },
    { id: 'reports', icon: FaFileAlt, label: 'Reports & Analytics' },
    { id: 'notifications', icon: FaBell, label: 'Notifications' },
    { id: 'database', icon: FaDatabase, label: 'Database Management' },
    { id: 'settings', icon: FaCog, label: 'System Settings' }
  ];

  const renderDashboardOverview = () => (
    <div>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaUsers className="mb-2" style={{ fontSize: '2rem', color: '#6c757d' }} />
              <h5 className="card-title text-muted">Total Users</h5>
              <h3 className="mb-0">1,247</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaTasks className="mb-2" style={{ fontSize: '2rem', color: '#6c757d' }} />
              <h5 className="card-title text-muted">Active Challenges</h5>
              <h3 className="mb-0">{challenges.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaBell className="mb-2" style={{ fontSize: '2rem', color: '#6c757d' }} />
              <h5 className="card-title text-muted">Pending Approvals</h5>
              <h3 className="mb-0">12</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaFileAlt className="mb-2" style={{ fontSize: '2rem', color: '#6c757d' }} />
              <h5 className="card-title text-muted">Total Submissions</h5>
              <h3 className="mb-0">856</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0">
                  <small className="text-muted">2 hours ago</small>
                  <p className="mb-1">New challenge "Data Science Competition" was submitted for approval</p>
                </div>
                <div className="list-group-item border-0 px-0">
                  <small className="text-muted">4 hours ago</small>
                  <p className="mb-1">User john.doe@example.com completed "AI Innovation Challenge"</p>
                </div>
                <div className="list-group-item border-0 px-0">
                  <small className="text-muted">6 hours ago</small>
                  <p className="mb-1">Challenge "Sustainable Energy Solutions" received 15 new submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">System Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Server Status</span>
                <span className="badge bg-success">Online</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Database</span>
                <span className="badge bg-success">Connected</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>API Status</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Last Backup</span>
                <span className="text-muted">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallengeManagement = () => {
  // Add state for managing status updates

  // Function to handle status updates
  const handleStatusUpdate = async (challengeId, newStatus) => {
    setUpdatingChallengeId(challengeId);
    try {
      const response = await fetch(`http://localhost:5000/api/challenges/${challengeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh the challenges list
        fetchChallenges();
        // Show success message (you can add a toast notification here)
        console.log(`Challenge ${challengeId} status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to update status:', errorData.error);
        // Handle error (show error message to user)
      }
    } catch (error) {
      console.error('Error updating challenge status:', error);
      // Handle network error
    } finally {
      setUpdatingChallengeId(null);
    }
  };

  // Function to handle challenge deletion
  const handleDelete = async (challengeId) => {
    

    setUpdatingChallengeId(challengeId);
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh the challenges list
        fetchChallenges();
        console.log(`Challenge ${challengeId} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete challenge:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
    } finally {
      setUpdatingChallengeId(null);
    }
  };
  

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Challenge Management</h3>
        <button className="btn btn-dark">
          <FaPlus className="me-2" />
          Add New Challenge
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-warning m-3">
              <strong>Warning:</strong> Could not fetch challenges from API. Showing demo data. Error: {error}
            </div>
          ) : null}
          
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Prize</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id}>
                    <td>#{challenge.id}</td>
                    <td>
                      <div>
                        <div className="fw-medium">{challenge.title}</div>
                        <small className="text-muted">
                          {challenge.description?.substring(0, 60)}...
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {challenge.category}
                      </span>
                    </td>
                    <td>${challenge.cashPrize}</td>
                    <td>
                      <span className={`badge ${
                        challenge.status === 'APPROVED' ? 'bg-success' :
                        challenge.status === 'PENDING' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {challenge.status}
                      </span>
                    </td>
                    <td>{challenge.createdBy}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        
                        {/* Conditional rendering based on status */}
                        {challenge.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleStatusUpdate(challenge.id, 'APPROVED')}
                              disabled={updatingChallengeId === challenge.id}
                              title="Approve Challenge"
                            >
                              {updatingChallengeId === challenge.id ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleStatusUpdate(challenge.id, 'REJECTED')}
                              disabled={updatingChallengeId === challenge.id}
                              title="Reject Challenge"
                            >
                              {updatingChallengeId === challenge.id ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          </>
                        )}
                        
                        {challenge.status !== 'PENDING' && (
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit Challenge"
                          >
                            <FaEdit />
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(challenge.id)}
                          disabled={updatingChallengeId === challenge.id}
                          title="Delete Challenge"
                        >
                          {updatingChallengeId === challenge.id ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderContent = () => {
    switch (activeSection) {
      case 'challenges':
        return renderChallengeManagement();
      case 'users':
        return (
          <div>
            <h3>User Management</h3>
            <p className="text-muted">Manage platform users, permissions, and access controls.</p>
          </div>
        );
      case 'reports':
        return (
          <div>
            <h3>Reports & Analytics</h3>
            <p className="text-muted">View detailed analytics and generate reports.</p>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h3>Notifications</h3>
            <p className="text-muted">Manage system notifications and announcements.</p>
          </div>
        );
      case 'security':
        return (
          <div>
            <h3>Security Management</h3>
            <p className="text-muted">Configure security settings and monitor access logs.</p>
          </div>
        );
      case 'database':
        return (
          <div>
            <h3>Database Management</h3>
            <p className="text-muted">Monitor database performance and manage data.</p>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h3>System Settings</h3>
            <p className="text-muted">Configure global system settings and preferences.</p>
          </div>
        );
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Professional Sidebar */}
      <div className="bg-white shadow-sm" style={{ width: "280px", borderRight: "1px solid #dee2e6" }}>
        <div className="p-4 border-bottom">
          <h4 className="mb-0 text-dark">Admin Console</h4>
          <small className="text-muted">Management Portal</small>
        </div>
        
        <nav className="mt-3">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`btn btn-link text-start w-100 px-4 py-3 border-0 ${
                  activeSection === item.id 
                    ? 'bg-light text-dark fw-medium' 
                    : 'text-muted'
                }`}
                onClick={() => setActiveSection(item.id)}
                style={{ textDecoration: 'none' }}
              >
                <IconComponent className="me-3" style={{ width: '16px' }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1">
        <header className="bg-white shadow-sm px-4 py-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Welcome back, Administrator</h2>
              <p className="text-muted mb-0">
                Manage your platform efficiently from this central dashboard.
              </p>
            </div>
            <div className="d-flex align-items-center">
              <button className="btn btn-outline-secondary me-2">
                <FaBell />
              </button>
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button">
                  Admin Profile
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;