import { fmtIn } from '../logic.js';
import { TOOLS } from '../generators.js';

function Stepper({ value, onDown, onUp, minWidth = 64 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button className="step-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={onDown}>−</button>
      <div style={{ font: '600 17px/1 "Barlow Condensed",sans-serif', minWidth, textAlign: 'center', whiteSpace: 'nowrap' }}>{value}</div>
      <button className="step-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={onUp}>+</button>
    </div>
  );
}

export default function ToolForm({ toolId, params, setParams, onPlace, onCancel }) {
  const t = TOOLS[toolId];
  return (
    <div className="tool-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ font: '600 20px/1.1 "Barlow Condensed",sans-serif' }}>{t.n}</div>
        <div className="btn-outline" onClick={onCancel}>Cancel</div>
      </div>
      <div className="hint" style={{ margin: '0 0 10px', padding: 0 }}>{t.tip}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {t.params.map(p => (
          <div key={p.k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="mono" style={{ color: 'var(--grey)', width: 92, flex: 'none' }}>{p.n}</div>
            {p.options ? (
              <div style={{ display: 'flex', border: '1px solid var(--line-24)', flex: 1 }}>
                {p.options.map(([v, n]) => (
                  <div key={v} className={'seg' + (String(params[p.k]) === String(v) ? ' on' : '')} style={{ padding: '8px 4px', fontSize: 12 }} onClick={() => setParams({ [p.k]: v })}>{n}</div>
                ))}
              </div>
            ) : (
              <Stepper
                value={fmtIn(params[p.k])}
                onDown={() => setParams({ [p.k]: Math.max(p.min, params[p.k] - p.step) })}
                onUp={() => setParams({ [p.k]: Math.min(p.max, params[p.k] + p.step) })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="btn-primary" style={{ marginTop: 12 }} onClick={onPlace}>Place {t.n.toLowerCase()}</div>
    </div>
  );
}
