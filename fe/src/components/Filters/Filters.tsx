import "./Filters.scss";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "low", label: "< 25k ft" },
  { key: "mid", label: "25k–35k ft" },
  { key: "high", label: "> 35k ft" },
] as const;

export type AltitudeFilter = (typeof FILTERS)[number]["key"];

type Props = {
  active: AltitudeFilter;
  onChange: (filter: AltitudeFilter) => void;
};

export default function Filters({ active, onChange }: Props) {
  return (
    <div className="filters">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`filter-chip ${active === f.key ? "active" : ""}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
