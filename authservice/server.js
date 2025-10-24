// auth-server/server.js
import http from 'http';
import { URL } from 'url';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Set CORS header for all responses
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // 1️⃣ Start OAuth — redirect user to Unsplash
    if (url.pathname === '/auth/unsplash') {
      const unsplashAuthUrl =
        `https://unsplash.com/oauth/authorize?` +
        `client_id=${process.env.UNSPLASH_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.UNSPLASH_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=public+read_user+write_likes`;

      res.writeHead(302, { Location: unsplashAuthUrl });
      return res.end();
    }

    // 2️⃣ Handle OAuth callback
    if (url.pathname === '/auth/unsplash/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing authorization code' }));
      }

      // 3️⃣ Exchange code for token
      const tokenResponse = await fetch('https://unsplash.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.UNSPLASH_CLIENT_ID,
          client_secret: process.env.UNSPLASH_CLIENT_SECRET,
          redirect_uri: process.env.UNSPLASH_REDIRECT_URI,
          code,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenResponse.json();

      if (tokens.error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: tokens.error_description || 'OAuth error' }));
      }

      // 4️⃣ Get user profile
      const userResponse = await fetch('https://api.unsplash.com/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const unsplashUser = await userResponse.json();

      // 5️⃣ Optionally issue a local JWT
      const jwtToken = jwt.sign(
        { id: unsplashUser.id, username: unsplashUser.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      // 6️⃣ Return everything to frontend as JSON
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        unsplashUser,
        accessToken: tokens.access_token,
        jwtToken,
      }));
    }

    // Default route
    res.writeHead(404, { 'Content-Type': 'application/json' });

    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
});



server.listen(PORT, () => {
  console.log(`🚀 Unsplash auth server running on http://localhost:${PORT}`);
});


