const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
const PORT = 5000;

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; // Read JWT from cookies

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// Login Route (Proxy to Auth Service)
app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://auth-service:4000/api/login', req.body);
        console.log("Auth-service response:", response.data);

        const jwtToken = response.data.token;
        if (jwtToken) {
            res.cookie('authToken', jwtToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000,
            });
        }

        res.json({ userId: response.data.userId, role: response.data.role });
    } catch (error) {
        console.error("Error in middleware login:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || "Authentication failed" });
    }
});

app.post("/auth/register", async (req, res) => {
    try {
        const response = await axios.post("http://auth-service:4000/api/register", req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || "Registration failed" });
    }
});

// Protected Route Example
app.get('/medications', authenticateUser, (req, res) => {
    res.json({ message: `Fetching medications for user ${req.userId}` });
});

app.listen(PORT, () => {
    console.log(`Middleware running on port ${PORT}`);
});
