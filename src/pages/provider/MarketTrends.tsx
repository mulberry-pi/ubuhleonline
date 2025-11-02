import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchAndLoadTrends();
  }, []);

  const fetchAndLoadTrends = async () => {
    setFetching(true);
    try {
      const { data, error: fetchError } = await supabase.functions.invoke("fetch-trends");
      
      if (fetchError) {
        console.error("Error fetching trends from Apify:", fetchError);
        toast.error("Could not fetch latest trends. Make sure APIFY_API_TOKEN is configured.");
      } else {
        toast.success(`Successfully fetched ${data?.count || 0} trends`);
      }
      
      await loadTrends();
    } catch (error) {
      console.error("Error in fetchAndLoadTrends:", error);
      toast.error("Failed to fetch trends");
      await loadTrends();
    } finally {
      setFetching(false);
    }
  };

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

  const topTrends = trends.slice(0, 5);
  const chartData = trends.slice(0, 10).map(trend => ({
    name: trend.name.length > 15 ? trend.name.substring(0, 15) + '...' : trend.name,
    score: trend.popularity_score
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">AI Market Trends</h2>
          <p className="text-muted-foreground mt-2">
            Personalized trend insights powered by AI, tailored to your services (Hair & Lash styling)
          </p>
        </div>
        <Button 
          onClick={fetchAndLoadTrends} 
          disabled={fetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          Refresh Trends
        </Button>
      </div>

      {trends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No trends available yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Refresh Trends" to fetch the latest beauty trends from social media
            </p>
            <Button onClick={fetchAndLoadTrends} disabled={fetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
              Fetch Trends Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Popularity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Trend Popularity Overview
              </CardTitle>
              <CardDescription>Top 10 trending styles by popularity score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Trending Styles with Images */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Top 5 Trending Styles
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topTrends.map((trend) => {
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
          </div>

          {/* All Trends Grid */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">All Trending Styles</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {trends.slice(5).map((trend) => {
                const popularity = getPopularityBadge(trend.popularity_score);
                return (
                  <Card key={trend.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {trend.image_url && (
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                          <img
                            src={trend.image_url}
                            alt={trend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{trend.name}</h4>
                        <Badge className={popularity.class} variant="secondary">
                          {trend.popularity_score}
                        </Badge>
                      </div>
                      {trend.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {trend.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
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
