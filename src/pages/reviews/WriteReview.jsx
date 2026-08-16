import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

function WriteReview({ onReviewSubmit, onNavigate, isLoggedIn, setRedirectAfterLogin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [pet, setPet] = useState("");
  const [service, setService] = useState("Grooming");
  const [stars, setStars] = useState("⭐⭐⭐⭐⭐");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const openReviewForm = () => {
    if (!isLoggedIn) {
      setRedirectAfterLogin("reviews");
      onNavigate("login");
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name || !pet || !reviewText) { setFormError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, pet, service, review: reviewText, stars }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message || 'Failed to submit review'); return; }
      onReviewSubmit(data);
      setName(""); setPet(""); setReviewText("");
      setService("Grooming"); setStars("⭐⭐⭐⭐⭐");
      setIsOpen(false);
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 4000);
    } catch {
      setFormError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-rev-section">
      <h2>Share Your Experience</h2>
      <p>Your feedback helps us improve and helps other pet owners make the right choice.</p>

      {justSubmitted && (
        <div className="review-success-banner">Thank you for your review!</div>
      )}

      {!isOpen ? (
        <button className="btn btn-white" onClick={openReviewForm}>Write a Review</button>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          {formError && <div className="review-form-error">{formError}</div>}
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Your Pet</label>
            <input type="text" value={pet} onChange={(e) => setPet(e.target.value)} placeholder="Golden Retriever" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Service</label>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                <option value="Grooming">Grooming</option>
                <option value="Vet Check-up">Vet Check-up</option>
                <option value="Boarding">Boarding</option>
                <option value="Training">Training</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select value={stars} onChange={(e) => setStars(e.target.value)}>
                <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                <option value="⭐⭐⭐">⭐⭐⭐</option>
                <option value="⭐⭐">⭐⭐</option>
                <option value="⭐">⭐</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Your Review</label>
            <textarea rows="5" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn btn-submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
            <button type="button" className="btn btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default WriteReview;