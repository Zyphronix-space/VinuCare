export default function TimeSlotSelector({
    slots,
    selected,
    setSelected
}) {

    return (

        <div className="time-slots">

            {slots.map((slot) => (

                <button
                    key={slot}
                    className={`time-slot ${
                        selected === slot
                            ? "selected"
                            : ""
                    }`}
                    onClick={() =>
                        setSelected(slot)
                    }
                >
                    {slot}
                </button>

            ))}

        </div>

    );
}