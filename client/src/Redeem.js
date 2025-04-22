import React, { useState, useEffect } from 'react';
import './challenges.css';
import './redeem.css'

function Redeem({ onClose }) {
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [rewards, setRewards] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    // Sample rewards data
    const allRewards = [
        { id: "1", title: "Vintage Clothing Item", points: 100, image: "vintage.png" },
        { id: "2", title: "Thrift Gift Card", points: 200, image: "giftcard.png" },
        { id: "3", title: "Vintage Deadstock Clothing Item", points: 200, image: "deadstock.png" },
        { id: "4", title: "Mystery Thrift Box", points: 300, image: "mystery.png" },
        { id: "5", title: "Vintage Designer Clothing Item", points: 150, image: "designer.jpg" }
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

        console.log("Redeem button clicked for:", reward.title); // Debugging
        setSelectedReward(reward);
        setShowPopup(true);

        console.log("confirmRedeem function:", confirmRedeem); // Check
    };

    const confirmRedeem = async () => {
        const userId = localStorage.getItem('userId');
        const response = await fetch('/redeem-reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, rewardId: selectedReward.id, cost: selectedReward.points })
        });
    
        const result = await response.json();
    
        if (result.success) {
            setEarnedPoints(prev => prev - selectedReward.points);
            setShowPopup(false);
            alert(`You have successfully redeemed: ${selectedReward.title}`);
        } else {
            alert(result.message || 'Redemption failed.');
        }
    };

    return (
        <div className="challenges-page">
            <h1>Redeem Rewards</h1>
            <div className="points-display">Total Points: {earnedPoints}</div>
            <hr className="divider" />
            <div className="challenges-container">
                {rewards.map((reward) => (
                    <div key={reward.id} className="challenge-box">
                        <h2 className="item-title">{reward.title}</h2>
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
