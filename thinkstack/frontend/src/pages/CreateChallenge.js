// src/pages/CreateChallenge.js

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const CreateChallenge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    participationType: 'individual', // individual or team
    cashPrize: '',
    deadline: '',
    additionalRequirements: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Challenge categories
  const categories = [
    'Web Development',
    'Mobile App Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Algorithm & Data Structures',
    'Cybersecurity',
    'Game Development',
    'Blockchain',
    'IoT',
    'DevOps',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Challenge title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Challenge description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters long';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.cashPrize || parseFloat(formData.cashPrize) <= 0) {
      newErrors.cashPrize = 'Please enter a valid cash prize amount';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const challengeData = {
        ...formData,
        cashPrize: parseFloat(formData.cashPrize),
        createdBy: user.id
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/challengesd', 
        challengeData, 
        { withCredentials: true }
      );
      
      // Redirect to dashboard or challenge detail page
      navigate('/challenger-dashboard');
      
    } catch (error) {
      console.error('Error creating challenge:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to create challenge. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum deadline is tomorrow
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="container mt-5 py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-primary">Create New Challenge</h1>
            <p className="lead text-muted">Design an engaging challenge for the community</p>
          </div>

          {/* Form Card */}
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white py-3">
              <h4 className="mb-0">
                <i className="fas fa-trophy me-2"></i>Challenge Details
              </h4>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Error Alert */}
                {errors.submit && (
                  <div className="alert alert-danger mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.submit}
                  </div>
                )}

                {/* Challenge Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="form-label fw-semibold">
                    Challenge Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter an engaging challenge title..."
                    maxLength="100"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  <div className="form-text">
                    {formData.title.length}/100 characters
                  </div>
                </div>

                {/* Category and Participation Type Row */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-semibold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select form-select-lg ${errors.category ? 'is-invalid' : ''}`}
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="participationType" className="form-label fw-semibold">
                      Participation Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="participationType"
                      name="participationType"
                      value={formData.participationType}
                      onChange={handleInputChange}
                    >
                      <option value="individual">Individual</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-semibold">
                    Challenge Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the challenge, including objectives, requirements, and evaluation criteria..."
                    maxLength="2000"
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  <div className="form-text">
                    {formData.description.length}/2000 characters (minimum 50 characters)
                  </div>
                </div>

                {/* Cash Prize and Deadline Row */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="cashPrize" className="form-label fw-semibold">
                      Cash Prize (USD) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className={`form-control ${errors.cashPrize ? 'is-invalid' : ''}`}
                        id="cashPrize"
                        name="cashPrize"
                        value={formData.cashPrize}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                      />
                      {errors.cashPrize && <div className="invalid-feedback">{errors.cashPrize}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="deadline" className="form-label fw-semibold">
                      Submission Deadline <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control form-control-lg ${errors.deadline ? 'is-invalid' : ''}`}
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                    />
                    {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
                  </div>
                </div>

                {/* Additional Requirements */}
                <div className="mb-4">
                  <label htmlFor="additionalRequirements" className="form-label fw-semibold">
                    Additional Requirements <span className="text-muted">(Optional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="additionalRequirements"
                    name="additionalRequirements"
                    rows="3"
                    value={formData.additionalRequirements}
                    onChange={handleInputChange}
                    placeholder="Any additional requirements, technologies to use, submission format, etc..."
                    maxLength="500"
                  />
                  <div className="form-text">
                    {formData.additionalRequirements.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate('/challenger-dashboard')}
                    disabled={loading}
                  >
                    <i className="fas fa-arrow-left me-2"></i>Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus-circle me-2"></i>Create Challenge
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Information Card */}
          <div className="card mt-4 border-info">
            <div className="card-body">
              <h6 className="card-title text-info">
                <i className="fas fa-info-circle me-2"></i>Challenge Guidelines
              </h6>
              <ul className="mb-0 small text-muted">
                <li>All challenges are reviewed before being published</li>
                <li>Clear and detailed descriptions get better participation</li>
                <li>Consider setting realistic deadlines for quality submissions</li>
                <li>Specify all technical requirements and evaluation criteria</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;