import ListScreen from './ListScreen.jsx';
import SheetScreen from './SheetScreen.jsx';

const SECTIONS = [['safety', 'Safety & cost'], ['cuts', 'Shopping list'], ['drawing', 'Drawing']];

export default function ReviewScreen({ section, setSection, ...rest }) {
  return (
    <div className="screen">
      <div className="pane-tabs">
        {SECTIONS.map(([k, n]) => (
          <div key={k} className={'pane-tab' + (section === k ? ' on' : '')} onClick={() => setSection(k)}>{n}</div>
        ))}
      </div>
      {section === 'drawing'
        ? <SheetScreen {...rest} />
        : <ListScreen {...rest} section={section} />}
    </div>
  );
}
