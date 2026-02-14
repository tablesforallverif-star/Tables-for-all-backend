require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/verify-me', async (req, res) => {
    const { email, username, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Your new key
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    name: "Tables For All", 
                    email: "tablesforallverif@gmail.com" // Use your verified email
                },
                to: [{ email: email }],
                subject: "Your 6-Digit Safety Code",
                htmlContent: `
                    <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px;">
                        <h1>Welcome to Tables For All, ${username}!</h1>
                        <p>Your verification code is:</p>
                        <h2 style="color: #ff4d4d; font-size: 32px; letter-spacing: 5px;">${code}</h2>
                    </div>`
            })
        });

        if (response.ok) {
            console.log("✅ Success! Email sent via Brevo API.");
            res.status(200).json({ message: "Email Sent!" });
        } else {
            const errorData = await response.json();
            console.error("❌ Brevo Error:", errorData);
            throw new Error(errorData.message || "Email API failed");
        }
    } catch (error) {
        console.error("❌ Connection Error:", error.message);
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API Backend running on port ${PORT}`));

