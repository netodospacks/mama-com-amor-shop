import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) acc[key.trim()] = rest.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('====================================================');
  console.log('DIAGNÓSTICO SUPABASE — Produtos');
  console.log('====================================================\n');

  // 1. Sessão ativa?
  console.log('── 1. SESSÃO ──────────────────────────────────────');
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    console.log('Erro ao obter sessão:', sessionErr.message);
  } else if (!session) {
    console.log('⚠️  Sem sessão ativa (usuário não autenticado via chave anon).');
    console.log('    (Isso é esperado para o script de diagnóstico – o que importa é que o browser tenha sessão.)');
  } else {
    console.log('✅ Sessão ativa. User ID:', session.user.id);
    console.log('   Email:', session.user.email);
  }

  // 2. Checar role do perfil (sem sessão, RLS bloqueará — mas testamos o acesso)
  console.log('\n── 2. PERFIL / ROLE ────────────────────────────────');
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('id, role')
    .limit(1);
  if (profileErr) {
    console.log('Erro ao ler profiles (esperado sem sessão):', profileErr.message, '| code:', profileErr.code);
  } else {
    console.log('Profiles acessíveis (anon):', JSON.stringify(profileData));
  }

  // 3. Tentar SELECT na tabela products (sem auth → só ativos devem aparecer)
  console.log('\n── 3. SELECT em products (sem auth) ────────────────');
  const { data: prodSelect, error: prodSelectErr } = await supabase
    .from('products')
    .select('id, name, active')
    .limit(3);
  if (prodSelectErr) {
    console.log('Erro SELECT products:', prodSelectErr.message, '| code:', prodSelectErr.code, '| hint:', prodSelectErr.hint);
  } else {
    console.log('Linhas retornadas (max 3):', JSON.stringify(prodSelect));
  }

  // 4. Tentar INSERT minimal (como anon — deve ser BLOQUEADO se RLS estiver certo)
  console.log('\n── 4. INSERT sem autenticação (deve ser BLOQUEADO) ─');
  const { error: insertAnonErr } = await supabase
    .from('products')
    .insert([{ name: 'TEST_DIAG_ANON', price: 'R$ 0,00', active: false, sort_order: 999 }]);
  if (insertAnonErr) {
    console.log('✅ INSERT anon bloqueado (esperado). Erro:', insertAnonErr.message, '| code:', insertAnonErr.code);
  } else {
    console.log('⚠️  INSERT anon passou! RLS pode não estar configurado corretamente.');
    // Limpar
    await supabase.from('products').delete().eq('name', 'TEST_DIAG_ANON');
    console.log('   (Linha de diagnóstico removida.)');
  }

  // 5. Verificar colunas da tabela products via query de 1 linha
  console.log('\n── 5. ESTRUTURA DA TABELA products ─────────────────');
  // Tentar inserir payload identico ao que o frontend envia, sem auth
  const testPayload = {
    name: 'DIAG_TEST',
    price: 'R$ 10,00',
    image: null,
    gallery: null,
    is_promo: false,
    is_new: false,
    short_description: null,
    detailed_description: null,
    specifications: null,
    observations: null,
    category_id: null,
    active: true,
    sort_order: 1,
  };

  const { error: payloadErr } = await supabase
    .from('products')
    .insert([testPayload]);

  if (payloadErr) {
    console.log('Erro ao inserir payload de diagnóstico:');
    console.log('  message:', payloadErr.message);
    console.log('  code:   ', payloadErr.code);
    console.log('  details:', payloadErr.details);
    console.log('  hint:   ', payloadErr.hint);

    if (payloadErr.code === '42703') {
      console.log('\n⚠️  Código 42703 = coluna não existe. Verifique o nome das colunas no banco.');
    } else if (payloadErr.code === '23502') {
      console.log('\n⚠️  Código 23502 = coluna NOT NULL sem valor. Verifique colunas obrigatórias.');
    } else if (payloadErr.code === '42501') {
      console.log('\n✅ Código 42501 = RLS bloqueou (esperado para anon). A policy está funcionando.');
    } else if (payloadErr.code === '22P02') {
      console.log('\n⚠️  Código 22P02 = tipo inválido. Algum campo tem tipo errado.');
    } else if (payloadErr.code === 'PGRST204') {
      console.log('\n⚠️  PGRST204 = Schema cache desatualizado. Tente "Reload schema" no Supabase Studio.');
    }
  } else {
    console.log('⚠️  INSERT passou sem autenticação! RLS não está restringindo INSERT.');
    await supabase.from('products').delete().eq('name', 'DIAG_TEST');
    console.log('   (Linha de diagnóstico removida.)');
  }

  // 6. Verificar bucket product-images
  console.log('\n── 6. STORAGE — bucket product-images ──────────────');
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.log('Erro ao listar buckets:', bucketsErr.message);
  } else {
    const found = buckets.find(b => b.id === 'product-images');
    if (found) {
      console.log('✅ Bucket "product-images" encontrado. Public:', found.public);
    } else {
      console.log('⚠️  Bucket "product-images" NÃO encontrado. Buckets existentes:', buckets.map(b => b.name));
    }
  }

  console.log('\n====================================================');
  console.log('FIM DO DIAGNÓSTICO');
  console.log('====================================================');
}

run().catch(console.error);
