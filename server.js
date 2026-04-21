const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';
const GROQ_KEY = process.env.GROQ_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  res.json({ status: 'TipsterPRO actif', version: '4.0', ai: !!GROQ_KEY });
});

// Test IA
app.get('/ai-test', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Dis bonjour en français' }],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const text = response.data.choices?.[0]?.message?.content || 'Vide';
    res.json({ success: true, text, key_present: !!GROQ_KEY });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, key_present: !!GROQ_KEY });
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

// Proxy Groq IA
app.post('/ai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: req.body.prompt }],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
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
