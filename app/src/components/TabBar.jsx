const TABS = [['yard', 'Yard'], ['plan', 'Plan'], ['build', 'Build'], ['parts', 'Parts'], ['list', 'List'], ['sheet', 'Sheet']];

export default function TabBar({ tab, onPick }) {
  return (
    <div className="tabbar">
      {TABS.map(([k, label]) => (
        <div key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => onPick(k)}>
          <div className="tab-bar" />
          {label}
        </div>
      ))}
    </div>
  );
}
