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

// ========================================================
// Authentication Routes using Supabase Auth
// ========================================================

// Registration endpoint using Supabase Auth
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Received registration request for email: ${email}`);

    // Email validation
    const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Email must end with @spelman.edu or @morehouse.edu.' });
    }

    try {
        // Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Store additional user info
        });

        if (error) throw error;

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

        console.log("File:", req.file);
        console.log("Body:", req.body); // userId and challengeId should be present

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

        // Store image URL in database (optional)
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
    const { submissionId, status, userId } = req.body; // Include userId

    if (!submissionId || !userId || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    try {
        // Get the points from the challenge submission
        const { data: submission, error: fetchError } = await supabase
            .from('challenge_submissions')
            .select('points')
            .eq('id', submissionId)
            .single();

        if (fetchError || !submission) throw new Error('Submission not found');

        // If approved, update user points
        if (status === 'approved') {
            // Update user's points in the users table (Assuming a `users` table with `total_points` column)
            const { error: pointsError } = await supabase
                .from('users')
                .update({ total_points: supabase.raw('total_points + ?', [submission.points]) })
                .eq('id', userId);

            if (pointsError) throw pointsError;
        }

        // Update the submission status
        const { error: updateError } = await supabase
            .from('challenge_submissions')
            .update({ status })
            .eq('id', submissionId);

        if (updateError) throw updateError;

        res.json({ success: true, message: `Submission ${status} successfully` });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ success: false, message: 'Review failed', error: error.message });
    }
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