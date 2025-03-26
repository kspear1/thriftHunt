import React, { useState, useEffect } from 'react';
import './challenges.css';

function Challenges({ onClose }) {
    const [challenges, setChallenges] = useState([]);

    // Sample challenges data - you can replace this with dynamic data from an API if needed
    const allChallenges = [
        { title: "Find a Vintage T-Shirt", points: 10, description: "Find a vintage t-shirt from any thrift store and post a photo!" },
        { title: "Upcycle an Old Item", points: 20, description: "Upcycle an old item from your wardrobe into something new!" },
        { title: "Complete a Thrift Haul", points: 15, description: "Do a full thrift haul and share your finds!" },
        { title: "Style a Thrifted Outfit", points: 25, description: "Style an outfit using only thrifted clothes and post a photo!" },
        { title: "Thrift for a Specific Theme", points: 30, description: "Thrift items for a specific theme, e.g., '90s aesthetic'." }
    ];

    // Function to get three random challenges
    const getRandomChallenges = () => {
        let shuffled = allChallenges.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    useEffect(() => {
        setChallenges(getRandomChallenges());
        document.body.classList.add("challenges-body");
        return () => {
            document.body.classList.remove("challenges-body"); // Cleanup on exit
        };
    }, []);

    return (
        <div className="challenges-page">
            <h1>Thrift Challenges</h1>
            <div className="challenges-container">
                {challenges.map((challenge, index) => (
                    <div key={index} className="challenge-box">
                        <h2>{challenge.title}</h2>
                        <p>{challenge.description}</p>
                        <div className="points">Points: {challenge.points}</div>
                    </div>
                ))}
            </div>
            <button className="dashboard-btn" onClick={onClose}>
                Dashboard!
            </button>
        </div>
    );
}

export default Challenges;