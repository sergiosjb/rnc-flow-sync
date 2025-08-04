import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { EvidenciasDisplay } from '@/components/EvidenciasDisplay';

export default function EditarRNC() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    descricao: '',
    setor: '',
    criticidade: 'media',
    origem: '',
    data_abertura: '',
    responsavel: '',
    data_prazo: '',
    status: 'aberta'
  });

  const [evidencias, setEvidencias] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchRNC();
    }
  }, [id]);

  const fetchRNC = async () => {
    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('rncs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData({
        descricao: data.descricao || '',
        setor: data.setor || '',
        criticidade: data.criticidade || 'media',
        origem: data.origem || '',
        data_abertura: data.data_abertura || '',
        responsavel: data.responsavel || '',
        data_prazo: data.data_prazo || '',
        status: data.status || 'aberta'
      });

      setEvidencias(Array.isArray(data.evidencias) ? data.evidencias.map(item => String(item)) : []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar RNC",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('rncs')
        .update({
          ...formData,
          evidencias: evidencias
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "RNC atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
      
      navigate(`/rnc/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar RNC",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/rnc/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/rnc/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Editar RNC</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Não Conformidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Não Conformidade *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva detalhadamente a não conformidade identificada..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor *</Label>
                  <Input
                    id="setor"
                    value={formData.setor}
                    onChange={(e) => handleInputChange('setor', e.target.value)}
                    placeholder="Ex: Produção, Qualidade, Compras..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criticidade">Criticidade *</Label>
                  <Select value={formData.criticidade} onValueChange={(value) => handleInputChange('criticidade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a criticidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origem">Origem *</Label>
                  <Input
                    id="origem"
                    value={formData.origem}
                    onChange={(e) => handleInputChange('origem', e.target.value)}
                    placeholder="Ex: Auditoria Interna, Cliente, Fornecedor..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="fechada">Fechada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    placeholder="Nome do responsável pelo processo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_prazo">Data Prazo</Label>
                  <Input
                    id="data_prazo"
                    type="date"
                    value={formData.data_prazo}
                    onChange={(e) => handleInputChange('data_prazo', e.target.value)}
                  />
                </div>
              </div>

              {/* Evidências Existentes */}
              {evidencias.length > 0 && (
                <div className="space-y-4">
                  <EvidenciasDisplay 
                    evidencias={evidencias} 
                    canEdit={true} 
                    onEvidenciasChange={setEvidencias} 
                  />
                </div>
              )}

              <FileUpload
                onFilesChange={setEvidencias}
                existingFiles={evidencias}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(`/rnc/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}