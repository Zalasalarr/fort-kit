import { MATS } from '../data.js';
import { partName, money, heightLabel, positionLabel, isPiece, partRows } from '../logic.js';

export default function PrintSheet({ project, snapshot, cuts, buys = [], checks, total }) {
  const { parts, yard } = project;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="print-sheet">
      <div className="ps-head">
        <div>
          <div className="ps-kicker">Fort Kit · Sheet A-01 · {date}</div>
          <h1>{project.name}</h1>
          <div className="ps-meta">
            Yard {yard.w}×{yard.d} ft · {yard.ground} · ages {yard.age} · 1 ft grid, 2 ft plan squares, pieces at actual size
          </div>
        </div>
        <div className="ps-est">
          <div className="ps-kicker">Materials estimate</div>
          <div className="ps-est-n">${total}</div>
          <div className="ps-meta">{total > yard.budget ? `$${total - yard.budget} over` : `$${yard.budget - total} under`} the ${yard.budget} ceiling</div>
        </div>
      </div>

      {snapshot && <img className="ps-img" src={snapshot} alt="" />}

      <div className="ps-cols">
        <section>
          <h2>Parts</h2>
          <table>
            <tbody>
              {partRows(parts).map((r, n) => {
                const p = r.p;
                return (
                  <tr key={n}>
                    <td>{n + 1}</td>
                    <td>{p ? partName(p) : r.a}</td>
                    <td>{p ? MATS[p.mat].n : `${r.group.indices.length} pieces`}</td>
                    <td>{p ? heightLabel(p) : heightLabel(parts[r.group.indices[0]])}</td>
                    <td>{p ? `at ${positionLabel(p)}${isPiece(p) ? (p.yaw ? ` · ${p.yaw}°` : '') + (p.pitch ? ` · ${p.pitch === 90 ? 'upright' : p.pitch + '° pitch'}` : '') + (p.roll ? ' · on edge' : '') : (p.rot ? ` · turned ${p.rot * 90}°` : '')}` : 'built from real pieces'}</td>
                    <td className="num">${money(r.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Cut &amp; buy list</h2>
          <table>
            <tbody>
              {cuts.map((c, i) => (
                <tr key={i}><td>{c.label}</td><td className="num">×{c.qty}</td></tr>
              ))}
            </tbody>
          </table>
          {buys.length > 0 && (
            <>
              <h2 style={{ marginTop: 10 }}>Stock to buy</h2>
              <table>
                <tbody>
                  {buys.map((b, i) => (
                    <tr key={i}><td>{b.label}</td><td className="num">{b.lines.join(', ')}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section>
          <h2>Safety read</h2>
          <ul>
            {checks.map((k, i) => (
              <li key={i} className={k.ok ? 'ok' : 'fix'}>{k.t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
