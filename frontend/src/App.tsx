import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { BevisToaster } from "./components/ui/Toast";
// import FeedbackButton from "./components/ui/FeedbackButton";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* You can add Navbar or Sidebar later */}
      <Navbar />
      <Outlet />
      {/* <FeedbackButton /> */}
      <BevisToaster />
    </main>
  );
}
