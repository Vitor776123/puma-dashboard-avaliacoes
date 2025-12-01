import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OverallScoreProps {
  questions: {
    title: string;
    score: number;
  }[];
}

export const OverallScore = ({ questions }: OverallScoreProps) => {
  const averageScore = Math.round(
    questions.reduce((sum, q) => sum + q.score, 0) / questions.length
  );

  const chartData = questions.map(q => ({
    name: q.title,
    value: q.score,
  }));

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(215 70% 55%)",
    "hsl(195 60% 60%)",
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: "Excelente", color: "text-success" };
    if (score >= 60) return { text: "Bom", color: "text-accent" };
    if (score >= 40) return { text: "Regular", color: "text-warning" };
    return { text: "Precisa melhorias", color: "text-destructive" };
  };

  const scoreLabel = getScoreLabel(averageScore);

  return (
    <Card className="p-6 border-border bg-card">
      <h3 className="text-xl font-semibold text-foreground mb-6">Visão Geral de Satisfação</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-4">
            <div className={`text-6xl font-bold ${scoreLabel.color}`}>{averageScore}%</div>
            <div className={`text-lg font-medium ${scoreLabel.color} mt-2`}>
              {scoreLabel.text}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Satisfação Média Geral</div>
          </div>

          <div className="space-y-2 mt-6">
            {questions.map((q, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate flex-1">{q.title}</span>
                <span className="font-medium text-foreground ml-4">{q.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, "Satisfação"]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
