import { useEffect, useRef, useState } from "react";
import type { PlaneBasic } from "../types";

const WS_URL = `${import.meta.env.VITE_WS_BASE}/ws/planes/basic`;
const RECONNECT_DELAY = 2000;

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function usePlanesBasic() {
  const [planes, setPlanes] = useState<PlaneBasic[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const reconnectTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let ws: WebSocket;
    let unmounted = false;

    function connect() {
      setStatus("connecting");
      ws = new WebSocket(WS_URL);

      ws.onopen = () => setStatus("connected");

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "planes") setPlanes(msg.data);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => setStatus("disconnected");

      ws.onclose = () => {
        setStatus("disconnected");
        if (!unmounted) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    }

    connect();
    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer.current);
      ws.close();
    };
  }, []);

  return { planes, status };
}
