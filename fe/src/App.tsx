import { useState, useRef, useCallback, useMemo } from "react";
import { usePlanesBasic } from "./hooks/usePlanesBasic";
import { usePlaneDetails } from "./hooks/usePlaneDetails";
import Map from "./components/Map";
import DetailPanel from "./components/DetailPanel";
import Sidebar from "./components/Sidebar";
import StatusIndicator from "./components/StatusIndicator";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import Filters, { type AltitudeFilter } from "./components/Filters";
import { computeHeading } from "./utils/geo";
import "leaflet/dist/leaflet.css";
import "./styles/global.scss";
import "./App.scss";

export default function App() {
  const { planes, status } = usePlanesBasic();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AltitudeFilter>("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const filteredPlanes = useMemo(() => {
    if (filter === "all") return planes;
    return planes.filter((p) => {
      const ft = p.altitude * 3.281;
      if (filter === "low") return ft < 25000;
      if (filter === "mid") return ft >= 25000 && ft <= 35000;
      return ft > 35000;
    });
  }, [planes, filter]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const hasData = planes.length > 0 && Object.keys(headings).length > 0;

  return (
    <div className="app">
      <header className="topbar">
        <h1>✈ FlightRadar</h1>
        <Filters active={filter} onChange={setFilter} />
        <div className="topbar-right">
          <StatusIndicator status={status} />
          <span className="plane-count">{filteredPlanes.length} flights</span>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
      </header>

      {!hasData && <Loader />}

      <div className="main-content">
        <ErrorBoundary>
          <Map
            planes={filteredPlanes}
            headings={headings}
            selectedId={selectedId}
            onSelect={toggleSelect}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <Sidebar
            planes={filteredPlanes}
            selectedId={selectedId}
            onSelect={toggleSelect}
            open={sidebarOpen}
          />
        </ErrorBoundary>
      </div>

      {details && (
        <ErrorBoundary>
          <DetailPanel details={details} onClose={() => setSelectedId(null)} />
        </ErrorBoundary>
      )}
    </div>
  );
}
