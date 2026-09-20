import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ImagePlus,
  X,
  ChevronDown,
  PackageX,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: string;
  promo_price: number | null;
  image: string | null;
  gallery: string[] | null;
  is_promo: boolean;
  is_new: boolean;
  short_description: string | null;
  detailed_description: string | null;
  specifications: string[] | null;
  observations: string | null;
  category_id: string | null;
  active: boolean;
  sort_order: number;
  // joined
  categories?: { name: string } | null;
}

// ─── Price Helpers ────────────────────────────────────────────────────────────

function parsePrice(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Remove R$, espaços e pontos de milhar, troca vírgula por ponto
  const cleaned = value.toString().replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return typeof value === 'string' ? value : '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

type FormData = {
  name: string;
  price: string;
  promo_price: string;
  image: string;
  gallery: string[];
  is_promo: boolean;
  is_new: boolean;
  short_description: string;
  detailed_description: string;
  specifications: string[];
  observations: string;
  category_id: string;
  active: boolean;
  sort_order: number;
};

const emptyForm = (): FormData => ({
  name: '',
  price: '',
  promo_price: '',
  image: '',
  gallery: [],
  is_promo: false,
  is_new: false,
  short_description: '',
  detailed_description: '',
  specifications: [],
  observations: '',
  category_id: '',
  active: true,
  sort_order: 1,
});

const MAX_FILE_SIZE_MB = 10;

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadImage(
  file: File,
  productId: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${Date.now()}.${ext}`;
  const path = `products/${productId}/${fileName}`;

  onProgress?.('Enviando imagem...');

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

async function removeStorageFile(url: string) {
  try {
    // Extract path from full public URL
    const marker = '/object/public/product-images/';
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const filePath = url.slice(idx + marker.length);
    await supabase.storage.from('product-images').remove([filePath]);
  } catch (e) {
    console.error('Storage remove error:', e);
  }
}

// ─── Image upload picker sub-component ───────────────────────────────────────

function ImagePicker({
  label,
  currentUrl,
  onUploaded,
  uploading,
  setUploading,
  productId,
}: {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  productId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);

  useEffect(() => setPreview(currentUrl), [currentUrl]);

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`A imagem deve ter menos de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, productId);
      setPreview(url);
      onUploaded(url);
      toast.success('Imagem enviada com sucesso!');
    } catch (e: any) {
      console.error(e);
      toast.error('Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={24} className="text-neutral-400" />
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {/* URL manual */}
          <input
            type="text"
            value={preview}
            onChange={e => { setPreview(e.target.value); onUploaded(e.target.value); }}
            placeholder="URL da imagem (ou faça upload)"
            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
          />

          {/* Upload button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={14} className="animate-spin" /> Enviando...</>
            ) : (
              <><ImagePlus size={14} /> Selecionar arquivo</>
            )}
          </button>
          <input
            ref={ref}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
          />
          <p className="text-[10px] text-neutral-400">JPG, PNG, WEBP — máx. {MAX_FILE_SIZE_MB}MB</p>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery picker sub-component ────────────────────────────────────────────

function GalleryPicker({
  gallery,
  onChange,
  productId,
}: {
  gallery: string[];
  onChange: (urls: string[]) => void;
  productId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { toast.error('Formato não suportado.'); return; }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { toast.error(`Máximo ${MAX_FILE_SIZE_MB}MB.`); return; }

    setUploading(true);
    try {
      const url = await uploadImage(file, productId);
      onChange([...gallery, url]);
      toast.success('Imagem adicionada à galeria!');
    } catch (e: any) {
      console.error(e);
      toast.error('Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">Galeria de Imagens <span className="text-neutral-400 font-normal">(opcional)</span></label>
      <div className="flex flex-wrap gap-2 mb-2">
        {gallery.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 group">
            <img src={url} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(gallery.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={uploading}
          onClick={() => ref.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /><span className="text-[10px] mt-1">Adicionar</span></>}
        </button>
        <input
          ref={ref}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}

// ─── Specifications editor ────────────────────────────────────────────────────

function SpecsEditor({ specs, onChange }: { specs: string[]; onChange: (s: string[]) => void }) {
  const [newSpec, setNewSpec] = useState('');

  const add = () => {
    const v = newSpec.trim();
    if (!v) return;
    onChange([...specs, v]);
    setNewSpec('');
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">Especificações <span className="text-neutral-400 font-normal">(itens do produto)</span></label>
      <div className="flex flex-col gap-1.5 mb-2">
        {specs.map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2 text-sm">
            <span className="flex-1 text-neutral-700 dark:text-neutral-300">{s}</span>
            <button type="button" onClick={() => onChange(specs.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSpec}
          onChange={e => setNewSpec(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Ex: Caixa personalizada..."
          className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  open,
  productName,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <h3 className="font-bold text-base">Excluir produto?</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tem certeza que deseja excluir <strong>"{productName}"</strong>? Esta ação não poderá ser desfeita.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 px-4 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Products() {
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Form panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Generate a stable temp ID for new product uploads
  const [tempId] = useState(() => crypto.randomUUID());

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name)')
        .order('sort_order', { ascending: true }),
      supabase.from('categories').select('id, name, active').order('name'),
    ]);

    if (prodRes.error) {
      toast.error('Não foi possível carregar os produtos.');
      console.error(prodRes.error);
    } else {
      setProducts(prodRes.data as Product[]);
    }

    if (catRes.error) {
      console.error(catRes.error);
    } else {
      setCategories(catRes.data as Category[]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category_id === filterCat;
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? p.active :
      !p.active;
    return matchSearch && matchCat && matchStatus;
  });

  // ── Open form ──────────────────────────────────────────────────────────────

  const openNew = () => {
    const base = { ...emptyForm(), sort_order: products.length + 1 };
    const draftKey = 'vs_admin_draft_new';
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
        toast.info("Rascunho restaurado!");
      } catch(e) {
        setFormData(base);
      }
    } else {
      setFormData(base);
    }
    setEditingId(null);
    setPanelOpen(true);
  };

  const openEdit = (p: Product) => {
    const base = {
      name: p.name ?? '',
      price: formatPrice(p.price) || '',
      promo_price: p.promo_price ? formatPrice(p.promo_price) : '',
      image: p.image ?? '',
      gallery: p.gallery ?? [],
      is_promo: p.is_promo ?? false,
      is_new: p.is_new ?? false,
      short_description: p.short_description ?? '',
      detailed_description: p.detailed_description ?? '',
      specifications: p.specifications ?? [],
      observations: p.observations ?? '',
      category_id: p.category_id ?? '',
      active: p.active ?? true,
      sort_order: p.sort_order ?? 1,
    };
    
    const draftKey = `vs_admin_draft_edit_${p.id}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
        toast.info("Rascunho restaurado!");
      } catch(e) {
        setFormData(base);
      }
    } else {
      setFormData(base);
    }
    setEditingId(p.id);
    setPanelOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePanel = () => { setPanelOpen(false); setEditingId(null); };

  const clearDraft = () => {
    const draftKey = editingId ? `vs_admin_draft_edit_${editingId}` : 'vs_admin_draft_new';
    localStorage.removeItem(draftKey);
    
    if (editingId) {
      const p = products.find(prod => prod.id === editingId);
      if (p) {
        setFormData({
          name: p.name ?? '',
          price: formatPrice(p.price) || '',
          promo_price: p.promo_price ? formatPrice(p.promo_price) : '',
          image: p.image ?? '',
          gallery: p.gallery ?? [],
          is_promo: p.is_promo ?? false,
          is_new: p.is_new ?? false,
          short_description: p.short_description ?? '',
          detailed_description: p.detailed_description ?? '',
          specifications: p.specifications ?? [],
          observations: p.observations ?? '',
          category_id: p.category_id ?? '',
          active: p.active ?? true,
          sort_order: p.sort_order ?? 1,
        });
      }
    } else {
      setFormData({ ...emptyForm(), sort_order: products.length + 1 });
    }
    toast.success("Rascunho descartado.");
  };

  useEffect(() => {
    if (panelOpen) {
      const draftKey = editingId ? `vs_admin_draft_edit_${editingId}` : 'vs_admin_draft_new';
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, panelOpen, editingId]);

  // ── Save product ───────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Nome obrigatório.'); return; }
    if (!formData.price.trim()) { toast.error('Preço obrigatório.'); return; }

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      price: parsePrice(formData.price),
      promo_price: parsePrice(formData.promo_price) || null,
      image: formData.image || null,
      gallery: formData.gallery.length > 0 ? formData.gallery : null,
      is_promo: formData.is_promo,
      is_new: formData.is_new,
      short_description: formData.short_description || null,
      detailed_description: formData.detailed_description || null,
      specifications: formData.specifications.length > 0 ? formData.specifications : null,
      observations: formData.observations || null,
      category_id: formData.category_id || null,
      active: formData.active,
      sort_order: formData.sort_order,
    };

    if (payload.is_promo && payload.promo_price) {
      if (payload.promo_price >= payload.price) {
        toast.error('O preço promocional deve ser menor que o preço original.');
        setSaving(false);
        return;
      }
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }
      const draftKey = editingId ? `vs_admin_draft_edit_${editingId}` : 'vs_admin_draft_new';
      localStorage.removeItem(draftKey);
      closePanel();
      fetchAll();
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────

  const toggleActive = async (p: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !p.active })
        .eq('id', p.id);
      if (error) throw error;
      toast.success(`Produto ${p.active ? 'desativado' : 'ativado'} com sucesso.`);
      fetchAll();
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível alterar o status.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Collect image URLs to delete from storage
      const urlsToDelete: string[] = [];
      if (deleteTarget.image) urlsToDelete.push(deleteTarget.image);
      if (deleteTarget.gallery) urlsToDelete.push(...deleteTarget.gallery);

      const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id);
      if (error) throw error;

      // Best-effort: remove storage files for this product only
      for (const url of urlsToDelete) {
        if (url.includes(`/products/${deleteTarget.id}/`)) {
          await removeStorageFile(url);
        }
      }

      toast.success('Produto excluído.');
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível excluir o produto.');
    } finally {
      setDeleting(false);
    }
  };

  // ── The product ID to use for uploads (real ID if editing, temp if new) ───

  const uploadTargetId = editingId ?? tempId;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <DeleteModal
        open={!!deleteTarget}
        productName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <div className="space-y-6 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Gerencie o catálogo de produtos da loja.
            </p>
          </div>
          <button
            onClick={openNew}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={16} />
            Novo Produto
          </button>
        </div>

        {/* ── Form Panel ── */}
        {panelOpen && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <h3 className="font-semibold text-base">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Row 1: Name + Price + Promo Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Nome do produto *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Caixa Café da Manhã"
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Preço Original *</label>
                  <input
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder='Ex: R$ 49,90'
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-neutral-500">
                    Preço Promocional {formData.is_promo && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  <input
                    required={formData.is_promo}
                    disabled={!formData.is_promo}
                    value={formData.promo_price}
                    onChange={e => setFormData({ ...formData, promo_price: e.target.value })}
                    placeholder={formData.is_promo ? 'Ex: R$ 39,90' : 'Marque "Promoção"'}
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Row 2: Category + Sort + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Categoria</label>
                  <div className="relative">
                    <select
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                      <option value="">Sem categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}{!c.active ? ' (inativa)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Ordem de exibição</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium">Produto ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={formData.is_promo} onChange={e => setFormData({ ...formData, is_promo: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">Promoção</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({ ...formData, is_new: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm">Novidade</span>
                  </label>
                </div>
              </div>

              {/* Main image */}
              <ImagePicker
                label="Imagem principal"
                currentUrl={formData.image}
                onUploaded={url => setFormData(f => ({ ...f, image: url }))}
                uploading={imageUploading}
                setUploading={setImageUploading}
                productId={uploadTargetId}
              />

              {/* Gallery */}
              <GalleryPicker
                gallery={formData.gallery}
                onChange={urls => setFormData(f => ({ ...f, gallery: urls }))}
                productId={uploadTargetId}
              />

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-medium mb-1.5">Descrição curta</label>
                <textarea
                  value={formData.short_description}
                  onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  placeholder="Breve descrição exibida no catálogo..."
                  className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Descrição detalhada</label>
                <textarea
                  value={formData.detailed_description}
                  onChange={e => setFormData({ ...formData, detailed_description: e.target.value })}
                  rows={4}
                  placeholder="Descrição completa do produto..."
                  className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={e => setFormData({ ...formData, observations: e.target.value })}
                  rows={2}
                  placeholder="Ex: As imagens são meramente ilustrativas..."
                  className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              {/* Specifications */}
              <SpecsEditor
                specs={formData.specifications}
                onChange={specs => setFormData(f => ({ ...f, specifications: specs }))}
              />

              {/* Form actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={closePanel}
                  className="sm:w-auto flex-1 py-2.5 px-6 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="sm:w-auto flex-1 py-2.5 px-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Limpar Rascunho
                </button>
                <button
                  type="submit"
                  disabled={saving || imageUploading}
                  className="sm:w-auto flex-[2] py-2.5 px-6 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar produto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar produto..."
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Category filter */}
            <div className="relative sm:w-48">
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-900 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="">Todas categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 sm:flex-none px-3 py-2.5 text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Inativos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product List ── */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm">Carregando produtos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
              <PackageX size={40} className="opacity-40" />
              <p className="text-sm font-medium">Nenhum produto encontrado.</p>
              {!panelOpen && (
                <button onClick={openNew} className="text-xs text-black dark:text-white underline underline-offset-2 hover:opacity-70">
                  Criar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3.5">Produto</th>
                      <th className="px-5 py-3.5">Preço</th>
                      <th className="px-5 py-3.5">Categoria</th>
                      <th className="px-5 py-3.5">Ordem</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filtered.map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <PackageX size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-tight">{p.name}</p>
                              <div className="flex gap-1 mt-0.5">
                                {p.is_promo && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">Promo</span>}
                                {p.is_new && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">Novo</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium">{formatPrice(p.price)}</td>
                        <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 text-sm">
                          {(p.categories as any)?.name ?? <span className="italic opacity-50">Sem categoria</span>}
                        </td>
                        <td className="px-5 py-4 text-neutral-500">{p.sort_order}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleActive(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              p.active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200'
                            }`}
                          >
                            {p.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {p.active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map(p => (
                  <div key={p.id} className="p-4 flex gap-3 items-start">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <PackageX size={18} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm leading-tight line-clamp-2">{p.name}</p>
                        <span className="font-semibold text-sm shrink-0">{formatPrice(p.price)}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {(p.categories as any)?.name ?? 'Sem categoria'}
                        {' · '}Ordem: {p.sort_order}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {p.is_promo && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Promo</span>}
                        {p.is_new && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Novo</span>}
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            p.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          {p.active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {p.active ? 'Ativo' : 'Inativo'}
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={11} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              {products.length !== filtered.length && ` de ${products.length} total`}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
