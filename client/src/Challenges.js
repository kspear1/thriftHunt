import React, { useState, useEffect } from 'react';
import './challenges.css';

function Challenges({ onClose }) {
    const [challenges, setChallenges] = useState([]);
    const [imagePreviews, setImagePreviews] = useState({}); // Store image previews for each challenge
    const [earnedPoints, setEarnedPoints] = useState(0); // Total points
    const [completedChallenges, setCompletedChallenges] = useState(new Set()); // Track completed challenges


    // Sample challenges data - you can replace this with dynamic data from an API if needed
    const allChallenges = [
        { id: "1", title: "Find a Vintage T-Shirt", points: 10, description: "Find a vintage t-shirt from any thrift store and post a photo!" },
        { id: "2", title: "Upcycle an Old Item", points: 20, description: "Upcycle an old item from your wardrobe into something new!" },
        { id: "3", title: "Complete a Thrift Haul", points: 15, description: "Do a full thrift haul and share your finds!" },
        { id: "4", title: "Style a Thrifted Outfit", points: 25, description: "Style an outfit using only thrifted clothes and post a photo!" },
        { id: "5", title: "Thrift for a Specific Theme", points: 30, description: "Thrift items for a specific theme, e.g., '90s aesthetic'." }
    ];

    // Function to get three random challenges
    const getRandomChallenges = () => {
        let shuffled = allChallenges.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    // Handle image file change and generate preview
    const handleImageChange = (event, challenge) => {
        const file = event.target.files[0];
        if (file && !completedChallenges.has(challenge.id)) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreviews(prev => ({ ...prev, [challenge.id]: previewUrl }));
            
            setEarnedPoints(prevPoints => {
                const updatedPoints = prevPoints + challenge.points;
                
                // Save the updated points to localStorage
                localStorage.setItem('earnedPoints', updatedPoints);

                // Save the completed challenges to localStorage
                setCompletedChallenges(prev => {
                    const updatedChallenges = new Set(prev).add(challenge.id);
                    localStorage.setItem('completedChallenges', JSON.stringify(Array.from(updatedChallenges)));
                    return updatedChallenges;
                });

                return updatedPoints;
            });
        }
    };

    useEffect(() => {
        setChallenges(getRandomChallenges());
        document.body.classList.add("challenges-body");

        // Load points and completed challenges from localStorage if available
        // Load points and completed challenges from localStorage if available
        const savedPoints = localStorage.getItem('earnedPoints');
        const savedCompletedChallenges = JSON.parse(localStorage.getItem('completedChallenges'));

        if (savedPoints) {
            setEarnedPoints(parseInt(savedPoints, 10));
        }

        if (savedCompletedChallenges) {
            setCompletedChallenges(new Set(savedCompletedChallenges));
        }

        return () => {
            document.body.classList.remove("challenges-body"); // Cleanup on exit
        };
    }, []);

    // Ensure points and challenges are loaded even if navigating away and back
    useEffect(() => {
        const savedPoints = localStorage.getItem('earnedPoints');
        const savedCompletedChallenges = JSON.parse(localStorage.getItem('completedChallenges'));

        if (savedPoints) {
            setEarnedPoints(parseInt(savedPoints, 10));
        }

        if (savedCompletedChallenges) {
            setCompletedChallenges(new Set(savedCompletedChallenges));
        }
    }, []);  // This ensures loading the state again when user returns to the page

    return (
        <div className="challenges-page">
            <h1>Thrift Challenges</h1>
            <div className="points-display">Total Points: {earnedPoints}</div>
            <hr className="divider" />
            <div className="challenges-container">
                {challenges.map((challenge, index) => (
                    <div key={index} className="challenge-box">
                        <h2>{challenge.title}</h2>
                        <p>{challenge.description}</p>
                        <div className="points">Points: {challenge.points}</div>

                        {/* Image Upload */}
                        <div className="upload-container">
                            <h3>Upload Your Image</h3>
                            {/* Hidden file input */}
                            <input
                                type="file"
                                id={`file-upload-${challenge.id}`}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(event) => handleImageChange(event, challenge)}
                            />
                            {/* Custom styled label acting as button */}
                            <label htmlFor={`file-upload-${challenge.id}`} className="upload-button">
                                Upload Photo
                            </label>
                            
                            {/* Image Preview */}
                            {imagePreviews[challenge.id] && (
                                <div className="image-preview">
                                    <img src={imagePreviews[challenge.id]} alt={`Preview of ${challenge.title}`} />
                                </div>
                            )}
                        </div>
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