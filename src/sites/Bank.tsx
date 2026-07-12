import { useGameStore, ITEM_DATA } from '../store/gameStore';
import type { ItemType } from '../store/gameStore';
import { useState, useEffect } from 'react';
import bankData from '../data/bank.json';
import { useTranslation } from 'react-i18next';

const DESJARDINS_GREEN = '#006647';
const DESJARDINS_LIGHT_GREEN = '#e8f3ee';
const DESJARDINS_ACCENT = '#009a44';
const DESJARDINS_DARK = '#004d35';

const headerBgStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${DESJARDINS_GREEN} 0%, ${DESJARDINS_DARK} 100%)`,
  padding: '20px 32px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `4px solid ${DESJARDINS_ACCENT}`,
};

const logoStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: 0.5,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 24,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid #e0e8e3',
  flex: 1,
};

const cardLabelStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: 13,
  color: '#5a7d6a',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  fontWeight: 600,
};

const cardAmountStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: DESJARDINS_GREEN,
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

const sectionTitleStyle: React.CSSProperties = {
  color: DESJARDINS_GREEN,
  fontSize: 18,
  fontWeight: 600,
  margin: '0 0 20px 0',
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

export default function Bank() {
  const { cash, inventory } = useGameStore();
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState(bankData.messages[0][i18n.language as 'en' | 'fr']);

  useEffect(() => {
    setMessage(bankData.messages[Math.floor(Math.random() * bankData.messages.length)][i18n.language as 'en' | 'fr']);
  }, [i18n.language]);

  const calculateNetWorth = () => {
    let total = cash;
    (Object.keys(ITEM_DATA) as ItemType[]).forEach((item) => {
      total += inventory[item] * ITEM_DATA[item].price;
    });
    return total;
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", maxWidth: 820, margin: '0 auto', backgroundColor: '#f5f8f6', minHeight: '100%', border: '1px solid #d4dcd7' }}>
      {/* Header with Desjardins-style branding */}
      <header style={headerBgStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 18,
            color: DESJARDINS_GREEN,
            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          }}>
            D
          </div>
          <div>
            <h1 style={{ margin: 0, ...logoStyle }}>{t('bankTitle')}</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: 12, opacity: 0.85 }}>{t('bankSubtitle')}</p>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          <span style={{ marginRight: 6 }}>🔒</span>
          {t('secureSession')}
        </div>
      </header>

      {/* Quick Actions Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: '14px 32px',
        display: 'flex',
        gap: 32,
        borderBottom: '1px solid #e0e8e3',
        fontSize: 14,
        color: '#5a7d6a',
        fontWeight: 500,
      }}>
        <span style={{ color: DESJARDINS_GREEN, fontWeight: 600 }}>{t('summary')}</span>
        <span>{t('accounts')}</span>
        <span>{t('transfers')}</span>
        <span>{t('bills')}</span>
        <span>{t('messagesTab')}</span>
      </div>

      <div style={{ padding: 32 }}>
        {/* Welcome Message */}
        <div style={{
          backgroundColor: DESJARDINS_LIGHT_GREEN,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 28,
          borderLeft: `4px solid ${DESJARDINS_ACCENT}`,
        }}>
          <p style={{ margin: 0, fontSize: 15, color: DESJARDINS_DARK, fontWeight: 500 }}>
            👋 {t('welcomeBack')}
          </p>
        </div>

        <h2 style={sectionTitleStyle}>{t('accountOverview')}</h2>

        {/* Account Cards */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
          <div style={cardStyle}>
            <h3 style={cardLabelStyle}>{t('availableCash')}</h3>
            <div style={cardAmountStyle}>
              ${cash.toFixed(2)}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8efea' }}>
              <span style={{ fontSize: 12, color: '#7a9a88' }}>{t('availableCashDescription')}</span>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={cardLabelStyle}>{t('totalNetWorth')}</h3>
            <div style={cardAmountStyle}>
              ${calculateNetWorth().toFixed(2)}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8efea' }}>
              <span style={{ fontSize: 12, color: '#7a9a88' }}>{t('totalNetWorthDescription')}</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '💸', label: t('payBill') },
            { icon: '📊', label: t('investments') },
            { icon: '💳', label: t('creditCards') },
            { icon: '📄', label: t('statements') },
          ].map((item) => (
            <div key={item.label} style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 10,
              padding: '18px 12px',
              textAlign: 'center',
              border: '1px solid #e0e8e3',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,102,71,0.12)`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, color: '#3d5a4a', fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div style={{
          backgroundColor: '#fffdf5',
          padding: 16,
          borderRadius: 10,
          borderLeft: `4px solid #e6b422`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>📢</span>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#6b5a00', fontSize: 14, fontWeight: 600 }}>{t('importantNotice')}</h4>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#5c4e00' }}>
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: '1px solid #d4dcd7',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#8aa898',
        }}>
          <span>{t('Dujardin')}</span>
          <span>{t('contactUs')} | {t('privacy')} | {t('legal')}</span>
        </div>
      </div>
    </div>
  );
}
