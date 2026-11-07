"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PublicMapProps {
  stops: any[];
  routes?: any[];
  vehicles?: any[];
}

export default function PublicMap({ stops, routes, vehicles = [] }: PublicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string>("กำลังค้นหาตำแหน่งของคุณ...");

  useEffect(() => {
    if (!mapRef.current) return;

    // เริ่มต้นสร้างแผนที่ (ตั้งค่าพิกัดเริ่มต้นเผื่อกรณี GPS ยังไม่มา)
    const defaultCenter: [number, number] = [13.9649, 100.5872];
    
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(defaultCenter, 16);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
    }

    const map = mapInstanceRef.current;

    // =====================================
    // 1. วาดเส้นทาง (Routes)
    // =====================================
    if (routes && routes.length > 0) {
      routes.forEach((route) => {
        if (route.path_coordinates) {
          L.geoJSON(route.path_coordinates, {
            style: () => ({ color: route.color || '#4B0082', weight: 5, opacity: 0.8 }),
          }).addTo(map);
        }
      });
    }

    // =====================================
    // 2. ปักหมุดรถบัส (Vehicles)
    // =====================================
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach((vehicle) => {
        if (vehicle.latitude && vehicle.longitude && vehicle.status === "ACTIVE") {
          const busIcon = L.divIcon({
            className: "custom-bus-icon",
            html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">🚌</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          L.marker([vehicle.latitude, vehicle.longitude], { icon: busIcon })
            .addTo(map)
            .bindPopup(`<b>รถ: ${vehicle.name || vehicle.plate_number}</b><br/>สถานะ: กำลังวิ่ง`);
        }
      });
    }

    // =====================================
    // 3. ปักหมุดป้ายจอด (Stops)
    // =====================================
    stops.forEach((stop) => {
      if (stop.latitude && stop.longitude) {
        const stopIcon = L.divIcon({
          className: "custom-stop-marker",
          html: `<div style="background-color: white; border: 3px solid #3B82F6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; color: #1E3A8A; box-shadow: 0px 2px 4px rgba(0,0,0,0.3); text-align: center;">${stop.name}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
        L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>${stop.name}</b>`);
      }
    });

    // =====================================
    // 4. ระบบติดตามตำแหน่งผู้ใช้แบบ Realtime (Geolocation)
    // =====================================
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setTrackingStatus("กำลังแสดงตำแหน่งของคุณบนแผนที่");

          // สร้างไอคอนรูปคน (👤)
          const userIcon = L.divIcon({
            className: "user-location-icon",
            html: `<div style="background-color: #EF4444; border: 3px solid white; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0px 4px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;">👤</div>`,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          if (userMarkerRef.current) {
            // อัปเดตตำแหน่งหมุดเดิม
            userMarkerRef.current.setLatLng([lat, lng]);
          } else {
            // สร้างหมุดใหม่ครั้งแรก
            const marker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
            marker.bindPopup("<b>📍 ตำแหน่งปัจจุบันของคุณ</b>").openPopup();
            userMarkerRef.current = marker;
          }

          // เลื่อนแผนให้ตำแหน่งคนอยู่กลางจอเสมอ (สามารถปรับเปลี่ยนได้ตามต้องการ)
          map.setView([lat, lng], 17);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setTrackingStatus("ไม่สามารถเข้าถึงตำแหน่ง GPS ได้ (กรุณาเปิดสิทธิ์ Location)");
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setTrackingStatus("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS");
    }
  }, [stops, routes, vehicles]);

  return (
    <div className="relative w-full h-full">
      {/* กล่องแสดงสถานะ GPS ด้านบนแผนที่ */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-xs text-gray-700 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        <span>{trackingStatus}</span>
      </div>

      <div ref={mapRef} className="w-full h-full z-0" />
    </div>
  );
}