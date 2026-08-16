export default function SuccessMessage({
    message
}) {

    if (!message) return null;

    return (
        <div className="success-msg">
            {message}
        </div>
    );
}