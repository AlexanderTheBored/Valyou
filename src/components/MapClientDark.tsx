"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/components/ThemeProvider";

interface LatLng { lat: number; lng: number }

function PinDropper({ onPin }: { onPin: (latlng: LatLng) => void }) {
  const isMovingRef = useRef(false);
  const lastDropTimeRef = useRef(0);

  useMapEvents({
    movestart() { isMovingRef.current = true; },
    moveend()   { isMovingRef.current = false; },
    click(e) {
      if (isMovingRef.current) return;
      const now = Date.now();
      if (now - lastDropTimeRef.current < 400) return;
      lastDropTimeRef.current = now;
      onPin({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ---------------------------------------------------------------------------
// Animation helpers — use inline style transitions on the SVG <path> element.
// CSS class-based keyframe animations on Leaflet SVG paths are unreliable
// because map.stop() can trigger an internal SVG redraw that resets the
// animation mid-frame. Inline transitions survive those redraws.
// ---------------------------------------------------------------------------

function animateCircleIn(el: SVGElement) {
  // Start: invisible + scaled down
  el.style.transition = "none";
  el.style.opacity = "0";
  el.style.transform = "scale(0.2)";
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = "center";
  // Force a layout so the browser registers the start state before transitioning
  void el.getBoundingClientRect();
  // Animate to natural state with a spring overshoot
  el.style.transition =
    "opacity 0.4s ease-out, transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)";
  el.style.opacity = "";
  el.style.transform = "";
}

function animateCircleOut(el: SVGElement, onDone: () => void) {
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = "center";
  el.style.transition =
    "opacity 0.25s ease-in, transform 0.25s ease-in";
  el.style.opacity = "0";
  el.style.transform = "scale(0.2)";
  setTimeout(onDone, 280);
}

// ---------------------------------------------------------------------------

function MapLayersController({
  center, radiusKm, bottomInset,
}: { center: LatLng | null; radiusKm: number; bottomInset: number }) {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const latestBottomInsetRef = useRef(bottomInset);
  latestBottomInsetRef.current = bottomInset;

  // True only when OUR flyTo is in flight and the circle is waiting to be shown.
  // Must be false BEFORE calling map.stop() — stop() fires moveend synchronously
  // and we don't want the handler to reveal a stale circle.
  const pendingCircleRef = useRef(false);

  // Animate a circle out then remove it. If it was never added to the map
  // (no SVG element yet) it's discarded immediately.
  const dismissCircle = (circle: L.Circle) => {
    const el = circle.getElement() as SVGElement | null;
    if (!el) {
      circle.remove();
      return;
    }
    animateCircleOut(el, () => circle.remove());
  };

  // Add a circle to the map and play the reveal animation.
  const revealCircle = (circle: L.Circle) => {
    circle.addTo(map);
    const el = circle.getElement() as SVGElement | null;
    if (el) animateCircleIn(el);
  };

  // Once the flyTo settles, show the pending circle.
  useMapEvents({
    moveend() {
      if (!pendingCircleRef.current || !circleRef.current) return;
      pendingCircleRef.current = false;
      revealCircle(circleRef.current);
    },
  });

  // Unmount-only cleanup.
  useEffect(() => {
    return () => {
      circleRef.current?.remove();
      circleRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    // ── Pin cleared ───────────────────────────────────────────────────────────
    if (!center) {
      pendingCircleRef.current = false;
      if (circleRef.current) {
        dismissCircle(circleRef.current);
        circleRef.current = null;
      }
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const radiusM = radiusKm * 1000;
    const latlng = L.latLng(center.lat, center.lng);

    // ── Disarm handler BEFORE map.stop() ─────────────────────────────────────
    // map.stop() fires moveend synchronously. pendingCircleRef must be false
    // at that point so the handler doesn't reveal the old circle.
    pendingCircleRef.current = false;

    // Animate the old circle out (works for both new-pin and radius changes).
    if (circleRef.current) {
      dismissCircle(circleRef.current);
      circleRef.current = null;
    }

    // Create the new circle — NOT added to the map yet.
    circleRef.current = L.circle(latlng, {
      radius: radiusM,
      color: "#C3110F",
      weight: 2,
      opacity: 0.7,
      fillColor: "#C3110F",
      fillOpacity: 0.1,
      dashArray: "6 6",
    });

    // Marker: create once, update in-place on subsequent drops.
    if (!markerRef.current) {
      const pinIcon = L.divIcon({
        className: "bg-transparent border-0",
        html: `
          <div style="position:relative;width:24px;height:24px;">
            <div style="width:24px;height:24px;background:#C3110F;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 10px rgba(195,17,15,0.6);"></div>
            <div class="valyou-pin-ripple" style="position:absolute;bottom:-5px;left:12px;transform:translateX(-50%);"></div>
          </div>`,
        iconSize: [24, 29],
        iconAnchor: [12, 29],
      });
      markerRef.current = L.marker(latlng, { icon: pinIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(latlng);
    }

    // toBounds() is pure spherical math — works on a detached circle.
    const circleBounds = latlng.toBounds(radiusM * 2);
    const mapBounds = map.getBounds();
    const isAlreadyZoomed = map.getZoom() >= 14;

    // Cancel any previous animation. Safe now that pendingCircleRef = false.
    map.stop();

    if (!isAlreadyZoomed || !mapBounds.contains(circleBounds)) {
      // Arm AFTER stop() so only our new flyTo's moveend triggers the reveal.
      pendingCircleRef.current = true;
      map.flyToBounds(circleBounds, {
        paddingTopLeft: [40, 40],
        paddingBottomRight: [40, 40 + latestBottomInsetRef.current],
        duration: 0.8,
        maxZoom: 16,
      });
    } else {
      // Already framed — reveal immediately.
      revealCircle(circleRef.current);
    }
  }, [center, radiusKm, map]);

  return null;
}

interface MapClientDarkProps {
  onPinDrop?: (latlng: LatLng) => void;
  droppedPin?: LatLng | null;
  interactive?: boolean;
  radiusKm?: number;
  bottomInset?: number;
}

export default function MapClientDark({
  onPinDrop, droppedPin, interactive = true, radiusKm, bottomInset = 0,
}: MapClientDarkProps) {
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

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      key={theme}
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
      <MapLayersController
        center={droppedPin ?? null}
        radiusKm={radiusKm ?? 2}
        bottomInset={bottomInset}
      />
    </MapContainer>
  );
}
