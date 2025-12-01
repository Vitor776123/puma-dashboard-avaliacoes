/**
 * Carrega os dados da pesquisa a partir de um arquivo CSV embutido no bundle.
 */

import surveyCsv from '../data/survey-data.csv?raw';

export const loadSurveyData = async (): Promise<string> => {
  try {
    console.log('Carregando dados do CSV embutido no bundle...');
    // O ?raw faz o Vite importar o conteúdo do CSV como string
    return surveyCsv;
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    throw new Error('Não foi possível carregar os dados da pesquisa');
  }
};
