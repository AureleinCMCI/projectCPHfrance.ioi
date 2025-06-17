'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import style from './style/login.module.css';

function LoginForm() {
  // États pour le formulaire de connexion
  const [name, setname] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // États pour le formulaire d'inscription
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // État pour l'animation du container
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Pour la navigation
  const router = useRouter();

  // Gestion du submit (connexion)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('jwt', data.token);
      }
        router.push('/hom'); // ← Mets ici la route de ta page d'accueil
      }
    } catch (err) {
      setMessage('Erreur lors de la connexion');
    }
  };

  // Gestion du submit (inscription)
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          password: signupPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
      setMessage('Inscription réussie ! Connecte-toi');
      setRightPanelActive(false); // Retourne au formulaire de connexion
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className={style.formRoot}>
      <div className={`${style.container} ${rightPanelActive ? style.rightPanelActive : ''}`}>
        <h2 className={style.formSubtitle} style={{ fontWeight: 'bold', marginBottom: 30 }}>
          Weekly Coding Challenge #1: Sign in/up Form
        </h2>
        {/* Sign Up */}
        <div className={style.formContainer + ' ' + style.signUpContainer}>
          <form className={style.form} onSubmit={handleSignUp}>
            <h1 className={style.formTitle}>Create Account</h1>
            <div className={style.socialContainer}>
              <a href="#" className={style.social}><i className="fab fa-facebook-f"></i></a>
              <a href="#" className={style.social}><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className={style.social}><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span className={style.formSpan}>or use your email for registration</span>
            <input
              className={style.formInput}
              type="text"
              placeholder="Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
            <input
              className={style.formInput}
              type="password"
              placeholder="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            <button className={style.formButton} type="submit">Sign Up</button>
            {message && <p className={style.formText}>{message}</p>}
          </form>
        </div>

        {/* Sign In */}
        <div className={style.formContainer + ' ' + style.signInContainer}>
          <form className={style.form} onSubmit={handleSubmit}>
            <h1 className={style.formTitle}>Sign in</h1>
            <div className={style.socialContainer}>
              <a href="#" className={style.social}><i className="fab fa-facebook-f"></i></a>
              <a href="#" className={style.social}><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className={style.social}><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span className={style.formSpan}>or use your account</span>
            <input
              className={style.formInput}
              type="text"
              value={name}
              onChange={e => setname(e.target.value)}
            />
            <input
              className={style.formInput}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <a className={style.formLink} href="#">Forgot your password?</a>
            <button className={style.formButton} type="submit">Sign In</button>
            {message && <p className={style.formText}>{message}</p>}
          </form>
        </div>

        {/* Overlay */}
        <div className={style.overlayContainer}>
          <div className={style.overlay}>
            <div className={style.overlayPanel + ' ' + style.overlayLeft}>
              <h1 className={style.formTitle}>Welcome Back!</h1>
              <p className={style.formText}>To keep connected with us please login with your personal info</p>
              <button
                className={`${style.formButton} ${style.ghost}`}
                id="signIn"
                type="button"
                onClick={() => setRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className={style.overlayPanel + ' ' + style.overlayRight}>
              <h1 className={style.formTitle}>Bonjour, bien-aimé</h1>
              <p className={style.formText}>creé ton compte avant de débuté</p>
              <button
                className={`${style.formButton} ${style.ghost}`}
                id="signUp"
                type="button"
                onClick={() => setRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
