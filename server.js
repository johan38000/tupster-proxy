const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'TipsterPRO Proxy actif', version: '1.0' });
});

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
  console.log(`Serveur TipsterPRO démarré sur le port ${PORT}`);
});
