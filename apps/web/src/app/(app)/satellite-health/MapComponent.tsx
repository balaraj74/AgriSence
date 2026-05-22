
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Field } from '@/types';

const MAP_ID = "AGRISENCE_SATELLITE_MAP";

export const MapComponent = ({
  center,
  field,
  healthMapUrl,
}: {
  center: google.maps.LatLngLiteral;
  field: Field | null;
  healthMapUrl: string | null;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const overlayRef = useRef<google.maps.GroundOverlay | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom: 16,
        mapId: MAP_ID,
        mapTypeId: 'hybrid',
      });
      setMap(newMap);
    }
  }, [ref, map, center]);
  
  useEffect(() => {
    if (map && field) {
        if(polygonRef.current) polygonRef.current.setMap(null);
        if(overlayRef.current) overlayRef.current.setMap(null);

        const bounds = new google.maps.LatLngBounds();
        field.coordinates.forEach(coord => bounds.extend(coord));
        
        const newPolygon = new google.maps.Polygon({
            paths: field.coordinates,
            strokeColor: '#FFC107',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FFC107',
            fillOpacity: 0.2,
        });
        newPolygon.setMap(map);
        polygonRef.current = newPolygon;

        if (healthMapUrl) {
            const groundOverlay = new google.maps.GroundOverlay(healthMapUrl, bounds);
            groundOverlay.setMap(map);
            overlayRef.current = groundOverlay;
        }
        
        map.fitBounds(bounds);
    }
  }, [map, field, healthMapUrl]);

  return <div ref={ref} className="h-full w-full rounded-lg bg-muted" />;
};
