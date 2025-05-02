// Import required modules
const express = require('express');
const path = require('path');
const multer = require('multer'); // Middleware for handling multipart/form-data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 

const app = express();
app.use(express.json());

// Configure Multer for handling image uploads
const storage = multer.memoryStorage(); // Store file in memory as a buffer
const upload = multer({ storage });

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

const getPointsForChallenge = (challengeId) => {
    const challengePointsMap = {
        "1": 10,
        "2": 20,
        "3": 15,
        "4": 25,
        "5": 30,
    };
    return challengePointsMap[challengeId] || 0;
};

// ========================================================
// Authentication Routes using Supabase Auth
// ========================================================

// Registration endpoint using Supabase Auth
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Received registration request for email: ${email}`);

    // Email validation
    /* const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Email must end with @spelman.edu or @morehouse.edu.' });
    } */

    try {
        // Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Store additional user info
        });

        if (error) throw error;

        // After successful registration, create a profile for the user
        const userId = data.user.id;

        // Insert the user into the 'profiles' table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: userId,
                    name: name || 'Unknown', // If no name, default to 'Unknown'
                    total_points: 0
                }
            ]);

        if (profileError) throw profileError;

        res.json({ success: true, message: 'Registration successful. Check your email for verification.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Received login request for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Extract name directly from login response
        const userName = data.user.user_metadata?.name || 'Thrifter';

        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: { ...data.user, name: userName } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// Email verification using 6-digit code
app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;
    console.log(`Verifying email: ${email} with code: ${verificationCode}`);

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: verificationCode,
            type: 'signup'
        });

        if (error) {
            console.error('Verification failed:', error);
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying email' });
    }
});

// ========================================================
// Image Upload Route (to Supabase Storage)
// ========================================================
app.post('/upload-challenge-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { userId, challengeId } = req.body; // Get user & challenge ID from frontend
        if (!userId || !challengeId) {
            return res.status(400).json({ success: false, message: 'Missing userId or challengeId' });
        }

        // Create a unique filename
        const fileName = `challenges/${userId}_${challengeId}_${Date.now()}.jpg`;
        const contentType = req.file.mimetype;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('challenge-images') // Supabase bucket name
            .upload(fileName, req.file.buffer, {
                contentType,
                upsert: false,
            });

        if (error) throw error;

        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage.from('challenge-images').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;

        // Store image URL in database
        const { error: dbError } = await supabase
            .from('challenge_submissions')
            .insert([{ user_id: userId, challenge_id: challengeId, image_url: imageUrl, status: 'pending' }]);

        if (dbError) throw dbError;

        res.json({ success: true, message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
    }
});

app.post('/review-challenge-submission', async (req, res) => {
    const { submissionId, status } = req.body;

    if (!submissionId || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    try {
        // Fetch submission data
        const { data: submissionData, error: fetchError } = await supabase
        .from('challenge_submissions')
        .select('user_id, challenge_id')
        .eq('id', submissionId);

        console.log('Fetched submissionData:', submissionData);

        if (fetchError || !submissionData || submissionData.length === 0) {
            throw new Error('Could not find submission with that ID');
        }

        const submission = submissionData[0];
        const challengePoints = getPointsForChallenge(submission.challenge_id); // <-- Replace this with your logic
        const userId = submission.user_id;

        // Update submission status
        const { error: updateError } = await supabase
            .from('challenge_submissions')
            .update({ status })
            .eq('id', submissionId);

        if (updateError) throw updateError;

        // If approved, update user points
        if (status === 'approved') {
            const { error: pointsError } = await supabase.rpc('increment_user_points', {
                user_id_input: userId,
                points_to_add: challengePoints
            });
            if (pointsError) throw pointsError;
        }

        res.json({ success: true, message: `Submission ${status} successfully` });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ success: false, message: 'Review failed', error: error.message });
    }
});

app.get('/get-user-points', async (req, res) => {
    const { userId } = req.query;
    const { data, error } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, totalPoints: data.total_points });
});

// ✅ Redeem a reward (deduct points)
app.post('/redeem-reward', async (req, res) => {
  const { userId, rewardId, cost } = req.body;

  try {
    // Deduct points
    const { error: pointsError } = await supabase.rpc('increment_user_points', {
      user_id_input: userId,
      points_to_add: -cost
    });

    if (pointsError) throw pointsError;

    // Record the redemption
    const { error: insertError } = await supabase
      .from('redemptions')
      .insert([{ user_id: userId, reward_id: rewardId }]);

    if (insertError) throw insertError;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/get-approved-points', async (req, res) => {
    const { userId } = req.query;

    try {
        // Get all approved submissions for this user
        const { data: submissions, error } = await supabase
            .from('challenge_submissions')
            .select('challenge_id')
            .eq('user_id', userId)
            .eq('status', 'approved');

        if (error) throw error;

        // Define point values
        const challengePoints = {
            "1": 10,
            "2": 20,
            "3": 15,
            "4": 25,
            "5": 30
        };

        // Calculate total points from approved challenges
        const totalPoints = submissions.reduce((sum, sub) => {
            return sum + (challengePoints[sub.challenge_id] || 0);
        }, 0);

        res.json({ success: true, totalPoints });
    } catch (err) {
        console.error('Error fetching approved points:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/get-approved-submissions', async (req, res) => {
    const { challengeId } = req.query;

    const { data, error } = await supabase
        .from('challenge_submissions')
        .select('user_id, image_url')
        .eq('challenge_id', challengeId)
        .eq('status', 'approved');

    if (error) return res.status(500).json({ success: false, message: error.message });

    res.json({ success: true, submissions: data });
});

app.get('/get-challenge-status', async (req, res) => {
    const { userId, challengeId } = req.query;
  
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select('status')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false }) // just in case multiple
      .limit(1)
      .single();
  
    if (error || !data) {
      return res.json({ success: true, status: null }); // no submission yet
    }
  
    res.json({ success: true, status: data.status });
  });
  



// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});