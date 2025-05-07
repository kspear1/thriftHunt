import React, { useState, useEffect } from 'react';
import './challenges.css';
import Redeem from './Redeem';
import Images from './Images';
const CHALLENGE_REFRESH_KEY = "lastChallengeRefresh";
const CHALLENGE_DATA_KEY = "cachedChallenges";
const REFRESH_INTERVAL_MS = 36 * 60 * 60 * 1000;


function Challenges({ onClose }) {
    const [challenges, setChallenges] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0); // Total points
    const [completedChallenges, setCompletedChallenges] = useState(new Set()); // Track completed challenges
    const [showRedeem, setShowRedeem] = useState(false);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [pendingUpload, setPendingUpload] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [challengeStatuses, setChallengeStatuses] = useState({});
    const [timeLeft, setTimeLeft] = useState('');
    const statusMessages = {
        approved: '✅ Your submission was approved! Fabulous job!',
        pending: '⏳ Your submission is pending review. Hold Tight!',
        rejected: '❌ Your submission was not approved. Feel free to try again!',
        none: '🚫 You haven’t submitted anything yet for this challenge.'
      };



    // Sample challenges data - you can replace this with dynamic data from an API if needed
    const allChallenges = [
        { id: "1", title: "Thrift Store Selfie", points: 5, difficulty: "easy", description: "Take a selfie inside any thrift store and upload it!" },
        { id: "2", title: "Thrifted Accessory Find", points: 10, difficulty: "easy", description: "Buy a thrifted accessory and take a photo of you wearing or holding it." },
        { id: "3", title: "Spot a Wild Pattern", points: 5, difficulty: "easy", description: "Snap a pic of the wildest pattern you find while thrifting—no need to buy it!" },
        { id: "4", title: "Cozy Corner Capture", points: 5, difficulty: "easy", description: "Take a photo of the coziest or most nostalgic corner in the store." },
        { id: "5", title: "Buy a Book", points: 10, difficulty: "easy", description: "Purchase a secondhand book and upload a photo of the cover." },
        { id: "6", title: "Color of the Day", points: 10, difficulty: "easy", description: "Buy something that’s mostly one color. Upload a photo showing the item clearly." },
        { id: "7", title: "Sticker or Tag Hunt", points: 5, difficulty: "easy", description: "Find a funny or interesting price tag or sticker and photograph it." },
        { id: "8", title: "Thrifted Jewelry Flex", points: 10, difficulty: "easy", description: "Buy a piece of jewelry and upload a photo of you styling it!" },
        { id: "9", title: "Outfit Under $10", points: 20, difficulty: "medium", description: "Buy and wear an outfit that cost $10 or less. Upload a full-body photo wearing it." },
        { id: "10", title: "One Brand Challenge", points: 15, difficulty: "medium", description: "Buy an item from a recognizable brand and upload a photo showing the logo or tag." },
        { id: "11", title: "Style Swap", points: 15, difficulty: "medium", description: "Buy an item outside your usual style. Upload a photo of you wearing it confidently!" },
        { id: "12", title: "Dress by Decade", points: 20, difficulty: "medium", description: "Buy an item that fits a past decade (like '70s, '90s) and upload a photo modeling it." },
        { id: "13", title: "Themed Thrift Photoshoot", points: 30, difficulty: "hard", description: "Buy at least one item that fits a fun theme (like 'cottagecore' or 'Y2K'). Upload a photo of you wearing it in a styled look!" },
        { id: "14", title: "Ultimate Thrift Flip", points: 35, difficulty: "hard", description: "Buy a basic item and customize or repurpose it into something new. Upload a photo of the final transformed item!" },
        { id: "15", title: "Thrifted Closet Challenge", points: 40, difficulty: "hard", description: "Put together a full outfit made entirely of thrifted purchases. Upload one photo of you rocking the full look!" }
      ];
      

    // Function to get three random challenges
    const getRandomChallenges = () => {
        const easy = allChallenges.filter(c => c.difficulty === "easy");
        const medium = allChallenges.filter(c => c.difficulty === "medium");
        const hard = allChallenges.filter(c => c.difficulty === "hard");
      
        const getRandom = (list, count) =>
          list.sort(() => 0.5 - Math.random()).slice(0, count);
      
        const selected = [
          ...getRandom(hard, 1),     // 1 hard
          ...getRandom(medium, 2),   // 2 medium
          ...getRandom(easy, 3)      // 3 easy
        ];
      
        return selected.sort(() => 0.5 - Math.random()); // Shuffle final list
      };

    // Handle image file change and generate preview
    const handleImageChange = (event, challenge) => {
        const file = event.target.files[0];
        if (!file || completedChallenges.has(challenge.id)) return;
    
        const previewUrl = URL.createObjectURL(file);
        setPendingUpload({ file, challenge, previewUrl });
        setShowModal(true);
    };

    const confirmUpload = async () => {
        if (isUploading) return; // avoid duplicate clicks
        setIsUploading(true);
      
        const { file, challenge } = pendingUpload;
      
        const formData = new FormData();
        formData.append('image', file);
        formData.append('challengeId', challenge.id);
      
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('You must be logged in to upload.');
          setIsUploading(false);
          return;
        }
      
        formData.append('userId', userId);
      
        try {
          const response = await fetch('/upload-challenge-image', {
            method: 'POST',
            body: formData,
          });
      
          const result = await response.json();
          if (result.success) {
            alert('Image uploaded! Awaiting approval to earn points.');

            setChallengeStatuses(prev => ({
                ...prev,
                [challenge.id]: 'pending'
              }));
          } else {
            alert(result.message || 'Upload failed.');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('An error occurred during upload.');
        }
      
        setPendingUpload(null);
        setShowModal(false);
        setIsUploading(false);
      };
      
    
    
    const refreshPoints = () => {
        const userId = localStorage.getItem('userId');
        fetch(`/get-user-points?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setEarnedPoints(data.totalPoints);
            });
    };

    const formatTimeLeft = (ms) => {
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
      };

      useEffect(() => {
        const now = Date.now();
        const lastRefresh = parseInt(localStorage.getItem(CHALLENGE_REFRESH_KEY), 10);
        const cached = localStorage.getItem(CHALLENGE_DATA_KEY);
      
        let finalChallenges = [];
      
        if (cached && lastRefresh && now - lastRefresh < REFRESH_INTERVAL_MS) {
          finalChallenges = JSON.parse(cached);
        } else {
          const newChallenges = getRandomChallenges();
          finalChallenges = [...newChallenges].sort((a, b) => a.points - b.points);
          localStorage.setItem(CHALLENGE_DATA_KEY, JSON.stringify(finalChallenges));
          localStorage.setItem(CHALLENGE_REFRESH_KEY, now.toString());
        }
      
        setChallenges(finalChallenges);
        setCompletedChallenges(new Set());
      
        const userId = localStorage.getItem('userId');
        if (!userId) return;
      
        fetch(`/get-user-points?userId=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setEarnedPoints(data.totalPoints);
          });
      
        finalChallenges.forEach(challenge => {
          fetch(`/get-challenge-status?userId=${userId}&challengeId=${challenge.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setChallengeStatuses(prev => ({
                  ...prev,
                  [challenge.id]: data.status
                }));
              }
            });
        });
      }, []);
      

    useEffect(() => {
  const updateCountdown = () => {
    const lastRefresh = parseInt(localStorage.getItem(CHALLENGE_REFRESH_KEY), 10);

    if (!lastRefresh || isNaN(lastRefresh)) {
      setTimeLeft('⏳ Waiting for first challenge set...');
      return;
    }

    const now = Date.now();
    const timeUntilRefresh = REFRESH_INTERVAL_MS - (now - lastRefresh);

    if (timeUntilRefresh > 0) {
      setTimeLeft(`⏳ New challenges in: ${formatTimeLeft(timeUntilRefresh)}`);
    } else {
      //Time is up — reset everything
      const newChallenges = getRandomChallenges().sort((a, b) => a.points - b.points);
      localStorage.setItem(CHALLENGE_DATA_KEY, JSON.stringify(newChallenges));
      localStorage.setItem(CHALLENGE_REFRESH_KEY, Date.now().toString());
      setChallenges(newChallenges);
      setTimeLeft(`🔄 New challenge set just loaded!`);

      //Clear old submissions from the backend
      fetch('/clear-expired-submissions', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            console.error('Failed to clear submissions:', data.message);
          }
        });
    }
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 60000); // check every 1 min
  return () => clearInterval(interval);
}, []);

      

    useEffect(() => {
        document.body.classList.add('challenges-layout');
        return () => document.body.classList.remove('challenges-layout');
      }, []);

    if (showRedeem) {
        return <Redeem onClose={() => setShowRedeem(false)} />;
    }

    if (selectedChallengeId) {
        return <Images 
            challenge={challenges.find(c => c.id === selectedChallengeId)}
            onBack={() => setSelectedChallengeId(null)} 
        />;
    }

    return (
        <div className="challenges-page">
            <h1>Thrift Challenges</h1>
            <div className="points-display">Total Points: {earnedPoints}</div>
            <div className="corner-button-wrapper">
                <button className="top-btn" onClick={onClose}>
                 ⬅ Back to Dashboard!
                </button>
                <button className="top-btn" onClick={() => setShowRedeem(true)}>
                    Redeem!      
                </button>
                <button className="top-btn" onClick={refreshPoints}>Refresh Points</button>
            </div>
            <div className="time-left">{timeLeft}</div>
            <hr className="divider" />
            <div className="challenges-container">
                {challenges.map((challenge, index) => (
                    <div key={index} className="challenge-box">
                        {(() => {
                        const rawStatus = challengeStatuses[challenge.id];
                        const status = typeof rawStatus === 'string' ? rawStatus : 'none';
                        return (
                            <div className={`challenge-status-header ${status}`}>
                            {statusMessages[status]}
                            </div>
                        );
                        })()}
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
                            disabled={['approved', 'pending'].includes(challengeStatuses[challenge.id])}
                            />

                            {/* Custom styled label acting as button */}
                            <label
                            htmlFor={`file-upload-${challenge.id}`}
                            className={`upload-button ${['approved', 'pending'].includes(challengeStatuses[challenge.id]) ? 'disabled' : ''}`}
                            >
                            Upload Photo
                            </label>
                            <button
                            className="view-submissions-btn" onClick={() => setSelectedChallengeId(challenge.id)}>
                            See Challenge Submissions
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {showModal && pendingUpload && (
            <div className="image-modal-overlay">
                <div className="image-modal-content">
                <img src={pendingUpload.previewUrl} alt="Preview" />
                <div className="image-modal-buttons">
                <button
                className="confirm-btn"
                onClick={confirmUpload}
                disabled={isUploading}
                >
                {isUploading ? 'Uploading...' : 'Confirm Image'}
                </button>
                <button className="cancel-btn" onClick={() => { setPendingUpload(null); setShowModal(false); }}>Cancel</button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default Challenges;