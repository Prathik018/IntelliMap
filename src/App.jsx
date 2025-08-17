import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";
import DarkVeil from "@/components/ui/DarkVeil/DarkVeil.jsx";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import { useEffect } from "react";


export default function App() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }); 
  }, []);
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Fixed background for all pages */}
      <div className="fixed inset-0 -z-10 w-full h-full">
        <DarkVeil className="w-full h-full" />
      </div>

      {/* Content */}
      <Navbar className="relative z-10" />
      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer className="relative z-10" />
    </div>
  );
}
