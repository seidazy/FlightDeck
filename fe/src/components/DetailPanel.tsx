import { useEffect, useRef } from "react";
import type { PlaneDetailed } from "../types";

type Props = {
  details: PlaneDetailed;
  onClose: () => void;
};

const statusColors: Record<string, string> = {
  departed: "#f59e0b",
  enroute: "#3b82f6",
  cruising: "#10b981",
  landing: "#ef4444",
};

function getInfoItems(d: PlaneDetailed, eta: number) {
  return [
    { label: "Aircraft", value: d.model },
    { label: "Registration", value: d.registration },
    { label: "Altitude", value: `${Math.round(d.altitude * 3.281).toLocaleString()} ft` },
    { label: "Speed", value: `${Math.round(d.speed * 1.944)} kts` },
    { label: "Heading", value: `${Math.round(d.heading)}°` },
    { label: "V/S", value: `${Math.round(d.verticalSpeed * 196.85)} ft/min` },
    { label: "Duration", value: `${d.flightDuration} min` },
    { label: "ETA", value: `${eta} min` },
  ];
}

export default function DetailPanel({ details, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const eta = Math.max(0, Math.round((details.estimatedArrival - Date.now()) / 60000));
  const occupancy = Math.round((details.numberOfPassengers / details.maxPassengers) * 100);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, [details.id]);

  return (
    <div className="detail-panel" ref={panelRef} tabIndex={-1} role="dialog" aria-label="Flight details">
      <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>

      <div className="panel-header" style={{ borderLeftColor: details.color }}>
        <span className="flight-number">{details.flightNumber}</span>
        <span className="airline">{details.airline}</span>
        <span className="status" style={{ background: statusColors[details.status] }}>
          {details.status}
        </span>
      </div>

      <div className="route">
        {[details.origin, details.destination].map((point) => (
          <div className="airport" key={point.airport}>
            <span className="code">{point.airport}</span>
            <span className="city">{point.city}</span>
          </div>
        ))}
      </div>

      <div className="info-grid">
        {getInfoItems(details, eta).map((item) => (
          <div className="info-item" key={item.label}>
            <span className="label">{item.label}</span>
            <span className="value">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="occupancy">
        <span className="label">Passengers {details.numberOfPassengers}/{details.maxPassengers}</span>
        <div className="bar">
          <div className="fill" style={{ width: `${occupancy}%` }} />
        </div>
      </div>
    </div>
  );
}
