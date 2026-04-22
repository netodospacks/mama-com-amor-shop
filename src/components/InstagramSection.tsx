import { Instagram } from "lucide-react";

export function InstagramSection() {
  return (
    <section className="py-8 my-4 flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm border border-pink-50 mx-2">
      <div className="mb-3">
        <h2 className="text-3xl font-display font-extrabold text-store-dark tracking-tight">
          Virtual Store 🎁
        </h2>
        <p className="font-cursive text-2xl text-store-pink mt-1 opacity-90">
          "Acompanhe nossos trabalhos e novidades no Instagram ✨"
        </p>
      </div>
      
      <a 
        href="https://instagram.com/virtualstore_3" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"
      >
        <Instagram className="w-5 h-5" />
        👉 Ver Instagram @virtualstore_3
      </a>
    </section>
  );
}
