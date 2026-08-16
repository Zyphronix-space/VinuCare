import { useState, useEffect } from "react";
import { useUIFeedback } from '../../context/UIFeedbackContext';
import GlassSelect from "./GlassSelect";
import StepIndicator from "./StepIndicator";
import DoctorPreviewCard from "./DoctorPreviewCard";
import BookingCalendar from "./BookingCalendar";
import Skeleton from "../../components/ui/Skeleton";
import { API_BASE_URL } from "../../config/api";

export default function AppointmentForm({ onAppointmentSuccess, initialService, initialDoctorKeyword, isLoggedIn, onRequireLogin }) {
  const { error: notifyError } = useUIFeedback();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: "", phone: "", email: "", petName: "",
    petType: "", service: initialService || "",
    apptDate: "", apptTime: "", notes: "", doctorId: ""
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [autoAssigned, setAutoAssigned] = useState(false);
  const [fromProfile, setFromProfile] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/appointments/doctors`)
      .then(res => {
        if (!res.ok) throw new Error('Server responded ' + res.status);
        return res.json();
      })
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => {
        setDoctors([]);
        notifyError('Could not load doctors. Please refresh the page or try again later.');
      })
      .finally(() => setDoctorsLoading(false));
  }, []);

  // Clinic-wide holidays gray out on the calendar no matter which doctor
  // is selected, so this only needs to load once.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/appointments/holidays`)
      .then(res => {
        if (!res.ok) throw new Error('Server responded ' + res.status);
        return res.json();
      })
      .then(data => setHolidays(Array.isArray(data) ? data : []))
      .catch(() => setHolidays([]));
  }, []);

  useEffect(() => {
    if (!initialService) return;
    // Also auto-assign the doctor here, same as manual selection does —
    // otherwise arriving with a preselected service (e.g. from the
    // Services page) leaves the doctor field empty until the user
    // touches the dropdown themselves. Depends on `doctors` too so it
    // still runs once the doctor list finishes loading after mount.
    const assigned = autoAssignDoctor(initialService, doctors);
    setAutoAssigned(!!assigned);
    setFormData((prev) => ({
      ...prev,
      service: initialService,
      doctorId: assigned || prev.doctorId,
    }));
  }, [initialService, doctors]);

  // Arriving via a doctor's team profile ("Book with Dr. X") should pin
  // that exact doctor into the form, overriding whatever the service-based
  // auto-assign above just set. `initialDoctorKeyword` is a lowercase
  // substring of the doctor's name (see teamData.js) — match it against
  // the live doctors list the same way autoAssignDoctor does below.
  useEffect(() => {
    if (!initialDoctorKeyword || !doctors.length) return;
    const match = doctors.find((d) =>
      (d.name || "").toLowerCase().includes(initialDoctorKeyword.toLowerCase())
    );
    if (!match) return;
    setAutoAssigned(false);
    setFromProfile(true);
    setFormData((prev) => ({ ...prev, doctorId: String(match.id) }));
  }, [initialDoctorKeyword, doctors]);

  // Fetch booked slots when date OR doctor changes — filtering by doctor
  // matters because a slot taken for Dr. A shouldn't grey out that same
  // time for Dr. B. This is a UX preview only; the server re-checks for
  // real when the booking is actually submitted (see handleSubmit).
  useEffect(() => {
    if (!formData.apptDate) { setBookedSlots([]); return; }
    setSlotsLoading(true);
    const params = new URLSearchParams({ date: formData.apptDate });
    if (formData.doctorId) params.set('doctorId', formData.doctorId);
    fetch(`${API_BASE_URL}/api/appointments/slots?${params.toString()}`)
      .then(res => res.json())
      .then(data => setBookedSlots(Array.isArray(data) ? data : []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [formData.apptDate, formData.doctorId]);

  // A doctor's marked-unavailable days need to gray out on the calendar
  // regardless of which date is currently selected — only depends on
  // which doctor is picked, not the date itself.
  useEffect(() => {
    if (!formData.doctorId) { setUnavailableDates([]); return; }
    fetch(`${API_BASE_URL}/api/appointments/doctor-unavailable?doctorId=${formData.doctorId}`)
      .then(res => res.json())
      .then(data => setUnavailableDates(Array.isArray(data) ? data : []))
      .catch(() => setUnavailableDates([]));
  }, [formData.doctorId]);

  const petTypes = [
    { label: "Dog",    icon: "🐶" },
    { label: "Cat",    icon: "🐱" },
    { label: "Bird",   icon: "🐦" },
    { label: "Rabbit", icon: "🐰" },
    { label: "Fish",   icon: "🐠" },
    { label: "Cow",    icon: "🐄" },
    { label: "Goat",   icon: "🐐" },
    { label: "Other",  icon: "🦔" }
  ];

  // Special / critical services need the surgeon; everything else defaults
  // to the general-medicine doctor. The customer can still override the
  // doctor dropdown manually after this auto-fill happens.
  const SPECIAL_SERVICES = ["Emergency & Critical Care", "Dental Health"];

  const SERVICE_OPTIONS = [
    { value: "", label: "Choose a service" },
    { value: "Veterinary Check-ups", label: "Veterinary Check-up" },
    { value: "Grooming & Styling", label: "Grooming & Styling" },
    { value: "Emergency & Critical Care", label: "Emergency Consultation" },
    { value: "Boarding & Daycare", label: "Boarding / Daycare" },
    { value: "Training & Behaviour", label: "Training Session" },
    { value: "Spa & Wellness", label: "Spa & Wellness" },
    { value: "Dental Health", label: "Dental Health" },
    { value: "Nutrition & Dietary Care", label: "Nutrition Consultation" },
  ];

  function autoAssignDoctor(serviceValue, doctorList) {
    if (!serviceValue || !doctorList.length) return "";
    const isSpecial = SPECIAL_SERVICES.includes(serviceValue);
    const keyword = isSpecial ? "athukorala" : "ekanayake";
    const match = doctorList.find((d) => (d.name || "").toLowerCase().includes(keyword));
    return match ? String(match.id) : "";
  }

  const allTimeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM",  "3:00 PM",  "4:00 PM",
    "5:00 PM", "6:00 PM"
  ];
  // The vet is only in until 2 PM on Saturdays — slots after that are
  // grayed out below. Index-based since allTimeSlots is a fixed, ordered list.
  const saturdayCutoffIndex = allTimeSlots.indexOf("2:00 PM");
  const isSaturday = !!formData.apptDate && new Date(formData.apptDate + "T00:00:00").getDay() === 6;

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'service') {
      const assigned = autoAssignDoctor(value, doctors);
      setAutoAssigned(!!assigned);
      setFormData((prev) => ({
        ...prev,
        service: value,
        // Only auto-fill the doctor if the current one is empty or was
        // itself auto-assigned — don't stomp on a doctor the person
        // manually picked just because they changed the service.
        doctorId: (!prev.doctorId || autoAssigned) ? (assigned || prev.doctorId) : prev.doctorId,
      }));
      return;
    }
    if (id === 'doctorId') { setAutoAssigned(false); setFromProfile(false); }
    setFormData({ ...formData, [id]: value });
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === String(formData.doctorId));

  // Per-step validation — gates the "Next" button so people don't reach
  // Review with obviously missing required fields.
  const stepValid = {
    1: formData.ownerName.trim() && formData.petName.trim(),
    2: !!formData.service,
    3: !!formData.apptDate,
  };

  const goNext = () => {
    if (step < 4 && !stepValid[step]) {
      notifyError("Please fill in the required fields before continuing");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // Hitting Enter in a text field (or an on-screen keyboard's "Go"/"Done"
  // key on mobile) implicitly submits the nearest <form> — the browser
  // has no idea this is a multi-step wizard. Without this guard, typing
  // the owner/pet name on step 1 and pressing Enter fires handleSubmit
  // immediately, popping the "Booking Confirmed" screen before the rest
  // of the form (service, date, time) is even filled in. Treat Enter as
  // "go to next step" instead, and never let it submit early.
  const handleFormKeyDown = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    if (step < 4) {
      e.preventDefault();
      goNext();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Belt-and-braces: only step 4's explicit "Confirm Booking" button
    // should ever actually submit. If a submit event reaches us from any
    // earlier step (implicit submission, a stray Enter, etc.) ignore it.
    if (step !== 4) return;
    const { ownerName, petName, service, apptDate } = formData;
    if (!ownerName.trim() || !petName.trim() || !service || !apptDate) {
      notifyError("Please fill in all required fields");
      return;
    }
    if (!isLoggedIn) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: formData.ownerName,
          petName:   formData.petName,
          service:   formData.service,
          apptDate:  formData.apptDate,
          apptTime:  formData.apptTime,
          notes:     formData.notes,
          doctorId:  formData.doctorId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.message || 'Booking failed');
        // Someone else took this exact slot between us loading the form
        // and hitting Confirm — refresh the booked-slots list so the now-
        // stale "available" time immediately shows as taken, and send
        // the user back to step 3 to pick a different time.
        if (data.code === 'SLOT_TAKEN') {
          setFormData((prev) => ({ ...prev, apptTime: '' }));
          setStep(3);
          setSlotsLoading(true);
          const params = new URLSearchParams({ date: formData.apptDate });
          if (formData.doctorId) params.set('doctorId', formData.doctorId);
          fetch(`${API_BASE_URL}/api/appointments/slots?${params.toString()}`)
            .then((r) => r.json())
            .then((d) => setBookedSlots(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setSlotsLoading(false));
        }
        return;
      }
      if (onAppointmentSuccess) {
        onAppointmentSuccess(
          {
            ...formData,
            referenceNumber: data.referenceNumber,
            doctorName: selectedDoctor ? selectedDoctor.name : '',
          },
          data.appointment
        );
      }
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
      <h3>Book Your Visit</h3>
      <p className="sub">All fields marked are required to confirm your booking.</p>

      <StepIndicator currentStep={step} />

      {/* ── STEP 1: Owner + Pet details ── */}
      {step === 1 && (
        <div className="appt-step-panel">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ownerName">Owner Name</label>
              <input type="text" id="ownerName" placeholder="e.g. Sarah Johnson"
                value={formData.ownerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" placeholder="+94 77 000 0000"
                value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="you@email.com"
              value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="petName">Pet's Name</label>
            <input type="text" id="petName" placeholder="e.g. Buddy"
              value={formData.petName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Pet Type</label>
            <div className="pet-type-grid">
              {petTypes.map((pet) => (
                <button key={pet.label} type="button"
                  className={`pet-type-btn ${formData.petType === pet.label ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, petType: pet.label })}>
                  <span className="pt-icon">{pet.icon}</span>
                  <span className="pt-lbl">{pet.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Service + Doctor ── */}
      {step === 2 && (
        <div className="appt-step-panel">
          <div className="form-group">
            <label htmlFor="service">Service Required</label>
            <GlassSelect
              id="service"
              value={formData.service}
              onChange={handleChange}
              options={SERVICE_OPTIONS}
              placeholder="Choose a service"
            />
          </div>

          <div className="form-group">
            <label htmlFor="doctorId">Choose Your Doctor (optional)</label>
            {doctorsLoading ? (
              <Skeleton width="100%" height="46px" radius="14px" />
            ) : (
              <GlassSelect
                id="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                options={[
                  { value: "", label: "No preference / any available doctor" },
                  ...doctors.map((doc) => ({
                    value: String(doc.id),
                    label: `${doc.name}${doc.specialty ? ` — ${doc.specialty}` : ''}`,
                  })),
                ]}
                placeholder="No preference / any available doctor"
              />
            )}
          </div>

          {doctorsLoading ? (
            <div className="doc-preview-card">
              <Skeleton width="46px" height="46px" circle />
              <div style={{ flex: 1 }}>
                <Skeleton width="140px" height="0.92rem" style={{ marginBottom: 6 }} />
                <Skeleton width="180px" height="0.78rem" />
              </div>
            </div>
          ) : (
            <DoctorPreviewCard doctor={selectedDoctor} autoAssigned={autoAssigned} fromProfile={fromProfile} />
          )}
        </div>
      )}

      {/* ── STEP 3: Date + Time ── */}
      {step === 3 && (
        <div className="appt-step-panel">
          <div className="form-group">
            <label>Preferred Date</label>
            <BookingCalendar
              value={formData.apptDate}
              onChange={(dateStr) => setFormData({ ...formData, apptDate: dateStr, apptTime: "" })}
              disabledDates={unavailableDates}
              holidays={holidays}
            />
            {formData.doctorId && unavailableDates.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>
                Dates with a strike-through are unavailable for this doctor.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Preferred Time {formData.apptDate && <span style={{ fontSize: '0.78rem', color: '#888', fontWeight: 400 }}>— gray slots are already booked</span>}</label>
            <div className="time-slots">
              {slotsLoading
                ? allTimeSlots.map((_, idx) => (
                    <Skeleton key={idx} width="100%" height="34px" radius="14px" />
                  ))
                : allTimeSlots.map((time, idx) => {
                    const isBooked = bookedSlots.includes(time);
                    const isPastSaturdayCutoff = isSaturday && idx > saturdayCutoffIndex;
                    const isDisabled = isBooked || isPastSaturdayCutoff;
                    return (
                      <button key={idx} type="button"
                        disabled={isDisabled}
                        title={isPastSaturdayCutoff ? "Vet only available until 2 PM on Saturdays" : undefined}
                        className={`time-slot ${isDisabled ? "unavailable" : ""} ${formData.apptTime === time ? "selected" : ""}`}
                        onClick={() => !isDisabled && setFormData({ ...formData, apptTime: time })}>
                        {time}
                      </button>
                    );
                  })}
            </div>
            {isSaturday && (
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>
                The vet is only available until 2 PM on Saturdays.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 4: Review + Notes + Confirm ── */}
      {step === 4 && (
        <div className="appt-step-panel">
          <div className="appt-review-list">
            <div className="appt-review-row"><span>Owner</span><strong>{formData.ownerName || "—"}</strong></div>
            <div className="appt-review-row"><span>Pet</span><strong>{formData.petName || "—"} {formData.petType && `(${formData.petType})`}</strong></div>
            <div className="appt-review-row"><span>Service</span><strong>{formData.service || "—"}</strong></div>
            <div className="appt-review-row"><span>Doctor</span><strong>{selectedDoctor ? selectedDoctor.name : "No preference"}</strong></div>
            <div className="appt-review-row"><span>Date</span><strong>{formData.apptDate || "—"}</strong></div>
            <div className="appt-review-row"><span>Time</span><strong>{formData.apptTime || "Any available"}</strong></div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes (optional)</label>
            <textarea id="notes"
              placeholder="Any special requirements or concerns about your pet…"
              value={formData.notes} onChange={handleChange} />
          </div>
        </div>
      )}

      {/* ── Step navigation ── */}
      <div className="appt-step-nav">
        {step > 1 && (
          <button type="button" className="appt-step-back-btn" onClick={goBack}>
            ← Back
          </button>
        )}
        {step < 4 ? (
          <button key="continue-btn" type="button" className="submit-btn appt-step-next-btn" onClick={goNext}>
            Continue →
          </button>
        ) : (
          <button key="confirm-btn" type="submit" className="submit-btn appt-step-next-btn">Confirm Booking</button>
        )}
      </div>
    </form>
  );
}