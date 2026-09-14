import React from "react";
import Sidebar, { SidebarItem } from "../../components/sidebar";
import "../../App.css";
import { Outlet, useLocation } from "react-router-dom";
import { House, QrCode, Users, SignOut } from "@phosphor-icons/react";

function Dashboard() {
  const location = useLocation().pathname;

  return (
    <div className="flex">
      <Sidebar>
        <SidebarItem
          icon={<House size={22} />}
          text="Dashboard"
          name="dashboard"
          active={location === "/admin"}
          to="/admin"
        />
        <SidebarItem
          icon={<QrCode size={22} />}
          text="Scan QR / Verifikasi"
          name="scan"
          active={location.includes("/admin/scan")}
          to="scan"
        />
        <SidebarItem
          icon={<Users size={22} />}
          text="Data Siswa"
          name="siswa"
          active={location.includes("/admin/siswa")}
          to="siswa"
        />
        <SidebarItem
          icon={<SignOut size={22} />}
          text="Logout"
          to="/admin/login"
        />
      </Sidebar>
      <div className="content h-screen overflow-y-auto bg-gray-50 w-full p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
