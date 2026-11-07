"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bus, Route, MapPin, Activity, Radio } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/admin/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
      กำลังโหลดแผนที่...
    </div>
  ),
});

export default function DashboardPage() {
  const [stats, setStats] = useState({
    vehicles: 0,
    routes: 0,
    stops: 0,
    activeVehicles: 0,
  });
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      const { count: vehicleCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });
      const { count: routeCount } = await supabase
        .from("routes")
        .select("*", { count: "exact", head: true });
      const { count: stopCount } = await supabase
        .from("stops")
        .select("*", { count: "exact", head: true });
      const { count: activeCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");

      setStats({
        vehicles: vehicleCount || 0,
        routes: routeCount || 0,
        stops: stopCount || 0,
        activeVehicles: activeCount || 0,
      });

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

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 w-full">
      {/* 🧭 แถบ Sidebar ด้านซ้าย */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-bold text-gray-800 text-lg">Shuttle Track</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm font-medium text-gray-600">
          <Link href="/admin" className="block px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-semibold">
            📊 Dashboard
          </Link>
          <Link href="/admin/tracker" className="block px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600">
            📍 GPS Tracker
          </Link>
          <Link href="/admin/vehicles" className="block px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600">
            🚐 Vehicles
          </Link>
          <Link href="/admin/routes" className="block px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600">
            🛣️ Routes
          </Link>
          <Link href="/admin/stops" className="block px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600">
            🚏 Stops
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline block">← กลับสู่หน้าเว็บ Public</Link>
        </div>
      </aside>

      {/* 📄 เนื้อหาหลักทางขวา (Dashboard Content + Map) */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of the ShuttleTrack system</p>
        </div>

        {/* การ์ดสถิติ 4 ช่อง */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-xl text-white">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.vehicles}</p>
              <p className="text-xs font-medium text-gray-400">Total Vehicles</p>
              <span className="text-[10px] text-blue-600 font-semibold">{stats.activeVehicles} active</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-xl text-white">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.routes}</p>
              <p className="text-xs font-medium text-gray-400">Total Routes</p>
              <span className="text-[10px] text-emerald-600 font-semibold">In system</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-500 p-3 rounded-xl text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.stops}</p>
              <p className="text-xs font-medium text-gray-400">Total Stops</p>
              <span className="text-[10px] text-amber-600 font-semibold">In system</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-purple-500 p-3 rounded-xl text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.activeVehicles}</p>
              <p className="text-xs font-medium text-gray-400">Live Vehicles</p>
              <span className="text-[10px] text-purple-600 font-semibold">Running now</span>
            </div>
          </div>
        </div>

        {/* ส่วนแสดงแผนที่และป้ายจอด */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-1">Stops & Live Locations</h2>
          <p className="text-xs text-gray-400 mb-4">Vehicle markers & stop locations on map</p>

          <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
            <MapComponent stops={stops} routes={routes} />
          </div>
        </div>
      </main>
    </div>
  );
}