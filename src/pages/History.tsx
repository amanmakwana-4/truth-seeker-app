import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";

interface Analysis {
  id: string;
  prediction: string;
  confidence_score: number;
  input_text: string;
  url: string | null;
  article_title: string | null;
  analysis_type: string;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [predictionFilter, setPredictionFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, predictionFilter, confidenceFilter, dateFrom, dateTo]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching history",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setAnalyses(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    if (predictionFilter !== "all") {
      filtered = filtered.filter(a => a.prediction === predictionFilter);
    }

    if (confidenceFilter !== "all") {
      const [min, max] = confidenceFilter.split('-').map(Number);
      filtered = filtered.filter(a => a.confidence_score >= min / 100 && a.confidence_score <= max / 100);
    }

    if (dateFrom) {
      filtered = filtered.filter(a => new Date(a.created_at) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(a => new Date(a.created_at) <= new Date(dateTo));
    }

    setFilteredAnalyses(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting analysis",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Analysis deleted successfully" });
      fetchHistory();
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Prediction', 'Confidence', 'Type', 'Text/URL'];
    const rows = filteredAnalyses.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
      a.prediction,
      `${(a.confidence_score * 100).toFixed(1)}%`,
      a.analysis_type,
      a.article_title || a.url || a.input_text?.substring(0, 50)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast({ title: "Exported to CSV successfully" });
  };

  const getPredictionBadge = (prediction: string) => {
    if (prediction === 'fake') return <Badge variant="destructive">Fake News</Badge>;
    if (prediction === 'authentic') return <Badge className="bg-success text-success-foreground">Authentic</Badge>;
    return <Badge variant="secondary">Uncertain</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">My Analysis History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={predictionFilter} onValueChange={setPredictionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prediction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Predictions</SelectItem>
                  <SelectItem value="fake">Fake</SelectItem>
                  <SelectItem value="authentic">Authentic</SelectItem>
                </SelectContent>
              </Select>

              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="70-100">70-100%</SelectItem>
                  <SelectItem value="40-70">40-70%</SelectItem>
                  <SelectItem value="0-40">0-40%</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Analyses ({filteredAnalyses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No analysis history yet. Start analyzing content!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(analysis.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{getPredictionBadge(analysis.prediction)}</TableCell>
                        <TableCell>{(analysis.confidence_score * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant="outline">{analysis.analysis_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {analysis.article_title || analysis.url || analysis.input_text?.substring(0, 50)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(analysis.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
