import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              When you use our Fake News Detection System, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email address, username, and password)</li>
              <li>Analysis data (text and URLs you submit for verification)</li>
              <li>Usage statistics and preferences</li>
              <li>Device and browser information</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our fake news detection services</li>
              <li>Maintain your analysis history for your convenience</li>
              <li>Send you important updates about our service</li>
              <li>Improve our AI models and detection algorithms</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We take data security seriously. Your information is stored securely using
              industry-standard encryption. We implement appropriate technical and organizational
              measures to protect your personal data against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We do not sell, trade, or rent your personal information to third parties.
              We may share aggregated, anonymized data for research purposes to improve
              fake news detection methods.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of saving your analysis history</li>
              <li>Export your data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We use cookies and similar tracking technologies to maintain your session
              and improve your experience. You can control cookie settings through your
              browser preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may update this privacy policy from time to time. We will notify you of
              any changes by posting the new policy on this page and updating the "Last
              Updated" date.
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

export default PrivacyPolicy;
