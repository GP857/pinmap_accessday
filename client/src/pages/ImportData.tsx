import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle2, AlertCircle, Database } from "lucide-react";

export default function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    totalRecords?: number;
    processedIntervals?: number;
  } | null>(null);

  const importMutation = trpc.import.importPinmapData.useMutation();
  const statsQuery = trpc.import.getImportStats.useQuery();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // Ler arquivo JSON
      const text = await file.text();
      const data = JSON.parse(text);

      // Enviar para API
      const response = await importMutation.mutateAsync({ data });

      setResult({
        success: true,
        message: response.message,
        totalRecords: response.totalRecords,
        processedIntervals: response.processedIntervals,
      });

      // Atualizar estatísticas
      statsQuery.refetch();

      // Limpar arquivo
      setFile(null);
    } catch (error) {
      setResult({
        success: false,
        message: `Erro ao importar dados: ${error}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Database className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Importar Dados do Pinmap</h1>
            <p className="text-gray-600">
              Faça upload do arquivo eclub_db.dailyaccesses.json para atualizar os dados de acessos
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Atuais</CardTitle>
            <CardDescription>Estatísticas dos dados importados no banco</CardDescription>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statsQuery.data?.totalRecords?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Data Inicial</p>
                  <p className="text-lg font-semibold text-green-600">
                    {statsQuery.data?.dateRange?.start
                      ? new Date(statsQuery.data.dateRange.start).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Data Final</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {statsQuery.data?.dateRange?.end
                      ? new Date(statsQuery.data.dateRange.end).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo</CardTitle>
            <CardDescription>
              Selecione o arquivo eclub_db.dailyaccesses.json exportado pelo Pinmap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {file ? file.name : "Clique para selecionar arquivo"}
                </p>
                <p className="text-sm text-gray-500 mt-2">Apenas arquivos .json</p>
              </label>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? "Importando..." : "Importar Dados"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <p className="font-semibold">{result.message}</p>
              {result.totalRecords && (
                <p className="text-sm mt-2">
                  {result.totalRecords.toLocaleString()} registros processados em{" "}
                  {result.processedIntervals?.toLocaleString()} intervalos únicos
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1.</strong> Execute o script de automação do Pinmap:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">python3 automacao_pinmap.py</code>
            </p>
            <p>
              <strong>2.</strong> Localize o arquivo exportado:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">eclub_db.dailyaccesses.json</code>
            </p>
            <p>
              <strong>3.</strong> Faça upload do arquivo usando o botão acima
            </p>
            <p>
              <strong>4.</strong> Aguarde o processamento (pode levar alguns segundos)
            </p>
            <p>
              <strong>5.</strong> Os dados serão automaticamente convertidos para intervalos de 30
              minutos
            </p>
            <p className="text-amber-600 font-medium mt-4">
              ⚠️ Atenção: A importação substitui todos os dados existentes no banco!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
