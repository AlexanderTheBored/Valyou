"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/components/ThemeProvider";

interface LatLng { lat: number; lng: number }

function PinDropper({ onPin }: { onPin: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) { onPin({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

// Always mounted inside MapContainer. Manages the circle imperatively and
// flies the map to fit the circle whenever the pin location changes.
function MapCircleController({ center, radiusKm }: { center: LatLng | null; radiusKm: number }) {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);
  const animRef = useRef<number | null>(null);
  const currentRadiusRef = useRef(radiusKm * 1000);
  // Latest ref so the center effect always reads the current radius without
  // needing radiusKm in its dependency array (which would re-zoom on every change).
  const latestRadiusKmRef = useRef(radiusKm);
  latestRadiusKmRef.current = radiusKm;

  useEffect(() => {
    if (center) {
      const radiusM = latestRadiusKmRef.current * 1000;
      if (!circleRef.current) {
        circleRef.current = L.circle([center.lat, center.lng], {
          radius: radiusM,
          color: "#C3110F",
          weight: 2,
          opacity: 0.7,
          fillColor: "#C3110F",
          fillOpacity: 0.1,
          dashArray: "6 6",
        }).addTo(map);
        currentRadiusRef.current = radiusM;
      } else {
        circleRef.current.setLatLng([center.lat, center.lng]);
      }
      // Zoom to fit the circle (already added to map, so projection is available).
      map.flyToBounds(circleRef.current.getBounds(), { padding: [80, 80], duration: 1.2 });
    } else {
      circleRef.current?.remove();
      circleRef.current = null;
    }
    return () => {
      circleRef.current?.remove();
      circleRef.current = null;
    };
  }, [center, map]);

  useEffect(() => {
    const targetM = radiusKm * 1000;
    const startM = currentRadiusRef.current;
    const duration = 420;
    const start = performance.now();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = startM + (targetM - startM) * eased;
      currentRadiusRef.current = val;
      circleRef.current?.setRadius(val);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [radiusKm]);

  return null;
}

interface MapClientDarkProps {
  onPinDrop?: (latlng: LatLng) => void;
  droppedPin?: LatLng | null;
  interactive?: boolean;
  radiusKm?: number;
}

export default function MapClientDark({ onPinDrop, droppedPin, interactive = true, radiusKm }: MapClientDarkProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const pinIcon =
    typeof window !== "undefined"
      ? L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:20px;height:20px;">
              <div class="valyou-pin-drop">
                <div style="width:100%;height:100%;background:#C3110F;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 10px rgba(195,17,15,0.7);"></div>
              </div>
              <div class="valyou-pin-ripple"></div>
            </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20],
        })
      : undefined;

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={[10.3157, 123.8854]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      scrollWheelZoom={interactive}
      dragging={interactive}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={tileUrl}
      />

      {onPinDrop && <PinDropper onPin={onPinDrop} />}
      <MapCircleController center={droppedPin ?? null} radiusKm={radiusKm ?? 2} />
      {droppedPin && pinIcon && (
        <Marker
          key={`${droppedPin.lat.toFixed(6)}-${droppedPin.lng.toFixed(6)}`}
          position={[droppedPin.lat, droppedPin.lng]}
          icon={pinIcon}
        />
      )}
    </MapContainer>
  );
}
