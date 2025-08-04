-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RNCs table
CREATE TABLE public.rncs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_rnc TEXT NOT NULL UNIQUE,
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  setor TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  criticidade TEXT NOT NULL CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  origem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_andamento', 'fechada', 'cancelada')),
  data_prazo DATE,
  evidencias JSONB DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create immediate actions table
CREATE TABLE public.acoes_imediatas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rnc_id UUID NOT NULL REFERENCES public.rncs(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create corrective actions table
CREATE TABLE public.acoes_corretivas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rnc_id UUID NOT NULL REFERENCES public.rncs(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create effectiveness evaluations table
CREATE TABLE public.avaliacoes_eficacia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rnc_id UUID NOT NULL REFERENCES public.rncs(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  resultado TEXT NOT NULL,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_imediatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_corretivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_eficacia ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for RNCs
CREATE POLICY "Users can view all RNCs" ON public.rncs FOR SELECT USING (true);
CREATE POLICY "Users can create RNCs" ON public.rncs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update RNCs they created" ON public.rncs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete RNCs they created" ON public.rncs FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for immediate actions
CREATE POLICY "Users can view all immediate actions" ON public.acoes_imediatas FOR SELECT USING (true);
CREATE POLICY "Users can create immediate actions for their RNCs" ON public.acoes_imediatas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update immediate actions for their RNCs" ON public.acoes_imediatas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete immediate actions for their RNCs" ON public.acoes_imediatas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);

-- Create RLS policies for corrective actions
CREATE POLICY "Users can view all corrective actions" ON public.acoes_corretivas FOR SELECT USING (true);
CREATE POLICY "Users can create corrective actions for their RNCs" ON public.acoes_corretivas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update corrective actions for their RNCs" ON public.acoes_corretivas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete corrective actions for their RNCs" ON public.acoes_corretivas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);

-- Create RLS policies for effectiveness evaluations
CREATE POLICY "Users can view all effectiveness evaluations" ON public.avaliacoes_eficacia FOR SELECT USING (true);
CREATE POLICY "Users can create effectiveness evaluations for their RNCs" ON public.avaliacoes_eficacia FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update effectiveness evaluations for their RNCs" ON public.avaliacoes_eficacia FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete effectiveness evaluations for their RNCs" ON public.avaliacoes_eficacia FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.rncs WHERE id = rnc_id AND user_id = auth.uid())
);

-- Create function to generate RNC number
CREATE OR REPLACE FUNCTION public.generate_rnc_number()
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    rnc_number TEXT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_rnc FROM 4 FOR 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.rncs
    WHERE numero_rnc LIKE 'RNC' || year_suffix || '%';
    
    rnc_number := 'RNC' || year_suffix || LPAD(counter::TEXT, 4, '0');
    
    RETURN rnc_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rncs_updated_at
    BEFORE UPDATE ON public.rncs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_imediatas_updated_at
    BEFORE UPDATE ON public.acoes_imediatas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_corretivas_updated_at
    BEFORE UPDATE ON public.acoes_corretivas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_eficacia_updated_at
    BEFORE UPDATE ON public.avaliacoes_eficacia
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('evidencias', 'evidencias', false);

-- Create storage policies for evidence files
CREATE POLICY "Users can view evidence files" ON storage.objects FOR SELECT USING (bucket_id = 'evidencias');
CREATE POLICY "Users can upload evidence files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their evidence files" ON storage.objects FOR UPDATE USING (bucket_id = 'evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their evidence files" ON storage.objects FOR DELETE USING (bucket_id = 'evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);