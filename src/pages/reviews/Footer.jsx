function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h2>VinuCare</h2>

          <p>
            Providing loving, professional veterinary care and pet services
            since 2016.
          </p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>

          <ul>
            <li>Veterinary Care</li>
            <li>Grooming</li>
            <li>Boarding</li>
            <li>Training</li>
            <li>Emergency Care</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>

          <ul>
            <li>Home</li>
            <li>Pet Shop</li>
            <li>Book Appointment</li>
            <li>Reviews</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>

          <ul>
            <li>📍 123 Paw Street, Pet City</li>
            <li>📞 +94 78 941 6906</li>
            <li>✉️ vinuagency@gmail.com</li>
            <li>🕐 Mon–Sat: 8AM – 7PM</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2025 VinuCare Veterinary & Pet Care.
          All rights reserved.
        </span>

        <span>
          Made with 💜 for pets everywhere
        </span>
      </div>
    </footer>
  );
}

export default Footer;