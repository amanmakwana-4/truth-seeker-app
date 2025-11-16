import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TextAnalysis from "@/components/TextAnalysis";
import UrlCrawler from "@/components/UrlCrawler";
import About from "@/components/About";
import { UserDropdown } from "@/components/UserDropdown";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fake News Detection</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Fact Verification System v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/batch")}>
                  Batch Analysis
                </Button>
                <UserDropdown />
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Alert Banner */}
          <div className="mb-6 p-4 rounded-xl border border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  This system provides AI-powered analysis to assist in identifying potentially misleading content. 
                  Results should be considered as guidance and verified through additional sources. 
                  Always practice critical thinking when consuming news.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="text">Text Analysis</TabsTrigger>
              <TabsTrigger value="url">URL Crawler</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <TextAnalysis />
            </TabsContent>

            <TabsContent value="url">
              <UrlCrawler />
            </TabsContent>

            <TabsContent value="about">
              <About />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fake News Detection System. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/about-us" className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <p className="text-center mt-4 text-xs text-muted-foreground">
            Always verify information from multiple sources before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;