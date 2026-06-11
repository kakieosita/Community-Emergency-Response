import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, IncidentSeverity, IncidentType } from '../types';

interface MapWidgetProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  onPlacePin?: (lat: number, lng: number, address: string) => void;
  isReportingMode?: boolean;
}

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: '#ef4444', // Red
  high: '#f97316',     // Orange
  medium: '#eab308',   // Yellow
  low: '#3b82f6',      // Blue
};

const INCIDENT_LABELS: Record<IncidentType, string> = {
  fire: '🔥 Fire Outbreak',
  flood: '🌊 Severe Flood',
  accident: '🚗 Traffic Crash',
  medical: '🚑 Medical Crisis',
  crime: '🚨 Criminal Activity',
  other: '⚙️ Utilities/Other',
};

export default function MapWidget({
  incidents,
  selectedIncident,
  onSelectIncident,
  onPlacePin,
  isReportingMode = false,
}: MapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const placementMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center of SF San Francisco
    const defaultCenter: L.LatLngExpression = [37.7749, -122.4194];
    
    // Initialize standard Leaflet Map object
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
      fadeAnimation: true,
    });

    // CartoDB Voyager maps layer for premium, light professional GIS viewports
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Event listener for placing click-pins if reporting mode is requested
    map.on('click', async (e: L.LeafletMouseEvent) => {
      if (!onPlacePin) return;
      const { lat, lng } = e.latlng;
      
      // Update placement marker position
      if (placementMarkerRef.current) {
        placementMarkerRef.current.setLatLng(e.latlng);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-placed-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
              <div class="relative h-4 w-4 rounded-full bg-emerald-500 border border-white"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        
        placementMarkerRef.current = L.marker(e.latlng, { icon: pinIcon }).addTo(map);
      }

      // Fetch approximate mock address for clicked coordinates, with fallback
      let mockAddress = 'GPS Coordinates Captured';
      // SF approximate boundary matches
      if (lat > 37.78) mockAddress = `N-Market St Zone (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      else if (lat < 37.76) mockAddress = `Mission District Perimeter (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      else mockAddress = `Central San Francisco Sector (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      onPlacePin(lat, lng, mockAddress);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onPlacePin]);

  // Handle markers updates on incidents array shifts
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear old markers
    markersGroup.clearLayers();

    // Replay markers
    incidents.forEach((incident) => {
      const color = SEVERITY_COLORS[incident.severity];
      const categoryIconLabel = INCIDENT_LABELS[incident.type].split(' ')[0];

      // Custom div wrapper with severity coloring, shadow and custom pulse effect
      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-200 hover:scale-125" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
          ${incident.severity === 'critical' ? `
            <span class="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
            </span>
          ` : ''}
          <div class="flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-white text-lg shadow-sm" style="box-shadow: 0 0 0 3px ${color};">
            <span>${categoryIconLabel}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([incident.location.lat, incident.location.lng], { icon: customIcon });

      // Interactive Popup elements
      const popupContent = `
        <div class="p-2 font-sans text-xs min-w-[200px] text-slate-800">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-sm tracking-tight text-slate-900">${incident.title}</span>
          </div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white" style="background-color: ${color};">
              ${incident.severity}
            </span>
            <span class="text-[10px] text-slate-500 font-semibold">${INCIDENT_LABELS[incident.type]}</span>
          </div>
          <p class="text-slate-650 font-normal line-clamp-2 mb-2">${incident.description.split('[System')[0]}</p>
          <div class="text-[10px] text-slate-500">
            <div>📍 ${incident.location.address || 'SF Area'}</div>
            <div>📋 Status: <span class="capitalize text-emerald-600 font-bold">${incident.status}</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectIncident) {
        marker.on('click', () => {
          onSelectIncident(incident);
        });
      }

      markersGroup.addLayer(marker);
    });

  }, [incidents, onSelectIncident]);

  // Track and zoom selected incident changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedIncident) return;

    const { lat, lng } = selectedIncident.location;
    map.setView([lat, lng], 16, { animate: true, duration: 1 });
  }, [selectedIncident]);

  // Adjust map dimensions or auto-zoom bounds on loading
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || incidents.length === 0) return;

    // Trigger leaflet layout recalculation
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Auto fit to encompass all coordinates if requested
    if (!selectedIncident && incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map((i) => [i.location.lat, i.location.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [incidents, selectedIncident]);

  return (
    <div className="relative h-full w-full rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-slate-105 bg-slate-100">
      <div id="gis-map" ref={mapContainerRef} className="h-full w-full z-10" />
      
      {/* Visual Overlay Indicator */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-3 z-20 pointer-events-none backdrop-blur-md shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-slate-700 font-medium">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-slate-700 font-medium">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span className="text-slate-700 font-medium">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-700 font-medium">Low</span>
        </div>
      </div>

      {isReportingMode && (
        <div className="absolute top-3 right-3 bg-emerald-900/90 border border-emerald-700/80 text-[11px] py-1.5 px-3 rounded-lg text-emerald-200 font-medium z-20 pointer-events-none backdrop-blur shadow-md">
          🖱️ Click anywhere on the map to drop custom GPS Pin coordinates
        </div>
      )}
    </div>
  );
}
