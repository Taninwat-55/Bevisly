import DashboardLayout from "./DashboardLayout";
import { Outlet } from "react-router-dom";

export default function CandidateLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
