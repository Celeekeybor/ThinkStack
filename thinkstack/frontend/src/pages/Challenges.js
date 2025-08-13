// src/pages/Challenges.js (Fixed)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
  import { useNavigate } from 'react-router-dom';


const challengeCategories = ['All', 'UI/UX Design', 'Machine Learning', 'IoT', 'Software Development', 'Data Science', 'General'];

const Challenges = ({ setActiveTab }) => {
  const [allChallenges, setAllChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/challenges');
        console.log(response.data, 'this is the response data.....');
        // Fix: Access the challenges array from the response
        setAllChallenges(response.data.challenges || []);
        setFilteredChallenges(response.data.challenges || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  useEffect(() => {
    let result = allChallenges;

    if (activeFilter !== 'All') {
      result = result.filter(c => c.category === activeFilter);
    }

    if (searchTerm) {
      result = result.filter(c => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredChallenges(result);
  }, [activeFilter, searchTerm, allChallenges]);

  const handleJoinChallenge = (challengeId) => {
    // Navigate to challenge details
    navigate(`/challenges/${challengeId}`);
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-5">
        <h1 className="display-4">Explore Challenges</h1>
        <p className="lead">Find a challenge that matches your skills and interests.</p>
      </div>

      {/* --- Filters and Search Bar --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div className="btn-group mb-3 mb-md-0" role="group">
          {challengeCategories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`btn ${activeFilter === cat ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-100" style={{ maxWidth: '300px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by title or creator..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Challenges Grid --- */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading challenges...</p>
        </div>
      ) : (
        <div className="row">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(challenge => (
              <div className="col-lg-6 col-xl-4 mb-4" key={challenge.id}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 fw-bold">{challenge.title}</h5>
                      <span className="badge bg-primary rounded-pill">{challenge.category}</span>
                    </div>
                    
                    <h6 className="card-subtitle mb-2 text-muted">
                      <i className="bi bi-person-circle me-1"></i>
                      Created by: <strong>{challenge.createdBy}</strong>
                    </h6>
                    
                    <p className="card-text text-muted mb-3">
                      {challenge.description ? 
                        (challenge.description.length > 120 ? 
                          challenge.description.substring(0, 120) + '...' : 
                          challenge.description
                        ) : 'No description available'}
                    </p>

                    {challenge.additionalRequirements && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <strong>Requirements:</strong> {challenge.additionalRequirements.substring(0, 80)}...
                        </small>
                      </div>
                    )}

                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        Created: {new Date(challenge.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                    <div className="text-success fw-bold fs-5">
                      <i className="bi bi-currency-dollar"></i>
                      {challenge.cashPrize ? challenge.cashPrize.toLocaleString() : 'N/A'} Prize
                    </div>
                    <button 
                      className="btn btn-primary btn-sm px-3"
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      <i className="bi bi-arrow-right-circle me-1"></i>
                      Join Challenge
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted mb-3"></i>
                <h4 className="text-muted">No challenges found</h4>
                <p className="text-muted">Try adjusting your search criteria or filters.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Challenges;