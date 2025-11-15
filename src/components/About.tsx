import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Lock, Brain } from "lucide-react";

const About = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Fake News Detection System</CardTitle>
          <CardDescription>AI-powered fact verification technology</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">System Overview</h3>
            <p className="text-muted-foreground">
              Our Fake News Detection System v1.0 leverages advanced machine learning models to analyze 
              text content and assess its authenticity. The system uses pre-trained transformer models 
              fine-tuned on large datasets of verified fake and authentic news articles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">AI-Powered</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Uses state-of-the-art transformer models with 87.5% accuracy
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <h4 className="font-semibold">Fast Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get results in under 5 seconds with real-time processing
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Lock className="w-5 h-5 text-warning" />
                </div>
                <h4 className="font-semibold">Secure</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Protected with XSS prevention and input validation
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-semibold">Ethical</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Respects robots.txt and implements rate limiting
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Input Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Text is cleaned, normalized, and prepared for analysis
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">AI Classification</p>
                  <p className="text-sm text-muted-foreground">
                    Advanced transformer models analyze linguistic patterns and context
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">Confidence Scoring</p>
                  <p className="text-sm text-muted-foreground">
                    Results include probability scores and visual confidence meters
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <h4 className="font-semibold mb-2 text-warning">Important Disclaimer</h4>
            <p className="text-sm text-muted-foreground">
              This system is designed to assist in identifying potentially misleading content, not to serve 
              as the sole source of truth. Always verify information through multiple trusted sources and 
              exercise critical thinking when consuming news content. The system's predictions should be 
              used as guidance, not definitive proof.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-2">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Model Accuracy</p>
                <p className="font-medium">87.5%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Processing Time</p>
                <p className="font-medium">&lt; 5 seconds</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Input Length</p>
                <p className="font-medium">10,000 characters</p>
              </div>
              <div>
                <p className="text-muted-foreground">Supported Languages</p>
                <p className="font-medium">English</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;