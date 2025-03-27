import React, { useState, useEffect } from 'react';
import './challenges.css';

function Challenges({ onClose }) {
    const [challenges, setChallenges] = useState([]);
    const [imagePreviews, setImagePreviews] = useState({}); // Store image previews for each challenge

    // Sample challenges data - you can replace this with dynamic data from an API if needed
    const allChallenges = [
        { title: "Find a Vintage T-Shirt", points: 10, description: "Find a vintage t-shirt from any thrift store and post a photo!" },
        { title: "Upcycle an Old Item", points: 20, description: "Upcycle an old item from your wardrobe into something new!" },
        { title: "Complete a Thrift Haul", points: 15, description: "Do a full thrift haul and share your finds!" }
    ];

    // Function to get three random challenges
    const getRandomChallenges = () => {
        let shuffled = allChallenges.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    // Handle image file change and generate preview
    const handleImageChange = (event, challengeIndex) => {
        const file = event.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreviews(prev => ({
                ...prev,
                [challengeIndex]: previewUrl
            }));

            // Optionally, you can upload the image to a server here
            // Example: uploadImageToServer(file);
        }
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

                        {/* Image Upload */}
                        <div className="upload-container">
                            <h3>Upload Your Image</h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => handleImageChange(event, index)} // Handle the file input change
                            />
                            
                            {/* Image Preview */}
                            {imagePreviews[index] && (
                                <div className="image-preview">
                                    <img src={imagePreviews[index]} alt={`Preview of ${challenge.title}`} />
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