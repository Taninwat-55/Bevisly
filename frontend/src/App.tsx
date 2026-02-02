import { Outlet } from "react-router-dom";

import { BevisToaster } from "@/components/common/Toast";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">

      <Outlet />
      <BevisToaster />
    </main>
  );
}
