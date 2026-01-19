'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  height?: string;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationSelect,
  interactive = false,
  height = '400px',
}: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fix for default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([latitude, longitude], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add initial marker
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);

      // Add click handler if interactive
      if (interactive && onLocationSelect) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          
          // Update marker position
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          
          // Notify parent component
          onLocationSelect(lat, lng);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className="relative">
      <div ref={containerRef} style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600" />
      {interactive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[1000] pointer-events-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            📍 Click on the map to set location
          </p>
        </div>
      )}
    </div>
  );
}
