// Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Challenges from './Challenges';



function Dashboard({ name, email, onLogout }) {
  const [showPopup, setShowPopup] = useState(true);
  const [thriftTip, setThriftTip] = useState("");
  const [thriftFact, setThriftFact] = useState("");
  const [showChallenges, setShowChallenges] = useState(false);
  
  useEffect(() => {
    // Generate a random thrift tip from an array
    const tips = [
      "Vintage never goes out of style.",
      "Check the accessories section for hidden gems!",
      "Thrift shopping is a treasure hunt, not a race.",
      "Never underestimate the power of a well-worn pair of boots.",
      "You’re saving money and the planet with each find!"
    ];
    setThriftTip(tips[Math.floor(Math.random() * tips.length)]);

    // Generate a random thrift tip from an array
    const facts = [
      "A woman found a Vera Wang wedding dress at Goodwill for just $25! 😱💍",
      "In 2018, a thrift shopper found a $1,000 Louis Vuitton bag for only $20! 👜✨",
      "One thrift store in California sold a Picasso painting for just $5,000—it was worth over $100 million! 🎨💸",
      "A pair of $1,200 Chanel boots were spotted at a Goodwill store in 2017 for just $50! 👢🖤",
      "The world's most expensive thrift store find was a rare 1947 Christian Dior gown, purchased for $100 at a Texas thrift shop and worth over $100,000! 👗🔥",
      "A woman found an authentic Gucci jacket at a thrift store for $12, later selling it for over $1,000! 💎💵",
      "Thrift stores are a goldmine for vintage vinyl records—some rare records can be worth over $5,000! 🎶💿",
      "In 2013, a man found a rare Rolex watch at a secondhand shop in New York for $5,000—it was worth $250,000! ⌚️💥",
      "Thrifted designer jeans like Levi’s or Wranglers can sell for hundreds of dollars online—especially if they’re vintage and distressed! 👖💸"
    ];
    setThriftFact(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  if (showChallenges) {
    return <Challenges user = {user} onClose={() => setShowChallenges(false)} />;
}

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <h2>Welcome to ThriftHunt!</h2>
        
        {showPopup && (
          <div className="welcome-popup">
            <h3>Welcome Back, {name}!</h3>
            <p>We missed you! Ready for your next thrift adventure?</p>
            <button onClick={() => setShowPopup(false)}>Yes I am!</button>
          </div>
        )}
        
        <div className="user-greeting">
          <h3>Hello, {name}!</h3>
          <p>You've successfully logged in with: {email}</p>
        </div>
        
        <div className="profile-section">
          <img src="/macaron.jpg" alt="Profile" className="profile-pic" />
          {/* Open Challenges Page (Replaces Everything) */}
          <button className="challenges-btn" onClick={() => setShowChallenges(true)}>
            My Challenges!        
          </button>
        </div>
      
        <div className="thrift-tip">
          <h4>Thrift Tip of the Day!</h4>
          <p>{thriftTip}</p>
        </div>

        <div className="thrift-fact">
          <h4>Fun Thrift Fact!</h4>
          <p>{thriftFact}</p>
        </div>
        
        <button className="logout-btn" onClick={onLogout}>
          Log Out
        </button>

  
      </div>
    </div>
  );
}

export default Dashboard;