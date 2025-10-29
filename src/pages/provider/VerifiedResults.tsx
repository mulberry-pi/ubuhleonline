import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { VerifiedReviewCard } from "@/components/provider/VerifiedReviewCard";
import { toast } from "sonner";

interface ReviewData {
  id: string;
  appointment_id: string;
  after_service_image_url: string;
  comparison_image_url: string;
  similarity_score: number;
  ai_summary: string;
  comparison_type: string;
  created_at: string;
  clientReview?: {
    rating: number;
    comment: string;
    created_at: string;
    client_id: string;
  };
}

export default function VerifiedResults() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedResults();
  }, []);

  const fetchVerifiedResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch published AI reviews
      const { data: aiReviews, error: aiError } = await supabase
        .from('ai_reviews')
        .select('*')
        .eq('provider_id', user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (aiError) throw aiError;

      // Fetch corresponding client reviews
      const reviewsWithClientData = await Promise.all(
        (aiReviews || []).map(async (aiReview) => {
          const { data: clientReview } = await supabase
            .from('reviews')
            .select('*')
            .eq('appointment_id', aiReview.appointment_id)
            .single();

          return {
            ...aiReview,
            clientReview: clientReview || undefined,
          };
        })
      );

      setReviews(reviewsWithClientData);
    } catch (error) {
      console.error('Error fetching verified results:', error);
      toast.error('Failed to load verified results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verified results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/provider/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Verified AI Results</h1>
              <p className="text-muted-foreground mt-1">
                Showcase your work with AI-verified before & after comparisons
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/provider/after-service-analysis')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Analysis
          </Button>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <VerifiedReviewCard
                key={review.id}
                appointmentId={review.appointment_id}
                aiReview={{
                  after_service_image_url: review.after_service_image_url,
                  comparison_image_url: review.comparison_image_url,
                  similarity_score: review.similarity_score,
                  ai_summary: review.ai_summary,
                  comparison_type: review.comparison_type,
                }}
                clientReview={review.clientReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">
              No verified results yet. Create your first AI analysis!
            </p>
            <Button
              onClick={() => navigate('/provider/after-service-analysis')}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Create First Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}