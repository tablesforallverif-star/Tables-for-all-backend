require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dns = require('dns');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Hardened Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Port 465 is usually more stable on Render
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Force IPv4 and extend timings for cloud firewalls
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 45000,     // Allow 45s for the data to actually move
    dnsLookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    }
});

// Immediate check
transporter.verify((error) => {
    if (error) {
        console.error("❌ Transporter Error (Still blocked):", error.message);
    } else {
        console.log("🚀 SUCCESS: Connection established to Gmail!");
    }
});

app.post('/verify-me', async (req, res) => {
    const { email, username, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Missing data" });
    }

    const mailOptions = {
        from: `"Tables For All" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 6-Digit Safety Code',
        html: `<h2>Welcome, ${username}!</h2><p>Your code is: <b>${code}</b></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to:", email);
        res.status(200).json({ message: "Email Sent!" });
    } catch (error) {
        console.error("❌ Send Error:", error.message);
        res.status(500).json({ error: "Email failed", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
