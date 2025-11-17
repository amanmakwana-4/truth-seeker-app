import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfidenceMeter from "./ConfidenceMeter";
import { SocialShare } from "./SocialShare";

const UrlCrawler = () => {
  const [url, setUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleCrawl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsCrawling(true);
    setArticle(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("crawl-url", {
        body: { url },
      });

      if (error) throw error;

      setArticle(data);
      toast({
        title: "Article crawled successfully",
        description: "Review the extracted content before analyzing",
      });
    } catch (error: any) {
      console.error("Crawl error:", error);
      toast({
        title: "Crawl failed",
        description: error.message || "Failed to crawl URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAnalyze = async () => {
    if (!article?.text) return;

    setIsCrawling(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: { 
          text: article.text,
          url: article.url,
          title: article.title,
        },
      });

      if (error) throw error;

      setResult(data);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("analyses").insert({
        input_text: article.text,
        url: article.url,
        article_title: article.title,
        analysis_type: "url",
        prediction: data.prediction,
        confidence_score: data.confidenceScore,
        model_version: data.modelVersion,
        processing_time_ms: data.processingTime,
        user_id: user?.id || null,
      });

      toast({
        title: "Analysis complete",
        description: "The article has been analyzed successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCrawling(false);
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
          <CardTitle>URL Crawler</CardTitle>
          <CardDescription>
            Enter a URL to crawl and analyze the article content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
            <Button
              onClick={handleCrawl}
              disabled={isCrawling || !url.trim()}
              className="whitespace-nowrap"
            >
              {isCrawling && !article ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Crawling...
                </>
              ) : (
                "Crawl URL"
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            The crawler respects robots.txt and has a 10-second timeout.
          </p>
        </CardContent>
      </Card>

      {article && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Extracted Article
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardTitle>
            <CardDescription>{article.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm whitespace-pre-wrap">{article.text}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isCrawling}
                className="flex-1"
                size="lg"
              >
                {isCrawling && article ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Article"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

            <SocialShare
              prediction={result.prediction}
              confidence={result.confidenceScore}
              text={article.text}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlCrawler;