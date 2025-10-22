import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Trend {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  popularity_score: number;
}

export default function MarketTrends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const { data, error } = await supabase
        .from("trends")
        .select("*")
        .order("popularity_score", { ascending: false });

      if (error) throw error;
      setTrends(data || []);
    } catch (error) {
      console.error("Error loading trends:", error);
      toast.error("Failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  const getPopularityBadge = (score: number) => {
    if (score >= 80) return { label: "Very High", class: "bg-red-100 text-red-800" };
    if (score >= 60) return { label: "High", class: "bg-orange-100 text-orange-800" };
    if (score >= 40) return { label: "Medium", class: "bg-yellow-100 text-yellow-800" };
    return { label: "Growing", class: "bg-green-100 text-green-800" };
  };

  if (loading) {
    return <div className="text-center py-12">Loading trends...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Market Trends</h2>
        <p className="text-muted-foreground mt-2">
          Stay ahead of beauty trends with AI insights that visualize what's gaining traction
        </p>
      </div>

      {trends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No trends available yet</h3>
            <p className="text-muted-foreground">
              Market trend data will appear here as we analyze beauty industry patterns
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {trends.map((trend) => {
            const popularity = getPopularityBadge(trend.popularity_score);
            return (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {trend.name}
                      </CardTitle>
                      {trend.description && (
                        <CardDescription>{trend.description}</CardDescription>
                      )}
                    </div>
                    <Badge className={popularity.class}>
                      {popularity.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trend.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={trend.image_url}
                        alt={trend.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Popularity Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${trend.popularity_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{trend.popularity_score}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Save Trend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How Trend Analysis Works</CardTitle>
          <CardDescription>
            Understanding AI-powered beauty trend insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Real-time Social Media Analysis</p>
              <p className="text-sm text-muted-foreground">
                We monitor Instagram, TikTok, and Pinterest to identify emerging styles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Predictive Insights</p>
              <p className="text-sm text-muted-foreground">
                Our AI predicts which trends will peak before they become mainstream
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Local Market Adaptation</p>
              <p className="text-sm text-muted-foreground">
                Trends are weighted based on regional popularity and cultural relevance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
