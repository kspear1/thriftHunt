import React, { useState, useEffect } from 'react';
import './challenges.css';
import Redeem from './Redeem';


function Challenges({ onClose }) {
    const [challenges, setChallenges] = useState([]);
    const [imagePreviews, setImagePreviews] = useState({}); // Store image previews for each challenge
    const [earnedPoints, setEarnedPoints] = useState(0); // Total points
    const [completedChallenges, setCompletedChallenges] = useState(new Set()); // Track completed challenges
    const [showRedeem, setShowRedeem] = useState(false);


    // Sample challenges data - you can replace this with dynamic data from an API if needed
    const allChallenges = [
        { id: "1", title: "Find a Vintage T-Shirt", points: 10, description: "Find a vintage t-shirt from any thrift store and upload a photo!" },
        { id: "2", title: "Upcycle an Old Item", points: 20, description: "Upcycle an old item from your wardrobe into something new!" },
        { id: "3", title: "Complete a Thrift Haul", points: 15, description: "Do a full thrift haul and share your finds!" },
        { id: "4", title: "Style a Thrifted Outfit", points: 25, description: "Style an outfit using only thrifted clothes and upload a photo!" },
        { id: "5", title: "Thrift for a Specific Theme", points: 30, description: "Thrift items for a specific theme, e.g., '90s aesthetic'." }
    ];

    // Function to get three random challenges
    const getRandomChallenges = () => {
        let shuffled = allChallenges.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    // Handle image file change and generate preview
    const handleImageChange = async (event, challenge) => {
        const file = event.target.files[0];
        if (!file || completedChallenges.has(challenge.id)) return;
    
        const formData = new FormData();
        formData.append('image', file);
        formData.append('challengeId', challenge.id);
    
        // Assuming you're storing the userId in localStorage after login
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('You must be logged in to upload.');
            return;
        }
    
        formData.append('userId', userId);
    
        try {
            const response = await fetch('/upload-challenge-image', {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
            if (result.success) {
                setEarnedPoints(prev => prev + challenge.points);
    
                alert('Image uploaded successfully!');
            } else {
                alert(result.message || 'Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload.');
        }
    };
    

    useEffect(() => {
        const newChallenges = getRandomChallenges();
        setChallenges(newChallenges);
    
        setCompletedChallenges(new Set()); // Reset on refresh
    
        const userId = localStorage.getItem('userId');
        if (!userId) return;
    
        // ✅ FETCH total points from Supabase
        fetch(`/get-user-points?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setEarnedPoints(data.totalPoints);
            });
    }, []);

    if (showRedeem) {
        return <Redeem onClose={() => setShowRedeem(false)} />;
    }

    return (
        <div className="challenges-page">
            <h1>Thrift Challenges</h1>
            <div className="points-display">Total Points: {earnedPoints}</div>
            <hr className="divider" />
            <button className="challenges-btn" onClick={() => setShowRedeem(true)}>
                Redeem!      
            </button>
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