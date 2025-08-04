import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface RNC {
  id: string;
  numero_rnc: string;
  descricao: string;
  status: string;
  processo_afetado: string;
  data_ocorrencia: string;
  responsavel: string;
  created_at: string;
}

export default function RNCList() {
  const [rncs, setRncs] = useState<RNC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchRNCs();
  }, []);

  const fetchRNCs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('rncs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRncs(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar RNCs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRNCs = rncs.filter(rnc => {
    const matchesSearch = rnc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rnc.numero_rnc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rnc.processo_afetado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rnc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'destructive';
      case 'em_avaliacao': return 'default';
      case 'fechado': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberto': return 'Aberto';
      case 'em_avaliacao': return 'Em Avaliação';
      case 'fechado': return 'Fechado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Relatórios de Não Conformidade</h1>
        <Button onClick={() => navigate('/nova-rnc')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova RNC
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, descrição ou processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_avaliacao">Em Avaliação</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de RNCs */}
      <div className="space-y-4">
        {filteredRNCs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {rncs.length === 0 
                  ? "Nenhuma RNC cadastrada ainda."
                  : "Nenhuma RNC encontrada com os filtros aplicados."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRNCs.map((rnc) => (
            <Card key={rnc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rnc.numero_rnc}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(rnc.data_ocorrencia).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(rnc.status)}>
                    {getStatusLabel(rnc.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">{rnc.descricao}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Processo:</span> {rnc.processo_afetado}
                    <br />
                    <span className="font-medium">Responsável:</span> {rnc.responsavel}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/rnc/${rnc.id}`)}>
                    <Eye className="mr-2 h-3 w-3" />
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}