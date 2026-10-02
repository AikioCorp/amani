import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function DashboardShell() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
