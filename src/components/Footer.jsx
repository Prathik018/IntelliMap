const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-between py-6 sm:h-16 sm:flex-row">
          <div className="text-center text-sm text-gray-500 sm:w-1/3 sm:text-left font-medium uppercase tracking-[0.1em]">
            © {new Date().getFullYear()} Intellimap
          </div>

          <div className="flex justify-center sm:justify-end sm:w-1/3">
            <a
              href="https://x.com/Prathik__Pai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-black sm:mt-0 font-medium"
            >
              <XIcon className="h-3.5 w-3.5" />
              Designed and Developed by{' '}
              <span className="font-bold text-gray-900">Prathik Pai</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
