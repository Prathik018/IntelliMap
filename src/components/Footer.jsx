export default function Footer() {
  return (
    <footer className="w-full text-center py-6 border-t bg-white mt-10">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} MindMapGen. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
