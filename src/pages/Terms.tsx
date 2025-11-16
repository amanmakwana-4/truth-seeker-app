import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Terms and Conditions</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By accessing and using the Fake News Detection System, you accept and agree to be
              bound by the terms and provisions of this agreement. If you do not agree to these
              terms, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Our service provides AI-powered analysis to help identify potentially misleading
              or false information in news content. The service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Text and URL analysis capabilities</li>
              <li>Batch processing features</li>
              <li>Analysis history tracking</li>
              <li>Admin dashboard for authorized users</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-warning">Important:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Our AI analysis is provided as a supplementary tool and should not be the sole
                basis for determining the authenticity of information.
              </li>
              <li>
                We do not guarantee 100% accuracy in our predictions. No automated system is
                perfect.
              </li>
              <li>
                Users should always verify information through multiple sources and exercise
                critical thinking.
              </li>
              <li>
                We are not responsible for decisions made based on our analysis results.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>As a user of this service, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when creating your account</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Not misuse or abuse the service</li>
              <li>Not attempt to circumvent any security measures</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not submit copyrighted or illegal content for analysis</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              All content, features, and functionality of this service, including but not limited
              to the AI models, algorithms, text, graphics, logos, and software, are owned by us
              and are protected by international copyright, trademark, and other intellectual
              property laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of data, use, or
              other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any errors or omissions in any content</li>
              <li>Decisions made based on our analysis</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to suspend or terminate your account if you violate these
              terms or engage in any activity that we deem harmful to our service or other users.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              any material changes. Your continued use of the service after such modifications
              constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have any questions about these Terms and Conditions, please contact us
              through our contact page.
            </p>
            <p className="font-semibold text-foreground">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
