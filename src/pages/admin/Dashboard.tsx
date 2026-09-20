import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Tags, Activity, CheckCircle2 } from 'lucide-react';
import { Mascot } from './Mascot';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    activeCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Categorias
        const { count: totalCat } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });
          
        const { count: activeCat } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        // Produtos
        const { count: totalProd } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        const { count: activeProd } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        setStats({
          totalCategories: totalCat || 0,
          activeCategories: activeCat || 0,
          totalProducts: totalProd || 0,
          activeProducts: activeProd || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number | string, icon: any, colorClass: string }) => (
    <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight">{loading ? '-' : value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Visão Geral</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Acompanhe os números do seu catálogo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Produtos" 
          value={stats.totalProducts} 
          icon={Package} 
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
        />
        <StatCard 
          title="Produtos Ativos" 
          value={stats.activeProducts} 
          icon={CheckCircle2} 
          colorClass="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
        />
        <StatCard 
          title="Categorias" 
          value={stats.totalCategories} 
          icon={Tags} 
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" 
        />
        <StatCard 
          title="Categorias Ativas" 
          value={stats.activeCategories} 
          icon={Activity} 
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" 
        />
      </div>

      <Mascot />
    </div>
  );
}
