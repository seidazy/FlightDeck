import { useState, useRef, useCallback, useMemo } from "react";
import { usePlanesBasic } from "./hooks/usePlanesBasic";
import { usePlaneDetails } from "./hooks/usePlaneDetails";
import Map from "./components/Map";
import DetailPanel from "./components/DetailPanel";
import StatusIndicator from "./components/StatusIndicator";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import { computeHeading } from "./utils/geo";
import "leaflet/dist/leaflet.css";
import "./App.css";

export default function App() {
  const { planes, status } = usePlanesBasic();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const details = usePlaneDetails(selectedId);

  const prevPositions = useRef<Record<string, { lat: number; lng: number }>>({});
  const headingsRef = useRef<Record<string, number>>({});

  const headings = useMemo(() => {
    for (const p of planes) {
      const prev = prevPositions.current[p.id];
      if (prev) {
        const h = computeHeading(prev.lat, prev.lng, p.latitude, p.longitude);
        if (h != null) headingsRef.current[p.id] = h;
      }
      prevPositions.current[p.id] = { lat: p.latitude, lng: p.longitude };
    }
    return headingsRef.current;
  }, [planes]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const hasData = planes.length > 0 && Object.keys(headings).length > 0;

  return (
    <div className="app">
      <header className="topbar">
        <h1>✈ FlightRadar</h1>
        <div className="topbar-right">
          <StatusIndicator status={status} />
          <span className="plane-count">{planes.length} flights</span>
        </div>
      </header>

      {!hasData && <Loader />}

      <ErrorBoundary>
        <Map
          planes={planes}
          headings={headings}
          selectedId={selectedId}
          onSelect={toggleSelect}
        />
      </ErrorBoundary>

      {details && (
        <ErrorBoundary>
          <DetailPanel details={details} onClose={() => setSelectedId(null)} />
        </ErrorBoundary>
      )}
    </div>
  );
}
