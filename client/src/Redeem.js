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
        { id: "1", title: "Mini Vintage Mystery Box", points: 75, image: "mini.png", description: "A bite-sized surprise box featuring 1–2 thrifted gems like accessories or vintage tees." },
        { id: "2", title: "Classic Y2K Mystery Box", points: 150, image: "Y2Kpic.png", description: "A curated box of early 2000s nostalgia — expect 2–3 items like denim, bold prints, or retro accessories." },
        { id: "3", title: "Deadstock Vintage Mystery Box", points: 200, image: "deadstock.png", description: "A premium collection of 3–4 vintage items that were never worn — tags still on!" },
        { id: "4", title: "Elite Thrifted Mystery Drop", points: 300, image: "elite.png", description: "The ultimate haul: 4–6 handpicked rare and high-quality thrift finds. Only for elite thrifters!" },
        { id: "5", title: "Designer Vintage Mystery Box", points: 250, image: "designer.jpg", description: "Includes 1–2 authenticated pieces from vintage designer labels — stylish, bold, timeless." },
        { id: "6", title: "Thrift Store Gift Card ($25)", points: 175, image: "giftcard.png", description: "Get a $25 gift card to spend at a participating thrift store partner — perfect for treating yourself!" }
      ];

    useEffect(() => {
        const sorted = [...allRewards].sort((a, b) => a.points - b.points); // ascending
        setRewards(sorted);
        document.body.classList.add("challenges-body");
    
        const userId = localStorage.getItem('userId');
        if (!userId) return;
    
        //Fetch total points from Supabase
        fetch(`/get-user-points?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEarnedPoints(data.totalPoints);
                }
            });
    
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
            setShowPopup(false);
            alert(`You have successfully redeemed: ${selectedReward.title}`);
        
            //Fetch updated points
            const userId = localStorage.getItem('userId');
            fetch(`/get-user-points?userId=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setEarnedPoints(data.totalPoints);
                    }
                });
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
                        <p className="reward-description">{reward.description}</p>
                        <div className="points">Required Points: {reward.points}</div>
                        <button className="redeem-button" onClick={() => handleRedeem(reward)}>
                            Redeem
                        </button>
                    </div>
                ))}
            </div>
            <button className="logout-btn" onClick={onClose}>⬅ Back to Challenges!</button>

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
