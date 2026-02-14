require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dns = require('dns'); // Required to force IPv4

const app = express();

// 1. Better CORS Configuration
app.use(cors()); 
app.use(express.json());

// 2. Transporter with IPv4 Force
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 20000,
    // This is the "Magic" that fixes Render network blocks
    dnsLookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    }
});

transporter.verify((error) => {
    if (error) console.error("❌ Transporter Error:", error);
    else console.log("🚀 Server is ready to send emails via IPv4");
});

app.post('/verify-me', async (req, res) => {
    // Debug: Log exactly what the server sees
    console.log("Incoming request body:", req.body);

    const { email, username, code } = req.body; 

    if (!email || !code) {
        return res.status(400).json({ 
            error: "Missing data", 
            received: { email: !!email, username: !!username, code: !!code } 
        });
    }

    const mailOptions = {
        from: `"Tables For All" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 6-Digit Safety Code',
        html: `<div style="font-family: sans-serif;">
                <h2>Welcome, ${username}!</h2>
                <p>Your safety code is: <b>${code}</b></p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email Sent!" });
    } catch (error) {
        console.error("❌ Send Error:", error);
        res.status(500).json({ error: "Email failed", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend live on port ${PORT}`));
