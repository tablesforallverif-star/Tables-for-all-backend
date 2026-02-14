require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Create the Transporter
// Using the hostname is safer than a static IP for long-term reliability
const transporter = nodemailer.createTransport({
    service: 'gmail', // Shorthand for host: 'smtp.gmail.com', port: 465, secure: true
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Must be a 16-character App Password
    },
    connectionTimeout: 20000, 
    greetingTimeout: 10000,
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Transporter Config Error:", error);
    } else {
        console.log("🚀 Email Server is ready to send messages");
    }
});

// 2. The Verification Route
app.post('/verify-me', async (req, res) => {
    const { email, username, code } = req.body; 

    if (!email || !code) {
        return res.status(400).json({ error: "Missing email or code" });
    }

    const mailOptions = {
        from: `"Tables For All" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 6-Digit Safety Code',
        text: `Welcome ${username || 'User'}! Your verification code is: ${code}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2>Welcome to Tables For All, ${username || 'User'}!</h2>
                <p>Your safety code is:</p>
                <h1 style="color: #4A90E2; letter-spacing: 2px;">${code}</h1>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to:", email);
        res.status(200).json({ message: "Email Sent!" });
    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        res.status(500).json({ 
            error: "Email failed", 
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error" 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
