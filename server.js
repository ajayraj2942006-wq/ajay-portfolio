require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const smtpPort = Number(process.env.SMTP_PORT || 465);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
const recipient = process.env.CONTACT_TO || 'ajayraj2942006@gmail.com';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}

if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error('SMTP_PORT must be a valid TCP port.');
}

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error('TRUST_PROXY_HOPS must be a non-negative integer.');
}

const missingSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']
  .filter((setting) => !process.env[setting]);

if (missingSettings.length) {
  throw new Error(`Missing required mail settings: ${missingSettings.join(', ')}. Copy .env.example to .env and configure it.`);
}

if (!emailPattern.test(recipient)) {
  throw new Error('CONTACT_TO must be a valid email address.');
}

const secureSmtp = process.env.SMTP_SECURE === 'true';
if (process.env.SMTP_SECURE && !['true', 'false'].includes(process.env.SMTP_SECURE)) {
  throw new Error('SMTP_SECURE must be either true or false.');
}

const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: secureSmtp,
  requireTLS: !secureSmtp,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  disableFileAccess: true,
  disableUrlAccess: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  });
  next();
});
app.use(express.json({ limit: '12kb', strict: true }));

const requestWindows = new Map();
const requestLimit = 5;
const requestWindowMs = 15 * 60 * 1000;
const maxTrackedIps = 10000;

function limitContactRequests(req, res, next) {
  const now = Date.now();

  for (const [ip, window] of requestWindows) {
    if (window.resetAt <= now) requestWindows.delete(ip);
  }

  const ip = req.ip;
  let window = requestWindows.get(ip);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + requestWindowMs };
    requestWindows.set(ip, window);
  }

  if (window.count >= requestLimit) {
    return res.status(429).json({ error: 'Too many messages. Please try again later.' });
  }

  window.count += 1;
  if (requestWindows.size > maxTrackedIps) {
    requestWindows.delete(requestWindows.keys().next().value);
  }
  next();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

app.post('/api/contact', limitContactRequests, async (req, res) => {
  const { name, email, message, website } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (typeof website === 'string' && website.trim()) {
    return res.status(400).json({ error: 'Unable to send this message.' });
  }

  if (
    !cleanName ||
    cleanName.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(cleanName) ||
    !cleanEmail ||
    cleanEmail.length > 254 ||
    /[\r\n]/.test(cleanEmail) ||
    !emailPattern.test(cleanEmail) ||
    !cleanMessage ||
    cleanMessage.length > 5000
  ) {
    return res.status(400).json({ error: 'Enter a valid name, email address, and message.' });
  }

  try {
    await transporter.sendMail({
      from: sender,
      to: recipient,
      replyTo: cleanEmail,
      subject: `Portfolio message from ${cleanName}`,
      text: `From: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
      html: `<p><strong>From:</strong> ${escapeHtml(cleanName)}</p><p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p><p>${escapeHtml(cleanMessage).replace(/\n/g, '<br>')}</p>`,
    });

    res.json({ message: 'Thanks! Your message has been sent.' });
  } catch (error) {
    console.error('Failed to send portfolio contact email:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    res.status(502).json({ error: 'Your message could not be sent. Please try again later.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  dotfiles: 'deny',
  fallthrough: false,
  maxAge: '1d',
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  if (error.status === 404) {
    return res.status(404).json({ error: 'Not found.' });
  }

  console.error('Unhandled contact server error:', error.message);
  res.status(500).json({ error: 'The server encountered an error.' });
});

app.listen(port, () => {
  console.log(`Portfolio and contact API listening on http://localhost:${port}`);
});
