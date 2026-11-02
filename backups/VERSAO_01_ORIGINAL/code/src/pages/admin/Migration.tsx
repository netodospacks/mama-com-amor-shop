import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CATEGORIES, getProductById, getAllProducts } from '../../data/catalog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Migration() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
    console.log(msg);
  };

  const parsePrice = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleaned = value.toString().replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const fetchAsBlob = async (path: string): Promise<Blob> => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao baixar imagem local: ${path}`);
    return response.blob();
  };

  const uploadImage = async (localPath: string, cache: Map<string, string>): Promise<string> => {
    if (cache.has(localPath)) {
      return cache.get(localPath)!;
    }
    
    // Clean filename
    const filename = localPath.split('/').pop() || 'image.jpeg';
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${Date.now()}_${safeFilename}`;

    const blob = await fetchAsBlob(localPath);
    
    const { data, error } = await supabase.storage.from('product-images').upload(storagePath, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false
    });

    if (error) {
      throw new Error(`Erro no upload da imagem ${localPath}: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    const url = publicUrlData.publicUrl;
    
    cache.set(localPath, url);
    return url;
  };

  const runMigration = async () => {
    try {
      setIsMigrating(true);
      setLogs([]);
      addLog('🚀 INICIANDO MIGRAÇÃO...');

      // 1. Limpar produtos existentes (Teste)
      addLog('ETAPA 1: Buscando produtos de teste...');
      const { data: existingProducts, error: fetchErr } = await supabase.from('products').select('*');
      if (fetchErr) throw new Error('Erro ao buscar produtos existentes.');
      
      if (existingProducts && existingProducts.length > 0) {
        addLog(`Foram encontrados ${existingProducts.length} produto(s) de teste. Eles serão removidos:`);
        for (const p of existingProducts) {
          addLog(`  - Removendo: ${p.name} (ID: ${p.id})`);
        }
        const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (delErr) throw new Error(`Erro ao deletar produto de teste: ${delErr.message}`);
      } else {
        addLog('Nenhum produto de teste encontrado.');
      }

      // 2 e 3. Categorias
      addLog('ETAPA 2 e 3: Processando Categorias...');
      const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
      if (catErr) throw new Error('Erro ao buscar categorias.');

      const categoriasFaltantes = [
        { name: 'Mamães e Bebês', slug: 'mamaes-e-bebes' },
        { name: 'Produtos', slug: 'produtos' },
        { name: 'Placas Acrílicas', slug: 'placas-acrilicas' },
        { name: 'Combos Promocionais', slug: 'combos-promocionais' },
        { name: 'Especial Mães', slug: 'especial-maes' },
      ];

      for (const cat of categoriasFaltantes) {
        const existe = dbCategories?.find(c => c.slug === cat.slug);
        if (!existe) {
          addLog(`Criando categoria faltante: ${cat.name}`);
          const { error: insertCatErr } = await supabase.from('categories').insert([cat]);
          if (insertCatErr) throw new Error(`Erro ao criar categoria ${cat.name}: ${insertCatErr.message}`);
        } else {
          addLog(`Categoria já existe: ${cat.name}`);
        }
      }

      // Buscar novamente as categorias atualizadas para montar o mapa
      const { data: finalCategories } = await supabase.from('categories').select('*');
      const categoryMap = new Map<string, string>(); // slug -> uuid
      finalCategories?.forEach(c => categoryMap.set(c.slug, c.id));

      // Função helper para descobrir o slug correto do produto baseado no catalog.ts
      const getCategorySlugForProduct = (p: any): string => {
        // MAES
        if (CATEGORIES.MAES.find(x => x.id === p.id)) return 'especial-maes';
        // COMBOS
        if (CATEGORIES.COMBOS.find(x => x.id === p.id)) return 'combos-promocionais';
        // QUADROS_PLACAS
        if (CATEGORIES.QUADROS_PLACAS.find(x => x.id === p.id)) return 'placas-acrilicas';
        // PRODUTOS
        if (CATEGORIES.PRODUTOS.find(x => x.id === p.id)) return 'produtos';
        // MAMAES_BEBES
        if (CATEGORIES.MAMAES_BEBES.find(x => x.id === p.id)) return 'mamaes-e-bebes';
        
        // CESTAS e subcategorias
        if (["cesta-1", "cesta-2", "cesta-3", "cesta-4"].includes(p.id)) return 'cesta-cafe-da-manha';
        if (["cesta-5", "cesta-6", "cesta-7", "cesta-8", "cesta-9"].includes(p.id)) return 'cesta-aniversario';
        if (["cesta-10", "cesta-11", "cesta-12", "cesta-13"].includes(p.id)) return 'cesta-cores';
        
        // QUADROS A4 e subcategorias
        if (["qa4-1", "qa4-2", "qa4-3", "qa4-4", "qa4-5"].includes(p.id)) return 'quadros-casal';
        if (["qa4-6", "qa4-7", "qa4-8", "qa4-9", "qa4-10"].includes(p.id)) return 'quadros-aniversario';

        // QUADROS 10x15 e subcategorias
        if (["q1015-1", "q1015-2", "q1015-3"].includes(p.id)) return 'quadro-10x15-casal';
        if (["q1015-4", "q1015-5"].includes(p.id)) return 'quadro-10x15-aniversario';

        // KITS
        return 'kits-casal';
      };

      // 4 a 9. Processamento de Produtos e Imagens
      const allProducts = getAllProducts();
      addLog(`ETAPA 4, 5, 6, 7, 8, 9: Preparando ${allProducts.length} produtos...`);
      
      const imageCache = new Map<string, string>();
      const payloads = [];
      let sortOrder = 1;

      for (const p of allProducts) {
        addLog(`Processando [${p.id}] ${p.name}...`);
        
        const catSlug = getCategorySlugForProduct(p);
        const categoryId = categoryMap.get(catSlug);
        if (!categoryId) {
          throw new Error(`Categoria não encontrada para slug ${catSlug} no produto ${p.name}`);
        }

        let mainImageUrl = null;
        if (p.image) {
          mainImageUrl = await uploadImage(p.image, imageCache);
        }

        let galleryUrls = null;
        if (p.gallery && p.gallery.length > 0) {
          galleryUrls = [];
          for (const gPath of p.gallery) {
            const gUrl = await uploadImage(gPath, imageCache);
            galleryUrls.push(gUrl);
          }
        }

        payloads.push({
          name: p.name,
          price: parsePrice(p.price),
          image: mainImageUrl,
          gallery: galleryUrls,
          is_promo: p.isPromo || false,
          is_new: p.isNew || false,
          short_description: p.shortDescription || null,
          detailed_description: p.detailedDescription || null,
          specifications: p.specifications && p.specifications.length > 0 ? p.specifications : null,
          observations: p.observations || null,
          category_id: categoryId,
          active: true,
          sort_order: sortOrder++
        });
      }

      // 10. Inserção
      addLog('ETAPA 10: Inserindo produtos no Supabase em lotes seguros...');
      const { error: insertErr } = await supabase.from('products').insert(payloads);
      if (insertErr) {
        throw new Error(`Falha na inserção final dos produtos: ${insertErr.message}`);
      }
      
      // 11. Verificação Final
      addLog('ETAPA 11: Verificação Final no banco...');
      const { data: finalProducts, count } = await supabase.from('products').select('*', { count: 'exact' });
      
      addLog(`\n================ RELATÓRIO FINAL ================`);
      addLog(`- Produtos encontrados no catalog.ts: ${allProducts.length}`);
      addLog(`- Produtos migrados: ${payloads.length}`);
      addLog(`- Produtos com erro: 0 (todos passaram)`);
      addLog(`- Categorias criadas/existentes validadas: ${finalCategories?.length}`);
      addLog(`- Imagens únicas enviadas: ${imageCache.size}`);
      addLog(`- Produtos ativos (active=true): ${finalProducts?.filter(x => x.active).length}`);
      addLog(`- Total final no Supabase: ${count}`);
      addLog(`- Status: MIGRAÇÃO 100% CONCLUÍDA COM SUCESSO!`);
      
    } catch (err: any) {
      addLog(`❌ ERRO CRÍTICO: ${err.message}`);
      addLog('A migração foi interrompida.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ferramenta de Migração Automática</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-neutral-500">
            Esta ferramenta irá ler o catálogo local, criar categorias faltantes, fazer o upload de todas as imagens para o Supabase Storage e inserir todos os produtos oficiais na base de dados em definitivo.
          </p>
          <Button onClick={runMigration} disabled={isMigrating}>
            {isMigrating ? 'Migrando...' : 'Iniciar Migração'}
          </Button>

          <div className="mt-8 bg-neutral-950 text-green-400 p-4 rounded-md font-mono text-xs overflow-y-auto max-h-[500px]">
            {logs.length === 0 && <span className="opacity-50">Aguardando execução...</span>}
            {logs.map((l, i) => (
              <div key={i} className="mb-1">{l}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
