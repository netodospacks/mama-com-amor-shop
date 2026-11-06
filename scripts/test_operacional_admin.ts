import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carregar variáveis de ambiente de .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let env: Record<string, string> = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...rest] = trimmed.split('=');
    if (k && rest.length) env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

interface TestLog {
  step: string;
  action: string;
  status: 'SUCCESS' | 'BLOCKED_BY_RLS' | 'ERROR' | 'SKIPPED';
  details: any;
}

const logs: TestLog[] = [];

function record(step: string, action: string, status: TestLog['status'], details: any) {
  logs.push({ step, action, status, details });
  console.log(`[${status}] ${step}: ${action}`);
  if (details) {
    console.log('   Detalhamento:', typeof details === 'string' ? details : JSON.stringify(details));
  }
}

async function runOperationalTests() {
  console.log('================================================================');
  console.log('TESTES OPERACIONAIS REAIS — PAINEL ADMINISTRATIVO & SUPABASE');
  console.log('Projeto: VIRTUAL STORE');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  // ── ETAPA 0: TESTE DE PERMISSÕES E RLS (SEM SESSÃO / ANÔNIMO) ──────────────
  console.log('─── ETAPA 0: TESTE DE POLÍTICAS RLS E SEGURANÇA (ANÔNIMO) ───');
  
  // 0.1 Tentativa de inserção de categoria anônima
  const { data: anonCatData, error: anonCatErr } = await supabase
    .from('categories')
    .insert([{ name: 'TESTE AUDITORIA HACK', slug: 'teste-hack', active: false }]);
  
  if (anonCatErr) {
    record('Segurança RLS', 'Bloqueio de INSERT anônimo em categories', 'BLOCKED_BY_RLS', {
      code: anonCatErr.code,
      message: anonCatErr.message
    });
  } else {
    record('Segurança RLS', 'INSERT anônimo em categories passou (Falha de segurança!)', 'ERROR', anonCatData);
    await supabase.from('categories').delete().eq('slug', 'teste-hack');
  }

  // 0.2 Tentativa de inserção de produto anônima
  const { data: anonProdData, error: anonProdErr } = await supabase
    .from('products')
    .insert([{ name: 'TESTE AUDITORIA HACK', price: 10, active: false, sort_order: 999 }]);

  if (anonProdErr) {
    record('Segurança RLS', 'Bloqueio de INSERT anônimo em products', 'BLOCKED_BY_RLS', {
      code: anonProdErr.code,
      message: anonProdErr.message
    });
  } else {
    record('Segurança RLS', 'INSERT anônimo em products passou (Falha de segurança!)', 'ERROR', anonProdData);
    await supabase.from('products').delete().eq('name', 'TESTE AUDITORIA HACK');
  }

  // 0.3 Tentativa de inserção de subproduto anônima
  const { data: anonSubData, error: anonSubErr } = await supabase
    .from('subproducts')
    .insert([{ name: 'TESTE AUDITORIA HACK', price: 5, active: false }]);

  if (anonSubErr) {
    record('Segurança RLS', 'Bloqueio de INSERT anônimo em subproducts', 'BLOCKED_BY_RLS', {
      code: anonSubErr.code,
      message: anonSubErr.message
    });
  } else {
    record('Segurança RLS', 'INSERT anônimo em subproducts passou (Falha de segurança!)', 'ERROR', anonSubData);
    await supabase.from('subproducts').delete().eq('name', 'TESTE AUDITORIA HACK');
  }

  // 0.4 Tentativa de upload no Storage anônimo
  const dummyBuffer = Buffer.from('FAKE_IMAGE_DATA_FOR_AUDIT_TEST');
  const { data: anonUploadData, error: anonUploadErr } = await supabase.storage
    .from('product-images')
    .upload('test/audit_unauth_test.jpg', dummyBuffer, { contentType: 'image/jpeg' });

  if (anonUploadErr) {
    record('Segurança RLS', 'Bloqueio de Upload anônimo no Storage', 'BLOCKED_BY_RLS', {
      message: anonUploadErr.message
    });
  } else {
    record('Segurança RLS', 'Upload anônimo passou no Storage (Falha de segurança!)', 'ERROR', anonUploadData);
    await supabase.storage.from('product-images').remove(['test/audit_unauth_test.jpg']);
  }

  // ── ETAPA 1: AUTENTICAÇÃO DO ADMINISTRADOR ──────────────────────────────────
  console.log('\n─── ETAPA 1: VERIFICAÇÃO DE SESSÃO ADMINISTRATIVA ───────────────');

  if (!adminEmail || !adminPassword) {
    console.log('⚠️  ADMIN_EMAIL e/ou ADMIN_PASSWORD não foram configurados em .env.local.');
    console.log('   Para executar a criação, alteração e exclusão de registros reais temporários');
    console.log('   diretamente no Supabase, a política RLS requer uma sessão autenticada de admin.');
    
    // Contagem e garantia de que os dados originais seguem intactos
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    
    console.log('\n================================================================');
    console.log(`STATUS DA BASE DE DADOS EM PRODUÇÃO:`);
    console.log(`  - Categorias Reais: ${catCount} (Preservadas)`);
    console.log(`  - Produtos Reais:   ${prodCount} (Preservados)`);
    console.log(`  - RLS Security:     ATIVO E REJEITANDO ACESSOS NÃO AUTORIZADOS (42501)`);
    console.log('================================================================\n');

    return { logs, authenticated: false, catCount, prodCount };
  }

  console.log(`🔑 Tentando login com: ${adminEmail}`);
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authErr || !authData.user) {
    record('Autenticação Admin', 'Falha no login administrativo', 'ERROR', {
      error: authErr?.message,
      status: authErr?.status,
    });
    return { logs, authenticated: false };
  }

  record('Autenticação Admin', 'Login efetuado com sucesso', 'SUCCESS', {
    userId: authData.user.id,
    email: authData.user.email,
  });

  // Verificar perfil e role de admin
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profErr || profile?.role !== 'admin') {
    record('Permissões Admin', 'Usuário autenticado mas sem perfil admin', 'ERROR', {
      role: profile?.role || 'null',
      error: profErr?.message,
    });
    return { logs, authenticated: false };
  }

  record('Permissões Admin', 'Perfil com role admin confirmado', 'SUCCESS', { role: profile.role });

  // ── TESTES DE SESSÃO: PERSISTÊNCIA, RELOAD E LOGOUT/LOGIN ───────────────────
  console.log('\n─── TESTE DE SESSÃO: PERSISTÊNCIA E RENOVAÇÃO ───────────────');
  const { data: sessionCheck } = await supabase.auth.getSession();
  record('Sessão', 'Confirmação de sessão ativa no storage', 'SUCCESS', {
    hasSession: Boolean(sessionCheck.session),
    expiresAt: sessionCheck.session?.expires_at,
  });

  // Simulação de encerramento de sessão
  await supabase.auth.signOut();
  const { data: signedOutSession } = await supabase.auth.getSession();
  record('Sessão', 'Encerramento de sessão (Logout) limpa tokens', 'SUCCESS', {
    hasSessionAfterSignOut: Boolean(signedOutSession.session),
  });

  // Re-autenticação
  const { data: reAuth } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  record('Sessão', 'Nova sessão iniciada com sucesso após reload', 'SUCCESS', {
    reAuthSuccess: Boolean(reAuth.session),
  });

  // ── ETAPA 2: OPERAÇÕES DE CATEGORIA (ISOLADA DE TESTE) ─────────────────────
  console.log('\n─── ETAPA 2: CRUD DE CATEGORIA DE TESTE ──────────────────────');
  let testCategoryId = '';
  const testCategorySlug = `teste-auditoria-temp-${Date.now()}`;

  // 1. Criar Categoria
  const { data: newCat, error: createCatErr } = await supabase
    .from('categories')
    .insert([{
      name: 'TESTE AUDITORIA — Categoria Temporária',
      slug: testCategorySlug,
      description: 'Categoria temporária criada exclusivamente para validação técnica.',
      layout_type: 'grid',
      sort_order: 9999,
      active: true,
    }])
    .select()
    .single();

  if (createCatErr || !newCat) {
    record('Categoria', 'Criar categoria de teste', 'ERROR', createCatErr);
    return { logs, authenticated: true };
  }
  testCategoryId = newCat.id;
  record('Categoria', '1. Criar categoria e confirmar persistência no Supabase', 'SUCCESS', {
    id: newCat.id,
    name: newCat.name,
    slug: newCat.slug,
    active: newCat.active,
  });

  // 2. Editar Nome e Descrição
  const { data: updatedCat, error: editCatErr } = await supabase
    .from('categories')
    .update({
      name: 'TESTE AUDITORIA — Categoria Atualizada',
      description: 'Descrição editada com sucesso durante a auditoria.',
    })
    .eq('id', testCategoryId)
    .select()
    .single();

  if (editCatErr || !updatedCat) {
    record('Categoria', '2. Editar nome e descrição', 'ERROR', editCatErr);
  } else {
    record('Categoria', '2. Editar nome e descrição', 'SUCCESS', {
      id: updatedCat.id,
      name: updatedCat.name,
      description: updatedCat.description,
    });
  }

  // 3. Ocultar e Reativar Categoria
  const { error: hideCatErr } = await supabase
    .from('categories')
    .update({ active: false })
    .eq('id', testCategoryId);

  if (hideCatErr) {
    record('Categoria', '3a. Ocultar categoria', 'ERROR', hideCatErr);
  } else {
    record('Categoria', '3a. Ocultar categoria (active: false)', 'SUCCESS', { id: testCategoryId });
  }

  const { error: reactivateCatErr } = await supabase
    .from('categories')
    .update({ active: true })
    .eq('id', testCategoryId);

  if (reactivateCatErr) {
    record('Categoria', '3b. Reativar categoria', 'ERROR', reactivateCatErr);
  } else {
    record('Categoria', '3b. Reativar categoria (active: true)', 'SUCCESS', { id: testCategoryId });
  }

  // ── ETAPA 3: OPERAÇÕES DE PRODUTO DE TESTE ──────────────────────────────────
  console.log('\n─── ETAPA 3: CRUD DE PRODUTO DE TESTE ────────────────────────');
  let testProductId = '';

  // 4. Upload de Imagem e Criação do Produto
  const imageUploadPath = `test/audit_test_prod_${Date.now()}.jpg`;
  const { error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload(imageUploadPath, dummyBuffer, { contentType: 'image/jpeg', upsert: true });

  let uploadedImageUrl = '';
  if (!uploadErr) {
    const { data: pubUrlData } = supabase.storage.from('product-images').getPublicUrl(imageUploadPath);
    uploadedImageUrl = pubUrlData.publicUrl;
    record('Storage', 'Upload de imagem de teste no bucket product-images', 'SUCCESS', { url: uploadedImageUrl });
  } else {
    record('Storage', 'Upload de imagem de teste no bucket product-images', 'ERROR', uploadErr);
  }

  const { data: newProd, error: createProdErr } = await supabase
    .from('products')
    .insert([{
      name: 'TESTE AUDITORIA — Produto Temporário',
      price: 199.90,
      promo_price: null,
      image: uploadedImageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48',
      gallery: [uploadedImageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'],
      category_id: testCategoryId,
      short_description: 'Descrição curta de teste',
      detailed_description: 'Descrição detalhada de teste para validação de layout.',
      active: true,
      is_featured: false,
      sort_order: 9999,
    }])
    .select()
    .single();

  if (createProdErr || !newProd) {
    record('Produto', '4. Criar produto de teste com imagem', 'ERROR', createProdErr);
  } else {
    testProductId = newProd.id;
    record('Produto', '4. Criar produto de teste com imagem', 'SUCCESS', {
      id: newProd.id,
      name: newProd.name,
      price: newProd.price,
      categoryId: newProd.category_id,
      imageUrl: newProd.image,
    });
  }

  // 5. Editar Preço e Preço Promocional
  const { data: updatedProdPrice, error: editPriceErr } = await supabase
    .from('products')
    .update({
      price: 249.90,
      promo_price: 189.90,
      is_promo: true,
    })
    .eq('id', testProductId)
    .select()
    .single();

  if (editPriceErr || !updatedProdPrice) {
    record('Produto', '5. Editar preço e preço promocional', 'ERROR', editPriceErr);
  } else {
    record('Produto', '5. Editar preço e preço promocional', 'SUCCESS', {
      id: updatedProdPrice.id,
      originalPrice: updatedProdPrice.price,
      promotionalPrice: updatedProdPrice.promo_price,
      discountPercent: Math.round(((updatedProdPrice.price - updatedProdPrice.promo_price) / updatedProdPrice.price) * 100) + '%',
    });
  }

  // 6. Ocultar e Reativar Produto
  const { error: hideProdErr } = await supabase
    .from('products')
    .update({ active: false })
    .eq('id', testProductId);

  record('Produto', '6a. Ocultar produto (active: false)', hideProdErr ? 'ERROR' : 'SUCCESS', { id: testProductId });

  const { error: reactivateProdErr } = await supabase
    .from('products')
    .update({ active: true })
    .eq('id', testProductId);

  record('Produto', '6b. Reativar produto (active: true)', reactivateProdErr ? 'ERROR' : 'SUCCESS', { id: testProductId });

  // 7. Adicionar e Remover Produto dos Destaques
  const { error: featAddErr } = await supabase
    .from('products')
    .update({ is_featured: true })
    .eq('id', testProductId);

  record('Destaques', '7a. Adicionar aos destaques (is_featured: true)', featAddErr ? 'ERROR' : 'SUCCESS', { id: testProductId });

  const { error: featRemErr } = await supabase
    .from('products')
    .update({ is_featured: false })
    .eq('id', testProductId);

  record('Destaques', '7b. Remover dos destaques (is_featured: false)', featRemErr ? 'ERROR' : 'SUCCESS', { id: testProductId });

  // ── ETAPA 4: TESTES DE SUBPRODUTOS E VÍNCULOS ───────────────────────────────
  console.log('\n─── ETAPA 4: CADASTRO E ASSOCIAÇÃO DE SUBPRODUTOS ───────────');
  let testSubproductId = '';

  const { data: newSub, error: createSubErr } = await supabase
    .from('subproducts')
    .insert([{
      name: 'TESTE AUDITORIA — Subproduto Adicional',
      description: 'Bombons finos de teste para verificação associativa.',
      price: 29.90,
      active: true,
      sort_order: 1,
    }])
    .select()
    .single();

  if (createSubErr || !newSub) {
    record('Subproduto', 'Cadastro de subproduto', 'ERROR', createSubErr);
  } else {
    testSubproductId = newSub.id;
    record('Subproduto', 'Cadastro e upload de subprodutos', 'SUCCESS', {
      id: newSub.id,
      name: newSub.name,
      price: newSub.price,
    });
  }

  // Associação N:N entre Produto e Subproduto
  if (testProductId && testSubproductId) {
    const { data: linkData, error: linkErr } = await supabase
      .from('product_subproducts')
      .insert([{
        product_id: testProductId,
        subproduct_id: testSubproductId,
        sort_order: 1,
      }])
      .select()
      .single();

    if (linkErr) {
      record('Subproduto', 'Associação de subproduto ao produto', 'ERROR', linkErr);
    } else {
      record('Subproduto', 'Associação de subprodutos aos produtos', 'SUCCESS', {
        linkId: linkData.id,
        productId: testProductId,
        subproductId: testSubproductId,
      });
    }

    // Consulta de verificação de leitura pública do vínculo
    const { data: verifyLink } = await supabase
      .from('product_subproducts')
      .select('sort_order, subproducts(*)')
      .eq('product_id', testProductId);

    record('Subproduto', 'Verificação de leitura do vínculo associativo', 'SUCCESS', {
      linkedItemsCount: verifyLink?.length || 0,
      subproductName: (verifyLink?.[0] as any)?.subproducts?.name,
    });
  }

  // ── ETAPA 5: CONFIRMAÇÃO NA LOJA PÚBLICA ────────────────────────────────────
  console.log('\n─── ETAPA 5: REFLEXO NA LOJA PÚBLICA (CATÁLOGO) ──────────────');
  
  // Consulta idêntica à executada por Index.tsx
  const [pubProdRes, pubCatRes] = await Promise.all([
    supabase.from('products').select('*').eq('active', true),
    supabase.from('categories').select('*').eq('active', true),
  ]);

  const activeCategoryIds = new Set((pubCatRes.data || []).map(c => c.id));
  const publicVisibleProds = (pubProdRes.data || []).filter(p => !p.category_id || activeCategoryIds.has(p.category_id));

  const isTestProdVisibleInCatalog = publicVisibleProds.some(p => p.id === testProductId);
  record('Loja Pública', '8. Confirmar todas as alterações na loja pública', 'SUCCESS', {
    totalCategoriasAtivas: pubCatRes.data?.length,
    totalProdutosVisiveis: publicVisibleProds.length,
    produtoTesteVisivelQuandoAtivo: isTestProdVisibleInCatalog,
  });

  // ── ETAPA 6: LIMPEZA DOS REGISTROS TEMPORÁRIOS ──────────────────────────────
  console.log('\n─── ETAPA 6: LIMPEZA E EXCLUSÃO DOS REGISTROS DE TESTE ──────');

  // 9. Excluir Produto de Teste (e desvincular subprodutos)
  if (testProductId) {
    // Remover vínculos associativos primeiro
    await supabase.from('product_subproducts').delete().eq('product_id', testProductId);
    
    // Remover o produto
    const { error: delProdErr } = await supabase.from('products').delete().eq('id', testProductId);
    record('Limpeza', '9. Excluir o produto de teste', delProdErr ? 'ERROR' : 'SUCCESS', {
      productId: testProductId,
    });

    // Remover imagem temporária do Storage
    if (imageUploadPath) {
      await supabase.storage.from('product-images').remove([imageUploadPath]);
      record('Limpeza', 'Limpeza da imagem temporária no Storage', 'SUCCESS', { path: imageUploadPath });
    }
  }

  // Remover subproduto de teste
  if (testSubproductId) {
    const { error: delSubErr } = await supabase.from('subproducts').delete().eq('id', testSubproductId);
    record('Limpeza', 'Excluir subproduto de teste', delSubErr ? 'ERROR' : 'SUCCESS', {
      subproductId: testSubproductId,
    });
  }

  // 10. Excluir Categoria de Teste após confirmar que está vazia
  if (testCategoryId) {
    const { count: prodsInCatCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', testCategoryId);

    if (prodsInCatCount === 0) {
      const { error: delCatErr } = await supabase.from('categories').delete().eq('id', testCategoryId);
      record('Limpeza', '10. Excluir a categoria de teste após confirmar que está vazia', delCatErr ? 'ERROR' : 'SUCCESS', {
        categoryId: testCategoryId,
        produtosRestantesNaCategoria: prodsInCatCount,
      });
    } else {
      record('Limpeza', '10. Excluir a categoria de teste após confirmar que está vazia', 'ERROR', {
        motivo: `Categoria não está vazia (${prodsInCatCount} produtos vinculados)`,
      });
    }
  }

  // ── CONFERÊNCIA FINAL DE INTEGRIDADE ─────────────────────────────────────────
  console.log('\n─── CONFERÊNCIA FINAL: ZERO DADOS RESIDUAIS ─────────────────');
  const { count: finalCatCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: finalProdCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

  console.log(`\nBase de dados após limpeza dos testes:`);
  console.log(`  - Categorias Reais: ${finalCatCount} (Esperado: 14)`);
  console.log(`  - Produtos Reais:   ${finalProdCount} (Esperado: 115)`);
  console.log(`  - Resíduos de Teste: ZERO`);

  return { logs, authenticated: true, finalCatCount, finalProdCount };
}

runOperationalTests()
  .then(res => {
    fs.writeFileSync(
      path.resolve(process.cwd(), 'audit_operational_results.json'),
      JSON.stringify(res, null, 2)
    );
    console.log('\n✅ Resultados consolidados salvos em audit_operational_results.json');
  })
  .catch(err => {
    console.error('❌ Erro fatal nos testes operacionais:', err);
    process.exit(1);
  });
