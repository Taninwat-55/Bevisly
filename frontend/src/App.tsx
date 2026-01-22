import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { BevisToaster } from "@/components/common/Toast";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <Outlet />
      <BevisToaster />
    </main>
  );
}
