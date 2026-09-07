import Viewport from './Viewport.jsx';
import AddPane from './AddPane.jsx';
import EditPane from './EditPane.jsx';
import { partName, isPiece } from '../logic.js';

export default function BuildScreen(props) {
  const {
    parts, sel, yard, maxLvl, marks, setMarks, render, setRender, camera, setCamera, evening, setEvening, snap,
    groupMove, pane, setPane, setSel, moveSel, movePiece, moveGroup, onDragStart, onDragEnd,
  } = props;
  const blueprint = render === 'blueprint';
  const persp = camera === 'persp';
  const selPart = parts[sel];
  const selName = selPart ? (isPiece(selPart) && selPart.grp && groupMove ? selPart.gn : partName(selPart)) : null;

  return (
    <div className="editor">
      <Viewport
        parts={parts} sel={sel} yard={yard} pick
        mode={render} camera={camera} snap={snap} groupMove={groupMove} evening={evening}
        onSelect={setSel} onMove={moveSel} onMovePiece={movePiece} onMoveGroup={moveGroup}
        onDragStart={onDragStart} onDragEnd={onDragEnd}
        marks={marks} onPickPin={setSel}
        caption="Drag a part to move it · drag empty space to spin · scroll or pinch to zoom"
        footer={`${parts.length} part${parts.length === 1 ? '' : 's'} · ${maxLvl || 0} ft high`}
        emptyText="Nothing built yet — use Add on the right to put something in, or Sketch to paint a shape first"
      >
        <div className="vp-tools">
          <div className={'btn-outline' + (!blueprint ? ' on' : '')} onClick={() => setRender(blueprint ? 'real' : 'blueprint')}>{blueprint ? 'Drawing look' : 'Realistic'}</div>
          <div className={'btn-outline' + (persp ? ' on' : '')} onClick={() => setCamera(persp ? 'iso' : 'persp')}>{persp ? '3D camera' : 'Overhead'}</div>
          {!blueprint && <div className={'btn-outline' + (evening ? ' on' : '')} onClick={() => setEvening(!evening)}>{evening ? 'Evening' : 'Daytime'}</div>}
          <div className={'btn-outline' + (marks ? ' on' : '')} onClick={() => setMarks(!marks)}>Labels</div>
        </div>
      </Viewport>

      <div className="side">
        <div className="pane-tabs">
          <div className={'pane-tab' + (pane === 'add' ? ' on' : '')} onClick={() => setPane('add')}>Add</div>
          <div className={'pane-tab' + (pane === 'edit' ? ' on' : '')} onClick={() => setPane('edit')}>
            Edit{selName ? <span className="pane-sub"> · {selName}</span> : ''}
          </div>
        </div>
        {pane === 'add' ? <AddPane {...props} /> : <EditPane {...props} onAdd={() => setPane('add')} />}
      </div>
    </div>
  );
}
