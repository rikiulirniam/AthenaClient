import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAxios } from "../../config/hooks";
import {
  QrCode,
  Camera,
  CameraSlash,
  CheckCircle,
  XCircle,
  User,
  IdentificationCard,
  GraduationCap,
  Phone,
  ArrowClockwise,
  UploadSimple,
} from "@phosphor-icons/react";

export default function ScanQr() {
  const beaxios = useAxios();
  const [scanResult, setScanResult] = useState("");
  const [manualId, setManualId] = useState("");
  const [siswaData, setSiswaData] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to start camera
  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }

      const qrCodeSuccessCallback = (decodedText) => {
        console.log("Scanned QR Code:", decodedText);
        setScanResult(decodedText);
        stopScanner();
        fetchStudentData(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // scanning frame - ignore non-matches
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      setCameraError(
        "Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser."
      );
      setIsScanning(false);
    }
  };

  // Function to stop camera
  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
  };

  // Handle image upload scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader");
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      setScanResult(decodedText);
      fetchStudentData(decodedText);
    } catch (err) {
      console.error("File scan error:", err);
      setStatusMessage({
        type: "error",
        text: "Kode QR tidak terdeteksi pada gambar yang diunggah.",
      });
    }
  };

  // Fetch student info from API by ID
  const fetchStudentData = async (id) => {
    const cleanId = id ? id.toString().trim() : "";
    if (!cleanId) return;

    setLoadingStudent(true);
    setStatusMessage(null);
    setSiswaData(null);

    try {
      const res = await beaxios.get(`/siswa/${cleanId}`);
      setSiswaData(res.data.data);
    } catch (err) {
      console.error("Error fetching siswa:", err);
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Data siswa tidak ditemukan dengan nomor ID tersebut.",
      });
    } finally {
      setLoadingStudent(false);
    }
  };

  // Verify enrollment
  const handleVerify = async () => {
    if (!siswaData?.id) return;
    setVerifying(true);
    setStatusMessage(null);

    try {
      const res = await beaxios.post("/siswa/verify", { id: siswaData.id });
      setStatusMessage({
        type: "success",
        text: res.data?.message || "Siswa berhasil daftar ulang!",
      });
      // Refresh student status
      setSiswaData((prev) => ({ ...prev, status: true }));
    } catch (err) {
      console.error("Error verifying siswa:", err);
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Gagal memverifikasi daftar ulang siswa.",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Reset and scan next
  const handleReset = () => {
    setScanResult("");
    setManualId("");
    setSiswaData(null);
    setStatusMessage(null);
    startScanner();
  };

  useEffect(() => {
    // Auto start scanner on mount
    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <QrCode size={32} className="text-[#5e72e4]" />
          Scan QR Code / Verifikasi Daftar Ulang
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Arahkan kamera ke kode QR bukti pendaftaran siswa untuk memeriksa data dan memverifikasi daftar ulang.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <Camera size={20} className="text-gray-500" />
              Kamera Scanner
            </span>
            <div className="flex gap-2">
              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition"
                >
                  <CameraSlash size={16} /> Matikan Kamera
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5e72e4] hover:bg-blue-700 rounded-lg flex items-center gap-1 transition"
                >
                  <Camera size={16} /> Nyalakan Kamera
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition"
              >
                <UploadSimple size={16} /> Upload Gambar
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Scanner Viewport */}
          <div className="w-full bg-black rounded-lg overflow-hidden relative min-h-[300px] flex items-center justify-center">
            <div id="reader" className="w-full"></div>
            {!isScanning && (
              <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center text-white p-4 text-center">
                <CameraSlash size={48} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium">Kamera sedang nonaktif</p>
                <button
                  onClick={startScanner}
                  className="mt-3 px-4 py-2 text-xs font-bold text-white bg-[#5e72e4] hover:bg-blue-600 rounded-lg shadow"
                >
                  Aktifkan Kamera
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {cameraError}
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="w-full mt-5 pt-4 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Input No. Pendaftaran / ID Siswa Manual:
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setScanResult(manualId);
                fetchStudentData(manualId);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Contoh: 00012345678"
                className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#5e72e4]"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
              >
                Cari
              </button>
            </form>
          </div>
        </div>

        {/* Result & Verification Section */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-[#5e72e4]" />
                Hasil Pemeriksaan Siswa
              </h2>
              {scanResult && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                  ID: {scanResult}
                </span>
              )}
            </div>

            {/* Notification messages */}
            {statusMessage && (
              <div
                className={`p-3 rounded-lg text-sm mb-4 flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle size={20} className="text-red-600 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Loading state */}
            {loadingStudent && (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e72e4] mb-3"></div>
                <p className="text-sm">Memuat data siswa...</p>
              </div>
            )}

            {/* Empty state */}
            {!loadingStudent && !siswaData && (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-center">
                <QrCode size={54} className="text-gray-300 mb-2 stroke-[1.5]" />
                <p className="font-medium text-gray-600">Belum ada QR Code yang dipindai</p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Arahkan QR Code ke kamera atau masukkan No. Pendaftaran manual di samping.
                </p>
              </div>
            )}

            {/* Student details display */}
            {!loadingStudent && siswaData && (
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-semibold">
                    Status Daftar Ulang
                  </span>
                  {siswaData.status == 1 || siswaData.status === true ? (
                    <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                      <CheckCircle size={14} weight="fill" /> Terverifikasi
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">
                      Belum Terverifikasi
                    </span>
                  )}
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">Nama Siswa</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{siswaData.name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">NISN / NIK</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {siswaData.nisn} / {siswaData.nik}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">Jurusan Pilihan</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {siswaData.jurusan || "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">Asal Sekolah</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {siswaData.asal_sekolah || "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">No. Telepon / WA</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {siswaData.no_telepon || "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">Orang Tua (Ayah / Ibu)</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {siswaData.ortu?.nama_ayah || "-"} / {siswaData.ortu?.nama_ibu || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {siswaData && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
              {siswaData.status == 0 || siswaData.status === false ? (
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow transition ${
                    verifying ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle size={20} />
                  {verifying ? "Memverifikasi..." : "Verifikasi Daftar Ulang"}
                </button>
              ) : (
                <div className="flex-1 bg-green-50 text-green-700 border border-green-200 text-center py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle size={18} weight="fill" /> Siswa Sudah Daftar Ulang
                </div>
              )}

              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center gap-1.5 text-sm transition"
              >
                <ArrowClockwise size={18} /> Scan Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
