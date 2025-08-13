// src/components/SubmitSolutionModal.js (CORRECTED)

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthProvider';

const SubmitSolutionModal = ({ challengeId, onClose, showAlert }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setError('GitHub URL is required.');
      return;
    }
    if ((!/^https:\/\/github\.com/.test(githubUrl))) {
        setError('Please provide a valid GitHub repository URL.');
        return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        challenge_id: challengeId,
        submitted_by_user_id: user.id,
        content: comments,
        attachments: githubUrl,
      };
      
      await axios.post('http://localhost:5000/api/solutions', payload, { withCredentials: true });
      
      showAlert('success', 'Your solution has been submitted successfully!');
      onClose();

    } catch (err) {
      const message = err.response?.data?.error || 'Failed to submit solution.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX #1: Use a React Fragment to render the backdrop and modal side-by-side
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal show fade" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Submit Your Solution</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label htmlFor="githubUrl" className="form-label">GitHub Repository URL <span className="text-danger">*</span></label>
                  <input
                    type="url"
                    className="form-control"
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="comments" className="form-label">Comments (Optional)</label>
                  <textarea
                    className="form-control"
                    id="comments"
                    rows="4"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Include any notes for the reviewer, setup instructions, or a brief description of your approach."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitSolutionModal;