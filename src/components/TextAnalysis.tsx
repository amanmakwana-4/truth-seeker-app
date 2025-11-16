import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfidenceMeter from "./ConfidenceMeter";
import { SocialShare } from "./SocialShare";

const TextAnalysis = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 10000) {
      toast({
        title: "Text too long",
        description: "Please limit your input to 10,000 characters",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: { text },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Your text has been analyzed successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    switch (result.prediction) {
      case "fake":
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      case "authentic":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-warning" />;
    }
  };

  const getResultColor = () => {
    if (!result) return "";
    
    switch (result.prediction) {
      case "fake":
        return "text-destructive";
      case "authentic":
        return "text-success";
      default:
        return "text-warning";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Analysis</CardTitle>
          <CardDescription>
            Enter up to 10,000 characters of text to analyze for authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste the text you want to analyze here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-y"
              maxLength={10000}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {text.length} / 10,000 characters
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Text"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getResultIcon()}
              <div>
                <CardTitle className={getResultColor()}>
                  {result.prediction === "fake" && "Likely Fake News"}
                  {result.prediction === "authentic" && "Likely Authentic"}
                  {result.prediction === "uncertain" && "Uncertain"}
                </CardTitle>
                <CardDescription>
                  Analysis completed in {result.processingTime}ms
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ConfidenceMeter
              score={result.confidenceScore}
              prediction={result.prediction}
            />

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model Version</p>
                <p className="font-medium">{result.modelVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                <p className="font-medium">{(result.confidenceScore * 100).toFixed(1)}%</p>
              </div>
            </div>

            {result.explanation && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Analysis Explanation</h4>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextAnalysis;