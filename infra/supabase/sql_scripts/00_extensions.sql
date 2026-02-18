-- ============================================
-- 00 - EXTENSOES NECESSARIAS
-- Execute este arquivo primeiro
-- ============================================

-- Geracao de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verificar extensoes
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
