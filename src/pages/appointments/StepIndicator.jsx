const STEPS = [
  { label: "Your Details" },
  { label: "Service & Doctor" },
  { label: "Date & Time" },
  { label: "Review" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="appt-steps" role="list">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div
            key={step.label}
            className={`appt-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            role="listitem"
          >
            <div className="appt-step-dot">{isDone ? "✓" : stepNum}</div>
            <span className="appt-step-label">{step.label}</span>
            {stepNum !== STEPS.length && <div className="appt-step-line" />}
          </div>
        );
      })}
    </div>
  );
}