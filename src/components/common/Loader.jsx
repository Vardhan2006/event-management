function Loader({ label = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="eyebrow" style={{ marginTop: 4 }}>{label}</span>
    </div>
  );
}

export default Loader;