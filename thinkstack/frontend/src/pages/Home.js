// src/pages/Home.js (FINAL - Updated for React Router)

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- IMPORT the useNavigate hook
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// FIX #1: The component no longer needs the 'setActiveTab' prop
const Home = () => { 
  // FIX #2: Initialize the navigate function from React Router
  const navigate = useNavigate(); 

  // Particle animation setup - this configuration is perfect.
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = {
    background: { color: { value: "#1A1A2E" } },
    fpsLimit: 120,
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
      color: { value: "#ffffff" },
      links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.2, width: 1 },
      move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1.5, straight: false },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.2 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 4 } },
    },
    detectRetina: true,
  };

  return (
    <div className="home-page">
      {/* --- Hero Section --- */}
      <div className="container-fluid p-0">
        <section className="hero-section">
          <Particles id="tsparticles" init={particlesInit} options={particleOptions} />
          <div className="hero-content">
            <h1>Where Brilliance Meets Opportunity</h1>
            <p>
              ThinkStack is the premier platform connecting innovative companies with a global community of skilled problem-solvers to tackle real-world challenges.
            </p>
            {/* FIX #3: Use navigate() with the correct URL path */}
            <button className="btn btn-light btn-lg" onClick={() => navigate('/challenges')}>
              Explore Challenges
            </button>
          </div>
        </section>
      </div>

      {/* --- How It Works Section --- */}
      <section className="page-section how-it-works-section">
        <div className="container">
          <h2 className="section-heading text-center">How It Works</h2>
          <div className="row">
            <div className="col-lg-4 mb-4 d-flex align-items-stretch">
              <div className="step-card">
                <i className="fas fa-bullhorn how-it-works-icon"></i>
                <h3>1. Post a Challenge</h3>
                <p>Organizations define their technical problems, set a competitive prize, and post them to our global community.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4 d-flex align-items-stretch">
              <div className="step-card">
                <i className="fas fa-users how-it-works-icon"></i>
                <h3>2. Compete & Solve</h3>
                <p>Talented solvers from around the world leverage their skills to develop and submit the most innovative solutions.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4 d-flex align-items-stretch">
              <div className="step-card">
                <i className="fas fa-trophy how-it-works-icon"></i>
                <h3>3. Win & Earn</h3>
                <p>The best solution wins. Solvers earn cash prizes, gain recognition, and build a portfolio of real-world project experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* --- Final Call to Action Section --- */}
      <section className="container page-section text-center">
         <h2 className="section-heading">Ready to Get Started?</h2>
         <p className="lead mb-4 mx-auto" style={{fontSize: "1.2rem", maxWidth: "600px"}}>Join a community of innovators and problem-solvers today. Your next big opportunity is just a click away.</p>
         {/* FIX #4: Use navigate() with the correct URL path */}
         <button className="btn btn-primary btn-lg px-5 py-3" style={{borderRadius: "50px"}} onClick={() => navigate('/register')}>
            Register Now
         </button>
      </section>
    </div>
  );
};

export default Home;