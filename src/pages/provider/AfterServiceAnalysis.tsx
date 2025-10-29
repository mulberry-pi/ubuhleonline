import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AfterServiceAnalysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ similarity_score: number; summary: string } | null>(null);
  const [comparisonImageUrl, setComparisonImageUrl] = useState<string>("");
  const [comparisonType, setComparisonType] = useState<"preview" | "inspiration">("preview");

  const loadAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('provider_id', user.id)
      .eq('status', 'completed')
      .order('appointment_date', { ascending: false });

    if (error) {
      console.error('Error loading appointments:', error);
      return;
    }

    setAppointments(data || []);
  };

  useState(() => {
    loadAppointments();
  });

  const handleAppointmentSelect = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      // Prioritize preview image over inspiration image
      if (appointment.preview_image_url) {
        setComparisonImageUrl(appointment.preview_image_url);
        setComparisonType("preview");
      } else if (appointment.inspiration_image_url) {
        setComparisonImageUrl(appointment.inspiration_image_url);
        setComparisonType("inspiration");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleRunAnalysis = async () => {
    if (!afterImage || !comparisonImageUrl || !selectedAppointment) {
      toast({
        title: "Missing Information",
        description: "Please select an appointment and upload an after-service image",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Upload the after-service image
      const afterServiceImageUrl = await uploadImage(afterImage);

      // Call the edge function to analyze images
      const { data, error } = await supabase.functions.invoke('analyze-after-service', {
        body: {
          afterServiceImageUrl,
          comparisonImageUrl,
        },
      });

      if (error) throw error;

      setResult(data);

      toast({
        title: "Analysis Complete",
        description: `Similarity score: ${data.similarity_score}%`,
      });

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('ai_reviews')
        .insert({
          appointment_id: selectedAppointment,
          provider_id: user.id,
          after_service_image_url: afterServiceImageUrl,
          comparison_image_url: comparisonImageUrl,
          comparison_type: comparisonType,
          similarity_score: data.similarity_score,
          ai_summary: data.summary,
          is_published: false,
        });

      if (insertError) throw insertError;

    } catch (error) {
      console.error('Error analyzing images:', error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!result) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('ai_reviews')
      .update({ is_published: true })
      .eq('appointment_id', selectedAppointment)
      .eq('provider_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to publish review",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Published",
      description: "Your verified result is now public on your profile",
    });

    navigate('/provider/dashboard');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/provider/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">After Service Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Upload your after-service image for AI comparison and client feedback
            </p>
          </div>
        </div>

        {/* Step 1: Select Appointment */}
        <Card className="p-6 rounded-3xl shadow-lg">
          <div className="space-y-4">
            <div>
              <Label htmlFor="appointment">Select Completed Appointment</Label>
              <Select value={selectedAppointment} onValueChange={handleAppointmentSelect}>
                <SelectTrigger id="appointment" className="mt-2">
                  <SelectValue placeholder="Choose an appointment..." />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {new Date(apt.appointment_date).toLocaleDateString()} - {apt.appointment_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {comparisonImageUrl && (
              <div className="mt-4">
                <Label>Comparison Image ({comparisonType})</Label>
                <img
                  src={comparisonImageUrl}
                  alt="Comparison"
                  className="mt-2 w-full max-w-md rounded-2xl shadow-md"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Upload After Image */}
        <Card className="p-6 rounded-3xl shadow-lg">
          <div className="space-y-4">
            <Label htmlFor="after-image">Upload Real Result Image</Label>
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Input
                id="after-image"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label htmlFor="after-image" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, JPEG or PNG (Max 10MB)
                </p>
              </Label>
            </div>

            {afterImagePreview && (
              <div className="mt-4">
                <img
                  src={afterImagePreview}
                  alt="After service preview"
                  className="w-full max-w-md rounded-2xl shadow-md mx-auto"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Run Analysis Button */}
        <Button
          onClick={handleRunAnalysis}
          disabled={!afterImage || !comparisonImageUrl || isAnalyzing}
          className="w-full h-12 rounded-full text-lg"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Run Analysis'
          )}
        </Button>

        {/* Results */}
        {result && (
          <Card className="p-8 rounded-3xl shadow-xl bg-gradient-to-br from-card to-card/80">
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.similarity_score)} mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  {result.similarity_score}%
                </div>
                <p className="text-sm text-muted-foreground">Similarity Match</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Before ({comparisonType})</Label>
                  <img
                    src={comparisonImageUrl}
                    alt="Before"
                    className="w-full rounded-2xl shadow-md"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">After (Result)</Label>
                  <img
                    src={afterImagePreview}
                    alt="After"
                    className="w-full rounded-2xl shadow-md"
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-2xl">
                <Label className="text-sm font-medium mb-2 block">AI Analysis Summary</Label>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <Button
                onClick={handlePublish}
                className="w-full h-12 rounded-full text-lg"
                size="lg"
              >
                Publish to Profile
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}