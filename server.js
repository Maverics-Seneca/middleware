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
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from frontend
    credentials: true, // Allow cookies to be sent
}));

const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; // Read JWT from cookies

    if (!token) {
        return res.redirect('/'); // Redirect to login if no token
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.name = decoded.name;
        next();
    } catch (error) {
        res.clearCookie('authToken'); // Clear invalid token
        return res.redirect('/'); // Redirect to login
    }
};

// Login Route (Proxy to Auth Service)
app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://auth-service:4000/api/login', req.body, { 
            withCredentials: true 
          });
        console.log("Auth-service response:", response.data);

        const jwtToken = response.data.token;
        if (jwtToken) {
            console.log("Setting cookie:", response.data.token);
            res.cookie('authToken', jwtToken, {
                httpOnly: true,
                secure: false, // Set to false for development (HTTP)
                sameSite: 'None', // Use 'Lax' for better compatibility
                maxAge: 3600000, // 1 hour
                domain: 'localhost', // Replace with your domain in production
                path: '/', // Accessible across all routes
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
        const response = await axios.post("http://auth-service:4000/api/register", req.body, { 
            withCredentials: true 
          });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || "Registration failed" });
    }
});

app.post("/auth/request-password-reset", async (req, res) => {
    try {
        const response = await axios.post("http://auth-service:4000/api/request-password-reset", req.body, { 
            withCredentials: true 
          });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || "Password reset failed" });
    }
});

// Protected Route Example
app.get('/medications', authenticateUser, (req, res) => {
    res.json({ message: `Fetching medications for user ${req.userId}` });
});

app.listen(PORT, () => {
    console.log(`Middleware running on port ${PORT}`);
});
