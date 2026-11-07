"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Radio } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/admin/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
      กำลังโหลดแผนที่ระบบขนส่ง...
    </div>
  ),
});

export default function PublicHomePage() {
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);

  useEffect(() => {
    async function fetchPublicData() {
      const { count: activeCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");
      setActiveVehiclesCount(activeCount || 0);

      const { data: stopsData } = await supabase
        .from("stops")
        .select("*")
        .eq("isActive", true);
      if (stopsData) setStops(stopsData);

      const { data: routesData } = await supabase
        .from("routes")
        .select("*")
        .eq("isActive", true);
      if (routesData) setRoutes(routesData);
    }

    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Public Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🚍
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-base">ShuttleTrack</h1>
              <p className="text-xs text-gray-400">ระบบติดตามรถ Shuttle Bus เรียลไทม์</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            <span className="text-blue-600 font-semibold">หน้าแรก / แผนที่สด</span>
          </nav>

          <div>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">แผนที่ติดตามรถและป้ายจอด</h2>
            <p className="text-sm text-gray-500">ตรวจสอบตำแหน่งปัจจุบันของรถ Shuttle Bus และจุดรับส่งได้แบบเรียลไทม์</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">
                กำลังให้บริการ: <strong className="text-emerald-600">{activeVehiclesCount} คัน</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Map Container อยู่ข้างใน Main และอยู่ในฟังก์ชัน */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Live GPS Tracking</h3>
              <p className="text-xs text-gray-400">แสดงตำแหน่งป้ายจอดและเส้นทางเดินรถบนแผนที่</p>
            </div>
          </div>

          <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
            <MapComponent stops={stops} routes={routes} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400 mt-auto">
        &copy; 2026 ShuttleTrack Public Passenger Service. All rights reserved.
      </footer>
    </div>
  );
}