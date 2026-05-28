import "./Loader.scss";

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <span className="loader-text">Loading flights...</span>
    </div>
  );
}
