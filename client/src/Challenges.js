import React, { useState, useEffect } from 'react';
import './challenges.css';
import axios from 'axios';

function Challenges({ email, onClose }) {
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
    const handleImageChange = async (event, challenge) => {
        const file = event.target.files[0];
        if (!file || completedChallenges.has(challenge.id)) return;
    
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', email); // Use email as userId
        formData.append('challengeId', challenge.id);
    
        try {
            const response = await axios.post('/upload-challenge-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            if (response.data.success) {
                // Update UI with the uploaded image
                setImagePreviews(prev => ({ ...prev, [challenge.id]: response.data.imageUrl }));
    
                // Store completed challenge in the database
                const { error } = await supabase
                    .from('completed_challenges')
                    .insert([{ user_id: email, challenge_id: challenge.id }]); // Use email instead of user.id
    
                if (error) throw error;
    
                // Update state to reflect completed challenge
                setCompletedChallenges(prev => new Set(prev).add(challenge.id));
    
                alert('Image uploaded! Challenge marked as completed.');
            } else {
                alert('Upload failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };

    useEffect(() => {
        setChallenges(getRandomChallenges());
        document.body.classList.add("challenges-body");
    
        const fetchPoints = async () => {
            try {
                if (!email) {
                    alert('User email is missing!');
                    return;
                }
    
                const { data, error } = await supabase
                    .from('users')
                    .select('total_points')
                    .eq('email', email) // Use email instead of user.id
                    .single();
    
                if (error) throw error;
    
                setEarnedPoints(data.total_points || 0);
            } catch (error) {
                console.error('Error fetching points:', error);
            }
        };
    
        fetchPoints();
    
        return () => {
            document.body.classList.remove("challenges-body"); // Cleanup on exit
        };
    }, [email]); // Re-run if the email changes

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
                                disabled={completedChallenges.has(challenge.id)} // Disable if challenge is completed
                            />
                            {/* Custom styled label acting as button */}
                            <label 
                                htmlFor={`file-upload-${challenge.id}`} 
                                className={`upload-button ${completedChallenges.has(challenge.id) ? 'disabled' : ''}`}
                            >
                                {completedChallenges.has(challenge.id) ? 'Completed!' : 'Upload Photo'}
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