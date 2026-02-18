-- ============================================
-- 08 - TABELA: ANEXOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'attachments',
  description TEXT,
  file_category TEXT DEFAULT 'other' CHECK (file_category IN ('documentation', 'contract', 'invoice', 'screenshot', 'other')),
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.attachments IS 'Arquivos anexados as aplicacoes';

-- Indices
CREATE INDEX IF NOT EXISTS idx_attachments_app ON public.attachments(app_id);
CREATE INDEX IF NOT EXISTS idx_attachments_category ON public.attachments(file_category);

-- RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view attachments" 
  ON public.attachments FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage attachments" 
  ON public.attachments FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));
