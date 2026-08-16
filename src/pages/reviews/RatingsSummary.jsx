function RatingsSummary({ reviews }) {
  const total = reviews.length;

  const countByStars = (starStr) =>
    reviews.filter(r => (r.stars || '').includes(starStr)).length;

  const starCount = (r) => ((r.stars || '').match(/[★⭐]/g) || []).length;

  const counts = {
    5: reviews.filter(r => starCount(r) === 5).length,
    4: reviews.filter(r => starCount(r) === 4).length,
    3: reviews.filter(r => starCount(r) === 3).length,
    2: reviews.filter(r => starCount(r) === 2).length,
    1: reviews.filter(r => starCount(r) === 1).length,
  };

  const avgRating = total === 0 ? 0 :
    (Object.entries(counts).reduce((sum, [star, count]) => sum + Number(star) * count, 0) / total).toFixed(1);

  const pct = (count) => total === 0 ? 0 : Math.round((count / total) * 100);

  const rows = [5, 4, 3, 2, 1].map(s => ({
    label: `${s} ⭐`,
    count: counts[s],
    percentage: pct(counts[s])
  }));

  const starDisplay = avgRating >= 4.5 ? '⭐⭐⭐⭐⭐' :
                      avgRating >= 3.5 ? '⭐⭐⭐⭐' :
                      avgRating >= 2.5 ? '⭐⭐⭐' :
                      avgRating >= 1.5 ? '⭐⭐' : '⭐';

  return (
    <div className="reviews-summary-bar">
      <div className="rating-big">
        <div className="rating-number">{total === 0 ? '—' : avgRating}</div>
        <div className="stars-row">{total === 0 ? '☆☆☆☆☆' : starDisplay}</div>
        <div className="rating-count">
          Based on {total} {total === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      <div className="rating-bars">
        {rows.map((row) => (
          <div className="bar-row" key={row.label}>
            <span className="bar-label">{row.label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${row.percentage}%` }} />
            </div>
            <span className="bar-pct">{row.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingsSummary;