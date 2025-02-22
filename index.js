const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post('http://auth-service:4000/login', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: "Authentication failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Middleware running on port ${PORT}`);
});
