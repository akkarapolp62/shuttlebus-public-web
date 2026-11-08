"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Radio } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// โหลด PublicMap แบบ Dynamic เพื่อป้องกันปัญหา SSR
const PublicMap = dynamic(() => import("@/components/PublicMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
      กำลังเปิดใช้งาน GPS และโหลดแผนที่...
    </div>
  ),
});

export default function PublicHomePage() {
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);

  useEffect(() => {
    async function fetchPublicData() {
      const { count: activeCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");
      setActiveVehiclesCount(activeCount || 0);

      const { data: stopsData } = await supabase.from("stops").select("*").eq("isActive", true);
      if (stopsData) setStops(stopsData);

      const { data: routesData } = await supabase.from("routes").select("*").eq("isActive", true);
      if (routesData) setRoutes(routesData);

      const { data: vehiclesData } = await supabase.from("vehicles").select("*");
      if (vehiclesData) setVehicles(vehiclesData);
    }

    fetchPublicData();

    // Realtime Listener สำหรับอัปเดตตำแหน่งรถและป้ายจอด
    const channel = supabase
      .channel("public-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, fetchPublicData)
      .on("postgres_changes", { event: "*", schema: "public", table: "stops" }, fetchPublicData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar ผู้โดยสาร */}
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-700 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>รถให้บริการ: <strong>{activeVehiclesCount} คัน</strong></span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: แผนที่แสดงตำแหน่งคนและรถ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">แผนที่ติดตามตำแหน่งสด</h2>
          <p className="text-sm text-gray-500">ระบบจะระบุตำแหน่งของคุณ (ไอคอนคน 👤) และแสดงรถ Shuttle Bus บนแผนที่แบบเรียลไทม์</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
          <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
            <PublicMap stops={stops} routes={routes} vehicles={vehicles} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        &copy; 2026 ShuttleTrack Public Passenger Service. All rights reserved.
      </footer>
    </div>
  );
}