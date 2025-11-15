import { Progress } from "@/components/ui/progress";

interface ConfidenceMeterProps {
  score: number;
  prediction: string;
}

const ConfidenceMeter = ({ score, prediction }: ConfidenceMeterProps) => {
  const percentage = score * 100;

  const getColor = () => {
    if (prediction === "fake") {
      if (percentage >= 70) return "bg-destructive";
      if (percentage >= 40) return "bg-warning";
      return "bg-muted-foreground";
    }
    
    if (prediction === "authentic") {
      if (percentage >= 70) return "bg-success";
      if (percentage >= 40) return "bg-warning";
      return "bg-muted-foreground";
    }
    
    return "bg-warning";
  };

  const getLabel = () => {
    if (percentage >= 70) return "High Confidence";
    if (percentage >= 40) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Confidence Level</span>
        <span className="text-sm text-muted-foreground">{getLabel()}</span>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ConfidenceMeter;