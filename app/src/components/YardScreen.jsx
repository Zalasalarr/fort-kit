const GROUNDS = ['Grass', 'Mulch', 'Patio'];
const AGES = ['2–4', '5–9', '10+'];

export default function YardScreen({ yard, setYard, onOpenBuild, onLoadSample, onClearBuild, onProjects, hasParts }) {
  const patch = p => setYard(y => ({ ...y, ...p }));

  return (
    <div className="panel narrow" style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="mono" style={{ color: 'var(--steel)', marginBottom: 6 }}>Step 1 of 3 · yard → build → list</div>
        <div style={{ font: '600 28px/1.08 "Barlow Condensed",sans-serif' }}>How much yard are we working with?</div>
        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-7)', maxWidth: 520 }}>
          The footprint sets the grid you build on and the fall zone the safety check uses. It's drawn as a blue outline in the 3D view.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 420 }}>
        <div style={{ border: '1px solid var(--line-2)', padding: '11px 12px' }}>
          <div className="mono" style={{ color: 'var(--grey)' }}>Width</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ font: '600 30px/1 "Barlow Condensed",sans-serif' }}>{yard.w}<span style={{ fontSize: 15, color: 'var(--ink-55)' }}> ft</span></div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="step-btn" style={{ width: 26, height: 26 }} onClick={() => patch({ w: Math.max(8, yard.w - 2) })}>−</button>
              <button className="step-btn" style={{ width: 26, height: 26 }} onClick={() => patch({ w: Math.min(60, yard.w + 2) })}>+</button>
            </div>
          </div>
        </div>
        <div style={{ border: '1px solid var(--line-2)', padding: '11px 12px' }}>
          <div className="mono" style={{ color: 'var(--grey)' }}>Depth</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ font: '600 30px/1 "Barlow Condensed",sans-serif' }}>{yard.d}<span style={{ fontSize: 15, color: 'var(--ink-55)' }}> ft</span></div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="step-btn" style={{ width: 26, height: 26 }} onClick={() => patch({ d: Math.max(8, yard.d - 2) })}>−</button>
              <button className="step-btn" style={{ width: 26, height: 26 }} onClick={() => patch({ d: Math.min(60, yard.d + 2) })}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Ground under the build</div>
        <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
          {GROUNDS.map(g => (
            <div key={g} className={'seg' + (yard.ground === g ? ' on' : '')} onClick={() => patch({ ground: g })}>{g}</div>
          ))}
        </div>
        <p style={{ margin: '7px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--ink-65)' }}>
          {yard.ground === 'Patio'
            ? 'Concrete counts as a hard fall surface — the safety read will flag any deck over 4 ft.'
            : 'Soft ground. The safety read assumes a 6 ft clear fall zone around the build.'}
        </p>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Who is climbing on it</div>
        <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
          {AGES.map(a => (
            <div key={a} className={'seg' + (yard.age === a ? ' on' : '')} onClick={() => patch({ age: a })}>Ages {a}</div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Budget ceiling</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ font: '600 34px/1 "Barlow Condensed",sans-serif' }}>${yard.budget}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button className="step-btn" style={{ width: 30, height: 30 }} onClick={() => patch({ budget: Math.max(200, yard.budget - 100) })}>−</button>
            <button className="step-btn" style={{ width: 30, height: 30 }} onClick={() => patch({ budget: yard.budget + 100 })}>+</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Project</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="btn-outline" onClick={onProjects}>All projects</div>
          <div className="btn-outline" onClick={onLoadSample}>Load sample fort</div>
          <div className={'btn-outline' + (hasParts ? '' : ' disabled')} onClick={onClearBuild}>Start from empty</div>
        </div>
        <p style={{ margin: '7px 0 0', fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-65)' }}>
          Every project saves itself on this device as you work. Load sample and start-from-empty change this project and can be undone; use All projects to keep several builds.
        </p>
      </div>

      <div className="btn-primary" style={{ maxWidth: 420, marginTop: 'auto' }} onClick={onOpenBuild}>
        <span className="tick tl" /><span className="tick tr" /><span className="tick bl" /><span className="tick br" />
        Open the build
      </div>
    </div>
  );
}
