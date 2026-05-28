import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import PlaneMarker from "../PlaneMarker";
import type { PlaneBasic } from "../../types";
import "./Map.scss";

type Props = {
  planes: PlaneBasic[];
  headings: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function FlyToSelected({ planes, selectedId }: { planes: PlaneBasic[]; selectedId: string | null }) {
  const map = useMap();
  const prevSelectedId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId && selectedId !== prevSelectedId.current) {
      const plane = planes.find((p) => p.id === selectedId);
      if (plane) {
        map.flyTo([plane.latitude, plane.longitude], Math.max(map.getZoom(), 5), {
          duration: 0.8,
        });
      }
    }
    prevSelectedId.current = selectedId;
  }, [selectedId, planes, map]);

  return null;
}

export default function Map({ planes, headings, selectedId, onSelect }: Props) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const handleClick = useCallback((id: string) => {
    onSelectRef.current(id);
  }, []);

  return (
    <MapContainer
      center={[48, -90]}
      zoom={3}
      minZoom={2}
      maxBounds={[[-85, -Infinity], [85, Infinity]]}
      maxBoundsViscosity={1}
      className="map"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToSelected planes={planes} selectedId={selectedId} />
      {planes.map((p) =>
        headings[p.id] != null ? (
          <PlaneMarker
            key={p.id}
            plane={p}
            selected={p.id === selectedId}
            heading={headings[p.id]}
            label={p.id}
            onClick={() => handleClick(p.id)}
          />
        ) : null
      )}
    </MapContainer>
  );
}
