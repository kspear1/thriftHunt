// Images.js
import React, { useEffect, useState } from 'react';
import './Images.css';

function Images({ challengeId, onBack }) {
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
        fetch(`/get-approved-submissions?challengeId=${challengeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setSubmissions(data.submissions);
            });
    }, [challengeId]);

    return (
        <div className="images-page">
            <button className="back-btn" onClick={onBack}>⬅ Back to Challenges</button>
            <h1>Approved Submissions</h1>
            <div className="image-grid">
                {submissions.map((submission, index) => (
                    <div key={index} className="image-card">
                        <img src={submission.image_url} alt={`submission ${index}`} />
                        <p>User: {submission.user_id.slice(0, 8)}...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Images;