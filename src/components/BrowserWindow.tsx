import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { ArrowLeft, ArrowRight, RefreshCw, Home, FileText, Mail, BarChart2 } from 'lucide-react';
import Intranet from '../sites/Intranet';
import Gregslist from '../sites/Gregslist';
import Bank from '../sites/Bank';
import StonkSheets from '../sites/StonkSheets';
import Mailbox from '../sites/Mailbox';
import Blog from '../sites/Blog';
import { useTranslation } from 'react-i18next';

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
  initialUrl?: string;
}

export default function BrowserWindow({ id, minimized, maximized, zIndex, isActive, onFocus, onClose, onMinimize, onMaximize, initialUrl }: Props) {
  const startUrl = initialUrl || 'http://corp.intranet';
  const [history, setHistory] = useState<string[]>([startUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState(startUrl);
  const [refreshKey, setRefreshKey] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const currentUrl = history[historyIndex];

  // Sync input URL when navigating history
  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  // Calculate window boundaries - allow full movement
  const getWindowBounds = () => {
    const taskbarHeight = 28;
    return {
      left: -700,
      top: -500,
      right: window.innerWidth + 700,
      bottom: window.innerHeight - taskbarHeight
    };
  };

  const navigateTo = useCallback((newUrl: string) => {
    // Truncate forward history and push new URL
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newUrl]);
    setHistoryIndex(prev => prev + 1);
    setInputUrl(newUrl);
  }, [historyIndex]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl !== currentUrl) {
      navigateTo(inputUrl);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    // Force re-render of the current page content
    setRefreshKey(prev => prev + 1);
  };

  const handleHome = () => {
    navigateTo('http://corp.intranet');
  };

  const renderContent = () => {
    switch (currentUrl) {
      case 'http://corp.intranet':
        return <Intranet />;
      case 'http://gregslist.com':
        return <Gregslist />;
      case 'http://bank.corp':
        return <Bank />;
      case 'http://stonksheets.xls':
        return <StonkSheets />;
      case 'http://mail.corp':
        return <Mailbox />;
      case 'http://yankd.blog':
        return <Blog />;
      default:
        if (currentUrl.includes('youtube.com')) {
          return (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: 'Arial' }}>
              <h1 style={{ color: '#FF0000', fontSize: 48, marginBottom: 0 }}>{t('youtubeParodyTitle')}</h1>
              <p style={{ color: '#666' }}>{t('youtubeParodyMessage')}</p>
              <div style={{ width: '100%', maxWidth: 500, height: 300, backgroundColor: '#000', margin: '16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <h3>{t('youtubeBlockedVideo')}</h3>
              </div>
            </div>
          );
        }

        // Attempt to load external sites in an iframe
        const iframeUrl = currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`;
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#fff9c4', borderBottom: '1px solid #ccc', fontSize: 12, color: '#333' }}>
              <strong>{t('externalSiteNotice')}</strong>
            </div>
            <iframe 
              src={iframeUrl} 
              style={{ width: '100%', flexGrow: 1, border: 'none' }} 
              title="External Content"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        );
    }
  };

  if (minimized) return null;

  return (
    <Draggable 
      nodeRef={nodeRef} 
      handle=".title-bar" 
      defaultPosition={{ x: 50 + (id * 20), y: 50 + (id * 20) }} 
      disabled={maximized}
      bounds={getWindowBounds()}
      onStart={() => onFocus()}
      onMouseDown={() => onFocus()}
    >
      <div ref={nodeRef} className={`window resizable-window ${maximized ? 'maximized-window' : ''}`} style={{ width: 800, height: 600, display: 'flex', flexDirection: 'column', position: 'relative', zIndex }} onMouseDown={onFocus}>
        <div className={`title-bar ${isActive ? '' : 'inactive'}`}>
          <div className="title-bar-text">{t('browserTitle', { url: currentUrl })}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={onMinimize} />
            <button aria-label="Maximize" onClick={onMaximize} />
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ padding: 4, display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #dfdfdf', backgroundColor: '#c0c0c0' }}>
            <button 
              style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: historyIndex > 0 ? 1 : 0.5 }} 
              onClick={handleBack}
              disabled={historyIndex <= 0}
            >
              <ArrowLeft size={16} /> {t('back')}
            </button>
            <button 
              style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: historyIndex < history.length - 1 ? 1 : 0.5 }} 
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
            >
              <ArrowRight size={16} /> {t('forward')}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={handleRefresh}>
              <RefreshCw size={16} /> {t('refresh')}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={handleHome}>
              <Home size={16} /> {t('home')}
            </button>
          </div>
          
          {/* Address bar */}
          <div style={{ padding: 4, display: 'flex', gap: 4, alignItems: 'center', borderBottom: '1px solid #dfdfdf', backgroundColor: '#c0c0c0' }}>
            <span>{t('address')}</span>
            <form onSubmit={handleNavigate} style={{ flexGrow: 1, display: 'flex', backgroundColor: 'white', border: '2px inset #dfdfdf', padding: '2px' }}>
              <input 
                type="text" 
                value={inputUrl} 
                onChange={(e) => setInputUrl(e.target.value)} 
                style={{ flexGrow: 1, border: 'none', outline: 'none' }}
              />
              <button type="submit" style={{ display: 'none' }}>Go</button>
            </form>
          </div>

          {/* Bookmarks bar */}
          <div style={{ padding: '4px 8px', display: 'flex', gap: 16, borderBottom: '2px solid #dfdfdf', backgroundColor: '#c0c0c0', fontSize: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>{t('links')}</span>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://corp.intranet'); }}>
              <FileText size={16} /> {t('corpIntranet')}
            </a>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://gregslist.com'); }}>
              <FileText size={16} /> {t('gregslist')}
            </a>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://bank.corp'); }}>
              <BarChart2 size={16} /> {t('bank')}
            </a>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://mail.corp'); }}>
              <Mail size={16} /> {t('mailbox')}
            </a>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://stonksheets.xls'); }}>
              <FileText size={16} /> {t('stonkSheets')}
            </a>
            <a href="#" style={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => { e.preventDefault(); navigateTo('http://yankd.blog'); }}>
              <FileText size={16} /> {t('blog')}
            </a>
          </div>

          {/* Web Content */}
          <div 
            key={refreshKey} 
            style={{ flexGrow: 1, backgroundColor: 'white', overflowY: 'scroll', padding: 16, height: 0 }}
            onClick={(e) => {
              const target = e.target as HTMLAnchorElement;
              // Intercept clicks on external links to open in the browser
              if (target.tagName === 'A') {
                const href = target.getAttribute('href');
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                  e.preventDefault();
                  navigateTo(href);
                }
              }
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </Draggable>
  );
}
