import type { PlaneBasic } from "../../types";
import "./Sidebar.scss";

type Props = {
  planes: PlaneBasic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
};

export default function Sidebar({ planes, selectedId, onSelect, open }: Props) {
  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <span>{planes.length} flights</span>
      </div>
      <ul className="flight-list">
        {planes.map((p) => (
          <li
            key={p.id}
            className={`flight-item ${p.id === selectedId ? "selected" : ""}`}
            onClick={() => onSelect(p.id)}
          >
            <span className="flight-dot" style={{ background: p.color }} />
            <div className="flight-info">
              <span className="flight-id">{p.id}</span>
              <span className="flight-alt">{Math.round(p.altitude * 3.281).toLocaleString()} ft</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
