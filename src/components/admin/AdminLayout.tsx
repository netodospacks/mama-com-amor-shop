import { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Produtos', path: '/admin/produtos', icon: Package },
  { label: 'Categorias', path: '/admin/categorias', icon: Tags },
  { label: 'Pedidos', path: '/admin/pedidos', icon: ShoppingCart },
  { label: 'Configurações', path: '/admin/configuracoes', icon: Settings },
];

function AdminNavLinks({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {ADMIN_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = currentPath === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => {
              if (onNavigate) onNavigate();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm select-none touch-manipulation ${
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
}

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha o menu lateral automaticamente sempre que a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Previne scroll do body quando o menu lateral mobile estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Fecha o menu lateral ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Você saiu do painel.');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex font-sans select-auto">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-800 z-40">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-9 h-9 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0 p-1">
            <img src="/vs_logo_white.png" alt="VS Logo" className="w-full h-full object-contain dark:hidden" />
            <img src="/vs_logo.png" alt="VS Logo" className="w-full h-full object-contain hidden dark:block" />
          </div>
          <span className="font-bold tracking-tight text-sm uppercase leading-tight">
            Virtual Store<br/><span className="font-light text-[10px] text-neutral-500 tracking-widest">Administração</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <AdminNavLinks currentPath={location.pathname} />
        </nav>

        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-neutral-600 hover:text-black hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800"
          >
            <ArrowLeft size={18} />
            Voltar para o site
          </Link>
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
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 touch-manipulation cursor-pointer"
              aria-label="Abrir Menu Admin"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold tracking-tight text-sm uppercase">Painel Admin</span>
          </div>

          <div className="hidden lg:block">
            <span className="font-medium text-neutral-500">
              {ADMIN_LINKS.find(l => l.path === location.pathname)?.label || 'Painel'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Voltar ao site</span>
            </Link>
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

      {/* Mobile Drawer Backdrop (Transição CSS direta: zero travamento de tela) */}
      <div
        role="presentation"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-200 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile Drawer Panel (Transição CSS suave: sem oscilações, fechamento instantâneo) */}
      <aside
        aria-label="Menu Administrativo Mobile"
        className={`fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white dark:bg-[#0A0A0A] shadow-2xl z-50 flex flex-col lg:hidden transition-transform duration-200 ease-out transform ${
          isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <span className="font-bold tracking-tight text-sm uppercase leading-tight">
            Virtual Store<br/><span className="font-light text-[10px] text-neutral-500 tracking-widest">Administração</span>
          </span>
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 touch-manipulation cursor-pointer"
            aria-label="Fechar Menu Admin"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <AdminNavLinks 
            currentPath={location.pathname} 
            onNavigate={() => setIsMobileMenuOpen(false)} 
          />
        </nav>

        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-neutral-600 hover:text-black hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800"
          >
            <ArrowLeft size={18} />
            Voltar para o site
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

    </div>
  );
}
