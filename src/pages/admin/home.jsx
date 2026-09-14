import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardTable } from "../../components/CardTable";
import { useAxios } from "../../config/hooks";
import { QrCode, Users, CheckCircle } from "@phosphor-icons/react";

export default function Home() {
  const axios = useAxios();
  const [newest, setNewest] = useState();

  useEffect(() => {
    axios
      .get("/siswa?startIn=1&length=5")
      .then((res) => setNewest(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, Admin</h1>
          <p className="text-gray-500 text-sm">Dashboard Sistem PPDB SMK Tunas Harapan</p>
        </div>
        <Link
          to="/admin/scan"
          className="inline-flex items-center gap-2 bg-[#5e72e4] hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow transition"
        >
          <QrCode size={22} />
          Buka Scanner QR
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#5e72e4] rounded-lg">
            <QrCode size={30} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Verifikasi Cepat</h3>
            <Link to="/admin/scan" className="text-sm font-bold text-[#5e72e4] hover:underline">
              Mulai Scan Kamera &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardTable title="Pendaftar Terbaru" data={newest} />
      </div>
    </div>
  );
}
