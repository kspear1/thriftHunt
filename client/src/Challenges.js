import React, { useState, useEffect } from 'react';
import './challenges.css';

function Challenges({ onClose, user }) { // Ensure user is passed as a prop
    const [challenges, setChallenges] = useState([]);
    const [imagePreviews, setImagePreviews] = useState({}); // Store image previews
    const [completedChallenges, setCompletedChallenges] = useState(new Set()); // Track completed challenges
    const [userPoints, setUserPoints] = useState(0); // Track user's total points


    // Sample challenges data - replace with API data if needed
    const allChallenges = [
        { id: "1", title: "Find a Vintage T-Shirt", points: 10, description: "Find a vintage t-shirt from any thrift store and post a photo!" },
        { id: "2", title: "Upcycle an Old Item", points: 20, description: "Upcycle an old item from your wardrobe into something new!" },
        { id: "3", title: "Complete a Thrift Haul", points: 15, description: "Do a full thrift haul and share your finds!" },
        { id: "4", title: "Style a Thrifted Outfit", points: 25, description: "Style an outfit using only thrifted clothes and post a photo!" },
        { id: "5", title: "Thrift for a Specific Theme", points: 30, description: "Thrift items for a specific theme, e.g., '90s aesthetic'." }
    ];

    // Get 3 random challenges
    const getRandomChallenges = () => {
        let shuffled = allChallenges.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    // Handle Image Upload
    const handleImageUpload = async (file, challengeId) => {

        const formData = new FormData();
        formData.append('image', file);
        /*formData.append('userId', user.id);
        formData.append('challengeId', challengeId);*/
    

        try {
            
            /*const response = await fetch('/upload-challenge-image', {
                method: 'POST',
                body: formData
            });*/

            const result = await response.json();
            if (result.success) {
                alert('Image uploaded successfully!');
                console.log('Image URL:', result.imageUrl);

                // Update image preview
                setImagePreviews((prev) => ({
                    ...prev,
                    [challengeId]: result.imageUrl
                }));

                // Add points if not already added
                if (!completedChallenges[challengeId]) {
                    // Update completed challenges with the points added
                    setCompletedChallenges((prev) => ({
                        ...prev,
                        [challengeId]: true
                    }));

                    // Add points to the user's total
                    setUserPoints((prevPoints) => prevPoints + allChallenges.find(c => c.id === challengeId).points);
                    alert(`You earned ${allChallenges.find(c => c.id === challengeId).points} points for completing this challenge!`);
                } else {
                    alert('Points already awarded for this challenge!');
                }

            } else {
                alert('Upload failed: ' + result.message);
            }

            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading image');
        }
    };

    // Handle Image Change
    const handleImageChange = (event, challengeId) => {
        const file = event.target.files[0];
        if (!file) return;
    
        // Instant preview before upload
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviews(prev => ({
                ...prev,
                [challengeId]: prev[challengeId] || reader.result // Keep uploaded URL if exists
            }));
        };
        reader.readAsDataURL(file);
    
        // Upload image
        handleImageUpload(file, challengeId);
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
            {/* Display user's total points */}
            <div className="user-points">
                <h3>Total Points: {userPoints}</h3>
            </div>
            <div className="challenges-container">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-box">
                        <h2>{challenge.title}</h2>
                        <p>{challenge.description}</p>
                        <div className="points">Points: {challenge.points}</div>

                        {/* Custom Image Upload */}
                        <div className="upload-container">
                            <h3>Upload Your Image</h3>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                id={`fileInput-${challenge.id}`}
                                className="hidden-file-input"
                                onChange={(event) => handleImageChange(event, challenge.id)}
                            />

                            {/* Custom Upload Button */}
                            <button className="upload-button" onClick={() => document.getElementById(`fileInput-${challenge.id}`).click()}>
                                Upload Photo
                            </button>

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