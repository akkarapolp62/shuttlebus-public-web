"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X } from "lucide-react";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับควบคุมการเปิด-ปิด Modal เพิ่มข้อมูล
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State สำหรับเก็บข้อมูลในฟอร์มกรอกข้อมูล
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6"); // ค่าเริ่มต้นเป็นสีฟ้า
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ฟังก์ชันดึงข้อมูลเส้นทางทั้งหมดจาก Supabase
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("routes").select("*");
      if (error) throw error;
      if (data) setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // ฟังก์ชันบันทึกข้อมูลใหม่ลง Supabase
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert("กรุณากรอกรหัสสายรถและชื่อเส้นทาง");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("routes").insert([
        {
          code,
          name,
          description,
          color,
          isActive,
        },
      ]);

      if (error) throw error;

      // รีเซ็ตฟอร์มและปิด Modal
      setCode("");
      setName("");
      setDescription("");
      setColor("#3B82F6");
      setIsActive(true);
      setIsModalOpen(false);

      // โหลดข้อมูลในตารางใหม่
      fetchRoutes();
      alert("เพิ่มเส้นทางสำเร็จ!");
    } catch (error: any) {
      console.error("Error adding route:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Routes</h1>
          <p className="text-gray-500 text-sm">Manage shuttle routes and paths</p>
        </div>
        {/* ปุ่มกดเปิด Modal เพิ่มข้อมูล */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
              <th className="p-4">Color</th>
              <th className="p-4">Code</th>
              <th className="p-4">Route Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  กำลังโหลดข้อมูลเส้นทาง...
                </td>
              </tr>
            ) : routes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  ยังไม่มีข้อมูลเส้นทางในระบบ
                </td>
              </tr>
            ) : (
              routes.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div
                      className="w-6 h-6 rounded-lg border shadow-sm"
                      style={{ backgroundColor: r.color || "#ccc" }}
                    ></div>
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{r.code}</td>
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4 text-gray-500 text-xs">{r.description || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal สำหรับกรอกข้อมูล Add Route */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add New Route</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoute} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Route Code (เช่น R1, R2)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ระบุรหัสสายรถ"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ระบุชื่อเส้นทาง"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดเส้นทางเพิ่มเติม (ถ้ามี)"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Route Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border cursor-pointer p-1 bg-white"
                    />
                    <span className="text-xs font-mono text-gray-500">{color}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:bg-gray-300"
                >
                  {submitting ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}