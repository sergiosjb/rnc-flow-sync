-- Criar políticas para o bucket evidencias
CREATE POLICY "Usuários autenticados podem ver evidências" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'evidencias' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem fazer upload de evidências" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'evidencias' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar suas próprias evidências" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'evidencias' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem deletar suas próprias evidências" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'evidencias' AND auth.role() = 'authenticated');