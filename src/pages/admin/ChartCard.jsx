export default function ChartCard({ title, dotColor, badge, children }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2><span className="admin-chart-dot" style={{ background: dotColor }} />{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}
