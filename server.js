require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Create the Transporter (Your Email "Engine")
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Your 16-character App Password
    }
});

// 2. The Verification Route
app.post('/verify-me', async (req, res) => {
    const { email, code } = req.body;

    const mailOptions = {
        from: `"Tables For All" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 6-Digit Safety Code',
        text: `Welcome! Your verification code is: ${code}`,
        html: `<b>Welcome to Tables For All!</b><br>Your safety code is: <h2>${code}</h2>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: "Email Sent!" });
    } catch (error) {
        console.error("Failed to send:", error);
        res.status(500).send({ error: "Email failed" });
    }
});

app.listen(3000, () => console.log('✅ Mailer ready on port 3000'));