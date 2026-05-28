import type { ConnectionStatus } from "../../hooks/usePlanesBasic";
import "./StatusIndicator.scss";

const labels: Record<ConnectionStatus, string> = {
  connecting: "Connecting...",
  connected: "Live",
  disconnected: "Reconnecting...",
};

const colors: Record<ConnectionStatus, string> = {
  connecting: "#f59e0b",
  connected: "#10b981",
  disconnected: "#ef4444",
};

export default function StatusIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <span className="status-indicator">
      <span className="status-dot" style={{ background: colors[status] }} />
      {labels[status]}
    </span>
  );
}
