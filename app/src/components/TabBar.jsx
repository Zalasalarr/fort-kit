const TABS = [['yard', 'Yard'], ['build', 'Build'], ['plan', 'Sketch'], ['review', 'Review']];

export default function TabBar({ tab, onPick }) {
  return (
    <div className="topnav">
      {TABS.map(([k, label]) => (
        <div key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => onPick(k)}>
          {label}
        </div>
      ))}
    </div>
  );
}
