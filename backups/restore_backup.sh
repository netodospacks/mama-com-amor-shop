#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE RESTAURAÇÃO — VISUAL STORY
# Restaura o código-fonte integral para a VERSÃO ORIGINAL (BACKUP 01)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="$DIR/backups/VERSAO_01_ORIGINAL/code"

echo "=========================================================="
echo " INICIANDO RESTAURAÇÃO: VISUAL STORY — VERSÃO ORIGINAL "
echo "=========================================================="

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ ERRO: Diretório de backup não encontrado em $BACKUP_DIR"
  exit 1
fi

echo "1. Restaurando arquivos do código-fonte..."
cp -r "$BACKUP_DIR/src" "$DIR/"
cp -r "$BACKUP_DIR/public" "$DIR/"
cp -r "$BACKUP_DIR/supabase" "$DIR/"
cp "$BACKUP_DIR/index.html" "$DIR/"
cp "$BACKUP_DIR/package.json" "$DIR/"
cp "$BACKUP_DIR/package-lock.json" "$DIR/"
cp "$BACKUP_DIR/tsconfig.json" "$DIR/"
cp "$BACKUP_DIR/tsconfig.app.json" "$DIR/"
cp "$BACKUP_DIR/tsconfig.node.json" "$DIR/"
cp "$BACKUP_DIR/vite.config.ts" "$DIR/"
cp "$BACKUP_DIR/tailwind.config.ts" "$DIR/"
cp "$BACKUP_DIR/postcss.config.js" "$DIR/"
cp "$BACKUP_DIR/eslint.config.js" "$DIR/"
cp "$BACKUP_DIR/components.json" "$DIR/"
cp "$BACKUP_DIR/vercel.json" "$DIR/"
cp "$BACKUP_DIR/vitest.config.ts" "$DIR/"

echo "2. Arquivos restaurados com sucesso!"
echo "3. Executando build de validação..."
cd "$DIR"
npm run build

echo "=========================================================="
echo "✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "O site voltou exatamente ao estado da VERSÃO ORIGINAL."
echo "=========================================================="
