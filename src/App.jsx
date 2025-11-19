import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import { useEffect } from "react";


export default function App() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }); 
  }, []);
  return (
    <div className="relative flex flex-col min-h-screen">
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
