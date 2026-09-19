import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  layout_type: string;
  sort_order: number;
  active: boolean;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    layout_type: 'grid',
    sort_order: 1,
    active: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao buscar categorias');
      console.error(error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenNew = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      layout_type: 'grid',
      sort_order: categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 1,
      active: true,
    });
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setFormData(cat);
    setIsEditing(true);
    setIsOpen(true);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = formData.slug || generateSlug(formData.name || '');
    
    const payload = {
      name: formData.name,
      slug,
      description: formData.description,
      layout_type: formData.layout_type,
      sort_order: formData.sort_order,
      active: formData.active,
    };

    try {
      if (isEditing && formData.id) {
        const { error } = await supabase.from('categories').update(payload).eq('id', formData.id);
        if (error) throw error;
        toast.success('Categoria atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
        toast.success('Categoria criada com sucesso!');
      }
      setIsOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error('Erro ao salvar categoria: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      const { error } = await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id);
      if (error) throw error;
      toast.success(`Categoria ${cat.active ? 'desativada' : 'ativada'} com sucesso.`);
      fetchCategories();
    } catch (error: any) {
      toast.error('Erro ao alterar status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Produtos vinculados podem ficar sem categoria.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Categoria excluída!');
      fetchCategories();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gerencie os grupos de produtos do seu catálogo.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={handleOpenNew}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Nova Categoria
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nome</label>
                <input 
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Slug (opcional)</label>
                <input 
                  value={formData.slug || ''}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  placeholder="ex: mamaes-bebes"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Descrição</label>
                <textarea 
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Layout</label>
                  <select
                    value={formData.layout_type || 'grid'}
                    onChange={e => setFormData({...formData, layout_type: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
                  >
                    <option value="grid">Grade (Grid)</option>
                    <option value="carousel">Carrossel (Horizontal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Ordem de Exibição</label>
                  <input 
                    type="number"
                    required
                    value={formData.sort_order || 0}
                    onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="active-checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="rounded border-neutral-300 text-black focus:ring-black"
                />
                <label htmlFor="active-checkbox" className="text-sm font-medium">Categoria Ativa</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-4 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-2 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Layout</th>
                <th className="px-6 py-4">Ordem</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Carregando...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {cat.name}
                      {cat.description && <p className="text-xs text-neutral-500 font-normal mt-0.5 line-clamp-1">{cat.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {cat.layout_type === 'grid' ? 'Grade' : 'Carrossel'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          cat.active 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200'
                        }`}
                      >
                        {cat.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {cat.active ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
