import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, Download, Play, FileText } from "lucide-react";
import { format } from "date-fns";

interface BatchItem {
  input: string;
  type: 'text' | 'url';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  prediction?: string;
  confidence?: number;
  error?: string;
}

const Batch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<BatchItem[]>([]);
  const [results, setResults] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkAuth();

    // Subscribe to realtime updates for batch jobs
    const channel = supabase
      .channel('batch-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'batch_jobs'
        },
        (payload) => {
          console.log('Batch job update:', payload);
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast({
              title: "Batch Analysis Complete",
              description: `Analysis finished: ${payload.new.completed_items} items processed`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const parsed: BatchItem[] = [];
      lines.forEach((line, idx) => {
        if (idx === 0 && (line.toLowerCase().includes('url') || line.toLowerCase().includes('text'))) {
          return; // Skip header row
        }
        
        const trimmed = line.trim();
        if (trimmed) {
          const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
          parsed.push({
            input: trimmed,
            type: isUrl ? 'url' : 'text',
            status: 'pending'
          });
        }
      });

      setItems(parsed);
      toast({
        title: "File uploaded",
        description: `${parsed.length} items loaded for processing`,
      });
    };

    reader.readAsText(file);
  };

  const processBatch = async () => {
    setProcessing(true);
    setProgress(0);
    const processedResults: BatchItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Update status
        const updatedItems = [...items];
        updatedItems[i].status = 'processing';
        setItems([...updatedItems]);

        let analysisResult;

        if (item.type === 'url') {
          // Crawl URL first
          const { data: crawlData, error: crawlError } = await supabase.functions.invoke('crawl-url', {
            body: { url: item.input }
          });

          if (crawlError) throw crawlError;

          // Analyze the crawled content
          const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke('analyze-text', {
            body: { text: crawlData.article.content }
          });

          if (analyzeError) throw analyzeError;
          analysisResult = analyzeData;
        } else {
          // Analyze text directly
          const { data, error } = await supabase.functions.invoke('analyze-text', {
            body: { text: item.input }
          });

          if (error) throw error;
          analysisResult = data;
        }

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('analyses').insert({
          user_id: user?.id,
          prediction: analysisResult.prediction,
          confidence_score: analysisResult.confidenceScore,
          input_text: item.type === 'text' ? item.input : null,
          url: item.type === 'url' ? item.input : null,
          analysis_type: item.type,
          model_version: analysisResult.modelVersion,
          processing_time_ms: analysisResult.processingTime
        });

        processedResults.push({
          ...item,
          status: 'completed',
          prediction: analysisResult.prediction,
          confidence: analysisResult.confidenceScore
        });

      } catch (error: any) {
        processedResults.push({
          ...item,
          status: 'failed',
          error: error.message || 'Analysis failed'
        });
      }

      setProgress(((i + 1) / items.length) * 100);
    }

    setResults(processedResults);
    setProcessing(false);
    
    toast({
      title: "Batch processing complete",
      description: `Processed ${processedResults.length} items`,
    });
  };

  const exportResults = () => {
    const headers = ['Input', 'Type', 'Prediction', 'Confidence', 'Status', 'Error'];
    const rows = results.map(r => [
      r.input.substring(0, 100),
      r.type,
      r.prediction || '',
      r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : '',
      r.status || '',
      r.error || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    a.click();
    
    toast({ title: "Results exported to CSV" });
  };

  const getPredictionBadge = (prediction: string) => {
    if (prediction === 'fake') return <Badge variant="destructive">Fake</Badge>;
    if (prediction === 'authentic') return <Badge className="bg-success text-success-foreground">Authentic</Badge>;
    return <Badge variant="secondary">N/A</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    if (status === 'processing') return <Badge variant="secondary">Processing...</Badge>;
    if (status === 'failed') return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Batch Analysis</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file with URLs or text content (one per line). You can include a header row with "url" or "text".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                disabled={processing}
                className="flex-1"
              />
              <Button
                onClick={processBatch}
                disabled={items.length === 0 || processing}
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {processing && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing batch...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {items.length > 0 && !processing && results.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview ({items.length} items)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Input</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.slice(0, 10).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{item.input}</TableCell>
                      </TableRow>
                    ))}
                    {items.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          ... and {items.length - 10} more items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results ({results.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Prediction</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{getStatusBadge(result.status || 'pending')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.type}</Badge>
                        </TableCell>
                        <TableCell>{result.prediction ? getPredictionBadge(result.prediction) : '-'}</TableCell>
                        <TableCell>
                          {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{result.input}</TableCell>
                        <TableCell className="text-destructive text-sm">
                          {result.error || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Batch;
