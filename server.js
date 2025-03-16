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

// Fetch all logs
app.get('/logs', async (req, res) => {
    console.log('Fetching logs');
    try {
        const response = await axios.get('http://auth-service:4000/api/logs');
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding logs request:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch logs' });
    }
});

// Create Organization
app.post('/organization/create', async (req, res) => {
    console.log('Create organization request received:', req.body);
    const { userId, name, description } = req.body;

    try {
        const response = await axios.post('http://auth-service:4000/api/organization/create', {
            userId,
            name,
            description
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error in middleware creating organization:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to create organization' });
    }
});

// Get All Organizations for a User
app.get('/organization/get', async (req, res) => {
    const { userId } = req.query;
    console.log('Get organizations request received for user:', userId);
    try {
        const response = await axios.get('http://auth-service:4000/api/organization/get', {
            params: { userId }
        });
        console.log('Middleware response from auth-service:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error in middleware fetching organizations:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch organizations' });
    }
});
// Update Organization
app.put('/organization/:id', async (req, res) => {
    const { id } = req.params;
    const { userId, name, description } = req.body;
    console.log('Update organization request received for ID:', id);

    try {
        const response = await axios.put(`http://auth-service:4000/api/organization/${id}`, {
            userId,
            name,
            description
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error in middleware updating organization:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to update organization' });
    }
});

// Delete Organization
app.delete('/organization/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('Delete organization request received for ID:', id);

    try {
        const response = await axios.delete(`http://auth-service:4000/api/organization/${id}`, {
            data: { userId }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error in middleware deleting organization:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to delete organization' });
    }
});

app.get('/organization/get-all', async (req, res) => {
    console.log('Get all organizations request received');

    try {
        const response = await axios.get('http://auth-service:4000/api/organization/get-all');
        res.json(response.data);
    } catch (error) {
        console.error('Error in middleware fetching all organizations:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch organizations' });
    }
});

// Login route
app.post('/auth/login', async (req, res) => {
    console.log('Login request received:', req.body);

    try {
        const response = await axios.post('http://auth-service:4000/api/login', req.body);
        console.log('Auth service response:', response.data);

        // Set the authToken cookie
        res.cookie('authToken', response.data.token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'Lax',
            maxAge: 3600000, // 1 hour
            path: '/',
        });

        console.log('Cookie set successfully:', response.data.token);

        // Include the token and role in the JSON response
        res.json({
            token: response.data.token,
            userId: response.data.userId,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role // Add role if Auth Service starts returning it explicitly
        });
    } catch (error) {
        console.error('Login error:', error.message);
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

// Register route (for admin)
app.post('/auth/register-admin', async (req, res) => {
    console.log('Register admin request received:', req.body);

    try {
        const response = await axios.post('http://auth-service:4000/api/register-admin', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error in middleware registering admin:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Registration failed' });
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

    console.log('Fetching caretakers for patientId:', patientId);

    try {
        const response = await axios.get('http://caretaker-service:4004/api/caretaker/get', {
            params: { patientId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch caretakers' });
    }
});

app.post('/caretaker/update', async (req, res) => {
    const { id, patientId, name, relation, phone, email } = req.body;

    console.log('Forwarding update for caretaker:', { id, patientId, name, relation, phone, email });

    try {
        const response = await axios.post('http://caretaker-service:4004/api/caretaker/update', {
            id,
            patientId,
            name,
            relation,
            phone,
            email
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding update to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to update caretaker' });
    }
});

// Delete a caretaker
app.delete('/caretaker/delete', async (req, res) => {
    const { id, patientId } = req.body;

    console.log('Forwarding delete for caretaker:', { id, patientId });

    try {
        const response = await axios.delete('http://caretaker-service:4004/api/caretaker/delete', {
            data: { id, patientId } // Send data in body for DELETE
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding delete to caretaker-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to delete caretaker' });
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

// Fetch medications
app.get('/medicine/get', async (req, res) => {
    const { patientId } = req.query;

    console.log('Fetching medications for patientId:', patientId);

    try {
        const response = await axios.get('http://medication-service:4002/api/medicine/get', {
            params: { patientId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to medication-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch medications' });
    }
});

// Fetch expired medications
app.get('/medicine/history', async (req, res) => {
    const { patientId } = req.query;

    console.log('Fetching medication history for patientId:', patientId);

    try {
        const response = await axios.get('http://medication-service:4002/api/medicine/history', {
            params: { patientId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to medication-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch medication history' });
    }
});

// Update a medicine
app.post('/medicine/update', async (req, res) => {
    const { id, patientId, name, dosage, frequency, prescribingDoctor, endDate, inventory } = req.body;

    console.log('Forwarding update for medicine:', { id, patientId, name, dosage, frequency, prescribingDoctor, endDate, inventory });

    try {
        const response = await axios.post('http://medication-service:4002/api/medicine/update', {
            id,
            patientId,
            name,
            dosage,
            frequency,
            prescribingDoctor,
            endDate,
            inventory
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding update to medication-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to update medicine' });
    }
});

// Delete a medicine
app.delete('/medicine/delete', async (req, res) => {
    const { id, patientId } = req.body;

    console.log('Forwarding delete for medicine:', { id, patientId });

    try {
        const response = await axios.delete('http://medication-service:4002/api/medicine/delete', {
            data: { id, patientId } // Send data in body for DELETE
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding delete to medication-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to delete medicine' });
    }
});

// Fetch medicine details
app.get('/medicine/details', async (req, res) => {
    const { patientId } = req.query;

    console.log('Fetching medications details for patientId:', patientId);

    try {
        const response = await axios.get('http://scraper-service:4006/api/medicine/details', {
            params: { patientId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to scraper-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch medicine details' });
    }
});

// Fetch user data
app.get('/auth/user', async (req, res) => {
    const { userId } = req.query;

    console.log('Fetching user data for userId:', userId);

    try {
        const response = await axios.get('http://auth-service:4000/api/user', {
            params: { userId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to auth-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch user data' });
    }
});

// Update user data
app.post('/auth/update', async (req, res) => {
    const { userId, name, email, password, currentPassword } = req.body;

    console.log('Forwarding update for user:', { userId, name, email, password: password || 'unchanged', currentPassword: currentPassword || 'not provided' });

    try {
        const response = await axios.post('http://auth-service:4000/api/update', {
            userId,
            name,
            email,
            password,
            currentPassword
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding update to auth-service:', error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Failed to update user data' });
    }
});

// Fetch reminders for a user
app.get('/reminders/:userId', async (req, res) => {
    const { userId } = req.params;

    console.log('Fetching reminders for userId:', userId);

    try {
        const response = await axios.get(`http://reminder-service:4005/reminders/${userId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding request to reminder-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch reminders' });
    }
});

// Create a reminder
app.post('/reminders', async (req, res) => {
    const { userId, title, description, datetime } = req.body;

    console.log('Forwarding reminder creation for userId:', userId);

    try {
        const response = await axios.post('http://reminder-service:4005/reminders', {
            userId,
            title,
            description,
            datetime
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error forwarding request to reminder-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to create reminder' });
    }
});

// Update a reminder
app.put('/reminders/:reminderId', async (req, res) => {
    const { reminderId } = req.params;
    const { userId, title, description, datetime, completed } = req.body;

    console.log('Forwarding reminder update for reminderId:', reminderId);

    try {
        const response = await axios.put(`http://reminder-service:4005/reminders/${reminderId}`, {
            userId,
            title,
            description,
            datetime,
            completed
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding update to reminder-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to update reminder' });
    }
});

// Delete a reminder
app.delete('/reminders/:reminderId', async (req, res) => {
    const { reminderId } = req.params;
    const { userId } = req.body;

    console.log('Forwarding reminder deletion for reminderId:', reminderId);

    try {
        const response = await axios.delete(`http://reminder-service:4005/reminders/${reminderId}`, {
            data: { userId }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding delete to reminder-service:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to delete reminder' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Middleware running on port ${PORT}`);
});