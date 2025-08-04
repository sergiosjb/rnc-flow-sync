import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface EvidenciasDisplayProps {
  evidencias: string[];
  canEdit?: boolean;
  onEvidenciasChange?: (evidencias: string[]) => void;
}

export function EvidenciasDisplay({ evidencias, canEdit = false, onEvidenciasChange }: EvidenciasDisplayProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadFile = async (filePath: string) => {
    try {
      setDownloading(filePath);
      
      const { data, error } = await supabase.storage
        .from('evidencias')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName(filePath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download realizado com sucesso!",
        description: "O arquivo foi baixado para seu dispositivo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer download",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const removeFile = async (fileToRemove: string) => {
    if (!canEdit || !onEvidenciasChange) return;

    try {
      // Remove from storage
      await supabase.storage
        .from('evidencias')
        .remove([fileToRemove]);

      const newEvidencias = evidencias.filter(file => file !== fileToRemove);
      onEvidenciasChange(newEvidencias);

      toast({
        title: "Arquivo removido",
        description: "Arquivo removido das evidências.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover arquivo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('evidencias')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const isImage = (filePath: string) => {
    return filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  if (!evidencias || evidencias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evidências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma evidência anexada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidências ({evidencias.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidencias.map((filePath, index) => (
            <div key={index} className="relative group">
              <div className="border rounded-lg overflow-hidden">
                {isImage(filePath) ? (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img
                      src={getFileUrl(filePath)}
                      alt={`Evidência ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></div>';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate" title={getFileName(filePath)}>
                    {getFileName(filePath)}
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(filePath)}
                      disabled={downloading === filePath}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {downloading === filePath ? "Baixando..." : "Download"}
                    </Button>
                    
                    {canEdit && onEvidenciasChange && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(filePath)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}