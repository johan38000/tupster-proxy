const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  res.json({ status: 'TipsterPRO actif', version: '4.0', ai: !!OPENROUTER_KEY });
});

// Test IA
app.get('/ai-test', async (req, res) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Dis bonjour en français' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.choices?.[0]?.message?.content || 'Vide';
    res.json({ success: true, text, key_present: !!OPENROUTER_KEY });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, key_present: !!OPENROUTER_KEY });
  }
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

// Proxy OpenRouter IA
app.post('/ai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: req.body.prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.choices?.[0]?.message?.content || 'Analyse indisponible.';
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message, text: 'Analyse indisponible.' });
  }
});

app.listen(PORT, () => {
  console.log(`TipsterPRO démarré sur le port ${PORT}`);
});
