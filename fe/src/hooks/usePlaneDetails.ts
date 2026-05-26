import { useEffect, useState } from "react";
import type { PlaneDetailed } from "../types";

const WS_URL = `${import.meta.env.VITE_WS_BASE}/ws/planes/details`;

export function usePlaneDetails(planeId: string | null) {
  const [details, setDetails] = useState<PlaneDetailed | null>(null);

  useEffect(() => {
    if (!planeId) {
      setDetails(null);
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", planeId }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "plane-details") setDetails(msg.data);
      } catch {
        // ignore malformed messages
      }
    };

    return () => ws.close();
  }, [planeId]);

  return details;
}
