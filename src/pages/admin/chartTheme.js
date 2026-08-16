// Shared look for every Recharts chart in the admin dashboard — glass
// tooltip card, muted axis text, no tick marks — so Recharts' defaults
// (black text, hairline axes, plain white tooltip box) don't clash with
// the frosted admin theme used everywhere else. Pulled out of
// AdminAnalytics so AdminDashboard's Overview charts can share it too.
// (ChartCard itself lives in ChartCard.jsx — react-refresh needs a
// component-only file separate from these plain constants/functions.)

export const STATUS_COLORS = {
  Pending: '#B45309',
  Confirmed: '#3730A3',
  Completed: '#0F766E',
  Cancelled: '#B91C1C',
};
export const PIE_FALLBACK_COLORS = ['#3730A3', '#0F766E', '#B45309', '#B91C1C', '#7C3AED'];
export const METHOD_LABELS = { payhere: 'PayHere', cod: 'Cash on Delivery', unknown: 'Other' };

export function money(n) {
  return 'Rs. ' + Number(n || 0).toLocaleString('en-LK');
}

export function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
}

export const tooltipProps = {
  contentStyle: {
    background: 'var(--admin-card)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid var(--admin-border)',
    borderRadius: 12,
    boxShadow: '0 12px 32px rgba(55,48,163,0.16)',
    fontSize: 13,
    padding: '10px 14px',
  },
  labelStyle: { color: 'var(--admin-muted)', fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: 'var(--admin-ink)' },
};
export const axisTick = { fill: 'var(--admin-muted)', fontSize: 12 };
export const axisLine = { stroke: 'var(--admin-border)' };
