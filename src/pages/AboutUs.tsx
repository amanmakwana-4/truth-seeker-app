import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Target, Users, Zap } from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">About Us</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-6">
            <Shield className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Fake News Detection System</h2>
          <p className="text-xl text-muted-foreground">
            Empowering truth through AI-powered fact verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To combat the spread of misinformation by providing accessible, AI-powered tools
                that help users verify the authenticity of news content and make informed decisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Our Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We leverage state-of-the-art natural language processing and machine learning
                models to analyze text patterns, verify sources, and detect misleading information
                with high accuracy.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Who We Serve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Journalists & Media Organizations</h3>
              <p className="text-muted-foreground">
                Verify sources and content before publication to maintain credibility and trust.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Educators & Students</h3>
              <p className="text-muted-foreground">
                Teach and learn critical thinking skills in the digital age.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">General Public</h3>
              <p className="text-muted-foreground">
                Anyone concerned about the authenticity of news and information they consume online.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              While our AI system provides powerful analysis capabilities, it should be used as
              a supplementary tool alongside critical thinking and verification from multiple
              sources. No automated system is perfect, and we encourage users to always
              cross-reference information and think critically about the content they consume.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AboutUs;
