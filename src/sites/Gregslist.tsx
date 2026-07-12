import { useState } from 'react';
import { useGameStore, ITEM_DATA } from '../store/gameStore';
import type { ItemType } from '../store/gameStore';
import { useTranslation } from 'react-i18next';

export default function Gregslist() {
  const { inventory, cash, activeAds, createAd } = useGameStore();
  const { t, i18n } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<ItemType>('paper');
  const [sellAmount, setSellAmount] = useState(1);

  const handlePostAd = () => {
    if (sellAmount > 0 && inventory[selectedItem] >= sellAmount) {
      createAd(selectedItem, sellAmount);
      setSellAmount(1);
    }
  };

  return (
    <div style={{ fontFamily: 'Times New Roman, serif', maxWidth: 800, margin: '0 auto' }}>
      <header style={{ backgroundColor: '#f0f0f0', padding: 16, borderBottom: '1px solid #ccc', textAlign: 'center' }}>
        <h1 style={{ color: '#0000ee', margin: 0 }}>{t('gregslistTitle')}</h1>
        <p style={{ margin: 0, fontSize: 14 }}>{t('gregslistSubtitle')}</p>
      </header>

      <div style={{ margin: '16px 0', padding: 8, backgroundColor: '#ffffcc', border: '1px solid #e6e600' }}>
        <strong>{t('accountBalance')}</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>${cash.toFixed(2)}</span>
      </div>

      <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ borderBottom: '1px solid #ccc' }}>{t('postAd')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label>
              {t('itemToSell')}<br/>
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value as ItemType)} style={{ width: '100%', padding: 4 }}>
                {(Object.keys(ITEM_DATA) as ItemType[]).filter(i => i !== 'gossip').map(item => (
                  <option key={item} value={item}>{ITEM_DATA[item].name[i18n.language as 'en' | 'fr']} (Own: {Math.floor(inventory[item])}) - ${ITEM_DATA[item].price.toFixed(2)} ea</option>
                ))}
              </select>
            </label>
            <label>
              {t('quantity')}<br/>
              <input type="number" min="1" max={Math.floor(inventory[selectedItem]) || 1} value={sellAmount} onChange={(e) => setSellAmount(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: 4 }} />
            </label>
            <div style={{ color: '#666', fontSize: 14 }}>
              {t('expectedReturn')} ${(sellAmount * ITEM_DATA[selectedItem].price).toFixed(2)}
            </div>
            <button onClick={handlePostAd} disabled={Math.floor(inventory[selectedItem]) < sellAmount || sellAmount <= 0} style={{ padding: '8px 16px', alignSelf: 'flex-start' }}>
              {t('postAdButton')}
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ borderBottom: '1px solid #ccc' }}>{t('activeAds')}</h2>
          {(!activeAds || activeAds.length === 0) ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>{t('noActiveAds')}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {activeAds.map(ad => (
                <li key={ad.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8, backgroundColor: '#f9f9f9' }}>
                  <strong>{t('selling')} {ad.amount}x {ITEM_DATA[ad.item].name[i18n.language as 'en' | 'fr']}</strong><br/>
                  {t('price')} ${ad.expectedReturn.toFixed(2)}<br/>
                  <span style={{ color: '#d00' }}>{t('statusPending')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: 32, fontSize: 12, color: '#666', textAlign: 'center' }}>
        <p>{t('gregslistDisclaimer')}</p>
      </div>
    </div>
  );
}
