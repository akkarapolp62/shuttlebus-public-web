'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        กำลังตรวจสอบสิทธิ์เข้าใช้งาน...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 w-full">
      {/* Sidebar เมนูด้านข้าง */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-bold text-gray-800 text-lg">Shuttle Track</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm font-medium text-gray-600">
          <Link href="/admin" className="block px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-blue-600">
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
          <p className="font-semibold truncate">{user?.email}</p>
        </div>
      </aside>

      {/* พื้นที่แสดงเนื้อหาหลัก */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}