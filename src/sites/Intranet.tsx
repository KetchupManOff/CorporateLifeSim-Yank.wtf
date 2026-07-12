import { useGameStore, ITEM_DATA, GENERATOR_DATA } from '../store/gameStore';
import type { ItemType, GeneratorType } from '../store/gameStore';
import { useTranslation } from 'react-i18next';

export default function Intranet() {
  const { inventory, cash, courage, suspicion, generators, stealItem, buyGenerator } = useGameStore();
  const { t, i18n } = useTranslation();
  const isWin = courage >= 100;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #000080', paddingBottom: 8, marginBottom: 16 }}>
        <h1 style={{ color: '#000080', margin: 0 }}>{t('intranetTitle')}</h1>
        <p style={{ margin: 0, color: '#666' }}>{t('intranetSubtitle')}</p>
      </header>

      {isWin && (
        <div style={{ backgroundColor: '#008000', color: 'white', padding: 16, marginBottom: 16, textAlign: 'center', fontWeight: 'bold', border: '2px solid #004000' }}>
          <h2>{t('winMessageTitle')}</h2>
          <p>{t('winMessageBody1')}</p>
          <p>{t('winMessageBody2')}</p>
        </div>
      )}

      <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <strong>{t('courageMeterTitle')}</strong>
          <span>{courage.toFixed(5)}%</span>
        </div>
        <div style={{ width: '100%', height: 24, backgroundColor: '#ddd', border: '1px inset #fff', marginBottom: 16 }}>
          <div style={{ width: `${Math.min(100, courage)}%`, height: '100%', backgroundColor: '#000080', transition: 'width 0.2s' }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <strong>{t('suspicionMeterTitle', 'Suspicion')}</strong>
          <span style={{ color: suspicion > 75 ? 'red' : 'black' }}>{suspicion.toFixed(2)}%</span>
        </div>
        <div style={{ width: '100%', height: 24, backgroundColor: '#ddd', border: '1px inset #fff' }}>
          <div style={{ width: `${Math.min(100, suspicion)}%`, height: '100%', backgroundColor: suspicion > 75 ? '#d00' : '#d80', transition: 'width 0.2s' }}></div>
        </div>
        <p style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 0 }}>{t('suspicionMeterDescription', 'Doing real work (Emails/Stonks) lowers suspicion. Do not get caught!')}</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, borderBottom: '1px solid #ccc' }}>{t('yourDesk')}</h2>
          <p>{t('deskDescription')}</p>
          
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.entries(ITEM_DATA) as [ItemType, typeof ITEM_DATA[ItemType]][]).map(([key, item]) => {
              const isLocked = courage < item.courageNeeded;
              return (
                <button 
                  key={key}
                  onClick={() => stealItem(key)}
                  disabled={isLocked}
                  style={{ 
                    padding: 16, 
                    fontSize: 14, 
                    backgroundColor: isLocked ? '#ccc' : '#f0f0f0', 
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    border: isLocked ? '1px solid #999' : '1px outset #fff',
                    color: isLocked ? '#666' : '#000',
                    width: 'calc(50% - 4px)'
                  }}
                  title={item.description[i18n.language as 'en' | 'fr']}
                >
                  <div style={{ fontWeight: 'bold' }}>{t('steal')} {item.name[i18n.language as 'en' | 'fr']}</div>
                  {isLocked ? (
                    <div style={{ fontSize: 11, color: '#900', marginTop: 4 }}>{t('needsCourage', { courage: item.courageNeeded })}</div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#080', marginTop: 4 }}>{t('courageYield', { courage: item.courageYield })}</div>
                  )}
                </button>
              );
            })}
          </div>

          <h2 style={{ fontSize: 18, borderBottom: '1px solid #ccc', marginTop: 24 }}>{t('currentStash')}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(Object.entries(ITEM_DATA) as [ItemType, typeof ITEM_DATA[ItemType]][]).map(([key, item]) => (
               <li key={key} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                 {item.name[i18n.language as 'en' | 'fr']}: <strong>{Math.floor(inventory[key])}</strong>
                 {key === 'gossip' && <span style={{ fontSize: 12, fontStyle: 'italic', marginLeft: 8 }}>{t('passiveAdRevenue')}</span>}
               </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 16, border: '1px solid #ccc' }}>
          <h2 style={{ fontSize: 18, borderBottom: '1px solid #ccc', marginTop: 0 }}>{t('coworkerNetworking')}</h2>
          <p>{t('coworkerDescription')}</p>
          <p><strong>{t('yourCash')}</strong> ${cash.toFixed(2)}</p>

          {(Object.entries(GENERATOR_DATA) as [GeneratorType, typeof GENERATOR_DATA[GeneratorType]][]).map(([key, generator]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <h3>{generator.name[i18n.language as 'en' | 'fr']} ({generators[key]} {t('hired')})</h3>
              <p style={{ fontSize: 12 }}>{generator.description[i18n.language as 'en' | 'fr']}</p>
              <button 
                onClick={() => buyGenerator(key, generator.cost)}
                disabled={cash < generator.cost}
              >
                {t('hire')} (${generator.cost} / {t('week', 'week')})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
