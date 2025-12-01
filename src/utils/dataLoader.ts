export const loadSurveyData = async (): Promise<string> => {
  console.log('Carregando dados do arquivo local estático');
  try {
    const response = await fetch('/data/survey-data.csv');
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.status}`);
    }
    const text = await response.text();
    console.log('✔ Dados carregados com sucesso');
    return text;
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    throw new Error('Não foi possível carregar os dados da pesquisa');
  }
};
