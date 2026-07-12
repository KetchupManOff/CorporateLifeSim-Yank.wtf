import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import emailsData from '../data/emails.json';
import { useTranslation } from 'react-i18next';

export default function Mailbox() {
  const { emails, readEmail, performCorporateTask } = useGameStore();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [targetEmail, setTargetEmail] = useState('');
  const [typedEmail, setTypedEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    pickNewTemplate();
  }, [i18n.language]);

  const pickNewTemplate = () => {
    const templates = emailsData.composeTemplates.filter((tmpl: any) => tmpl[i18n.language as 'en' | 'fr']);
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]?.[i18n.language as 'en' | 'fr'] || '';
    setTargetEmail(randomTemplate);
    setTypedEmail('');
  };

  const handleSend = () => {
    // Calculate accuracy
    let correctChars = 0;
    const maxLength = Math.max(targetEmail.length, typedEmail.length);
    for (let i = 0; i < maxLength; i++) {
      if (targetEmail[i] === typedEmail[i]) correctChars++;
    }
    const accuracy = correctChars / maxLength;
    
    // Reward: up to $5.00 based on accuracy. Drain: 1% courage.
    const reward = 5 * accuracy;
    performCorporateTask(reward, 1);
    
    setFeedback(t('emailSentFeedback', { accuracy: (accuracy * 100).toFixed(1), reward: reward.toFixed(2), courage: '1.00', suspicion: '5.00' }));
    setTimeout(() => {
      setFeedback('');
      pickNewTemplate();
    }, 4000);
  };

  const sortedEmails = [...emails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#008080', padding: 16, color: 'white', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{t('mailboxTitle')}</h1>
      </header>

      <div style={{ display: 'flex', gap: 16, flexGrow: 1 }}>
        <div style={{ width: 250, borderRight: '2px solid #ccc', paddingRight: 16 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li 
              onClick={() => setActiveTab('inbox')}
              style={{ padding: '8px 16px', backgroundColor: activeTab === 'inbox' ? '#e0e0e0' : 'transparent', fontWeight: activeTab === 'inbox' ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              {t('inbox')} ({emails.filter(e => !e.read).length})
            </li>
            <li 
              onClick={() => setActiveTab('compose')}
              style={{ padding: '8px 16px', backgroundColor: activeTab === 'compose' ? '#e0e0e0' : 'transparent', fontWeight: activeTab === 'compose' ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              {t('composeWork')}
            </li>
            <li style={{ padding: '8px 16px', cursor: 'not-allowed', color: '#999' }}>{t('drafts')}</li>
            <li style={{ padding: '8px 16px', cursor: 'not-allowed', color: '#999' }}>{t('sentItems')}</li>
          </ul>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'inbox' && (
            sortedEmails.length === 0 ? (
              <p>{t('inboxEmpty')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedEmails.map(email => (
                  <div 
                    key={email.id} 
                    style={{ 
                      border: '1px solid #ccc', 
                      backgroundColor: email.read ? '#f9f9f9' : '#fff', 
                      padding: 12,
                      cursor: 'pointer',
                      borderLeft: email.read ? '1px solid #ccc' : '4px solid #008080'
                    }}
                    onClick={() => readEmail(email.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontWeight: email.read ? 'normal' : 'bold' }}>{email.sender}</strong>
                      <span style={{ fontSize: 12, color: '#666' }}>{new Date(email.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontWeight: email.read ? 'normal' : 'bold', marginBottom: 8 }}>
                      {typeof email.subject === 'string' ? email.subject : email.subject[i18n.language as keyof typeof email.subject]}
                    </div>
                    {email.read && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee', whiteSpace: 'pre-wrap', color: '#333' }}>
                        {typeof email.body === 'string' ? email.body : email.body[i18n.language as keyof typeof email.body]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'compose' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffe066', padding: 12 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{t('composeTitle')}</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{t('composeDescription')}</p>
              </div>

              {feedback && (
                <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: 12, color: '#155724', fontWeight: 'bold' }}>
                  {feedback}
                </div>
              )}

              <div style={{ border: '1px solid #ccc', padding: 12, backgroundColor: '#f9f9f9', minHeight: '80px', userSelect: 'none' }}>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('template')}</strong>
                {targetEmail.split('').map((char, i) => {
                  let color = '#333';
                  let bg = 'transparent';
                  if (i < typedEmail.length) {
                    if (typedEmail[i] === char) {
                      color = 'green';
                    } else {
                      color = 'red';
                      bg = '#ffcccc';
                    }
                  } else if (i === typedEmail.length) {
                    bg = '#e0e0e0'; // Cursor indicator
                  }
                  return <span key={i} style={{ color, backgroundColor: bg, fontFamily: 'monospace', fontSize: 16 }}>{char}</span>;
                })}
              </div>

              <textarea 
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                placeholder={t('startTyping')}
                style={{ flexGrow: 1, padding: 12, fontFamily: 'monospace', fontSize: 16, border: '1px inset #ccc', resize: 'none' }}
                disabled={!!feedback}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSend}
                  disabled={typedEmail.length === 0 || !!feedback}
                  style={{ padding: '8px 24px', fontWeight: 'bold', cursor: typedEmail.length > 0 ? 'pointer' : 'not-allowed' }}
                >
                  {t('send')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
