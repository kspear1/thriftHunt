// Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ name, email, onLogout }) {
  const [showPopup, setShowPopup] = useState(true);
  const [thriftTip, setThriftTip] = useState("");
  const [userName, setUserName] = useState(name || "User");

  

  useEffect(() => {

    const storedName = localStorage.getItem("user_name");
    if (!name && storedName) {
      setUserName(storedName);
    }
    // Generate a random thrift tip from an array
    const tips = [
      "Vintage never goes out of style.",
      "Check the accessories section for hidden gems!",
      "Thrift shopping is a treasure hunt, not a race.",
      "Never underestimate the power of a well-worn pair of boots.",
      "You’re saving money and the planet with each find!"
    ];
    setThriftTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <h2>Welcome to ThriftHunt!</h2>
        
        {showPopup && (
          <div className="welcome-popup">
            <h3>Welcome Back, {userName}!</h3>
            <p>We missed you! Ready for your next thrift adventure?</p>
            <button onClick={() => setShowPopup(false)}>Yes I am!</button>
          </div>
        )}
        
        <div className="user-greeting">
          <h3>Hello, {userName}!</h3>
          <p>You've successfully logged in with: {email}</p>
        </div>
        
        <div className="profile-section">
          <img src="/macaron.jpg" alt="Profile" className="profile-pic" />
          <button className="challenges-btn">My Challenges</button>
        </div>
        
        <div className="dashboard-content">
          <p>You're looking awesome today!</p>
        </div>
        
        <div className="thrift-tip">
          <h4>Thrift Tip of the Day</h4>
          <p>{thriftTip}</p>
        </div>

        <div className="user-stats">
          <h4>Your Thrift Stats</h4>
          <ul>
            <li>Total Items Saved: 32</li>
            <li>Thrift Finds This Week: 4</li>
            <li>Money Saved: $120</li>
          </ul>
        </div>
        
        <button className="logout-btn" onClick={onLogout}>
          Log Out
        </button>

        <button className="challenges-btn">
          Challeges!
        </button>
      </div>
    </div>
  );
}

export default Dashboard;