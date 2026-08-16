import { useState } from "react";
import ExtraBanners from '../../components/ExtraBanners';
import jsPDF from "jspdf";
import AppointmentHero, { EmergencyStrip } from "./AppoinmentHero";
import AppointmentFeatures from "./AppoinmentFetures";
import AppointmentForm from "./AppoinmentForm";
import PaymentModal from "../../components/payment/PaymentModal";
import { useUIFeedback } from "../../context/UIFeedbackContext";
import { CheckBadgeIcon, ReceiptIcon, PawIcon, StethoscopeIcon, UserIcon, CalendarIcon, CardIcon } from "../../components/ui/Icons";
import "../../styles/appointments.css";

export default function Appointment({ selectedService, selectedDoctorKeyword, isLoggedIn, onNavigate, setRedirectAfterLogin, user }) {
  const { success } = useUIFeedback();
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null); // { id, fee, payment_status }
  const [showPayment, setShowPayment] = useState(false);

  const handleFormSubmit = (formData, appointment) => {
    setConfirmedBooking(formData);
    setBookedAppointment(appointment || null);
  };

  const handleRequireLogin = () => {
    setRedirectAfterLogin('appointments');
    onNavigate('login');
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setBookedAppointment(null);
    setShowPayment(false);
  };

  const handleDownloadPdf = () => {
    if (!confirmedBooking) return;
    const doc = new jsPDF();
    const pageW = 210;
    const marginX = 16;
    const contentW = pageW - marginX * 2;

    // ---- Header band (faux-gradient: layered rects light -> dark) ----
    const headerH = 46;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(124 + (79 - 124) * t);
      const g = Math.round(92 + (47 - 92) * t);
      const b = Math.round(232 + (189 - 232) * t);
      doc.setFillColor(r, g, b);
      doc.rect((pageW / steps) * i, 0, pageW / steps + 1, headerH, 'F');
    }
    // soft decorative circles (paw-print feel, abstracted)
    doc.setFillColor(255, 255, 255);
    [[178, 12, 4], [188, 20, 3], [196, 14, 2.4], [184, 30, 6]].forEach(([cx, cy, rad]) => {
      doc.circle(cx, cy, rad, 'F');
    });

    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.text('VinuCare', marginX, 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text('VETERINARY & PET CARE', marginX, 31);
    doc.setFontSize(12);
    doc.text('Appointment Booking Confirmation', marginX, 40);

    // ---- Reference number badge (rounded pill) ----
    let y = headerH + 16;
    const badgeW = contentW;
    const badgeH = 22;
    doc.setFillColor(243, 239, 254);
    doc.setDrawColor(211, 196, 253);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, y, badgeW, badgeH, 11, 11, 'FD');
    doc.setTextColor(139, 123, 173);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BOOKING REFERENCE', marginX + 10, y + 8.5);
    doc.setTextColor(79, 47, 189);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(confirmedBooking.referenceNumber || '—', marginX + 10, y + 17);
    doc.setTextColor(79, 47, 189);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Keep this for any inquiries', marginX + badgeW - 10, y + 12.5, { align: 'right' });

    y += badgeH + 14;

    // ---- Detail rows (zebra striped rounded card) ----
    const rows = [
      ['Owner Name', confirmedBooking.ownerName || '—'],
      ['Phone', confirmedBooking.phone || '—'],
      ['Email', confirmedBooking.email || '—'],
      ["Pet's Name", confirmedBooking.petName || '—'],
      ['Pet Type', confirmedBooking.petType || '—'],
      ['Service', confirmedBooking.service || '—'],
      ['Doctor', confirmedBooking.doctorName || 'No preference / any available doctor'],
      ['Date', confirmedBooking.apptDate || '—'],
      ['Time', confirmedBooking.apptTime || '—'],
      ['Notes', confirmedBooking.notes || '—'],
    ];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(139, 123, 173);
    doc.text('APPOINTMENT DETAILS', marginX + 2, y);
    y += 6;

    const rowH = 11;
    const cardTop = y;
    const cardHeight = rows.length * rowH + 6;
    doc.setFillColor(250, 249, 255);
    doc.roundedRect(marginX, cardTop, contentW, cardHeight, 8, 8, 'F');

    y += 8;
    rows.forEach(([label, value], i) => {
      if (i % 2 === 1) {
        doc.setFillColor(243, 239, 254);
        doc.rect(marginX + 2, y - 6.5, contentW - 4, rowH, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(79, 47, 189);
      doc.text(String(label), marginX + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 25, 51);
      doc.text(String(value), marginX + 62, y, { maxWidth: contentW - 70 });
      y += rowH;
    });

    y = cardTop + cardHeight + 16;

    // ---- Footer ----
    doc.setDrawColor(211, 196, 253);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageW - marginX, y);
    y += 10;
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 85, 140);
    doc.text('Thank you for choosing VinuCare Veterinary & Pet Care.', pageW / 2, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 140, 175);
    doc.text('Please arrive 10 minutes early. For changes to this booking, contact us with your reference number.', pageW / 2, y, { align: 'center', maxWidth: contentW });

    doc.save(`VinuCare-Booking-${confirmedBooking.referenceNumber || 'confirmation'}.pdf`);
  };

  return (
    <div id="page-appointments" className="page active">
      <div className="appt-blob-3" />

      <AppointmentHero />
      <ExtraBanners page="appointments" />
      <EmergencyStrip />

      <div className="appt-wrap">
        <div className="appt-left">
          <AppointmentFeatures />
        </div>
        <div className="appt-form-box">
          <AppointmentForm
            initialService={selectedService}
            initialDoctorKeyword={selectedDoctorKeyword}
            onAppointmentSuccess={handleFormSubmit}
            isLoggedIn={isLoggedIn}
            onRequireLogin={handleRequireLogin}
          />
        </div>
      </div>

      {confirmedBooking && (
        <div className="appt-success-overlay">
          <div className="appt-success-card">
            <div className="appt-success-icon"><CheckBadgeIcon size={36} /></div>
            <h2>Booking Confirmed!</h2>
            <p>
              Thank you <strong>{confirmedBooking.ownerName || "Customer"}</strong>.
              <br />Your appointment has been successfully scheduled!
            </p>
            <div className="appt-success-details">
              <div className="det-label">APPOINTMENT DETAILS</div>
              <div className="det-row" style={{ fontWeight: 700, color: '#5B3FC4', display: 'flex', alignItems: 'center', gap: 7 }}>
                <ReceiptIcon size={15} /> Reference No: {confirmedBooking.referenceNumber || "—"}
              </div>
              <div className="det-row" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><PawIcon size={15} /> Pet: {confirmedBooking.petName || "—"}</div>
              <div className="det-row" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><StethoscopeIcon size={15} /> Service: {confirmedBooking.service || "—"}</div>
              {confirmedBooking.doctorName && (
                <div className="det-row" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><UserIcon size={15} /> Doctor: {confirmedBooking.doctorName}</div>
              )}
              <div className="det-row" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CalendarIcon size={15} /> Date & Time: {confirmedBooking.apptDate || "—"}
                {confirmedBooking.apptTime ? ` at ${confirmedBooking.apptTime}` : ""}
              </div>
              {bookedAppointment && (
                <div className="det-row" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CardIcon size={15} /> Booking fee: Rs. {Number(bookedAppointment.fee).toLocaleString('en-LK')}
                  {' '}— {bookedAppointment.payment_status === 'paid' ? 'Paid' : 'Payment pending'}
                </div>
              )}
            </div>

            {bookedAppointment && bookedAppointment.payment_status !== 'paid' && (
              <button
                className="appt-back-btn"
                style={{ marginTop: '14px', background: 'linear-gradient(135deg, #7C5CE8, #5B3FC4)', color: '#fff', border: 'none' }}
                onClick={() => setShowPayment(true)}
              >
                Pay Booking Fee Now
              </button>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadPdf}
                style={{
                  padding: '13px 26px', borderRadius: '999px',
                  border: 'none', background: 'linear-gradient(135deg,#7C5CE8,#5B3FC4)',
                  color: '#fff', cursor: 'pointer', fontWeight: '600',
                  boxShadow: '0 8px 20px rgba(124,92,232,0.35)'
                }}
              >
                ⬇ Download PDF
              </button>
              <button className="appt-back-btn" style={{ width: 'auto', padding: '13px 26px' }} onClick={handleReset}>
                Book Another
              </button>
              <button
                onClick={() => { handleReset(); onNavigate('home'); }}
                style={{
                  padding: '13px 26px', borderRadius: '999px',
                  border: '1px solid rgba(124,92,232,0.3)', background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(6px)', color: '#524677', cursor: 'pointer', fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        orderType="appointment"
        orderId={bookedAppointment?.id}
        amount={bookedAppointment?.fee || 0}
        itemsDescription={`VinuCare appointment booking fee — ${confirmedBooking?.service || ''}`}
        user={user}
        onPaid={() => {
          setBookedAppointment((prev) => prev ? { ...prev, payment_status: 'paid' } : prev);
          setShowPayment(false);
          success('Booking fee paid — you\u2019re all set!', 6000);
        }}
      />
    </div>
  );
}