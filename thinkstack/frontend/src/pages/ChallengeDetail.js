// src/pages/ChallengeDetail.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import { useParams } from 'react-router-dom';

const ChallengeDetail = ({ showAlert }) => {
  const { id: challengeId } = useParams(); 
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
        console.log(response.data, 'this is the response data for challenge detail.....');
        
        // Handle direct challenge object response
        if (response.data && response.data.id) {
          setChallenge(response.data);
        } else if (response.data.success) {
          // Fallback for wrapped response
          setChallenge(response.data.challenge);
        } else {
          setError('Invalid challenge data received.');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Challenge not found.');
        } else {
          setError('Could not load the challenge details.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  const handleJoinChallenge = async () => {
    if (!user) {
      showAlert && showAlert('Please log in to join this challenge.', 'warning');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/challenges/${challengeId}/join`, {
        userId: user.id
      });

      if (response.data.success) {
        showAlert && showAlert('Successfully joined the challenge!', 'success');
        // Optionally refresh challenge data to update participant count
        // fetchChallenge();
      } else {
        showAlert && showAlert(response.data.message || 'Failed to join challenge.', 'error');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to join challenge.';
      showAlert && showAlert(errorMessage, 'error');
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3">Loading Challenge Details...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="mb-1">{challenge.title}</h1>
              <span className="badge bg-light text-dark">{challenge.category}</span>
            </div>
            <div className="text-end">
              <div className="badge bg-success fs-6">{challenge.status || 'Active'}</div>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="mb-4">
            <h5><i className="fas fa-info-circle me-2"></i>Description</h5>
            <p style={{ whiteSpace: 'pre-wrap' }} className="text-muted">
              {challenge.description || 'No description available.'}
            </p>
          </div>

          {challenge.additionalRequirements && (
            <div className="mb-4">
              <h5><i className="fas fa-list-check me-2"></i>Additional Requirements</h5>
              <p style={{ whiteSpace: 'pre-wrap' }} className="text-muted">
                {challenge.additionalRequirements}
              </p>
            </div>
          )}
          
          <div className="row">
            <div className="col-md-3">
              <h5><i className="fas fa-trophy me-2 text-warning"></i>Prize</h5>
              <p className="text-success fs-4 fw-bold">
                ${challenge.cashPrize ? challenge.cashPrize.toLocaleString() : '92'}
              </p>
            </div>
            
            <div className="col-md-3">
              <h5><i className="fas fa-calendar me-2 text-info"></i>Deadline</h5>
              <p>
                {challenge.deadline 
                  ? new Date(challenge.deadline).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'No deadline set'
                }
              </p>
            </div>
            
            <div className="col-md-3">
              <h5><i className="fas fa-users me-2 text-primary"></i>Participation</h5>
              <p>
                <span className="badge bg-info">
                  {challenge.participationType || 'Individual'}
                </span>
              </p>
              {challenge.maxParticipants && (
                <small className="text-muted">
                  {challenge.currentParticipants || 0} / {challenge.maxParticipants} participants
                </small>
              )}
            </div>
            
            <div className="col-md-3">
              <h5><i className="fas fa-user me-2 text-secondary"></i>Created By</h5>
              <p className="fw-semibold">{challenge.createdBy || 'Unknown'}</p>
              {challenge.createdAt && (
                <small className="text-muted">
                  {new Date(challenge.createdAt).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-footer text-center">
          {user ? (
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-lg btn-primary"
                onClick={handleJoinChallenge}
                disabled={joining || challenge.status !== 'active'}
              >
                {joining ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Joining...
                  </>
                ) : (
                  <>
                    <i className="fas fa-hand-paper me-2"></i>Join Challenge
                  </>
                )}
              </button>
              
              <button className="btn btn-lg btn-success">
                <i className="fas fa-lightbulb me-2"></i>Submit Solution
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted mb-3">
                <i className="fas fa-lock me-2"></i>
                Please log in or register to participate in this challenge.
              </p>
              <button className="btn btn-outline-primary">
                <i className="fas fa-sign-in-alt me-2"></i>Login to Participate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;