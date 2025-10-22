import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Settings() {
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    business_name: "",
    business_description: "",
    business_address: "",
    is_public: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: providerProfile } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfileData({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        business_name: providerProfile?.business_name || "",
        business_description: providerProfile?.business_description || "",
        business_address: providerProfile?.business_address || "",
        is_public: providerProfile?.is_public ?? true,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("id", user.id);

      const { data: existing } = await supabase
        .from("provider_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase
          .from("provider_profiles")
          .update({
            business_name: profileData.business_name,
            business_description: profileData.business_description,
            business_address: profileData.business_address,
            is_public: profileData.is_public,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("provider_profiles").insert([
          {
            user_id: user.id,
            business_name: profileData.business_name,
            business_description: profileData.business_description,
            business_address: profileData.business_address,
            is_public: profileData.is_public,
          },
        ]);
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your profile and business information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Details about your beauty business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={profileData.business_name}
              onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={profileData.business_description}
              onChange={(e) => setProfileData({ ...profileData, business_description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Input
              id="business_address"
              value={profileData.business_address}
              onChange={(e) => setProfileData({ ...profileData, business_address: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_public">Show my business publicly</Label>
              <p className="text-sm text-muted-foreground">Allow clients to discover your business</p>
            </div>
            <Switch
              id="is_public"
              checked={profileData.is_public}
              onCheckedChange={(checked) => setProfileData({ ...profileData, is_public: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} size="lg">Save Changes</Button>
    </div>
  );
}
