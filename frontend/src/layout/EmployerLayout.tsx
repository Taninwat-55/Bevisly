import DashboardLayout from "./DashboardLayout";
import { Outlet } from "react-router-dom";

export default function EmployerLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
