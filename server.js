const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  res.json({ status: 'TipsterPRO actif', version: '3.0' });
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

// Proxy Anthropic IA
app.post('/ai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TipsterPRO démarré sur le port ${PORT}`);
});
