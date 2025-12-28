// src/components/LazyMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';

// Wrapped Leaflet components - simplified without lazy loading
export function LeafletComponents({ children }) {
  return children({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap });
}