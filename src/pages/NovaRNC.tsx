import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function NovaRNC() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    descricao: '',
    setor: '',
    criticidade: 'media',
    origem: '',
    data_abertura: '',
    responsavel: '',
    data_prazo: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Generate RNC number
      const { data: rncNumber, error: numberError } = await supabase
        .rpc('generate_rnc_number');

      if (numberError) throw numberError;

      const { error } = await supabase
        .from('rncs')
        .insert([{
          ...formData,
          numero_rnc: rncNumber,
          user_id: user.id,
          status: 'aberta'
        }]);

      if (error) throw error;

      toast({
        title: "RNC criada com sucesso!",
        description: "A não conformidade foi registrada no sistema.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao criar RNC",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nova RNC</h1>
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
                  <Label htmlFor="data_abertura">Data de Abertura *</Label>
                  <Input
                    id="data_abertura"
                    type="date"
                    value={formData.data_abertura}
                    onChange={(e) => handleInputChange('data_abertura', e.target.value)}
                    required
                  />
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
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar RNC"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}