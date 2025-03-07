const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
const PORT = 3001;

const app = express();

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from frontend
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Debug: Log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Cookies:', req.cookies); // Log cookies for debugging
    next();
});

// Authentication middleware
const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; // Extract the authToken cookie
    console.log('Token from cookie:', token); // Debug: Log the token

    if (!token) {
        console.log('No token found, unauthorized access.'); // Debug: No token
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verify the token
        console.log('Decoded token:', decoded); // Debug: Log decoded token
        req.userId = decoded.userId;
        req.email = decoded.email;
        req.name = decoded.name;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message); // Debug: Token verification error
        res.clearCookie('authToken'); // Clear invalid token
        return res.redirect('/');
    }
};

// Login route
app.post('/auth/login', async (req, res) => {
    console.log('Login request received:', req.body); // Debug: Log login request

    try {
        const response = await axios.post('http://auth-service:4000/api/login', req.body);
        console.log('Auth service response:', response.data); // Debug: Log auth service response

        // Set the authToken cookie
        res.cookie('authToken', response.data.token, {
            httpOnly: true,
            secure: true, // Ensure this is true in production (HTTPS only)
            sameSite: 'None', // Required for cross-origin cookies
            maxAge: 3600000, // 1 hour
            path: '/', // Cookie accessible across all paths
        });

        console.log('Cookie set successfully:', response.data.token); // Debug: Log cookie set

        // Include the token in the JSON response
        res.json({
            token: response.data.token, // Send the token back to the frontend server
            userId: response.data.userId,
            email: response.data.email,
            name: response.data.name,
        });
    } catch (error) {
        console.error('Login error:', error.message); // Debug: Log login error
        res.status(error.response?.status || 500).json({ error: "Authentication failed" });
    }
});

// Register route
app.post("/auth/register", async (req, res) => {
    console.log('Register request received:', req.body); // Debug: Log register request

    try {
        const response = await axios.post("http://auth-service:4000/api/register", req.body);
        console.log('Auth service response:', response.data); // Debug: Log auth service response
        res.json(response.data);
    } catch (error) {
        console.error('Registration error:', error.message); // Debug: Log registration error
        res.status(error.response?.status || 500).json({ error: "Registration failed" });
    }
});

// Password reset route
app.post("/auth/request-password-reset", async (req, res) => {
    console.log('Password reset request received:', req.body); // Debug: Log password reset request

    try {
        const response = await axios.post("http://auth-service:4000/api/request-password-reset", req.body);
        console.log('Auth service response:', response.data); // Debug: Log auth service response
        res.json(response.data);
    } catch (error) {
        console.error('Password reset error:', error.message); // Debug: Log password reset error
        res.status(error.response?.status || 500).json({ error: "Password reset failed" });
    }
});

app.post('/caretaker/add', async (req, res) => {
    console.log('Adding caretaker:', req.body); // Debug: Log caretaker data

    try {
        const response = await axios.post('http://caretaker-service:4004/api/caretaker/add', req.body);
        res.json(response.data); // Forward the response from caretaker-service
    } catch (error) {
        console.error('Error forwarding request to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to add caretaker' });
    }
});

app.get('/caretaker/get', async (req, res) => {
    const { patientId } = req.query;

    console.log('Fetching caretakers for patientId:', patientId); // Debug log

    try {
        const response = await axios.get('http://caretaker-service:4004/api/caretaker/get', {
            params: { patientId }
        });
        res.json(response.data); // Forward the response from caretaker-service
    } catch (error) {
        console.error('Error forwarding request to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch caretakers' });
    }
});

app.post('/caretaker/update', async (req, res) => {
    const { id, patientId, name, relation, phone, email } = req.body;

    console.log('Forwarding update for caretaker:', { id, patientId, name, relation, phone, email }); // Debug log

    try {
        const response = await axios.post('http://caretaker-service:4004/api/caretaker/update', {
            id,
            patientId,
            name,
            relation,
            phone,
            email
        });
        res.json(response.data); // Forward the response from caretaker-service
    } catch (error) {
        console.error('Error forwarding update to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to update caretaker' });
    }
});

app.post('/medicine/add', async (req, res) => {
    console.log('Incoming request: POST /medicine/add');
    console.log('Request body:', req.body); // Log full request body

    const { patientId, name, dosage, frequency, prescribingDoctor, endDate, inventory } = req.body;

    console.log('Forwarding medicine add request:', { patientId, name, dosage, frequency, prescribingDoctor, endDate, inventory });

    try {
        const response = await axios.post('http://medication-service:4002/api/medicine/add', {
            patientId,
            name,
            dosage,
            frequency,
            prescribingDoctor,
            endDate,
            inventory
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Response from medication-service:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to medication-service:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(error.response?.status || 500).json({ error: 'Failed to add medicine', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Middleware running on port ${PORT}`);
});