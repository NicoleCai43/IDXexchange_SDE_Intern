import { useMemo } from "react";

function parseAllDataRemarks(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed?.OpenHouseRemarks ?? null;
  } catch {
    return null;
  }
}

export default function OpenHouses({ list }) {
  const items = list || [];

  if (!items.length) {
    return <div>No open houses scheduled</div>;
  }

  return (
    <div className="openhouses">
      <h3>Open Houses</h3>
      <ul>
        {items.map((oh) => (
          <li key={oh.id || oh.OpenHouseID}>
            <div>
              <strong>{new Date(oh.OpenHouseDate).toLocaleDateString()}</strong>
              <div>{oh.OH_StartTime || ""} - {oh.OH_EndTime || ""}</div>
            </div>
            <div className="oh-remarks">{parseAllDataRemarks(oh.all_data) || ""}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
