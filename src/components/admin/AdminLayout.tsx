import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_LINKS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Produtos', path: '/admin/produtos', icon: Package },
  { label: 'Categorias', path: '/admin/categorias', icon: Tags },
  { label: 'Pedidos', path: '/admin/pedidos', icon: ShoppingCart },
  { label: 'Configurações', path: '/admin/configuracoes', icon: Settings },
];

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Você saiu do painel.');
    navigate('/admin/login');
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {ADMIN_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              isActive 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex font-sans">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-800 z-40">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center shrink-0">
            <Store size={18} className="text-white dark:text-black" />
          </div>
          <span className="font-bold tracking-tight text-sm uppercase leading-tight">
            Virtual Store<br/><span className="font-light text-[10px] text-neutral-500 tracking-widest">Administração</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Header Mobile & Desktop */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold tracking-tight text-sm uppercase">Painel Admin</span>
          </div>

          <div className="hidden lg:block">
            {/* Espaço para breadcrumbs ou título da página no desktop se quiser */}
            <span className="font-medium text-neutral-500">
              {ADMIN_LINKS.find(l => l.path === location.pathname)?.label || 'Painel'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-bold tracking-tight text-sm uppercase leading-tight">
                  Virtual Store<br/><span className="font-light text-[10px] text-neutral-500 tracking-widest">Administração</span>
                </span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
              </nav>

              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut size={18} />
                  Sair do Painel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
