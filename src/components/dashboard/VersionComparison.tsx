import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { VersionComparison as VersionComparisonType } from "@/utils/surveyParser";

interface VersionComparisonProps {
  comparison: VersionComparisonType;
}

export const VersionComparison = ({ comparison }: VersionComparisonProps) => {
  const chartData = comparison.v1.questions.map((q1, index) => {
    const q2 = comparison.v2.questions[index];
    return {
      name: q1.title.length > 30 ? q1.title.substring(0, 30) + "..." : q1.title,
      fullName: q1.title,
      V1: q1.satisfactionRate,
      V2: q2.satisfactionRate,
    };
  });

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Comparação de Evolução: V1 vs V2
        </h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">V1:</span> {comparison.v1.totalResponses} respostas
          </div>
          <div>
            <span className="font-medium">V2:</span> {comparison.v2.totalResponses} respostas
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--foreground))"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            tick={{ fill: "hsl(var(--foreground))" }}
            domain={[0, 100]}
            label={{ value: "% Satisfação", angle: -90, position: "insideLeft", fill: "hsl(var(--foreground))" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="V1" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line 
            type="monotone" 
            dataKey="V2" 
            stroke="hsl(var(--success))" 
            strokeWidth={3}
            dot={{ fill: "hsl(var(--success))", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Table */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-primary/5">
          <h4 className="font-semibold text-primary mb-2">V1 - Média Geral</h4>
          <p className="text-3xl font-bold text-foreground">
            {Math.round(
              comparison.v1.questions.reduce((sum, q) => sum + q.satisfactionRate, 0) / 
              comparison.v1.questions.length
            )}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Satisfação média</p>
        </Card>
        
        <Card className="p-4 bg-success/5">
          <h4 className="font-semibold text-success mb-2">V2 - Média Geral</h4>
          <p className="text-3xl font-bold text-foreground">
            {Math.round(
              comparison.v2.questions.reduce((sum, q) => sum + q.satisfactionRate, 0) / 
              comparison.v2.questions.length
            )}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Satisfação média</p>
        </Card>
      </div>

      {/* Evolution Details */}
      <div className="mt-6">
        <h4 className="font-semibold text-foreground mb-3">Detalhamento por Dimensão</h4>
        <div className="space-y-2">
          {comparison.v1.questions.map((q1, index) => {
            const q2 = comparison.v2.questions[index];
            const diff = q2.satisfactionRate - q1.satisfactionRate;
            const isPositive = diff > 0;
            
            return (
              <div key={q1.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground flex-1">{q1.title}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">V1: {q1.satisfactionRate}%</span>
                  <span className="text-sm text-muted-foreground">V2: {q2.satisfactionRate}%</span>
                  <span className={`text-sm font-semibold ${isPositive ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isPositive ? '+' : ''}{diff}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
