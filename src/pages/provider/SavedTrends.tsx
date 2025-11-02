import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Trend {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  popularity_score: number;
}

interface SavedTrend {
  id: string;
  trend_id: string;
  created_at: string;
  trends: Trend;
}

export default function SavedTrends() {
  const [savedTrends, setSavedTrends] = useState<SavedTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedTrends();
  }, []);

  const loadSavedTrends = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_trends")
        .select(`
          id,
          trend_id,
          created_at,
          trends (
            id,
            name,
            description,
            image_url,
            popularity_score
          )
        `)
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedTrends(data || []);
    } catch (error) {
      console.error("Error loading saved trends:", error);
      toast({
        title: "Error",
        description: "Failed to load saved trends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (savedTrendId: string) => {
    try {
      const { error } = await supabase
        .from("saved_trends")
        .delete()
        .eq("id", savedTrendId);

      if (error) throw error;

      setSavedTrends(prev => prev.filter(st => st.id !== savedTrendId));
      toast({
        title: "Trend removed",
        description: "Trend has been removed from your saved list",
      });
    } catch (error) {
      console.error("Error unsaving trend:", error);
      toast({
        title: "Error",
        description: "Failed to unsave trend",
        variant: "destructive",
      });
    }
  };

  const getPopularityBadge = (score: number) => {
    if (score >= 80) return { label: "Very High", className: "bg-red-500" };
    if (score >= 60) return { label: "High", className: "bg-orange-500" };
    if (score >= 40) return { label: "Moderate", className: "bg-yellow-500" };
    return { label: "Emerging", className: "bg-blue-500" };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Saved Trends
          </h1>
          <p className="text-muted-foreground mt-2">
            Your collection of saved market trends
          </p>
        </div>
      </div>

      {savedTrends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved trends yet</h3>
            <p className="text-muted-foreground">
              Visit the Market Trends page to save trends you want to track
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrends.map(savedTrend => {
            const trend = savedTrend.trends;
            const badge = getPopularityBadge(trend.popularity_score);
            
            return (
              <Card key={savedTrend.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{trend.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {trend.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsave(savedTrend.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={badge.className}>
                      {badge.label}
                    </Badge>
                    <span className="text-2xl font-bold">{trend.popularity_score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Saved {new Date(savedTrend.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
