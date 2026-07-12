import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin();
    } else {
      setError(t('loginError'));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#008080',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 99999
    }}>
      {/* Windows 98 flag logo area */}
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3px',
          width: '48px',
          height: '48px',
          margin: '0 auto 12px auto'
        }}>
          <div style={{ backgroundColor: '#FF0000', borderRadius: '2px 0 0 0' }} />
          <div style={{ backgroundColor: '#00FF00', borderRadius: '0 2px 0 0' }} />
          <div style={{ backgroundColor: '#0000FF', borderRadius: '0 0 0 2px' }} />
          <div style={{ backgroundColor: '#FFFF00', borderRadius: '0 0 2px 0' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Yankrosoft OS
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Version 98.0.1</p>
      </div>

      <div style={{
        backgroundColor: '#c0c0c0',
        padding: '20px',
        border: '2px outset #dfdfdf',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        width: '350px'
      }}>
        {/* Title bar */}
        <div style={{
          background: 'linear-gradient(90deg, #000080, #1084d0)',
          color: 'white',
          padding: '4px 8px',
          marginBottom: '16px',
          fontWeight: 'bold',
          fontSize: '13px',
          margin: '-20px -20px 16px -20px'
        }}>
          {t('welcomeToYankrosoft')}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* User icon */}
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#fff',
            border: '2px inset #808080',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            flexShrink: 0
          }}>
            👤
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="username" style={{ color: '#000', fontSize: '13px', width: '70px' }}>{t('username')}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  border: '2px inset #808080',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="password" style={{ color: '#000', fontSize: '13px', width: '70px' }}>{t('password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  border: '2px inset #808080',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: '13px'
                }}
              />
            </div>

            {error && (
              <div style={{
                color: 'red',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="submit"
                style={{
                  padding: '4px 24px',
                  backgroundColor: '#c0c0c0',
                  border: '2px outset #dfdfdf',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.border = '2px inset #dfdfdf';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.border = '2px outset #dfdfdf';
                }}
              >
                OK
              </button>
              <button
                type="button"
                style={{
                  padding: '4px 16px',
                  backgroundColor: '#c0c0c0',
                  border: '2px outset #dfdfdf',
                  color: '#000',
                  cursor: 'not-allowed',
                  fontSize: '13px',
                  opacity: 0.6
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <p style={{ marginTop: '16px', fontSize: '11px', opacity: 0.6 }}>
        {t('yankrosoftCopyright')}
      </p>
    </div>
  );
};

export default LoginScreen;
