import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledContactSection = styled.section`
  max-width: 700px;
  margin: 0 auto 100px;
  color: var(--lightest-slate);
  text-align: center;

  h2 {
    display: inline-block;
    position: relative;
    text-align: center;
    font-size: clamp(32px, 5vw, 50px);
    font-weight: bold;
    margin-bottom: 10px;

    &:after {
      content: '';
      display: block;
      height: 2px;
      width: 60%;
      margin: 8px auto 0;
      background-color: var(--lightest-slate);
    }
  }

  p {
    font-size: var(--fz-lg);
    margin-bottom: 40px;
    line-height: 1.6;
    color: var(--light-slate);
  }

  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    input, textarea {
      background-color: transparent;
      border: 1px solid var(--slate);
      padding: 12px 15px;
      font-size: var(--fz-md);
      color: var(--lightest-slate);
      border-radius: 4px;
      font-family: var(--font-sans);
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--green);
      }

      &::placeholder {
        color: var(--slate);
      }
    }

    textarea {
      grid-column: 1 / -1;
      min-height: 150px;
      resize: vertical;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    button {
      grid-column: 1 / -1;
      margin-top: 20px;
      ${({ theme }) => theme.mixins.bigButton};
      font-size: var(--fz-lg);
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    }
  }

  .status-message {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    font-size: var(--fz-md);
    font-weight: 500;
    animation: slideIn 0.3s ease-out;

    &.success {
      background-color: rgba(100, 255, 218, 0.1);
      border: 1px solid var(--green);
      color: var(--green);
    }

    &.error {
      background-color: rgba(255, 100, 100, 0.1);
      border: 1px solid #ff6464;
      color: #ff6464;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    if (prefersReducedMotion) return;
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear status message when user starts typing
    if (statusMessage.message) {
      setStatusMessage({ type: '', message: '' });
    }
  };

  const validateForm = () => {
    const { name, email, phone, message } = formData;
    
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', message: 'Please fill in all required fields.' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }

    if (name.length > 100) {
      setStatusMessage({ type: 'error', message: 'Name is too long (max 100 characters).' });
      return false;
    }

    if (message.length > 2000) {
      setStatusMessage({ type: 'error', message: 'Message is too long (max 2000 characters).' });
      return false;
    }

    return true;
  };

const sendEmail = async (formData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        to: email,
      }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    // Check if response has content before parsing
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    const result = JSON.parse(responseText);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: '', message: '' });

    try {
      const result = await sendEmail(formData);
      
      if (result.success) {
        setStatusMessage({ 
          type: 'success', 
          message: 'Thank you! Your message has been sent successfully. I\'ll get back to you soon!' 
        });
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
        
        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          setStatusMessage({ type: '', message: '' });
        }, 8000);
        
      } else {
        setStatusMessage({ 
          type: 'error', 
          message: result.error || 'Failed to send message. Please try again or contact me directly.' 
        });
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        message: 'An unexpected error occurred. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <p className="overline">CONTACT</p>
      <h2>Get In Touch</h2>
      <p>
        If you have any suggestion, project or even you want to say "hello", please fill out the form
        below and I will reply you shortly.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name *"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          maxLength={100}
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone *"
          value={formData.phone}
          onChange={handleChange}
          className="full-width"
          required
          disabled={isSubmitting}
        />
        <textarea
          name="message"
          placeholder="Message *"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          maxLength={2000}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting && <span className="loading-spinner"></span>}
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {statusMessage.message && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
    </StyledContactSection>
  );
};

export default Contact;