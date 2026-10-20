import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { RoadReport } from '../types';

interface Props { reports: RoadReport[]; selectedId?: string; onSelect: (report: RoadReport) => void; }

export default function ReportMap({ reports, selectedId, onSelect }: Props) {
  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom className="map-canvas">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.filter((r) => r.lifecycleStatus !== 'Rejected').map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.latitude, report.longitude]}
          radius={selectedId === report.id ? 10 : 7}
          pathOptions={{ color: '#32292F', fillColor: selectedId === report.id ? '#32292F' : '#99E1D9', fillOpacity: 1, weight: 3 }}
          eventHandlers={{ click: () => onSelect(report) }}
        >
          <Popup>
            <div className="map-popup">
              <strong>{report.locationLabel}</strong>
              <span>{report.lifecycleStatus}</span>
              <button onClick={() => onSelect(report)}>View report</button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
