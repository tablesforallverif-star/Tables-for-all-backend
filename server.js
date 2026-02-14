require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Create the Transporter (Your Email "Engine")
const transporter = nodemailer.createTransport({
    // Direct Google SMTP IPv4 address to bypass network routing issues
    host: '64.233.184.108', 
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 20000, // Increased to 20s to allow for Render "cold starts"
    tls: {
        // Essential: Tells Gmail the certificate is for smtp.gmail.com even though we use an IP
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    }
});

// 2. The Verification Route
app.post('/verify-me', async (req, res) => {
    // We get the email, username, and the code from the frontend
    const { email, username, code } = req.body; 

    // Check if data is missing before trying to send
    if (!email || !code) {
        return res.status(400).send({ error: "Missing email or code" });
    }

    const mailOptions = {
        from: `"Tables For All" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 6-Digit Safety Code',
        text: `Welcome ${username}! Your verification code is: ${code}`,
        html: `<b>Welcome to Tables For All, ${username}!</b><br>Your safety code is: <h2>${code}</h2>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to:", email);
        res.status(200).send({ message: "Email Sent!" });
    } catch (error) {
        console.error("❌ Failed to send:", error);
        res.status(500).send({ error: "Email failed", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});



