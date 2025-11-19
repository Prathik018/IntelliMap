import { Github, Mail, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-[#0a0a0a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">IntelliMap</h3>
            <p className="text-gray-400 text-sm">Transforming knowledge into clarity.</p>
          </div>

          <div className="flex gap-6">
            <a href="https://github.com/Prathik018" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="mailto:prathikvpai@gmail.com" className="text-gray-400 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/Prathik__Pai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/prathikk.pai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} IntelliMap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
