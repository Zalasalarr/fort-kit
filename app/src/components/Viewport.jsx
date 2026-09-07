import { useEffect, useRef, useState } from 'react';
import { BuildView, VIEWS } from '../BuildView.js';
import Pins from './Pins.jsx';

export default function Viewport({
  parts, sel = -1, yard, pick = false, view = 'iso', zoom = 9,
  mode = 'blueprint', camera = 'iso',
  onSelect, onMove, onDragStart, onDragEnd,
  marks = false, onPickPin, viewRef,
  caption, footer, emptyText, className = '', children,
}) {
  const canvasRef = useRef(null);
  const [bv, setBv] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const v = new BuildView(canvas, { ...VIEWS[view], zoom, pick, mode, camera });
    if (viewRef) viewRef.current = v;
    setBv(v);
    const ro = new ResizeObserver(() => { v.resize(); v.draw(); });
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      v.destroy();
      if (viewRef) viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bv) return;
    bv.onSelect = onSelect || null;
    bv.onMove = onMove || null;
    bv.onDragStart = onDragStart || null;
    bv.onDragEnd = onDragEnd || null;
  });

  useEffect(() => {
    if (bv) bv.setMode(mode);
  }, [bv, mode]);

  useEffect(() => {
    if (bv) bv.setCamera(camera);
  }, [bv, camera]);

  useEffect(() => {
    if (bv && yard) {
      bv.setGroundType(yard.ground);
      bv.setYard(yard.w, yard.d);
      bv.draw();
    }
  }, [bv, yard]);

  useEffect(() => {
    if (bv) bv.setParts(parts, sel);
  }, [bv, parts, sel]);

  return (
    <div className={'viewport ' + className + (mode === 'real' ? ' real' : '')}>
      <canvas ref={canvasRef} />
      {marks && bv && <Pins view={bv} parts={parts} sel={sel} onPick={onPickPin} />}
      {caption && <div className="vp-caption">{caption}</div>}
      <div className="vp-zoom">
        <div className="step-btn" onClick={() => bv && bv.zoomBy(-1.5)}>+</div>
        <div className="step-btn" onClick={() => bv && bv.zoomBy(1.5)}>−</div>
      </div>
      {footer && <div className="vp-footer">{footer}</div>}
      {emptyText && parts.length === 0 && <div className="vp-empty">{emptyText}</div>}
      {children}
    </div>
  );
}
