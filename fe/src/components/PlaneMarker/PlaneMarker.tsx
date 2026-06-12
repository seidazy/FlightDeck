import { useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { PlaneBasic } from "../../types";
import { wrapLng } from "../../utils/geo";

const MIN_ALT_FT = 30000
const MAX_ALT_FT = 40000

const MIN_ICON_SIZE = 16
const MAX_ICON_SIZE = 32

function getPlaneIconSize(altitude: number, selected: boolean) {
  const t = Math.min(1, Math.max(0, (altitude - MIN_ALT_FT * 0.3) / ( MAX_ALT_FT * 0.3 - MIN_ALT_FT * 0.3)))

  const base = MIN_ICON_SIZE + t * (MAX_ICON_SIZE - MIN_ICON_SIZE)

  return base
}

function createPlaneIcon(color: string, heading: number, selected: boolean, altitude: number) {
  const size = getPlaneIconSize(altitude, selected)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="transform:rotate(${heading}deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))${selected ? ";stroke:#fff;stroke-width:1" : ""}"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

type Props = {
  plane: PlaneBasic;
  selected: boolean;
  heading: number;
  label: string;
  onClick: () => void;
};

export default function PlaneMarker({ plane, selected, heading, label, onClick }: Props) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  // Create marker on mount
  useEffect(() => {
    const center = map.getCenter();
    const lng = wrapLng(plane.longitude, center.lng);
    const marker = L.marker([plane.latitude, lng], {
      icon: createPlaneIcon(plane.color, heading, selected, plane.altitude),
    }).addTo(map);

    marker.bindTooltip(label, {
      direction: "top",
      offset: [0, -12],
      className: "plane-tooltip",
    });

    marker.on("click", () => onClickRef.current());
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update position and icon when data changes
  useEffect(() => {
    if (!markerRef.current) return;
    const center = map.getCenter();
    const lng = wrapLng(plane.longitude, center.lng);
    markerRef.current.setLatLng([plane.latitude, lng]);
    markerRef.current.setIcon(createPlaneIcon(plane.color, heading, selected, plane.altitude));
    markerRef.current.setTooltipContent(label);
  }, [plane.latitude, plane.longitude, plane.altitude, plane.color, heading, selected, label, map]);

  // Reposition on map move
  const reposition = useCallback(() => {
    if (!markerRef.current) return;
    const center = map.getCenter();
    const pos = markerRef.current.getLatLng();
    const lng = wrapLng(pos.lng, center.lng);
    if (lng !== pos.lng) {
      markerRef.current.setLatLng([pos.lat, lng]);
    }
  }, [map]);

  useEffect(() => {
    map.on("moveend", reposition);
    return () => { map.off("moveend", reposition); };
  }, [map, reposition]);

  return null;
}
