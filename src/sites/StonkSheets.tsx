import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from 'react-i18next';


// Generate random target data for 3x3 grid
const generateTargetData = () => {
  return Array(3).fill(0).map(() => 
    Array(3).fill(0).map(() => Math.floor(Math.random() * 900) + 100 + '')
  );
};

export default function StonkSheets() {
  const { cash, performCorporateTask } = useGameStore();
  const { t } = useTranslation();
  const [targetData, setTargetData] = useState(generateTargetData());
  const [inputData, setInputData] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [feedback, setFeedback] = useState('');
  
  // Create refs for inputs to handle arrow/enter navigation like excel
  const inputRefs = useRef<Array<Array<HTMLInputElement | null>>>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (r < 2) inputRefs.current[r + 1][c]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (r > 0) inputRefs.current[r - 1][c]?.focus();
    } else if (e.key === 'ArrowRight') {
      // Allow moving cursor in text, only jump if at end
      const target = e.target as HTMLInputElement;
      if (target.selectionStart === target.value.length) {
        e.preventDefault();
        if (c < 2) inputRefs.current[r][c + 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      const target = e.target as HTMLInputElement;
      if (target.selectionStart === 0) {
        e.preventDefault();
        if (c > 0) inputRefs.current[r][c - 1]?.focus();
      }
    }
  };

  const handleCellChange = (val: string, r: number, c: number) => {
    const newData = [...inputData];
    newData[r][c] = val;
    setInputData(newData);
  };

  const handleSubmit = () => {
    let correctCells = 0;
    const totalCells = 9;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (targetData[r][c] === inputData[r][c].trim()) {
          correctCells++;
        }
      }
    }

    const accuracy = correctCells / totalCells;
    // Reward: max $15.00 for perfect 9/9. Drain: 3% courage.
    const reward = 15 * accuracy;
    performCorporateTask(reward, 3);

    setFeedback(t('dataSubmittedFeedback', { correct: correctCells, total: totalCells, reward: reward.toFixed(2), courage: '3.00', suspicion: '5' }));
    
    setTimeout(() => {
      setFeedback('');
      setTargetData(generateTargetData());
      setInputData([['', '', ''], ['', '', ''], ['', '', '']]);
      inputRefs.current[0][0]?.focus();
    }, 4000);
  };

  return (
    <div style={{ fontFamily: 'monospace', margin: -16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#1d8f51', color: 'white', padding: '8px 16px', fontWeight: 'bold' }}>
        {t('stonkSheetsTitle')}
      </div>
      
      <div style={{ display: 'flex', backgroundColor: '#f3f2f1', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
        <div style={{ padding: '4px 16px', backgroundColor: 'white', border: '1px solid #ccc' }}>{t('file')}</div>
        <div style={{ padding: '4px 16px' }}>{t('home')}</div>
        <div style={{ padding: '4px 16px' }}>{t('insert')}</div>
        <div style={{ padding: '4px 16px' }}>{t('formulas')}</div>
      </div>

      <div style={{ display: 'flex', padding: 4, borderBottom: '1px solid #ccc', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '2px 8px', marginRight: 8, width: 40, textAlign: 'center' }}>fx</div>
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '2px 8px', flex: 1, color: '#666' }}>
          =DATA_ENTRY_TASK()
        </div>
      </div>

      <div style={{ padding: 16, flexGrow: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#e2f0e6', border: '1px solid #1d8f51', padding: 12, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1d8f51' }}>{t('dataEntryTask')}</h3>
          <p style={{ margin: 0, fontSize: 14 }}>{t('dataEntryDescription')}</p>
        </div>

        {feedback && (
          <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: 12, marginBottom: 16, color: '#155724', fontWeight: 'bold' }}>
            {feedback}
          </div>
        )}

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Source Data Box */}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0' }}>{t('sourceData')}</h4>
            <div style={{ backgroundColor: '#ffffe0', border: '1px solid #ccc', padding: 16, boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', fontFamily: 'Courier New, monospace' }}>
              <table style={{ width: '100%', textAlign: 'center' }}>
                <tbody>
                  {targetData.map((row, r) => (
                    <tr key={r}>
                      {row.map((val, c) => (
                        <td key={c} style={{ padding: 8, borderBottom: '1px dashed #ccc', borderRight: c<2 ? '1px dashed #ccc' : 'none' }}>
                          <strong>{val}</strong>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Spreadsheet */}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0' }}>{t('yourSpreadsheet')}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ width: 30, backgroundColor: '#f3f2f1', border: '1px solid #ccc' }}></th>
                  <th style={{ backgroundColor: '#f3f2f1', border: '1px solid #ccc', padding: 4 }}>A</th>
                  <th style={{ backgroundColor: '#f3f2f1', border: '1px solid #ccc', padding: 4 }}>B</th>
                  <th style={{ backgroundColor: '#f3f2f1', border: '1px solid #ccc', padding: 4 }}>C</th>
                </tr>
              </thead>
              <tbody>
                {inputData.map((row, r) => (
                  <tr key={`row-${r}`}>
                    <td style={{ backgroundColor: '#f3f2f1', border: '1px solid #ccc', textAlign: 'center' }}>{r + 1}</td>
                    {row.map((val, c) => (
                      <td key={`cell-${r}-${c}`} style={{ border: '1px solid #ccc', padding: 0 }}>
                        <input
                          ref={(el) => { inputRefs.current[r][c] = el; }}
                          value={val}
                          onChange={(e) => handleCellChange(e.target.value, r, c)}
                          onKeyDown={(e) => handleKeyDown(e, r, c)}
                          disabled={!!feedback}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '6px 4px',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'monospace'
                          }}
                          onFocus={(e) => {
                            e.target.style.outline = '2px solid #1d8f51';
                            e.target.style.outlineOffset = '-2px';
                          }}
                          onBlur={(e) => {
                            e.target.style.outline = 'none';
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSubmit}
                disabled={!!feedback}
                style={{ padding: '8px 24px', backgroundColor: '#e0e0e0', border: '1px outset #fff', fontWeight: 'bold', cursor: feedback ? 'not-allowed' : 'pointer' }}
              >
                {t('submitReport')}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, padding: 16, borderTop: '2px solid #ccc', display: 'flex', justifyContent: 'space-between', color: '#666' }}>
          <div>
            <strong>{t('liquidity')} </strong> <span style={{ color: 'green', fontWeight: 'bold' }}>${cash.toFixed(2)}</span>
          </div>
          <div>
            <i>{t('stonkSheetsDisclaimer')}</i>
          </div>
        </div>
      </div>
    </div>
  );
}
