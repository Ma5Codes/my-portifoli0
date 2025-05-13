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

  // h2 {
  //   font-size: clamp(32px, 5vw, 50px);
  //   font-weight: bold;
  //   margin-bottom: 10px;
  //   border-bottom: 1px solid var(--lightest-slate);
  //   padding-bottom: 5px;
  // }

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

  useEffect(() => {
    if (prefersReducedMotion) return;
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:${email}?subject=Contact from Portfolio&body=Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
  };

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <p className="overline">CONTACT</p>
      <h2>Get In Touch</h2>
      <p>
        If you have any suggestion, project or even you want to say “hello”, please fill out the form
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
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone *"
          value={formData.phone}
          onChange={handleChange}
          className="full-width"
          required
        />
        <textarea
          name="message"
          placeholder="Message *"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Mail Me!</button>
      </form>
    </StyledContactSection>
  );
};

export default Contact;