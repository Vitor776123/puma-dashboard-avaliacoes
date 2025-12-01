import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface CommentsSectionProps {
  title: string;
  comments: string[];
}

export const CommentsSection = ({ title, comments }: CommentsSectionProps) => {
  const validComments = comments.filter(c => c && c.trim().length > 0);

  if (validComments.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {validComments.length} {validComments.length === 1 ? "comentário" : "comentários"}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {validComments.map((comment, index) => (
          <div
            key={index}
            className="p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
          >
            <p className="text-sm text-foreground leading-relaxed">{comment}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
