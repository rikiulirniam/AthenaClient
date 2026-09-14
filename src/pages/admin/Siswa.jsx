import React, { useEffect, useState } from "react";
import { useAxios } from "../../config/hooks";
import { Users, CheckCircle, Clock, MagnifyingGlass } from "@phosphor-icons/react";

export default function Siswa() {
  const beaxios = useAxios();
  const [siswas, setSiswas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = "";
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (filterStatus === "verified") query += `&verified=true`;
      if (filterStatus === "unverified") query += `&verified=false`;

      const res = await beaxios.get(`/siswa?${query}`);
      setSiswas(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, filterStatus]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={28} className="text-[#5e72e4]" />
            Data Calon Siswa
          </h1>
          <p className="text-gray-500 text-sm">
            Daftar seluruh calon siswa yang mendaftar di SMK Tunas Harapan.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#5e72e4] w-64 bg-white"
            />
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#5e72e4]"
          >
            <option value="all">Semua Status</option>
            <option value="verified">Terverifikasi</option>
            <option value="unverified">Belum Verifikasi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">NISN / NIK</th>
                <th className="px-5 py-3">Jurusan</th>
                <th className="px-5 py-3">Asal Sekolah</th>
                <th className="px-5 py-3">No. HP</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    Memuat data siswa...
                  </td>
                </tr>
              ) : siswas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    Tidak ada data siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                siswas.map((siswa, i) => (
                  <tr key={siswa.id || i} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {siswa.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {siswa.nisn} <br />
                      <span className="text-gray-400">{siswa.nik}</span>
                    </td>
                    <td className="px-5 py-3">{siswa.jurusan}</td>
                    <td className="px-5 py-3">{siswa.asal_sekolah}</td>
                    <td className="px-5 py-3">{siswa.no_telepon}</td>
                    <td className="px-5 py-3 text-center">
                      {siswa.status == 1 || siswa.status === true ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          <CheckCircle size={14} weight="fill" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                          <Clock size={14} /> Belum
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
