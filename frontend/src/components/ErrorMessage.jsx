function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        padding: "10px 14px",
        borderRadius: "6px",
        marginTop: "10px",
        marginBottom: "10px",
      }}
    >
      {message}
    </div>
  );
}

export default ErrorMessage;