import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface QuestionChartProps {
  title: string;
  description?: string;
  data: {
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  score: number;
  satisfactionRate: number;
}

export const QuestionChart = ({ title, description, data, score, satisfactionRate }: QuestionChartProps) => {
  const chartData = data
    .filter(d => d.count > 0)
    .map(d => ({
      name: d.label,
      value: d.count,
      percentage: d.percentage,
      color: d.color,
    }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="p-6 border-border bg-card">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(satisfactionRate)}`}>
              {satisfactionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Satisfação</div>
            <div className="text-xs text-muted-foreground mt-1">
              Score médio: {score}%
            </div>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={150}
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} respostas (${props.payload.percentage}%)`,
              "",
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
