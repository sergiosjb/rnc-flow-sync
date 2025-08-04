import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (files: string[]) => void;
  existingFiles?: string[];
}

export function FileUpload({ onFilesChange, existingFiles = [] }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<string[]>(existingFiles);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('evidencias')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(uploadFile);
      const uploadedPaths = await Promise.all(uploadPromises);
      
      const newFiles = [...files, ...uploadedPaths];
      setFiles(newFiles);
      onFilesChange(newFiles);

      toast({
        title: "Arquivos enviados com sucesso!",
        description: `${uploadedPaths.length} arquivo(s) adicionado(s).`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar arquivo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedPath = await uploadFile(file);
      const newFiles = [...files, uploadedPath];
      setFiles(newFiles);
      onFilesChange(newFiles);

      toast({
        title: "Foto capturada com sucesso!",
        description: "Foto adicionada às evidências.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao capturar foto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileToRemove: string) => {
    try {
      // Remove from storage
      await supabase.storage
        .from('evidencias')
        .remove([fileToRemove]);

      const newFiles = files.filter(file => file !== fileToRemove);
      setFiles(newFiles);
      onFilesChange(newFiles);

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

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('evidencias')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <Label>Evidências (Fotos/Arquivos)</Label>
      
      <div className="flex gap-2 flex-wrap">
        {/* Camera capture */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={uploading}
            id="camera-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            asChild
          >
            <label htmlFor="camera-input" className="cursor-pointer">
              <Camera className="mr-2 h-4 w-4" />
              Tirar Foto
            </label>
          </Button>
        </div>

        {/* File upload */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={uploading}
            id="file-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            asChild
          >
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Arquivos
            </label>
          </Button>
        </div>
      </div>

      {uploading && (
        <div className="text-sm text-muted-foreground">
          Enviando arquivo(s)...
        </div>
      )}

      {/* Display uploaded files */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                {file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={getFileUrl(file)}
                    alt={`Evidência ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}