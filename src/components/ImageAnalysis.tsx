import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfidenceMeter from "./ConfidenceMeter";
import SocialShare from "./SocialShare";

const ImageAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
    explanation: string;
  } | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Call edge function for image analysis
        const { data, error } = await supabase.functions.invoke('analyze-image', {
          body: { image: base64Image }
        });

        const processingTime = Date.now() - startTime;

        if (error) throw error;

        setResult({
          prediction: data.prediction,
          confidence: data.confidence,
          explanation: data.explanation
        });

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('analyses').insert({
          input_text: 'Image Analysis',
          analysis_type: 'image',
          prediction: data.prediction,
          confidence_score: data.confidence,
          model_version: '1.0',
          processing_time_ms: processingTime,
          user_id: user?.id || null
        });

        toast({
          title: "Analysis Complete",
          description: "Image has been analyzed successfully",
        });
      };
      reader.readAsDataURL(selectedImage);
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="h-6 w-6 text-primary" />
            Image-Based Fake News Detection
          </CardTitle>
          <CardDescription>
            Upload an image containing text or a screenshot of an article to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              <Upload className="h-12 w-12 text-primary" />
              <div className="text-center">
                <p className="text-lg font-medium">Click to upload an image</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            </label>
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-primary/20">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full max-h-96 object-contain"
                />
              </div>
              
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? "Analyzing Image..." : "Analyze Image"}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-4 border-t border-primary/20">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Analysis Results</h3>
                <div className={`text-lg font-medium ${
                  result.prediction === 'Likely Fake News' 
                    ? 'text-destructive' 
                    : 'text-success'
                }`}>
                  {result.prediction}
                </div>
              </div>
              
              <ConfidenceMeter confidence={result.confidence} />
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </div>

              <SocialShare
                result={result.prediction}
                confidence={result.confidence}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageAnalysis;
