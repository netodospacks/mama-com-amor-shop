import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc: any, l: string) => {
  const [k, ...v] = l.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('================================================================');
  console.log('VERIFICAÇÃO DE ESQUEMA E PAYLOAD DO PAINEL COM O SUPABASE');
  console.log('================================================================\n');

  // 1. SELECT inicial
  const { data: prods, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, promo_price, category_id, active, sort_order')
    .limit(5);

  if (prodErr) {
    console.error('❌ Erro no SELECT de produtos:', prodErr);
    process.exit(1);
  }

  console.log(`✅ SELECT em products bem-sucedido (${prods?.length} produtos lidos).`);
  console.log('Amostra de produto no banco:', prods?.[0]);

  // 2. Obter categorias válidas para validação de FK
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug')
    .limit(3);

  if (catErr) {
    console.error('❌ Erro no SELECT de categorias:', catErr);
    process.exit(1);
  }
  console.log(`✅ SELECT em categories bem-sucedido (${cats?.length} categorias lidas).`);
  const validCatId = cats?.[0]?.id;
  console.log(`   Categoria de teste (FK): ${cats?.[0]?.name} (${validCatId})`);

  // 3. Teste de payloads simulados (conforme gerados pelo Products.tsx corrigido):
  // Cenário A: Produto simples sem preço promocional
  const payloadSimples = {
    name: 'TESTE_VALIDACAO_SIMPLES',
    price: 49.90,
    promo_price: null,
    image: 'https://exemplo.com/imagem.jpg',
    gallery: ['https://exemplo.com/imagem.jpg'],
    is_promo: false,
    is_new: true,
    is_featured: false,
    short_description: 'Descrição curta',
    detailed_description: 'Descrição longa',
    specifications: ['Item 1'],
    observations: 'Observação',
    category_id: validCatId,
    active: true,
    sort_order: 999,
  };

  // Cenário B: Produto com preço promocional
  const payloadPromo = {
    name: 'TESTE_VALIDACAO_PROMO',
    price: 100.00,
    promo_price: 79.90,
    image: null,
    gallery: null,
    is_promo: true,
    is_new: false,
    is_featured: true,
    short_description: null,
    detailed_description: null,
    specifications: null,
    observations: null,
    category_id: null, // Sem categoria
    active: true,
    sort_order: 1000,
  };

  console.log('\n--- Testando validação de schema do PostgREST para o Payload Simples ---');
  // Tentativa com anon: o PostgREST primeiro valida as colunas e tipos contra o schema cache.
  // Se houver coluna inexistente (ex: collection), retorna PGRST204 antes do RLS.
  // Se o payload for 100% válido, o RLS intercepta com 42501 (ou permite se for admin).
  const { error: errA } = await supabase.from('products').insert([payloadSimples]);
  console.log('Resultado Cenário A:');
  console.log('  Código retornado:', errA?.code);
  console.log('  Mensagem:', errA?.message);
  if (errA?.code === 'PGRST204' || errA?.code === '42703') {
    console.error('❌ FALHA: PostgREST rejeitou por coluna inexistente no schema!');
  } else if (errA?.code === '42501') {
    console.log('✅ SUCESSO: O schema foi 100% aceito pelo PostgREST e Postgres! (Bloqueado corretamente por RLS para anon)');
  }

  console.log('\n--- Testando validação de schema do PostgREST para o Payload Promocional ---');
  const { error: errB } = await supabase.from('products').insert([payloadPromo]);
  console.log('Resultado Cenário B:');
  console.log('  Código retornado:', errB?.code);
  console.log('  Mensagem:', errB?.message);
  if (errB?.code === 'PGRST204' || errB?.code === '42703') {
    console.error('❌ FALHA: PostgREST rejeitou por coluna inexistente no schema!');
  } else if (errB?.code === '42501') {
    console.log('✅ SUCESSO: O schema foi 100% aceito pelo PostgREST e Postgres! (Bloqueado corretamente por RLS para anon)');
  }

  console.log('\n================================================================');
  console.log('VERIFICAÇÃO CONCLUÍDA');
  console.log('================================================================');
}

run().catch(console.error);
