import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Calendar, User, Building, AlertTriangle } from 'lucide-react';
import { EvidenciasDisplay } from '@/components/EvidenciasDisplay';

interface RNC {
  id: string;
  numero_rnc: string;
  descricao: string;
  setor: string;
  responsavel: string;
  criticidade: string;
  origem: string;
  status: string;
  data_abertura: string;
  data_prazo?: string;
  evidencias?: string[];
  created_at: string;
  updated_at: string;
}

interface AcaoImediata {
  id: string;
  descricao: string;
  responsavel: string;
  prazo?: string;
  status: string;
  observacoes?: string;
  created_at: string;
}

interface AcaoCorretiva {
  id: string;
  descricao: string;
  responsavel: string;
  prazo?: string;
  status: string;
  observacoes?: string;
  created_at: string;
}

interface AvaliacaoEficacia {
  id: string;
  descricao: string;
  resultado: string;
  data_avaliacao: string;
  responsavel: string;
  observacoes?: string;
  created_at: string;
}

export default function RNCDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rnc, setRnc] = useState<RNC | null>(null);
  const [acoesImediatas, setAcoesImediatas] = useState<AcaoImediata[]>([]);
  const [acoesCorretivas, setAcoesCorretivas] = useState<AcaoCorretiva[]>([]);
  const [avaliacoesEficacia, setAvaliacoesEficacia] = useState<AvaliacaoEficacia[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEditRNC = () => {
    navigate(`/editar-rnc/${id}`);
  };

  const handleAddImmediateAction = () => {
    navigate(`/rnc/${id}/acao-imediata`);
  };

  const handleAddCorrectiveAction = () => {
    navigate(`/rnc/${id}/acao-corretiva`);
  };

  const handleEvaluateEffectiveness = () => {
    navigate(`/rnc/${id}/avaliacao-eficacia`);
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRNC(),
        fetchAcoesImediatas(),
        fetchAcoesCorretivas(),
        fetchAvaliacoesEficacia()
      ]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRNC = async () => {
    const { data, error } = await supabase
      .from('rncs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Convert evidencias to string array
    const rncData = {
      ...data,
      evidencias: Array.isArray(data.evidencias) ? data.evidencias.map(item => String(item)) : []
    };
    
    setRnc(rncData);
  };

  const fetchAcoesImediatas = async () => {
    const { data, error } = await supabase
      .from('acoes_imediatas')
      .select('*')
      .eq('rnc_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAcoesImediatas(data || []);
  };

  const fetchAcoesCorretivas = async () => {
    const { data, error } = await supabase
      .from('acoes_corretivas')
      .select('*')
      .eq('rnc_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAcoesCorretivas(data || []);
  };

  const fetchAvaliacoesEficacia = async () => {
    const { data, error } = await supabase
      .from('avaliacoes_eficacia')
      .select('*')
      .eq('rnc_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAvaliacoesEficacia(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'destructive';
      case 'em_andamento': return 'secondary';
      case 'fechada': return 'default';
      case 'cancelada': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'fechada': return 'Fechada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'baixa': return 'default';
      case 'media': return 'secondary';
      case 'alta': return 'destructive';
      case 'critica': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCriticidadeLabel = (criticidade: string) => {
    switch (criticidade) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      case 'critica': return 'Crítica';
      default: return criticidade;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'destructive';
      case 'em_andamento': return 'secondary';
      case 'concluida': return 'default';
      default: return 'secondary';
    }
  };

  const getActionStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
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

  if (!rnc) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">RNC não encontrada</h2>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Voltar para a lista
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{rnc.numero_rnc}</h1>
              <p className="text-muted-foreground">Detalhes da não conformidade</p>
            </div>
          </div>
          <Button onClick={handleEditRNC}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Descrição</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rnc.descricao}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Setor</p>
                      <p className="font-medium">{rnc.setor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="font-medium">{rnc.responsavel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Origem</p>
                      <p className="font-medium">{rnc.origem}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data de Abertura</p>
                      <p className="font-medium">
                        {new Date(rnc.data_abertura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {rnc.data_prazo && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data Prazo</p>
                        <p className="font-medium">
                          {new Date(rnc.data_prazo).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ações Imediatas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ações Imediatas
                  <Badge variant="outline">{acoesImediatas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acoesImediatas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma ação imediata registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {acoesImediatas.map((acao) => (
                      <div key={acao.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getActionStatusColor(acao.status)}>
                            {getActionStatusLabel(acao.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(acao.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{acao.descricao}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Responsável:</span> {acao.responsavel}</p>
                          {acao.prazo && (
                            <p><span className="font-medium">Prazo:</span> {new Date(acao.prazo).toLocaleDateString('pt-BR')}</p>
                          )}
                          {acao.observacoes && (
                            <p><span className="font-medium">Observações:</span> {acao.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações Corretivas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ações Corretivas
                  <Badge variant="outline">{acoesCorretivas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acoesCorretivas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma ação corretiva registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {acoesCorretivas.map((acao) => (
                      <div key={acao.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getActionStatusColor(acao.status)}>
                            {getActionStatusLabel(acao.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(acao.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{acao.descricao}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Responsável:</span> {acao.responsavel}</p>
                          {acao.prazo && (
                            <p><span className="font-medium">Prazo:</span> {new Date(acao.prazo).toLocaleDateString('pt-BR')}</p>
                          )}
                          {acao.observacoes && (
                            <p><span className="font-medium">Observações:</span> {acao.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Avaliações de Eficácia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Avaliações de Eficácia
                  <Badge variant="outline">{avaliacoesEficacia.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {avaliacoesEficacia.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma avaliação de eficácia registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {avaliacoesEficacia.map((avaliacao) => (
                      <div key={avaliacao.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Avaliada em: {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{avaliacao.descricao}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Responsável:</span> {avaliacao.responsavel}</p>
                          <p><span className="font-medium">Resultado:</span> {avaliacao.resultado}</p>
                          {avaliacao.observacoes && (
                            <p><span className="font-medium">Observações:</span> {avaliacao.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidências */}
            <EvidenciasDisplay evidencias={rnc.evidencias || []} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status Atual</p>
                  <Badge variant={getStatusColor(rnc.status)}>
                    {getStatusLabel(rnc.status)}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Criticidade</p>
                  <Badge variant={getCriticidadeColor(rnc.criticidade)}>
                    {getCriticidadeLabel(rnc.criticidade)}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Criado em:</span>{' '}
                    {new Date(rnc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <span className="font-medium">Atualizado em:</span>{' '}
                    {new Date(rnc.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" onClick={handleAddImmediateAction}>
                    Adicionar Ação Imediata
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleAddCorrectiveAction}>
                    Adicionar Ação Corretiva
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleEvaluateEffectiveness}>
                    Avaliar Eficácia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}