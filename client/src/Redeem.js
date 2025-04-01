import React, { useState, useEffect } from 'react';
import './challenges.css';

function Redeem({ onClose }) {
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [rewards, setRewards] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    // Sample rewards data
    const allRewards = [
        { id: "1", title: "Vintage Tote Bag", points: 100, image: "tote.jpg" },
        { id: "2", title: "Thrift Gift Card", points: 200, image: "giftcard.jpg" },
        { id: "3", title: "Custom Thrifted Hoodie", points: 300, image: "hoodie.jpg" },
        { id: "4", title: "Mystery Thrift Box", points: 250, image: "mystery.jpg" },
        { id: "5", title: "Thrifted Sunglasses", points: 150, image: "sunglasses.jpg" }
    ];

    // Function to get three random rewards
    const getRandomRewards = () => {
        let shuffled = allRewards.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    useEffect(() => {
        setRewards(getRandomRewards());
        document.body.classList.add("challenges-body");

        // Load saved points from localStorage
        const savedPoints = localStorage.getItem('earnedPoints');
        if (savedPoints) {
            setEarnedPoints(parseInt(savedPoints, 10));
        }

        return () => {
            document.body.classList.remove("challenges-body");
        };
    }, []);

    const handleRedeem = (reward) => {
        if (earnedPoints < reward.points) {
            alert("Not enough points");
            return;
        }
        setSelectedReward(reward);
        setShowPopup(true);
    };

    const confirmRedeem = () => {
        if (!selectedReward) return;
    
        const updatedPoints = earnedPoints - selectedReward.points;
    
        // Update local storage and state correctly
        localStorage.setItem('earnedPoints', updatedPoints);
        setEarnedPoints(updatedPoints);
        
        // Close the popup
        setShowPopup(false);
        
        // Show a confirmation message
        alert(`You have successfully redeemed: ${selectedReward.title}`);
    };

    return (
        <div className="challenges-page">
            <h1>Redeem Rewards</h1>
            <div className="points-display">Total Points: {earnedPoints}</div>
            <hr className="divider" />
            <div className="challenges-container">
                {rewards.map((reward) => (
                    <div key={reward.id} className="challenge-box">
                        <h2>{reward.title}</h2>
                        <img src={reward.image} alt={reward.title} className="reward-image" />
                        <div className="points">Required Points: {reward.points}</div>
                        <button className="redeem-button" onClick={() => handleRedeem(reward)}>
                            Redeem
                        </button>
                    </div>
                ))}
            </div>
            <button className="dashboard-btn" onClick={onClose}>Challenges!</button>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Confirm Redemption</h2>
                        <p>Are you sure you want to redeem {selectedReward.title} for {selectedReward.points} points?</p>
                        <button className="confirm-btn" onClick={confirmRedeem}>Yes, Redeem</button>
                        <button className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Redeem;
