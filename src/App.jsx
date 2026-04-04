import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Dashboard from '@/components/Dashboard';

export default function App() {
  const location = useLocation();

  return (
    <div className="relative flex flex-col min-h-screen">
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
