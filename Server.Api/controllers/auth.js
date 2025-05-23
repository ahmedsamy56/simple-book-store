const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Refresh Access Token
router.post('/token', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.refreshToken(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout
router.delete('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    await authService.logout(token);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
