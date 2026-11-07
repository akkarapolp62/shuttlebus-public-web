"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";

export default function TrackerPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState({ lat: 13.965, lng: 100.587 }); // พิกัดเริ่มต้น ม.รังสิต
  const [watchId, setWatchId] = useState<number | null>(null);

  // 👉 1. เพิ่ม State สำหรับเก็บค่าพิกัดที่ผู้ใช้กรอกเข้ามาเอง
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // สร้างแผนที่เมื่อโหลดฝั่ง Client สำเร็จ
  useEffect(() => {
    let mapInstance: any = null;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (mapContainer.current && !mapRef.current) {
        const map = L.map(mapContainer.current).setView([coords.lat, coords.lng], 16);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        const busIcon = L.divIcon({
          className: "custom-bus-marker",
          html: `<div style="background-color: #EF4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">🚌</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: busIcon }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;
        mapInstance = map;
      }
    }

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // อัปเดตตำแหน่งหมุดบนแผนที่ เมื่อ coords เปลี่ยนแปลง
  useEffect(() => {
    async function updateMarker() {
      if (mapRef.current && markerRef.current) {
        const L = (await import("leaflet")).default;
        const newLatLng = new L.LatLng(coords.lat, coords.lng);
        markerRef.current.setLatLng(newLatLng);
        mapRef.current.setView(newLatLng, 17);
      }
    }
    updateMarker();
  }, [coords]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        const { error } = await supabase
          .from("vehicles")
          .update({ latitude: latitude, longitude: longitude })
          .eq("id", 1); 

        if (error) console.error("Error updating GPS to Supabase:", error);
      },
      (error) => console.error("GPS Error:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  // 👉 2. ฟังก์ชันสำหรับจัดการเมื่อผู้ใช้กดปุ่ม "ไปที่พิกัดนี้"
  const handleCustomLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(customLat);
    const lngNum = parseFloat(customLng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("กรุณากรอกตัวเลขละติจูดและลองจิจูดให้ถูกต้อง");
      return;
    }

    // อัปเดตพิกัดใน State เพื่อให้แผนที่เลื่อนไปหา
    setCoords({ lat: latNum, lng: lngNum });

    // (ทางเลือก) อัปเดตลง Supabase ด้วย
    const { error } = await supabase
      .from("vehicles")
      .update({ latitude: latNum, longitude: lngNum })
      .eq("id", 1);

    if (error) {
      console.error("Error updating custom GPS to Supabase:", error);
    } else {
      alert("ย้ายหมุดและอัปเดตพิกัดสำเร็จ!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-2 md:p-4 gap-4">
      {/* ส่วนแผงควบคุม */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">ระบบส่งพิกัดรถบัส</h1>
        <p className="mb-4 text-sm text-gray-500">
          สถานะ: {isTracking ? <span className="text-green-500 font-semibold">กำลังส่งข้อมูลพิกัดและอัปเดตแผนที่...</span> : <span className="text-red-500">หยุดการทำงาน</span>}
        </p>
        
        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-800 font-mono">
          Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
        </div>

        {/* ปุ่มควบคุม GPS จริง */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={startTracking}
            disabled={isTracking}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${
              isTracking ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            เริ่มส่งพิกัดจริง
          </button>
          
          <button
            onClick={stopTracking}
            disabled={!isTracking}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              !isTracking ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white shadow-md"
            }`}
          >
            หยุดส่งพิกัด
          </button>
        </div>

        {/* 👉 3. เพิ่มฟอร์มกรอกพิกัด Latitude / Longitude เอง */}
        <form onSubmit={handleCustomLocation} className="border-t pt-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700 text-left">ปักหมุดระบุพิกัดเอง (Latitude / Longitude)</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Latitude (เช่น 13.965)"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <input
              type="text"
              placeholder="Longitude (เช่น 100.587)"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-semibold transition-colors shadow"
          >
            ย้ายหมุดไปยังพิกัดนี้
          </button>
        </form>
      </div>

      {/* ส่วนแสดงแผนที่ */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[350px] relative z-0">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}