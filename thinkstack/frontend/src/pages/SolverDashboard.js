import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom'; // <-- IMPORT useNavigate
import Challenges from './Challenges';

const SolverDashboard = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate(); // <-- Initialize the navigate function

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/challenges');
        
        // --- FIX #1: DEFENSIVE CHECK ---
        // Ensure that the response data is actually an array before setting the state.
        if (Array.isArray(response.data)) {
          setChallenges(response.data);
        } else {
          // If the API returns something unexpected, log it and set an empty array.
          console.error("API did not return an array for challenges:", response.data);
          setChallenges([]);
        }
      } catch (err) {
        setError('Could not load challenges. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  return (
    <div className="container mt-4">
      {/* --- Welcome Header --- */}
      <div className="card p-4 border-0 mb-5 shadow-sm">
        <h1 className="card-title">Welcome back, {user.name}!</h1>
        <p className="lead text-muted">Ready to solve the next big challenge? Browse the open opportunities below.</p>
      </div>

      {/* --- Challenges List --- */}
      <h2 className="mb-4">Available Challenges</h2>
      <Challenges />
      {loading && <p className="text-center">Loading challenges...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && (
        challenges.length === 0 ? (
          <div className="card text-center p-4">
            <p className="mb-0">There are no active challenges right now. Great work is on the horizon!</p>
          </div>
        ) : (
          <div className="row">
            {challenges.map(challenge => (
              <div className="col-lg-6 mb-4" key={challenge.id}>
                <div className="card h-100 feature-card">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{challenge.title}</h5>
                    {/* Use the correct camelCase name from to_dict() */}
                    {challenge.cashPrize && <h6 className="card-subtitle mb-2 text-success">${challenge.cashPrize.toLocaleString()} Prize</h6>}
                    <p className="card-text text-muted flex-grow-1">
                      {challenge.description.substring(0, 120)}...
                    </p>
                    {/* FIX #2: Use navigate() with the correct URL path */}
                    <button className="btn btn-primary mt-auto" onClick={() => navigate(`/challenges/${challenge.id}`)}>
                      View & Solve
                    </button>
                  </div>
                   <div className="card-footer text-muted">
                     Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SolverDashboard;