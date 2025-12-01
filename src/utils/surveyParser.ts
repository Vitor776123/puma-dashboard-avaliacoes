export interface SurveyResponse {
  id: number;
  date: string;
  version: "V1" | "V2";
  responses: {
    q1: string; // Linguagem empática
    q1Comment: string;
    q2: string; // Perguntas assertivas
    q2Comment: string;
    q3: string; // Conversa fluída
    q3Comment: string;
    q4: string; // Bot disponível
    q4Comment: string;
    q5: string; // Demanda resolvida
    q5Comment: string;
    q6: string; // Experiência geral
    q6Comment: string;
  };
}

export interface SurveyAnalysis {
  totalResponses: number;
  questions: {
    id: string;
    title: string;
    distribution: {
      label: string;
      count: number;
      percentage: number;
      color: string;
    }[];
    score: number; // 0-100 (média ponderada)
    satisfactionRate: number; // % de respostas positivas (Concordo + Concordo totalmente)
    comments: string[];
  }[];
}

export interface VersionComparison {
  v1: SurveyAnalysis;
  v2: SurveyAnalysis;
}

const likertScale = [
  { label: "Concordo totalmente", value: 5, color: "hsl(var(--success))" },
  { label: "Concordo", value: 4, color: "hsl(var(--accent))" },
  { label: "Não concordo, nem discordo", value: 3, color: "hsl(var(--warning))" },
  { label: "Nem concordo, nem discordo", value: 3, color: "hsl(var(--warning))" },
  { label: "Discordo", value: 2, color: "hsl(var(--destructive))" },
  { label: "Discordo totalmente", value: 1, color: "hsl(var(--destructive))" },
];

const normalizeVersion = (version: string): "V1" | "V2" => {
  const normalized = version.trim().toUpperCase();
  return normalized === "V2" ? "V2" : "V1";
};

const parseCSVLine = (content: string, delimiter: string = ';'): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of cell
      currentRow.push(currentCell);
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      currentRow.push(currentCell);
      if (currentRow.some(cell => cell.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  // Add last cell and row if not empty
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some(cell => cell.trim() !== '')) {
      rows.push(currentRow);
    }
  }
  
  return rows;
};

export const parseSurveyCSV = (csvContent: string): SurveyResponse[] => {
  const responses: SurveyResponse[] = [];
  
  // Remove BOM if present
  const cleanContent = csvContent.replace(/^\ufeff/, '');
  
  // Parse CSV properly handling quoted fields with line breaks
  const rows = parseCSVLine(cleanContent, ';');
  
  // Skip header rows (first 2 rows)
  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i];
    
    // Check if this is a valid data row (starts with a number)
    const id = parseInt(cells[0]?.trim() || '');
    if (isNaN(id) || id === 0) continue;
    
    const dateStr = cells[1]?.trim() || "";
    if (!dateStr) continue;
    
    try {
      // Debug: log all cells for rows 10 and 11
      if (id === 10 || id === 11) {
        console.log(`\n=== DEBUG ID ${id} ===`);
        cells.forEach((cell, idx) => {
          console.log(`  Cell[${idx}]: "${cell}"`);
        });
      }
      
      // Read version from last column - find the last non-empty cell
      let versionStr = "";
      for (let j = cells.length - 1; j >= 0; j--) {
        const cellValue = cells[j]?.trim() || "";
        if (cellValue && (cellValue.toUpperCase() === "V1" || cellValue.toUpperCase() === "V2")) {
          versionStr = cellValue;
          break;
        }
      }
      
      // Default to V1 if no version found
      if (!versionStr) {
        versionStr = "V1";
      }
      
      const version = normalizeVersion(versionStr);
      
      console.log(`ID ${id}: versionStr="${versionStr}" -> version=${version}, cells.length=${cells.length}`);

      responses.push({
        id,
        date: dateStr,
        version,
        responses: {
          q1: cells[7]?.trim() || "",
          q1Comment: cells[8]?.trim() || "",
          q2: cells[9]?.trim() || "",
          q2Comment: cells[10]?.trim() || "",
          q3: cells[11]?.trim() || "",
          q3Comment: cells[12]?.trim() || "",
          q4: cells[13]?.trim() || "",
          q4Comment: cells[14]?.trim() || "",
          q5: cells[15]?.trim() || "",
          q5Comment: cells[16]?.trim() || "",
          q6: cells[17]?.trim() || "",
          q6Comment: cells[18]?.trim() || "",
        },
      });
    } catch (error) {
      console.warn(`Erro ao processar linha ID ${id}:`, error);
      continue;
    }
  }

  console.log(`Total de respostas processadas: ${responses.length}`);
  console.log(`V1: ${responses.filter(r => r.version === "V1").length} respostas`);
  console.log(`V2: ${responses.filter(r => r.version === "V2").length} respostas`);

  return responses;
};

const normalizeResponse = (response: string): string => {
  const normalized = response.toLowerCase().trim();
  
  if (normalized.includes("concordo totalmente")) return "Concordo totalmente";
  if (normalized === "concordo") return "Concordo";
  if (normalized.includes("nem concordo") || normalized.includes("não concordo")) return "Nem concordo, nem discordo";
  if (normalized === "discordo") return "Discordo";
  if (normalized.includes("discordo totalmente")) return "Discordo totalmente";
  
  return response;
};

export const analyzeSurvey = (responses: SurveyResponse[]): SurveyAnalysis => {
  const questions = [
    {
      id: "q1",
      title: "Linguagem empática e natural",
      description: "O bot utilizou uma linguagem empática e natural, parecendo uma conversa humana",
    },
    {
      id: "q2",
      title: "Perguntas e respostas assertivas",
      description: "As perguntas e respostas foram assertivas, ajudando a chegar rapidamente à solução",
    },
    {
      id: "q3",
      title: "Conversa fluida",
      description: "A conversa foi fluída, sem quebras de contexto ou repetições desnecessárias",
    },
    {
      id: "q4",
      title: "Bot disponível e interessado",
      description: "O bot se manteve à disposição e demonstrou interesse em continuar ajudando",
    },
    {
      id: "q5",
      title: "Demanda resolvida",
      description: "O usuário teria a sua demanda considerada resolvida após o atendimento",
    },
    {
      id: "q6",
      title: "Experiência geral",
      description: "De forma geral, a experiência com o bot foi agradável e eficiente",
    },
  ];

  const analysis: SurveyAnalysis = {
    totalResponses: responses.length,
    questions: questions.map(q => {
      const counts = new Map<string, number>();
      const comments: string[] = [];
      let totalScore = 0;
      let validResponses = 0;

      responses.forEach(response => {
        const answer = normalizeResponse(response.responses[q.id as keyof typeof response.responses]);
        const comment = response.responses[`${q.id}Comment` as keyof typeof response.responses];

        if (answer) {
          counts.set(answer, (counts.get(answer) || 0) + 1);
          
          const scaleItem = likertScale.find(s => s.label === answer);
          if (scaleItem) {
            totalScore += scaleItem.value;
            validResponses++;
          }
        }

        if (comment) {
          comments.push(comment);
        }
      });

      const distribution = likertScale.map(scale => ({
        label: scale.label,
        count: counts.get(scale.label) || 0,
        percentage: Math.round(((counts.get(scale.label) || 0) / responses.length) * 100),
        color: scale.color,
      }));

      // Score médio ponderado (0-100)
      const score = validResponses > 0 ? Math.round((totalScore / (validResponses * 5)) * 100) : 0;

      // Taxa de satisfação: % de respostas positivas (Concordo + Concordo totalmente)
      const positiveResponses = (counts.get("Concordo totalmente") || 0) + (counts.get("Concordo") || 0);
      const satisfactionRate = responses.length > 0 ? Math.round((positiveResponses / responses.length) * 100) : 0;

      return {
        id: q.id,
        title: q.title,
        distribution,
        score,
        satisfactionRate,
        comments,
      };
    }),
  };

  return analysis;
};

export const analyzeByVersion = (responses: SurveyResponse[]): VersionComparison => {
  const v1Responses = responses.filter(r => r.version === "V1");
  const v2Responses = responses.filter(r => r.version === "V2");

  return {
    v1: analyzeSurvey(v1Responses),
    v2: analyzeSurvey(v2Responses),
  };
};
