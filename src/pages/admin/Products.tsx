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
  Gift,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { SubproductsManager } from '@/components/admin/SubproductsManager';
import { fetchAddonCountsByProduct } from '@/lib/subproducts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
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
  is_featured: boolean;
  is_best_seller?: boolean;
  display_order?: number;
  collection?: string | null;
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

// ─── Price & UUID Helpers ────────────────────────────────────────────────────

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 UUID generator for environments without crypto.randomUUID (e.g. non-HTTPS/older webviews)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function parsePrice(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : Math.round(value * 100) / 100;

  const raw = value.toString().replace(/R\$\s?/gi, '').trim();
  if (!raw) return 0;

  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');

  let normalized = raw;
  if (lastDot !== -1 && lastComma !== -1) {
    if (lastComma > lastDot) {
      // Formato brasileiro: 1.250,50 -> remove pontos, troca vírgula por ponto
      normalized = raw.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,250.50 -> remove vírgulas
      normalized = raw.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // Apenas vírgula: 49,90 -> troca por ponto
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else if (lastDot !== -1) {
    // Apenas ponto: verificar se é separador de milhar (ex: 1.000) ou decimal (ex: 49.90)
    const dotCount = (raw.match(/\./g) || []).length;
    if (dotCount > 1) {
      normalized = raw.replace(/\./g, '');
    } else {
      const parts = raw.split('.');
      if (parts[1] && parts[1].length === 3 && parseInt(parts[0], 10) >= 1) {
        normalized = raw.replace('.', '');
      }
    }
  }

  normalized = normalized.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parsePrice(value) : value;
  if (isNaN(num)) return '';
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
  is_featured: boolean;
  is_best_seller: boolean;
  display_order: number;
  collection: string;
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
  is_featured: false,
  is_best_seller: false,
  display_order: 1,
  collection: '',
  short_description: '',
  detailed_description: '',
  specifications: [],
  observations: '',
  category_id: '',
  active: true,
  sort_order: 1,
});

const MAX_FILE_SIZE_MB = 10;

// ─── Storage Error Parser ───────────────────────────────────────────────────

export function parseStorageError(error: any): string {
  if (!error) return 'Erro desconhecido ao enviar imagem.';
  const msg = typeof error === 'string' ? error : (error.message || '');
  const status = error.status || error.statusCode;

  if (msg.includes('Sessão expirada') || msg.includes('não autenticada')) {
    return 'Sessão expirada. Por favor, faça login novamente no painel.';
  }
  if (msg.includes('row-level security') || status === '403' || status === 403 || error.code === 'AccessDenied') {
    return 'Permissão negada (RLS). Sua sessão de administrador pode ter expirado ou precisa ser renovada. Faça logout e login novamente no painel.';
  }
  if (msg.includes('Payload too large') || status === '413' || status === 413) {
    return `A imagem é muito grande. O limite máximo é de ${MAX_FILE_SIZE_MB}MB.`;
  }
  if (msg.includes('Bucket not found') || status === '404' || status === 404) {
    return 'O bucket de imagens "product-images" não foi encontrado no Supabase.';
  }
  if (msg.includes('JWT') || msg.includes('token') || msg.includes('auth') || status === 401 || status === '401') {
    return 'Sessão expirada. Por favor, faça login novamente no painel.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
    return 'Falha de conexão com o Supabase. Verifique sua conexão com a internet.';
  }
  return msg || 'Falha ao processar o arquivo no servidor.';
}

// ─── Session Validator & Auto-refresh ───────────────────────────────────────

async function checkAndRefreshAdminSession(): Promise<void> {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData?.session) {
    throw new Error('Sessão expirada ou não autenticada. Por favor, faça login novamente no painel.');
  }

  const session = sessionData.session;
  const expiresAt = session.expires_at;
  // Se faltar menos de 2 minutos para expirar ou já expirou, renova proativamente
  if (expiresAt && (expiresAt * 1000 - Date.now() < 120000)) {
    try {
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !refreshed?.session) {
        throw new Error('Sessão expirada. Por favor, faça login novamente no painel.');
      }
    } catch {
      throw new Error('Sessão expirada. Por favor, faça login novamente no painel.');
    }
  }
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadImage(
  file: File,
  productId: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  // 1. Validar e renovar sessão de administrador
  await checkAndRefreshAdminSession();

  // 2. Sanitizar extensão e MIME type
  const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
  const cleanExt = rawExt.replace(/[^a-z0-9]/g, '') || (file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg');
  
  let mimeType = file.type || '';
  if (!mimeType || mimeType === 'application/octet-stream') {
    mimeType = cleanExt === 'png' ? 'image/png' : cleanExt === 'webp' ? 'image/webp' : 'image/jpeg';
  }

  // 3. Sanitizar identificador do produto
  const cleanProductId = (productId && productId.trim() !== '' && productId !== 'undefined')
    ? productId.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    : 'temp';

  const timestamp = Date.now();
  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const fileName = `${timestamp}_${uniqueSuffix}.${cleanExt}`;
  
  // Caminho esperado conforme padrão da loja: products/{id}/{timestamp}.ext
  const primaryPath = `products/${cleanProductId}/${fileName}`;

  onProgress?.('Enviando imagem...');

  let { error } = await supabase.storage
    .from('product-images')
    .upload(primaryPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType,
    });

  let finalPath = primaryPath;

  // Fallback seguro caso a política RLS exija caminho raiz para produtos
  if (error && (error.message?.includes('row-level security') || (error as any).statusCode === '403')) {
    const fallbackPath = `${Date.now()}_prod_${cleanProductId}_${uniqueSuffix}.${cleanExt}`;
    console.warn(`[uploadImage] Tentando fallback para caminho seguro: ${fallbackPath}`);
    const retry = await supabase.storage
      .from('product-images')
      .upload(fallbackPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      });

    if (!retry.error) {
      error = null;
      finalPath = fallbackPath;
    }
  }

  if (error) {
    console.error('[Upload de Imagem] Falha na operação:', {
      path: primaryPath,
      fileSize: file.size,
      mimeType,
      status: error.status,
      statusCode: (error as any).statusCode,
      message: error.message,
    });
    throw error;
  }

  const { data: pubData } = supabase.storage.from('product-images').getPublicUrl(finalPath);
  if (!pubData?.publicUrl) {
    throw new Error('Falha ao obter URL pública da imagem após o upload.');
  }

  return pubData.publicUrl;
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
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const isAllowed = allowedTypes.includes(file.type?.toLowerCase()) || allowedExts.includes(cleanExt);
    if (!isAllowed) {
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
      console.error('[ImagePicker] Erro:', e);
      const friendlyMsg = parseStorageError(e);
      toast.error(`Não foi possível enviar a imagem: ${friendlyMsg}`);
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
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const isAllowed = allowedTypes.includes(file.type?.toLowerCase()) || allowedExts.includes(cleanExt);
    if (!isAllowed) {
      toast.error('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Máximo ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, productId);
      onChange([...gallery, url]);
      toast.success('Imagem adicionada à galeria!');
    } catch (e: any) {
      console.error('[GalleryPicker] Erro:', e);
      const friendlyMsg = parseStorageError(e);
      toast.error(`Não foi possível enviar a imagem: ${friendlyMsg}`);
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
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
  const queryClient = useQueryClient();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);
  const [updatingBestSellerId, setUpdatingBestSellerId] = useState<string | null>(null);

  // Colunas confirmadas existentes na tabela public.products
  const [existingColumns, setExistingColumns] = useState<Set<string>>(() => new Set([
    'id', 'category_id', 'name', 'description', 'price', 'image_url', 'sort_order',
    'active', 'created_at', 'updated_at', 'image', 'gallery', 'is_promo', 'is_new',
    'short_description', 'detailed_description', 'specifications', 'observations',
    'promo_price', 'is_featured'
  ]));

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

  // Subproduct / Addon counts
  const [addonCounts, setAddonCounts] = useState<Record<string, number>>({});

  // Generate a stable temp ID for new product uploads
  const [tempId] = useState(() => generateUUID());

  // ── Helper Categorias ──────────────────────────────────────────────────────
  const isBasketCategory = (c: Category) => {
    const slug = c?.slug || '';
    const name = c?.name || '';
    return slug.startsWith('cesta-') || name.toLowerCase().includes('cesta');
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, counts] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(name)')
          .order('sort_order', { ascending: true }),
        supabase.from('categories').select('id, name, slug, active').order('sort_order', { ascending: true }),
        fetchAddonCountsByProduct().catch(err => {
          console.warn('Erro ao carregar contagem de adicionais:', err);
          return {};
        }),
      ]);

      if (prodRes.error) {
        toast.error(`Não foi possível carregar os produtos: ${prodRes.error.message}`);
        console.error(prodRes.error);
      } else {
        const prodList = (prodRes.data as Product[]) || [];
        setProducts(prodList);
        if (prodList.length > 0) {
          const detected = new Set([
            'id', 'category_id', 'name', 'description', 'price', 'image_url', 'sort_order',
            'active', 'created_at', 'updated_at', 'image', 'gallery', 'is_promo', 'is_new',
            'short_description', 'detailed_description', 'specifications', 'observations',
            'promo_price', 'is_featured'
          ]);
          Object.keys(prodList[0]).forEach(k => detected.add(k));
          setExistingColumns(detected);
        }
      }

      if (catRes.error) {
        console.error(catRes.error);
      } else {
        setCategories((catRes.data as Category[]) || []);
      }

      if (counts) {
        setAddonCounts(counts);
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do painel:', err);
      toast.error('Erro ao carregar produtos. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = (products || []).filter(p => {
    if (!p) return false;
    const pName = p.name || '';
    const matchSearch = !search || pName.toLowerCase().includes(search.toLowerCase());
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
      is_featured: p.is_featured ?? false,
      is_best_seller: p.is_best_seller ?? false,
      display_order: p.display_order ?? (p.sort_order ?? 1),
      collection: p.collection ?? '',
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
          is_featured: p.is_featured ?? false,
          is_best_seller: p.is_best_seller ?? false,
          display_order: p.display_order ?? (p.sort_order ?? 1),
          collection: p.collection ?? '',
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
      setFormData({ ...emptyForm(), sort_order: products.length + 1, display_order: products.length + 1 });
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
    if (!formData.name.trim()) { toast.error('Nome do produto é obrigatório.'); return; }
    if (!formData.price.trim()) { toast.error('Preço do produto é obrigatório.'); return; }

    const numericPrice = parsePrice(formData.price);
    if (numericPrice <= 0) {
      toast.error('Informe um preço válido maior que zero.');
      return;
    }

    let numericPromoPrice: number | null = null;
    if (formData.is_promo) {
      numericPromoPrice = parsePrice(formData.promo_price);
      if (!numericPromoPrice || numericPromoPrice <= 0) {
        toast.error('Informe um preço promocional válido maior que zero.');
        return;
      }
      if (numericPromoPrice >= numericPrice) {
        toast.error('O preço promocional deve ser estritamente menor que o preço original.');
        return;
      }
    }

    setSaving(true);

    const mainImg = (formData.image && formData.image.trim())
      ? formData.image.trim()
      : (formData.gallery && formData.gallery.length > 0 && formData.gallery[0] ? formData.gallery[0].trim() : null);

    const validGallery = Array.isArray(formData.gallery)
      ? formData.gallery.map(url => (typeof url === 'string' ? url.trim() : '')).filter(Boolean)
      : [];

    const cleanCategoryId = (formData.category_id && formData.category_id.trim() !== '')
      ? formData.category_id.trim()
      : null;

    const validSpecs = Array.isArray(formData.specifications)
      ? formData.specifications.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
      : [];

    const sortOrder = Number.isInteger(formData.sort_order) && formData.sort_order > 0
      ? formData.sort_order
      : (products.length + 1);

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      price: numericPrice,
      promo_price: numericPromoPrice,
      image: mainImg,
      gallery: validGallery.length > 0 ? validGallery : null,
      is_promo: formData.is_promo,
      is_new: formData.is_new,
      is_featured: formData.is_featured,
      short_description: formData.short_description?.trim() || null,
      detailed_description: formData.detailed_description?.trim() || null,
      specifications: validSpecs.length > 0 ? validSpecs : null,
      observations: formData.observations?.trim() || null,
      category_id: cleanCategoryId,
      active: formData.active,
      sort_order: sortOrder,
    };

    // Colunas opcionais: só envia se comprovadamente existirem no banco
    if (existingColumns.has('is_best_seller')) {
      payload.is_best_seller = formData.is_best_seller;
    }
    if (existingColumns.has('display_order')) {
      payload.display_order = formData.display_order || sortOrder;
    }
    if (existingColumns.has('collection')) {
      payload.collection = formData.collection?.trim() || null;
    }

    try {
      // 1. Tentar renovar sessão se aplicável
      try {
        await checkAndRefreshAdminSession();
      } catch (sessionErr: any) {
        console.warn('[Products:handleSubmit] Aviso ao verificar sessão administrativa:', sessionErr?.message);
      }

      // Função de execução que suporta re-tentativa caso falte coluna no schema do Supabase
      const executeSave = async (currentPayload: Record<string, any>) => {
        if (editingId) {
          return await supabase.from('products').update(currentPayload).eq('id', editingId);
        } else {
          return await supabase.from('products').insert([currentPayload]);
        }
      };

      let saveRes = await executeSave(payload);

      // Tratamento resiliente caso uma coluna opcional não exista no Supabase (PGRST204 ou 42703)
      if (saveRes.error && (saveRes.error.code === 'PGRST204' || saveRes.error.code === '42703')) {
        const missingMatch = saveRes.error.message?.match(/column [products.]*([a-zA-Z0-9_]+) does not exist/i)
          || saveRes.error.message?.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);
        if (missingMatch && missingMatch[1]) {
          const missingCol = missingMatch[1];
          console.warn(`[Products:handleSubmit] Coluna "${missingCol}" inexistente no Supabase. Retentando sem ela.`);
          delete payload[missingCol];
          setExistingColumns(prev => {
            const next = new Set(prev);
            next.delete(missingCol);
            return next;
          });
          saveRes = await executeSave(payload);
        }
      }

      if (saveRes.error) {
        throw saveRes.error;
      }

      toast.success(editingId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['public-catalog'] });
      const draftKey = editingId ? `vs_admin_draft_edit_${editingId}` : 'vs_admin_draft_new';
      localStorage.removeItem(draftKey);
      closePanel();
      fetchAll();
    } catch (err: any) {
      console.error('[Products:handleSubmit] Erro ao salvar produto no Supabase:', err);
      const errorMsg = err?.message || 'Erro desconhecido ao salvar produto.';
      const errorCode = err?.code ? ` (${err.code})` : '';

      let friendly = `Não foi possível salvar esse produto: ${errorMsg}${errorCode}`;
      if (err?.code === '42501' || errorMsg.includes('row-level security')) {
        friendly = 'Permissão negada (RLS). Sua sessão de administrador pode ter expirado ou não possui perfil autorizado. Faça logout e login novamente no painel.';
      } else if (err?.code === '23503') {
        friendly = 'A categoria selecionada não foi encontrada no banco de dados. Atualize a página e selecione uma categoria válida.';
      } else if (err?.code === '23502') {
        friendly = `Campo obrigatório ausente no banco de dados: ${errorMsg}`;
      } else if (err?.code === '22P02') {
        friendly = `Formato de dados ou valor numérico incompatível: ${errorMsg}`;
      } else if (err?.code === 'PGRST204') {
        friendly = `Incompatibilidade de esquema no Supabase: ${errorMsg}`;
      }

      toast.error(friendly);
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
      queryClient.invalidateQueries({ queryKey: ['public-catalog'] });
      fetchAll();
    } catch (err: any) {
      console.error('[toggleActive] Erro:', err);
      toast.error(`Não foi possível alterar o status: ${err?.message || 'Erro no banco'}`);
    }
  };

  // ── Toggle featured (1-click star) ─────────────────────────────────────────

  const toggleFeatured = async (p: Product) => {
    if (updatingFeaturedId === p.id) return;
    const nextFeatured = !p.is_featured;
    setUpdatingFeaturedId(p.id);

    // Atualização otimista imediata na interface
    setProducts(prev =>
      prev.map(item => (item.id === p.id ? { ...item, is_featured: nextFeatured } : item))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: nextFeatured })
        .eq('id', p.id);

      if (error) throw error;

      if (nextFeatured) {
        toast.success('Produto adicionado aos destaques!');
      } else {
        toast.success('Produto removido dos destaques.');
      }

      // Invalida cache do catálogo público para sincronização imediata
      queryClient.invalidateQueries({ queryKey: ['public-catalog'] });
    } catch (err: any) {
      console.error('[toggleFeatured] Erro:', err);
      // Reversão em caso de erro
      setProducts(prev =>
        prev.map(item => (item.id === p.id ? { ...item, is_featured: p.is_featured } : item))
      );
      toast.error(`Não foi possível atualizar o destaque: ${err?.message || 'Erro no banco'}`);
    } finally {
      setUpdatingFeaturedId(null);
    }
  };

  // ── Toggle best seller (1-click Mais Pedido) ──────────────────────────────

  const toggleBestSeller = async (p: Product) => {
    if (updatingBestSellerId === p.id) return;

    if (!existingColumns.has('is_best_seller')) {
      toast.info('A funcionalidade "Mais Pedido" requer a aplicação da migração de Natal no banco Supabase.');
      return;
    }

    const nextBestSeller = !p.is_best_seller;
    setUpdatingBestSellerId(p.id);

    // Atualização otimista imediata na interface
    setProducts(prev =>
      prev.map(item => (item.id === p.id ? { ...item, is_best_seller: nextBestSeller } : item))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_best_seller: nextBestSeller })
        .eq('id', p.id);

      if (error) throw error;

      if (nextBestSeller) {
        toast.success('Produto marcado como MAIS PEDIDO!');
      } else {
        toast.success('Selo Mais Pedido removido do produto.');
      }

      // Invalida cache do catálogo público para sincronização imediata
      queryClient.invalidateQueries({ queryKey: ['public-catalog'] });
    } catch (err: any) {
      console.error('[toggleBestSeller] Erro:', err);
      // Reversão em caso de erro
      setProducts(prev =>
        prev.map(item => (item.id === p.id ? { ...item, is_best_seller: p.is_best_seller } : item))
      );
      toast.error(`Não foi possível atualizar o selo Mais Pedido: ${err?.message || 'Erro no banco'}`);
    } finally {
      setUpdatingBestSellerId(null);
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

      toast.success('Produto excluído com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['public-catalog'] });
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      console.error('[handleDelete] Erro ao excluir produto:', err);
      toast.error(`Não foi possível excluir o produto: ${err?.message || 'Erro no banco'}`);
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
                      {/* Grupo Cestas com suas subseções */}
                      {categories.some(isBasketCategory) && (
                        <optgroup label="Cestas (Subcategorias)">
                          {categories
                            .filter(isBasketCategory)
                            .map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name}{!c.active ? ' (inativa)' : ''}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {/* Demais Categorias */}
                      <optgroup label="Outras Categorias Principais">
                        {categories
                          .filter(c => !isBasketCategory(c))
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}{!c.active ? ' (inativa)' : ''}
                            </option>
                          ))}
                      </optgroup>
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
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Coleção Temática</label>
                  <input
                    type="text"
                    value={formData.collection}
                    onChange={e => setFormData({ ...formData, collection: e.target.value })}
                    placeholder="Ex: natal, dia-das-maes"
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Status e Destaques Especiais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-xs sm:text-sm font-medium">Produto ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={formData.is_best_seller} onChange={e => setFormData({ ...formData, is_best_seller: e.target.checked })} className="w-4 h-4 rounded accent-amber-500" />
                  <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">🔥 MAIS PEDIDO</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded accent-amber-500" />
                  <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">⭐ Destaque Geral</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={formData.is_promo} onChange={e => setFormData({ ...formData, is_promo: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-xs sm:text-sm font-medium">Promoção</span>
                </label>
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

              {/* ── Subprodutos e Adicionais ── */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <SubproductsManager
                  productId={uploadTargetId}
                  productName={formData.name || 'Produto'}
                  isNewProduct={!editingId}
                  onCountChange={(count) => {
                    if (editingId) {
                      setAddonCounts(prev => ({ ...prev, [editingId]: count }));
                    }
                  }}
                />
              </div>

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
                {categories.some(isBasketCategory) && (
                  <optgroup label="Cestas (Subcategorias)">
                    {categories
                      .filter(isBasketCategory)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </optgroup>
                )}
                <optgroup label="Outras Categorias">
                  {categories
                    .filter(c => !isBasketCategory(c))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </optgroup>
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
                            <div
                              onClick={() => openEdit(p)}
                              className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              title="Clique para editar"
                            >
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <PackageX size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className="font-medium text-sm leading-tight text-left hover:underline cursor-pointer block"
                                title="Clique para editar"
                              >
                                {p.name}
                              </button>
                              <div className="flex gap-1 mt-0.5 flex-wrap items-center">
                                {p.is_best_seller && (
                                  <button
                                    type="button"
                                    disabled={updatingBestSellerId === p.id}
                                    onClick={() => toggleBestSeller(p)}
                                    title="Clique para remover o selo Mais Pedido"
                                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer shadow-xs"
                                  >
                                    🔥 MAIS PEDIDO
                                  </button>
                                )}
                                {p.collection && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                    🎄 {p.collection}
                                  </span>
                                )}
                                {p.is_featured && (
                                  <button
                                    type="button"
                                    disabled={updatingFeaturedId === p.id}
                                    onClick={() => toggleFeatured(p)}
                                    title="Clique para remover dos destaques"
                                    className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
                                  >
                                    ⭐ Destaque
                                  </button>
                                )}
                                {p.is_promo && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">Promo</span>}
                                {p.is_new && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">Novo</span>}
                                {addonCounts[p.id] ? (
                                  <span className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Gift size={10} className="text-store-pink" />
                                    <span>{addonCounts[p.id]} {addonCounts[p.id] === 1 ? 'adicional' : 'adicionais'}</span>
                                  </span>
                                ) : null}
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
                              type="button"
                              disabled={updatingFeaturedId === p.id}
                              onClick={() => toggleFeatured(p)}
                              className={`p-2 rounded-lg transition-colors ${
                                p.is_featured
                                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                  : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              } disabled:opacity-50`}
                              title={p.is_featured ? "Remover dos destaques" : "Adicionar aos destaques"}
                            >
                              {updatingFeaturedId === p.id ? (
                                <Loader2 size={15} className="animate-spin text-amber-500" />
                              ) : (
                                <Star
                                  size={15}
                                  className={p.is_featured ? "fill-amber-400 text-amber-500" : "text-neutral-400 hover:text-amber-500"}
                                />
                              )}
                            </button>
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
                  <div key={p.id} className="p-4 flex gap-3 items-start touch-manipulation">
                    {/* Image */}
                    <div
                      onClick={() => openEdit(p)}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 cursor-pointer hover:opacity-80 transition-opacity touch-manipulation"
                      title="Clique para editar"
                    >
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
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="font-semibold text-sm leading-tight line-clamp-2 text-left hover:underline cursor-pointer touch-manipulation"
                          title="Clique para editar"
                        >
                          {p.name}
                        </button>
                        <span className="font-semibold text-sm shrink-0">{formatPrice(p.price)}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {(p.categories as any)?.name ?? 'Sem categoria'}
                        {' · '}Ordem: {p.sort_order}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {p.is_best_seller && (
                          <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            🔥 MAIS PEDIDO
                          </span>
                        )}
                        {p.collection && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                            🎄 {p.collection}
                          </span>
                        )}
                        {p.is_featured && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">⭐ Destaque</span>}
                        {p.is_promo && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Promo</span>}
                        {p.is_new && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Novo</span>}
                        {addonCounts[p.id] ? (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Gift size={10} className="text-store-pink" />
                            <span>{addonCounts[p.id]} {addonCounts[p.id] === 1 ? 'adicional' : 'adicionais'}</span>
                          </span>
                        ) : null}
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium touch-manipulation ${
                            p.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          {p.active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {p.active ? 'Ativo' : 'Inativo'}
                        </button>
                        <button
                          type="button"
                          disabled={updatingFeaturedId === p.id}
                          onClick={() => toggleFeatured(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                            p.is_featured
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                          } disabled:opacity-50`}
                          title={p.is_featured ? "Remover dos destaques" : "Adicionar aos destaques"}
                        >
                          {updatingFeaturedId === p.id ? (
                            <Loader2 size={11} className="animate-spin text-amber-500" />
                          ) : (
                            <Star
                              size={11}
                              className={p.is_featured ? "fill-amber-400 text-amber-500" : "text-neutral-400"}
                            />
                          )}
                          <span>{p.is_featured ? 'Destaque' : 'Destacar'}</span>
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors touch-manipulation"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-colors touch-manipulation"
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
