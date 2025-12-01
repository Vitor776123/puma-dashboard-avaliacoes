/**
 * Carrega os dados da pesquisa a partir de um CSV estático em /public/data
 */
export const loadSurveyData = async (): Promise<string> => {
  console.log('Carregando dados do arquivo local estático /data/survey-data.csv');

  try {
    // Em produção (Vercel) e em dev (npm run dev), tudo que está em /public
    // fica disponível pela raiz do site. Por isso usamos /data/survey-data.csv
    const response = await fetch('/data/survey-data.csv');

    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo CSV: ${response.status}`);
    }

    const text = await response.text();
    console.log('✔ Dados carregados com sucesso');
    return text;
  } catch (error) {
    console.error('✘ Erro ao carregar dados da pesquisa:', error);
    throw new Error('Não foi possível carregar os dados da pesquisa');
  }
};
