// api/contact.js - Vercel Serverless Function

const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Validation function
const validateContactData = (data) => {
  const { name, email, phone, message } = data;
  
  if (!name || !email || !phone || !message) {
    return { isValid: false, error: 'All fields are required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Name too long (max 100 characters)' };
  }

  if (message.length > 2000) {
    return { isValid: false, error: 'Message too long (max 2000 characters)' };
  }

  const sanitizedData = {
    name: name.trim().replace(/[<>]/g, ''),
    email: email.trim().toLowerCase(),
    phone: phone.trim().replace(/[<>]/g, ''),
    message: message.trim().replace(/[<>]/g, ''),
  };

  return { isValid: true, data: sanitizedData };
};

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
};

// Main handler function - Vercel format
module.exports = async (req, res) => {
  console.log('API called with method:', req.method);
  console.log('Request body:', req.body);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const identifier = clientIP.split(',')[0].trim();
    
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again in 15 minutes.' 
      });
    }

    // Validate input
    const validation = validateContactData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const { name, email, phone, message } = validation.data;
    const { to } = req.body;

    // Verify environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error('Missing email configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create and verify transporter
    const transporter = createTransporter();
    
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return res.status(500).json({ error: 'Email service unavailable' });
    }

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">New Contact Message</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">Contact Details</h2>
              
              <div style="margin: 20px 0;">
                <p style="margin: 8px 0; font-size: 16px;">
                  <strong style="color: #667eea;">Name:</strong> ${name}
                </p>
                <p style="margin: 8px 0; font-size: 16px;">
                  <strong style="color: #667eea;">Email:</strong> 
                  <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                </p>
                <p style="margin: 8px 0; font-size: 16px;">
                  <strong style="color: #667eea;">Phone:</strong> 
                  <a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a>
                </p>
              </div>
              
              <div style="margin-top: 25px;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">Message</h3>
                <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px; line-height: 1.6;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              This message was sent from your portfolio contact form on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Message

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Sent: ${new Date().toLocaleString()}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to send email. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};