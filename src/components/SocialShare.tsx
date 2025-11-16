import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  prediction: string;
  confidence: number;
  text: string;
}

export const SocialShare = ({ prediction, confidence, text }: SocialShareProps) => {
  const { toast } = useToast();
  const snippet = text.substring(0, 100) + (text.length > 100 ? "..." : "");
  const shareText = `Check this Fake News Analysis: "${snippet}" — Result: ${prediction === 'fake' ? 'Fake News' : 'Authentic'} with ${(confidence * 100).toFixed(1)}% confidence.`;

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(window.location.href);
    
    let url = "";
    switch(platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast({ title: "Opening share dialog..." });
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm text-muted-foreground">Share:</span>
      <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
        <Facebook className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
        <Linkedin className="w-4 h-4" />
      </Button>
    </div>
  );
};
