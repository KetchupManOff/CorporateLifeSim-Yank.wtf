import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';

interface Props {
  id: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

// Static help text that will be pre-filled in the notepad - bilingual
const getHelpText = (lang: string) => {
  if (lang === 'fr') {
    return `
🎮 COMMENT JOUER - Jeu de Simulation "Corporate Resell" 🎮

Bienvenue dans Corporate Resell Simulator ! Ce guide va vous apprendre les bases pour débuter votre vie d'entreprise.

📋 TABLE DES MATIÈRES
-----------------------------
1. Pour Commencer
2. Le Compteur de Courage
3. Voler des Fournitures de Bureau
4. Utiliser le Navigateur
5. Gestion des Emails
6. Vendre sur Gregslist
7. Générateurs Passifs

1. POUR COMMENCER
-----------------------------
Vous êtes un employé d'entreprise qui travaille à un bureau. Votre objectif est d'atteindre 100% de Courage et de devenir le revendeur ultime de fournitures de bureau.

2. LE COMPTEUR DE COURAGE
-----------------------------
Chaque fois que vous volez une fourniture de bureau, votre compteur de Courage augmente. Plus votre Courage est élevé, plus les objets que vous pouvez voler sont précieux !

3. VOLER DES FOURNITURES DE BUREAU
-----------------------------
Ouvrez le navigateur Internet et allez dans "Intranet Corp" pour voir les objets disponibles au "vol". Certains objets nécessitent un niveau de Courage minimum avant de pouvoir les prendre.

4. UTILISER LE NAVIGATEUR
-----------------------------
Le navigateur Internet est votre outil principal. Utilisez la barre d'adresse pour visiter :
- http://corp.intranet - Votre plateforme principale
- http://gregslist.com - Vendez vos objets volés
- http://bank.corp - Gérez votre argent
- http://mail.corp - Consultez vos emails
- http://stonksheets.xls - Voir les données du marché

5. GESTION DES EMAILS
-----------------------------
La Boîte Mail est l'endroit où vous recevez des messages de vos collègues et de la direction. Certains emails sont déclenchés par vos actions - consultez-les régulièrement !

6. VENDRE SUR GREGSLIST
-----------------------------
Une fois que vous avez volé des fournitures, allez sur Gregslist pour les vendre. Les prix peuvent varier, alors consultez StonkSheets pour les données du marché.

7. GÉNÉRATEURS PASSIFS
-----------------------------
Sur l'Intranet, vous pouvez engager des Envoyeurs d'Emails Automatisés, des Propagateurs de Rumeurs de Bureau et d'autres "employés" pour générer un revenu passif pendant votre absence.

💰 ASTUCE : Consultez régulièrement StonkSheets pour les meilleurs prix de vente !
`;
  }

  return `
🎮 HOW TO PLAY - "Corporate Resell" Simulation Game 🎮

Welcome to the Corporate Resell Simulator! This guide will teach you the basics of how to get started with your corporate life.

📋 TABLE OF CONTENTS
-----------------------------
1. Getting Started
2. The Courage Meter
3. Stealing Office Supplies
4. Using the Browser
5. Email Management
6. Selling on Gregslist
7. Passive Generators

1. GETTING STARTED
-----------------------------
You are a corporate employee working at a desk. Your goal is to reach 100% Courage and become the ultimate office supply reseller.

2. THE COURAGE METER
-----------------------------
Each time you steal an office supply, your Courage meter increases. The higher your Courage, the more valuable items you can steal!

3. STEALING OFFICE SUPPLIES
-----------------------------
Open the Internet browser and navigate to "Corp Intranet" to see available items for "stealing". Some items require a minimum Courage level before you can grab them.

4. USING THE BROWSER
-----------------------------
The Internet browser is your main tool. Use the address bar to visit:
- http://corp.intranet - Your main hub
- http://gregslist.com - Sell your stolen goods
- http://bank.corp - Manage your money
- http://mail.corp - Check your email
- http://stonksheets.xls - View market data

5. EMAIL MANAGEMENT
-------------------------------
The Mailbox is where you receive messages from coworkers and management. Some emails are triggered by your actions - check them regularly!

6. SELLING ON GREGSLIST
-----------------------------
Once you've stolen supplies, go to Gregslist to sell them. Prices may vary, so check StonkSheets for market data.

7. PASSIVE GENERATORS
-----------------------------
On the Intranet, you can hire Automated Emailers, Office Gossip Spreaders and other "employees" to generate passive income while you're away.

💰 TIP: Check StonkSheets regularly for the best selling prices!
`;
};

export default function Notepad({ id, minimized, maximized, zIndex, isActive, onFocus, onClose, onMinimize, onMaximize }: Props) {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<string>(getHelpText(i18n.language));
  const nodeRef = useRef<HTMLDivElement>(null);


    // Calculate window boundaries - allow full movement
  const getWindowBounds = () => {
    const taskbarHeight = 28;
    
    return {
      left: -600, // Allow window to go far off-screen left
      top: -500, // Allow window to go above screen
      right: window.innerWidth + 600, // Allow window to go far off-screen right
      bottom: window.innerHeight - taskbarHeight // Keep above taskbar
    };
  };

  // Update content when language changes
  useEffect(() => {
    setContent(getHelpText(i18n.language));
  }, [i18n.language]);

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'how-to-play.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (minimized) return null;

  return (
    <Draggable 
      nodeRef={nodeRef} 
      handle=".title-bar" 
      defaultPosition={{ x: 200 + (id * 20), y: 80 + (id * 20) }} 
      disabled={maximized}
      bounds={getWindowBounds()}
      onStart={() => onFocus()}
      onMouseDown={() => onFocus()}
    >
      <div ref={nodeRef} className={`window resizable-window ${maximized ? 'maximized-window' : ''}`} style={{ width: 700, height: 550, display: 'flex', flexDirection: 'column', position: 'relative', zIndex }} onMouseDown={onFocus}>
        <div className={`title-bar ${isActive ? '' : 'inactive'}`}>
          <div className="title-bar-text">📝 {t('howToPlay')}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={onMinimize} />
            <button aria-label="Maximize" onClick={onMaximize} />
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ padding: 4, display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
            <button onClick={handleSave} style={{ padding: '4px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={14} /> {t('saveNote')}
            </button>
          </div>

          {/* Notepad Content */}
          <div style={{ flexGrow: 1, padding: 0, backgroundColor: 'white' }}>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('enterHelpInstructions')}
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none', 
                outline: 'none',
                resize: 'none',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                backgroundColor: '#fffff0',
                padding: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Status bar */}
          <div style={{ padding: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12, backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc' }}>
            <span>{t('characterCount', { count: content.length })}</span>
            <span>{t('lastModified', { time: new Date().toLocaleTimeString() })}</span>
          </div>
        </div>
      </div>
    </Draggable>
  );
}