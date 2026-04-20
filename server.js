const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

app.use(cors());
app.use(express.json());

// Servir l'app HTML
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/status', (req, res) => {
  res.json({ status: 'TipsterPRO actif', version: '2.0' });
});

// Proxy API-Football
app.get('/api/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api', '');
    const query = new URLSearchParams(req.query).toString();
    const url = `https://v3.football.api-sports.io${endpoint}${query ? '?' + query : ''}`;
    const response = await axios.get(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TipsterPRO démarré sur le port ${PORT}`);
});
