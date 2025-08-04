import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RNCStats {
  total: number;
  abertas: number;
  em_andamento: number;
  fechadas: number;
  criticas: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<RNCStats>({
    total: 0,
    abertas: 0,
    em_andamento: 0,
    fechadas: 0,
    criticas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all RNCs
      const { data: rncs, error } = await supabase
        .from('rncs')
        .select('status, criticidade');

      if (error) throw error;

      if (rncs) {
        const stats: RNCStats = {
          total: rncs.length,
          abertas: rncs.filter(rnc => rnc.status === 'aberta').length,
          em_andamento: rncs.filter(rnc => rnc.status === 'em_andamento').length,
          fechadas: rncs.filter(rnc => rnc.status === 'fechada').length,
          criticas: rncs.filter(rnc => rnc.criticidade === 'critica').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das não conformidades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de RNCs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Registros no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{loading ? '-' : stats.abertas}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando tratamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{loading ? '-' : stats.em_andamento}</div>
              <p className="text-xs text-muted-foreground">
                Sendo tratadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fechadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '-' : stats.fechadas}</div>
              <p className="text-xs text-muted-foreground">
                Resolvidas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>RNCs Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {loading ? '-' : stats.criticas}
                </div>
                <p className="text-sm text-muted-foreground">
                  Não conformidades que requerem atenção imediata
                </p>
                {stats.criticas > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    Ação Requerida
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Resolução</span>
                  <span className="font-medium">
                    {stats.total > 0 ? Math.round((stats.fechadas / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: stats.total > 0 ? `${(stats.fechadas / stats.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.fechadas} de {stats.total} RNCs resolvidas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}