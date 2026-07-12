import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from 'react-i18next';

interface Props {
  zIndex: number;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
}

export default function SettingsWindow({ zIndex, isActive, onFocus, onClose }: Props) {
  const { reset } = useGameStore();
  const { t, i18n } = useTranslation();
    const nodeRef = useRef<HTMLDivElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);


    // Calculate window boundaries - allow full movement
    const getWindowBounds = () => {
      const taskbarHeight = 28;
    
      return {
        left: -350, // Allow window to go far off-screen left
        top: -350, // Allow window to go above screen
        right: window.innerWidth + 350, // Allow window to go far off-screen right
        bottom: window.innerHeight - taskbarHeight // Keep above taskbar
      };
    };

  const handleReset = () => {
    if (confirmReset) {
      reset();
      onClose();
      // Reload the page to clear any residual state and sounds
      window.location.reload();
    } else {
      setConfirmReset(true);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
        <Draggable 
      nodeRef={nodeRef} 
      handle=".title-bar" 
      defaultPosition={{ x: 150, y: 150 }}
            bounds={getWindowBounds()}
      onStart={() => onFocus()}
      onMouseDown={() => onFocus()}
    >
      <div ref={nodeRef} className="window resizable-window" style={{ width: 400, height: 400, display: 'flex', flexDirection: 'column', position: 'relative', zIndex }} onMouseDown={onFocus}>
              <div className={`title-bar ${isActive ? '' : 'inactive'}`}>
          <div className="title-bar-text">{t('settingsTitle')}</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ flexGrow: 1, padding: 16, backgroundColor: '#c0c0c0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <fieldset>
            <legend>{t('language')}</legend>
            <div style={{ padding: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => changeLanguage('fr')} disabled={i18n.language === 'fr'}>Français</button>
              <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>English</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>{t('audioSettings')}</legend>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
              <input type="checkbox" id="mute-audio" disabled />
              <label htmlFor="mute-audio">{t('muteAudio')}</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
              <input type="range" id="volume" disabled style={{ flexGrow: 1 }} />
              <label htmlFor="volume">{t('masterVolume')}</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>{t('dangerZone')}</legend>
            <div style={{ padding: 8 }}>
              <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#666' }}>
                {t('resetWarning')}
              </p>
              <button 
                onClick={handleReset} 
                style={{ 
                  color: confirmReset ? 'red' : 'black',
                  fontWeight: confirmReset ? 'bold' : 'normal',
                  width: '100%',
                  padding: 8
                }}
              >
                {confirmReset ? t('resetConfirm') : t('resetButton')}
              </button>
            </div>
          </fieldset>

          <div style={{ flexGrow: 1 }}></div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '4px 16px' }}>{t('ok')}</button>
            <button onClick={onClose} style={{ padding: '4px 16px' }}>{t('cancel')}</button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
