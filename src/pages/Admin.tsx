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
import { ArrowLeft, Download, Trash2, Filter, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
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
  processing_time_ms: number | null;
}

interface KPIData {
  total: number;
  fakeCount: number;
  authenticCount: number;
  avgConfidence: number;
  last7Days: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIData>({ total: 0, fakeCount: 0, authenticCount: 0, avgConfidence: 0, last7Days: 0 });
  
  // Filters
  const [predictionFilter, setPredictionFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    checkAdminAccess();
    fetchAnalyses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, predictionFilter, confidenceFilter, typeFilter, dateFrom, dateTo, searchText]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchAnalyses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching analyses",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setAnalyses(data);
      calculateKPIs(data);
    }
    setLoading(false);
  };

  const calculateKPIs = (data: Analysis[]) => {
    const total = data.length;
    const fakeCount = data.filter(a => a.prediction === 'fake').length;
    const authenticCount = data.filter(a => a.prediction === 'authentic').length;
    const avgConfidence = data.reduce((sum, a) => sum + a.confidence_score, 0) / (total || 1);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = data.filter(a => new Date(a.created_at) >= sevenDaysAgo).length;

    setKpis({ total, fakeCount, authenticCount, avgConfidence, last7Days });
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

    if (typeFilter !== "all") {
      filtered = filtered.filter(a => a.analysis_type === typeFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(a => new Date(a.created_at) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(a => new Date(a.created_at) <= new Date(dateTo));
    }

    if (searchText) {
      filtered = filtered.filter(a => 
        a.input_text?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.article_title?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.url?.toLowerCase().includes(searchText.toLowerCase())
      );
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
      fetchAnalyses();
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Prediction', 'Confidence', 'Type', 'Text/URL', 'Processing Time'];
    const rows = filteredAnalyses.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
      a.prediction,
      `${(a.confidence_score * 100).toFixed(1)}%`,
      a.analysis_type,
      a.article_title || a.url || a.input_text?.substring(0, 50),
      `${a.processing_time_ms}ms`
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{kpis.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fake News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-2xl font-bold">{kpis.fakeCount}</span>
                <span className="text-sm text-muted-foreground">({((kpis.fakeCount / kpis.total) * 100 || 0).toFixed(1)}%)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Authentic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-2xl font-bold">{kpis.authenticCount}</span>
                <span className="text-sm text-muted-foreground">({((kpis.authenticCount / kpis.total) * 100 || 0).toFixed(1)}%)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(kpis.avgConfidence * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{kpis.last7Days}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
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

              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search text..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analyses ({filteredAnalyses.length})</CardTitle>
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
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No analyses found</TableCell>
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
                        <TableCell>{analysis.processing_time_ms}ms</TableCell>
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

export default Admin;
