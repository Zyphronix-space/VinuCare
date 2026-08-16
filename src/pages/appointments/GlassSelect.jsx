import { useState, useRef, useEffect } from "react";

/**
 * A fully custom dropdown so the open menu can be styled glassy,
 * unlike a native <select> popup which the browser renders itself.
 * Mimics the native onChange(e) shape ({ target: { id, value } })
 * so it's a drop-in replacement wherever handleChange(e) is used.
 */
export default function GlassSelect({ id, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    onChange({ target: { id, value: optValue } });
    setOpen(false);
  };

  return (
    <div className="glass-select" ref={wrapperRef}>
      <button
        type="button"
        id={id}
        className={`glass-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected && selected.value !== "" ? "" : "placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="glass-select-arrow">▾</span>
      </button>

      {open && (
        <div className="glass-select-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`glass-select-option ${String(opt.value) === String(value) ? "selected" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}