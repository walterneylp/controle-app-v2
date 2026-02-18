-- ============================================
-- 11 - STORAGE BUCKET
-- Configuracao do bucket para anexos
-- ============================================

-- Criar bucket para anexos (se nao existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Politica para permitir upload de anexos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica para permitir leitura
CREATE POLICY "Allow authenticated select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'attachments'
);

-- Politica para permitir delete
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
