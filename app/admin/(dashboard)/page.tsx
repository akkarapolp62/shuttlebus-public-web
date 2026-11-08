"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bus, Route, MapPin, Activity, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 นำเข้า useRouter สำหรับเปลี่ยนหน้า

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
  const router = useRouter(); // 👈 ประกาศใช้งาน Router

  // 🚪 ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // ลบ Session แล้วพาเด้งไปหน้า login
  };

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
    <div className="min-h-screen bg-gray-50 w-full p-8 space-y-6">
      {/* Header และปุ่มทางลัด + ปุ่มออกจากระบบ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of the ShuttleTrack system</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            ← กลับสู่หน้าเว็บ Public
          </Link>

          {/* 🚪 ปุ่มออกจากระบบ */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบ
          </button>
        </div>
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
    </div>
  );
}