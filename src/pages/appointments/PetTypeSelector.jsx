export default function PetTypeSelector({
    petTypes,
    selected,
    setSelected
}) {

    return (

        <div className="pet-type-grid">

            {petTypes.map((pet) => (

                <button
                    key={pet.name}
                    className={`pet-type-btn ${
                        selected === pet.name
                            ? "selected"
                            : ""
                    }`}
                    onClick={() =>
                        setSelected(pet.name)
                    }
                >
                    <span>{pet.icon}</span>

                    <span>{pet.name}</span>

                </button>

            ))}

        </div>

    );
}