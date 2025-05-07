// Images.js
import React, { useEffect, useState } from 'react';
import './Images.css';
import './challenges.css'

function Images({ challenge, onBack }) {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        // Apply override class to <body>
        document.body.classList.add('images-active');
        return () => {
          // Clean up on unmount
          document.body.classList.remove('images-active');
        };
      }, []);

    useEffect(() => {
        fetch(`/get-approved-submissions?challengeId=${challenge.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setSubmissions(data.submissions);
            });
    }, [challenge]);

    return (
        <div className="images-page">
            <button className="logout-btn" onClick={onBack}>⬅ Back to Challenges</button>
            <h1 className="challenge-title">{challenge?.title || "Challenge Submissions"}</h1>
            <hr className="image-divider" />
            <div className="image-grid">
                {submissions.map((submission, index) => (
                    <div key={index} className="image-card">
                        <img src={submission.image_url} alt={`submission ${index}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Images;