// api/test.js - Create this file to test if your API is working
export default async function handler(req, res) {
  console.log('Test API called');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Environment variables available:', {
    EMAIL_USER: !!process.env.EMAIL_USER,
    EMAIL_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      message: 'API is working!',
      method: req.method,
      timestamp: new Date().toISOString(),
      environmentCheck: {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Missing',
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      error: 'Test API failed',
      message: error.message
    });
  }
}