import { useState, useRef } from 'react';
import BrowserWindow from './BrowserWindow';
import SettingsWindow from './SettingsWindow';
import Notepad from './Notepad';
import { useGameStore } from '../store/gameStore';
import { Globe, Mail, Monitor, Settings, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type WindowState = { id: number; minimized: boolean; maximized: boolean; zIndex: number; initialUrl?: string };
type ActiveWindow = { type: 'browser'; id: number } | { type: 'notepad'; id: number } | { type: 'settings' } | null;

export default function Desktop() {
  const [browsers, setBrowsers] = useState<WindowState[]>([]);
  const [nextId, setNextId] = useState(1);
  const [notepads, setNotepads] = useState<WindowState[]>([]);
  const [noteNextId, setNoteNextId] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsZIndex, setSettingsZIndex] = useState(0);
  const [activeWindow, setActiveWindow] = useState<ActiveWindow>(null);
  const topZRef = useRef(1);
  const { emails } = useGameStore();
  const { t } = useTranslation();

  const unreadEmailsCount = emails.filter(e => !e.read).length;

  // Returns the next z-index, always current via ref
    const bumpZ = () => {
      topZRef.current += 1;
      return topZRef.current;
    };

    const openBrowser = () => {
      const z = bumpZ();
      const newId = nextId;
      setBrowsers(prev => [...prev, { id: newId, minimized: false, maximized: false, zIndex: z }]);
      setNextId(prev => prev + 1);
      setActiveWindow({ type: 'browser', id: newId });
    };

    const focusBrowser = (id: number) => {
      const z = bumpZ();
      setBrowsers(prev => prev.map(b => b.id === id ? { ...b, zIndex: z } : b));
      setActiveWindow({ type: 'browser', id });
    };

    const closeBrowser = (id: number) => {
      setBrowsers(prev => prev.filter(b => b.id !== id));
      setActiveWindow(active => (active?.type === 'browser' && active.id === id) ? null : active);
    };

  const toggleMinimize = (id: number) => {
      setBrowsers(prev => prev.map(b => {
        if (b.id !== id) return b;
        const willBeMinimized = !b.minimized;
        if (willBeMinimized) {
          setActiveWindow(active => (active?.type === 'browser' && active.id === id) ? null : active);
        } else {
          focusBrowser(id);
        }
        return { ...b, minimized: willBeMinimized };
      }));
    };

  const toggleMaximize = (id: number) => {
    setBrowsers(prev => prev.map(b => b.id === id ? { ...b, maximized: !b.maximized } : b));
  };

  const focusNotepad = (id: number) => {
      const z = bumpZ();
      setNotepads(prev => prev.map(n => n.id === id ? { ...n, zIndex: z } : n));
      setActiveWindow({ type: 'notepad', id });
    };

    const closeNotepad = (id: number) => {
      setNotepads(prev => prev.filter(n => n.id !== id));
      setActiveWindow(active => (active?.type === 'notepad' && active.id === id) ? null : active);
    };

    const toggleNotepadMinimize = (id: number) => {
      setNotepads(prev => prev.map(n => {
        if (n.id !== id) return n;
        const willBeMinimized = !n.minimized;
        if (willBeMinimized) {
          setActiveWindow(active => (active?.type === 'notepad' && active.id === id) ? null : active);
        } else {
          focusNotepad(id);
        }
        return { ...n, minimized: willBeMinimized };
      }));
    };

  const toggleNotepadMaximize = (id: number) => {
    setNotepads(prev => prev.map(n => n.id === id ? { ...n, maximized: !n.maximized } : n));
  };

  const focusSettings = () => {
        setSettingsZIndex(bumpZ());
        setActiveWindow({ type: 'settings' });
      };

    const isBrowserActive = (id: number) =>
      activeWindow?.type === 'browser' && activeWindow.id === id;
    const isNotepadActive = (id: number) =>
      activeWindow?.type === 'notepad' && activeWindow.id === id;
    const isSettingsActive = () => activeWindow?.type === 'settings';

    const handleTaskbarBrowser = (id: number) => {
      const browser = browsers.find(b => b.id === id);
      if (!browser) return;
      if (browser.minimized) {
        setBrowsers(prev => prev.map(b => b.id === id ? { ...b, minimized: false } : b));
        focusBrowser(id);
      } else if (isBrowserActive(id)) {
        toggleMinimize(id);
      } else {
        focusBrowser(id);
      }
    };

    const handleTaskbarNotepad = (id: number) => {
      const notepad = notepads.find(n => n.id === id);
      if (!notepad) return;
      if (notepad.minimized) {
        setNotepads(prev => prev.map(n => n.id === id ? { ...n, minimized: false } : n));
        focusNotepad(id);
      } else if (isNotepadActive(id)) {
        toggleNotepadMinimize(id);
      } else {
        focusNotepad(id);
      }
    };

    // Global click handler to blur windows when clicking desktop
    const handleDesktopClick = (e: React.MouseEvent) => {
      // Only blur if clicking directly on the desktop background
      const target = e.target as HTMLElement;
      if (target.classList.contains('desktop')) {
        setActiveWindow(null);
      }
    };

    return (
      <>
        <div className="desktop" onMouseDown={handleDesktopClick}>
        <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'white' }} onDoubleClick={openBrowser}>
          <Globe size={32} color="#fff" />
          <span style={{ backgroundColor: '#000080', padding: '2px', fontSize: '12px' }}>{t('internet')}</span>
        </div>

<div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'white', marginTop: '16px' }} onDoubleClick={() => { const z = bumpZ(); const newId = nextId; setBrowsers(prev => [...prev, { id: newId, minimized: false, maximized: false, zIndex: z, initialUrl: 'http://mail.corp' }]); setNextId(prev => prev + 1); setActiveWindow({ type: 'browser', id: newId }); }}>
  <div style={{ position: 'relative' }}>
    <Mail size={32} color="#fff" />
    {unreadEmailsCount > 0 && (
      <div style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
        {unreadEmailsCount}
      </div>
    )}
  </div>
  <span style={{ backgroundColor: '#000080', padding: '2px', fontSize: '12px', textAlign: 'center' }}>{t('corpMail')}</span>
</div>

<div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'white', marginTop: '16px' }} onDoubleClick={() => { const z = bumpZ(); const newId = noteNextId; setNotepads(prev => [...prev, { id: newId, minimized: false, maximized: false, zIndex: z }]); setNoteNextId(prev => prev + 1); setActiveWindow({ type: 'notepad', id: newId }); }}>
  <FileText size={32} color="#fff" />
  <span style={{ backgroundColor: '#000080', padding: '2px', fontSize: '12px', textAlign: 'center' }}>{t('howToPlay')}</span>
</div>
<div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'white', marginTop: '16px' }} onDoubleClick={() => { const z = bumpZ(); const newId = nextId; setBrowsers(prev => [...prev, { id: newId, minimized: false, maximized: false, zIndex: z, initialUrl: 'http://yankd.blog' }]); setNextId(prev => prev + 1); setActiveWindow({ type: 'browser', id: newId }); }}>
  <FileText size={32} color="#fff" />
  <span style={{ backgroundColor: '#000080', padding: '2px', fontSize: '12px', textAlign: 'center' }}>{t('blog')}</span>
</div>

                <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'white', marginTop: '16px' }} onDoubleClick={() => { focusSettings(); setSettingsOpen(true); }}>
                  <Settings size={32} color="#fff" />
                  <span style={{ backgroundColor: '#000080', padding: '2px', fontSize: '12px', textAlign: 'center' }}>{t('settings')}</span>
                </div>
        
        {notepads.map(n => (
                                  <Notepad 
                                    key={n.id} 
                                    id={n.id} 
                                    minimized={n.minimized}
                                    maximized={n.maximized}
                                    zIndex={n.zIndex}
                                    isActive={isNotepadActive(n.id)}
                                    onFocus={() => focusNotepad(n.id)}
                                    onClose={() => closeNotepad(n.id)} 
                                    onMinimize={() => toggleNotepadMinimize(n.id)}
                                    onMaximize={() => toggleNotepadMaximize(n.id)}
                                  />
                                ))}
        
                                {browsers.map(b => (
                                  <BrowserWindow 
                                    key={b.id} 
                                    id={b.id} 
                                    minimized={b.minimized}
                                    maximized={b.maximized}
                                    zIndex={b.zIndex}
                                    isActive={isBrowserActive(b.id)}
                                    onFocus={() => focusBrowser(b.id)}
                                    onClose={() => closeBrowser(b.id)} 
                                    onMinimize={() => toggleMinimize(b.id)}
                                    onMaximize={() => toggleMaximize(b.id)}
                                    initialUrl={b.initialUrl}
                                  />
                                ))}

        {settingsOpen && (
                  <SettingsWindow
                    zIndex={settingsZIndex}
                    isActive={isSettingsActive()}
                    onFocus={focusSettings}
                    onClose={() => { setSettingsOpen(false); setActiveWindow(null); }}
                  />
                )}
      </div>
      
      <div className="taskbar">
              <button className="start-button">
                <Monitor size={16} />
                {t('start')}
              </button>
              <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                {notepads.map(n => (
                                  <button 
                                    key={n.id} 
                                    onClick={() => handleTaskbarNotepad(n.id)}
                                    className={isNotepadActive(n.id) ? "active" : ""}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', margin: 0, height: '24px', fontWeight: isNotepadActive(n.id) ? 'bold' : 'normal', cursor: 'pointer' }}
            >
                    <FileText size={16} />
                    {t('howToPlay')}
            </button>
          ))}
                                              {browsers.map(b => (
            <button 
              key={b.id} 
              onClick={() => handleTaskbarBrowser(b.id)}
              className={isBrowserActive(b.id) ? "active" : ""}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', margin: 0, height: '24px', fontWeight: isBrowserActive(b.id) ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              <Globe size={16} />
              {t('internet')}
            </button>
          ))}
              </div>
        <div style={{ flexGrow: 1 }}></div>
        <div className="window" style={{ margin: 0, padding: '2px 8px', display: 'flex', alignItems: 'center', height: '24px' }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </>
  );
}
