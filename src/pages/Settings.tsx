import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('save_history')
      .eq('id', user.id)
      .single();

    if (data) {
      setSaveHistory(data.save_history ?? true);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ save_history: saveHistory })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings updated successfully",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="save-history">Save Analysis History</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your analyses will be saved to your account history
                </p>
              </div>
              <Switch
                id="save-history"
                checked={saveHistory}
                onCheckedChange={setSaveHistory}
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
