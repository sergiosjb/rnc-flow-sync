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
    requisito_ferido: '',
    tipo_requisito: 'interno',
    local_ocorrencia: '',
    data_ocorrencia: '',
    processo_afetado: '',
    responsavel: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await (supabase as any)
        .from('rncs')
        .insert([{
          ...formData,
          status: 'aberto'
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
                  <Label htmlFor="tipo_requisito">Tipo de Requisito *</Label>
                  <Select value={formData.tipo_requisito} onValueChange={(value) => handleInputChange('tipo_requisito', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno">Interno</SelectItem>
                      <SelectItem value="externo">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requisito_ferido">Requisito Ferido *</Label>
                  <Input
                    id="requisito_ferido"
                    value={formData.requisito_ferido}
                    onChange={(e) => handleInputChange('requisito_ferido', e.target.value)}
                    placeholder="Ex: ISO 9001:2015 - Cláusula 8.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local_ocorrencia">Local da Ocorrência *</Label>
                  <Input
                    id="local_ocorrencia"
                    value={formData.local_ocorrencia}
                    onChange={(e) => handleInputChange('local_ocorrencia', e.target.value)}
                    placeholder="Ex: Linha de Produção 1, Almoxarifado..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_ocorrencia">Data da Ocorrência *</Label>
                  <Input
                    id="data_ocorrencia"
                    type="date"
                    value={formData.data_ocorrencia}
                    onChange={(e) => handleInputChange('data_ocorrencia', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processo_afetado">Processo Afetado *</Label>
                  <Input
                    id="processo_afetado"
                    value={formData.processo_afetado}
                    onChange={(e) => handleInputChange('processo_afetado', e.target.value)}
                    placeholder="Ex: Produção, Qualidade, Compras..."
                    required
                  />
                </div>

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