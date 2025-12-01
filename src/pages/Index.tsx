import { useEffect, useState } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuestionChart } from "@/components/dashboard/QuestionChart";
import { CommentsSection } from "@/components/dashboard/CommentsSection";
import { VersionComparison } from "@/components/dashboard/VersionComparison";
import { parseSurveyCSV, analyzeSurvey, analyzeByVersion, SurveyAnalysis, VersionComparison as VersionComparisonType } from "@/utils/surveyParser";
import { loadSurveyData } from "@/utils/dataLoader";
import { MessageSquare, Users, CheckCircle, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null);
  const [versionComparison, setVersionComparison] = useState<VersionComparisonType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const csvContent = await loadSurveyData();
      
      const responses = parseSurveyCSV(csvContent);
      const surveyAnalysis = analyzeSurvey(responses);
      const versionData = analyzeByVersion(responses);
      
      setAnalysis(surveyAnalysis);
      setVersionComparison(versionData);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido ao carregar dados");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <div className="space-y-2 text-sm">
              <p><strong>Possíveis soluções:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Verifique se a URL está configurada corretamente no arquivo .env</li>
                <li>Certifique-se de que o link é público e acessível</li>
                <li>Exporte a planilha como CSV e gere um link de compartilhamento público</li>
              </ul>
            </div>
            <Button onClick={loadData} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const averageSatisfaction = Math.round(
    analysis.questions.reduce((sum, q) => sum + q.satisfactionRate, 0) / analysis.questions.length
  );

  const allComments = analysis.questions.flatMap(q => q.comments).filter(c => c.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Projeto IA30 – PUMA
              </h1>
              <p className="text-muted-foreground mt-1">
                Visão Geral do Formulário | Chatbot Troca e Devolução
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <p className="text-sm text-muted-foreground">
                  Última atualização: {lastUpdate.toLocaleString('pt-BR')}
                </p>
              )}
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Indicadores Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Respostas"
              value={analysis.totalResponses}
              icon={Users}
              description="Avaliações coletadas"
            />
            <MetricCard
              title="Satisfação Geral"
              value={`${averageSatisfaction}%`}
              icon={TrendingUp}
              description="Respostas positivas (média)"
            />
            <MetricCard
              title="Taxa de Resolução"
              value={`${analysis.questions.find(q => q.id === "q5")?.satisfactionRate || 0}%`}
              icon={CheckCircle}
              description="Demandas resolvidas"
            />
            <MetricCard
              title="Comentários"
              value={allComments.length}
              icon={MessageSquare}
              description="Feedbacks qualitativos"
            />
          </div>
        </section>

        {/* Questions Analysis */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Análise Detalhada por Dimensão
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.questions.map(question => (
              <QuestionChart
                key={question.id}
                title={question.title}
                data={question.distribution}
                score={question.score}
                satisfactionRate={question.satisfactionRate}
              />
            ))}
          </div>
        </section>

        {/* Version Comparison */}
        {versionComparison && (
          <section>
            <VersionComparison comparison={versionComparison} />
          </section>
        )}

        {/* Key Insights */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Principais Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analysis.questions
              .sort((a, b) => b.satisfactionRate - a.satisfactionRate)
              .slice(0, 3)
              .map((question, index) => (
                <div
                  key={question.id}
                  className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-primary">
                      {index === 0 ? "Ponto Forte" : index === 1 ? "Destaque" : "Oportunidade"}
                    </span>
                    <span className="text-2xl font-bold text-success">{question.satisfactionRate}%</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{question.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {question.distribution
                      .filter(d => d.count > 0)
                      .slice(0, 2)
                      .map(d => `${d.percentage}% ${d.label}`)
                      .join(", ")}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* Comments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Feedbacks dos Usuários</h2>
          <CommentsSection
            title="Todos os Comentários (Anônimos)"
            comments={allComments}
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border">
          <p>Dashboard gerado automaticamente • Dados 100% anônimos</p>
          <p className="mt-1">Projeto IA30 – PUMA © 2025</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
