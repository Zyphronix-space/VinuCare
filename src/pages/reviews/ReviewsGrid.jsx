import ReviewCard from "./ReviewCard";

function ReviewsGrid({ reviewsList }) {
  return (
    <div className="reviews-full-grid">
      {reviewsList.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
        />
      ))}
    </div>
  );
}

export default ReviewsGrid;