import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AIReview {
  after_service_image_url: string;
  comparison_image_url: string;
  similarity_score: number;
  ai_summary: string;
  comparison_type: string;
}

interface ClientReview {
  rating: number;
  comment: string;
  created_at: string;
  client_id: string;
}

interface VerifiedReviewCardProps {
  appointmentId: string;
  clientReview?: ClientReview;
  aiReview?: AIReview;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-yellow-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
};

export const VerifiedReviewCard = ({ appointmentId, clientReview, aiReview }: VerifiedReviewCardProps) => {
  const [loadedAIReview, setLoadedAIReview] = useState<AIReview | null>(aiReview || null);

  useEffect(() => {
    if (!aiReview && appointmentId) {
      const fetchAIReview = async () => {
        const { data, error } = await supabase
          .from('ai_reviews')
          .select('*')
          .eq('appointment_id', appointmentId)
          .eq('is_published', true)
          .single();

        if (!error && data) {
          setLoadedAIReview(data);
        }
      };

      fetchAIReview();
    }
  }, [appointmentId, aiReview]);

  return (
    <Card className="p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
      {/* Client Review Section */}
      {clientReview && (
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < clientReview.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm leading-relaxed mb-2">{clientReview.comment}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(clientReview.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* AI Verified Result Section */}
      {loadedAIReview && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary">AI Verified Result</Badge>
            <Badge className={`${getScoreColor(loadedAIReview.similarity_score)} text-white`}>
              {loadedAIReview.similarity_score}% Match
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Before ({loadedAIReview.comparison_type})
              </p>
              <img
                src={loadedAIReview.comparison_image_url}
                alt="Before"
                className="w-full rounded-2xl shadow-md object-cover aspect-square"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                After (Result)
              </p>
              <img
                src={loadedAIReview.after_service_image_url}
                alt="After"
                className="w-full rounded-2xl shadow-md object-cover aspect-square"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-2xl">
            <p className="text-sm leading-relaxed">{loadedAIReview.ai_summary}</p>
          </div>
        </div>
      )}

      {!clientReview && !loadedAIReview && (
        <p className="text-muted-foreground text-center py-8">No reviews available</p>
      )}
    </Card>
  );
};