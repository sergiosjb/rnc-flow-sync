import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function AvaliacaoEficacia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    resultado: '',
    data_avaliacao: new Date().toISOString().split('T')[0],
    responsavel: '',
    observacoes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('avaliacoes_eficacia')
        .insert([{
          ...formData,
          rnc_id: id
        }]);

      if (error) throw error;

      toast({
        title: "Avaliação de eficácia criada com sucesso!",
        description: "A avaliação foi registrada no sistema.",
      });
      
      navigate(`/rnc/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao criar avaliação de eficácia",
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
          <Button variant="ghost" size="icon" onClick={() => navigate(`/rnc/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nova Avaliação de Eficácia</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Avaliação de Eficácia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Avaliação *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva o que está sendo avaliado..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultado">Resultado da Avaliação *</Label>
                <Textarea
                  id="resultado"
                  value={formData.resultado}
                  onChange={(e) => handleInputChange('resultado', e.target.value)}
                  placeholder="Descreva o resultado da avaliação de eficácia..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável pela Avaliação *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    placeholder="Nome do responsável pela avaliação"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_avaliacao">Data da Avaliação *</Label>
                  <Input
                    id="data_avaliacao"
                    type="date"
                    value={formData.data_avaliacao}
                    onChange={(e) => handleInputChange('data_avaliacao', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre a avaliação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(`/rnc/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Avaliação"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}