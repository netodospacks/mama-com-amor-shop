import React, { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Subproduct, SubproductInput } from '@/types/subproduct';
import {
  fetchSubproductsForProductAdmin,
  fetchAllSubproductsAdmin,
  saveSubproduct,
  linkSubproductToProduct,
  unlinkSubproductFromProduct,
  deleteSubproduct,
  toggleSubproductStatus,
  formatSubproductPrice,
  parseSubproductPrice,
} from '@/lib/subproducts';
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ImagePlus,
  X,
  Link as LinkIcon,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface SubproductsManagerProps {
  productId: string;
  productName: string;
  isNewProduct?: boolean;
  onCountChange?: (count: number) => void;
}

const MAX_FILE_SIZE_MB = 10;

export function SubproductsManager({
  productId,
  productName,
  isNewProduct = false,
  onCountChange,
}: SubproductsManagerProps) {
  const [subproducts, setSubproducts] = useState<Subproduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Form para criar ou editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subproduct | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Modal para vincular adicional já existente
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [allStoreSubproducts, setAllStoreSubproducts] = useState<Subproduct[]>([]);
  const [loadingStoreSubs, setLoadingStoreSubs] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');

  // Confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<Subproduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSubproducts = async () => {
    if (!productId || isNewProduct) {
      setSubproducts([]);
      onCountChange?.(0);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSubproductsForProductAdmin(productId);
      setSubproducts(data);
      onCountChange?.(data.length);
    } catch (err) {
      console.error('Erro ao carregar subprodutos no admin:', err);
      toast.error('Erro ao carregar adicionais vinculados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubproducts();
  }, [productId, isNewProduct]);

  // Upload de imagem do subproduto para o bucket product-images
  const handleImageFile = async (file: File) => {
    if (!file) return;

    // Validação resiliente de formato (por MIME type e por extensão)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileExt = (file.name.split('.').pop() || '').toLowerCase();
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);
    const isAllowedMime = allowedTypes.includes(file.type) || (file.type === '' && isAllowedExt);

    if (!isAllowedMime) {
      toast.error('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`A imagem deve ter menos de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    if (!isSupabaseConfigured) {
      // Cria blob URL local para preview em modo teste/local
      const localUrl = URL.createObjectURL(file);
      setImage(localUrl);
      toast.success('Imagem selecionada (modo local)!');
      return;
    }

    setImageUploading(true);
    try {
      // 1. Verificar se a sessão do administrador está ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('[SubproductsManager] Sessão ausente ao tentar upload:', sessionError);
        toast.error('Sessão expirada ou não autenticada. Faça login novamente no painel.');
        return;
      }

      // 2. Gerar nome de arquivo limpo, seguro e único
      const cleanExt = (fileExt === 'jpeg' ? 'jpg' : fileExt) || 'jpg';
      const rawBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
      const safeBase = rawBase
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 30) || 'sub';

      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${Date.now()}_${safeBase}_${uniqueSuffix}.${cleanExt}`;

      // 3. Caminho organizado e seguro no bucket product-images sob 'subproducts/'
      const cleanProductId = (productId && productId !== 'undefined' && productId.trim() !== '')
        ? productId.trim().replace(/[^a-zA-Z0-9_-]/g, '')
        : '';
      const primaryPath = cleanProductId
        ? `subproducts/${cleanProductId}/${fileName}`
        : `subproducts/${fileName}`;

      // 4. Upload no bucket product-images com mime type e upsert false (evita exigir permissão de UPDATE do RLS em arquivos novos)
      const mimeType = file.type || (cleanExt === 'png' ? 'image/png' : cleanExt === 'webp' ? 'image/webp' : 'image/jpeg');

      let finalPath = primaryPath;
      let { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(primaryPath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: mimeType,
        });

      // Se falhar por RLS na pasta subproducts/, tenta fallback para a pasta products/ (pasta padrão com permissões de produto)
      if (uploadError && (uploadError.message?.includes('row-level security') || (uploadError as any).statusCode === '403')) {
        const fallbackPath = cleanProductId
          ? `products/${cleanProductId}/sub_${fileName}`
          : `products/sub_${fileName}`;

        console.warn(`[SubproductsManager] Tentando fallback para caminho seguro: ${fallbackPath}`);
        const fallbackResult = await supabase.storage
          .from('product-images')
          .upload(fallbackPath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType,
          });

        if (!fallbackResult.error) {
          uploadError = null;
          finalPath = fallbackPath;
        } else {
          uploadError = fallbackResult.error;
        }
      }

      if (uploadError) {
        console.error('[SubproductsManager] Erro retornado pelo Supabase Storage:', {
          message: uploadError.message,
          name: uploadError.name,
          details: (uploadError as any).error || (uploadError as any).statusCode,
          finalPath,
        });

        let userMsg = uploadError.message || 'Erro desconhecido no envio.';
        if (userMsg.includes('row-level security') || (uploadError as any).statusCode === '403') {
          userMsg = 'Permissão negada pelo Storage (RLS). Verifique se o seu usuário possui perfil de administrador ativo.';
        } else if (userMsg.includes('Payload too large') || (uploadError as any).statusCode === '413') {
          userMsg = `A imagem excede o tamanho máximo suportado (${MAX_FILE_SIZE_MB}MB).`;
        } else if (userMsg.includes('Bucket not found') || (uploadError as any).statusCode === '404') {
          userMsg = 'O bucket "product-images" não foi localizado no Supabase.';
        }

        toast.error(`Não foi possível enviar a imagem: ${userMsg}`);
        return;
      }

      // 5. Obter URL pública gerada
      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(finalPath);

      if (!publicData?.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem após o upload.');
      }

      setImage(publicData.publicUrl);
      toast.success('Imagem do adicional enviada com sucesso!');
    } catch (e: any) {
      console.error('[SubproductsManager] Exceção durante upload de imagem:', e);
      const detail = e?.message ? `: ${e.message}` : '';
      toast.error(`Não foi possível enviar a imagem do subproduto${detail}.`);
    } finally {
      setImageUploading(false);
    }
  };

  // Abrir modal para novo
  const handleOpenNew = () => {
    setEditingSub(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    setActive(true);
    setSortOrder(subproducts.length + 1);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (sub: Subproduct) => {
    setEditingSub(sub);
    setName(sub.name);
    setDescription(sub.description || '');
    setPrice(formatSubproductPrice(sub.price));
    setImage(sub.image || '');
    setActive(sub.active);
    setSortOrder(sub.sort_order);
    setIsModalOpen(true);
  };

  // Salvar subproduto
  const handleSaveSubproduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome do subproduto é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const input: SubproductInput = {
        id: editingSub?.id,
        name: name.trim(),
        description: description.trim() || null,
        price: parseSubproductPrice(price),
        image: image || null,
        active,
        sort_order: sortOrder,
        productId,
      };

      await saveSubproduct(input, productId);
      toast.success(editingSub ? 'Subproduto atualizado!' : 'Subproduto cadastrado!');
      setIsModalOpen(false);
      loadSubproducts();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao salvar subproduto.');
    } finally {
      setSaving(false);
    }
  };

  // Alternar ativo/inativo
  const handleToggleActive = async (sub: Subproduct) => {
    try {
      const newStatus = !sub.active;
      // Otimista
      setSubproducts(prev =>
        prev.map(s => (s.id === sub.id ? { ...s, active: newStatus } : s))
      );
      await toggleSubproductStatus(sub.id, newStatus);
      toast.success(newStatus ? 'Subproduto ativado!' : 'Subproduto desativado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao alterar status.');
      loadSubproducts();
    }
  };

  // Desvincular apenas deste produto
  const handleConfirmUnlink = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await unlinkSubproductFromProduct(productId, deleteTarget.id);
      toast.success(`"${deleteTarget.name}" desvinculado deste produto.`);
      setDeleteTarget(null);
      loadSubproducts();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao desvincular subproduto.');
    } finally {
      setDeleting(false);
    }
  };

  // Excluir permanentemente do catálogo geral
  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSubproduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" excluído permanentemente do catálogo.`);
      setDeleteTarget(null);
      loadSubproducts();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir subproduto permanentemente.');
    } finally {
      setDeleting(false);
    }
  };

  // Abrir modal de vincular adicional existente
  const handleOpenLinkModal = async () => {
    setLinkSearch('');
    setIsLinkModalOpen(true);
    setLoadingStoreSubs(true);
    try {
      const all = await fetchAllSubproductsAdmin();
      setAllStoreSubproducts(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStoreSubs(false);
    }
  };

  const handleLinkExisting = async (sub: Subproduct) => {
    try {
      await linkSubproductToProduct(productId, sub.id, subproducts.length + 1);
      toast.success(`"${sub.name}" vinculado a este produto!`);
      loadSubproducts();
      setIsLinkModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao vincular adicional.');
    }
  };

  // Filtrar adicionais que já não estejam vinculados a este produto
  const availableToLink = allStoreSubproducts
    .filter(s => !subproducts.some(curr => curr.id === s.id))
    .filter(s => !linkSearch || s.name.toLowerCase().includes(linkSearch.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-rose-50/60 to-white dark:from-rose-950/20 dark:to-neutral-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-store-pink/10 text-store-pink flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Subprodutos e adicionais
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-store-pink/10 text-store-pink">
                {subproducts.length} {subproducts.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Cadastre mimos (ex: chocolates, ursinho, cartão) oferecidos como complemento deste produto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão vincular existente */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            disabled={isNewProduct}
            className="px-3 py-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Vincular adicional já cadastrado em outro produto"
          >
            <LinkIcon size={14} />
            <span className="hidden sm:inline">Vincular Existente</span>
          </button>

          {/* Botão novo subproduto */}
          <button
            type="button"
            onClick={handleOpenNew}
            disabled={isNewProduct}
            className="px-3.5 py-2 text-xs font-semibold bg-store-pink hover:bg-store-dark text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Novo Subproduto</span>
          </button>
        </div>
      </div>

      {isNewProduct && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Sparkles size={16} className="shrink-0 text-amber-600" />
          <span>Salve este produto principal primeiro para começar a adicionar os mimos e subprodutos vinculados.</span>
        </div>
      )}

      {/* Lista de Subprodutos Cadastrados */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-xs text-neutral-400 gap-2">
          <Loader2 size={18} className="animate-spin text-store-pink" />
          <span>Carregando subprodutos vinculados...</span>
        </div>
      ) : subproducts.length === 0 ? (
        !isNewProduct && (
          <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
            <Gift size={32} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Nenhum subproduto vinculado a este produto.
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              Clique em "+ Novo Subproduto" para adicionar caixas de bombom, bichinhos de pelúcia, cartões e mais!
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subproducts.map((sub, idx) => (
            <div
              key={sub.id}
              className={`p-3 rounded-xl border flex gap-3 items-center justify-between transition-all ${
                sub.active
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-60'
              }`}
            >
              {/* Imagem do Adicional */}
              <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-700 relative">
                {sub.image ? (
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Sparkles size={16} />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-mono rounded-tl">
                  #{sub.sort_order}
                </span>
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {sub.name}
                  </h5>
                  {!sub.active && (
                    <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 px-1.5 py-0.2 rounded font-medium">
                      Inativo
                    </span>
                  )}
                </div>
                {sub.description && (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                    {sub.description}
                  </p>
                )}
                <p className="text-xs font-bold text-store-pink mt-0.5">
                  + {formatSubproductPrice(sub.price)}
                </p>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(sub)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    sub.active
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                      : 'text-neutral-400 hover:bg-neutral-200'
                  }`}
                  title={sub.active ? 'Desativar adicional' : 'Ativar adicional'}
                >
                  {sub.active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(sub)}
                  className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Editar subproduto"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(sub)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Remover deste produto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Diálogo de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !saving && setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Gift size={18} className="text-store-pink" />
                <span>{editingSub ? 'Editar Subproduto' : 'Novo Subproduto'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubproduct} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium mb-1">Nome do subproduto *</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Caixa de Chocolates Finos"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-store-pink"
                />
              </div>

              {/* Preço Adicional + Ordem */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Preço adicional *</label>
                  <input
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Ex: R$ 19,90"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-store-pink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Ordem de exibição</label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={e => setSortOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-store-pink"
                  />
                </div>
              </div>

              {/* Descrição Opcional */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  Descrição <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ex: 8 bombons trufados artesanais sortidos..."
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-store-pink resize-none"
                />
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-xs font-medium mb-2">Imagem do subproduto</label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={22} className="text-neutral-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <input
                      type="text"
                      value={image}
                      onChange={e => setImage(e.target.value)}
                      placeholder="URL da imagem ou faça upload"
                      className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-900"
                    />
                    <button
                      type="button"
                      disabled={imageUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={13} />
                          <span>Enviar Imagem (Supabase Storage)</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                    <p className="text-[10px] text-neutral-400">JPG, PNG, WEBP — máx. {MAX_FILE_SIZE_MB}MB</p>
                  </div>
                </div>
              </div>

              {/* Status Ativo / Inativo */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-store-pink"
                  />
                  <span className="text-xs font-medium">Subproduto ativo e disponível na loja</span>
                </label>
              </div>

              {/* Botões do Formulário */}
              <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || imageUploading}
                  className="flex-1 py-2 px-4 bg-store-pink hover:bg-store-dark text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {saving ? 'Salvando...' : editingSub ? 'Salvar Alterações' : 'Cadastrar Subproduto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Vincular Adicional Existente */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLinkModalOpen(false)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-w-md w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <LinkIcon size={16} className="text-store-pink" />
                <span>Vincular Adicional Existente</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
                placeholder="Buscar adicional cadastrado..."
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-900"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingStoreSubs ? (
                <div className="py-8 flex justify-center">
                  <Loader2 size={18} className="animate-spin text-store-pink" />
                </div>
              ) : availableToLink.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Nenhum adicional disponível para vincular.
                </div>
              ) : (
                availableToLink.map(sub => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 hover:border-store-pink transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Gift size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{sub.name}</p>
                      <p className="text-[11px] text-store-pink font-bold">
                        +{formatSubproductPrice(sub.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLinkExisting(sub)}
                      className="px-2.5 py-1 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
                    >
                      Vincular
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão / Desvinculação */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600">
                <AlertTriangle size={24} />
              </div>
              <h4 className="font-bold text-base">Gerenciar adicional</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                O que você deseja fazer com <strong>"{deleteTarget.name}"</strong>?
              </p>
            </div>
            
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmUnlink}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                <span>Desvincular apenas deste produto</span>
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmPermanentDelete}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                <span>Excluir definitivamente do catálogo</span>
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 px-4 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
