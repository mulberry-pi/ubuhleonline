import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Settings() {
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    business_name: "",
    business_description: "",
    business_address: "",
    is_public: true,
    banner_image_url: "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bankData, setBankData] = useState({
    bank_name: "",
    branch_code: "",
    bank_account_number: "",
    bank_account_holder_name: "",
    payout_frequency: "monthly",
    payout_date: "10",
    payout_start_date: "",
  });

  // South African bank branch codes
  const bankBranchCodes: { [key: string]: string } = {
    "ABSA": "632005",
    "African Bank": "430000",
    "Capitec Bank": "470010",
    "Discovery Bank": "679000",
    "First National Bank (FNB)": "250655",
    "Investec": "580105",
    "Nedbank": "198765",
    "Standard Bank": "051001",
    "TymeBank": "678910",
  };
  const [isBankSectionOpen, setIsBankSectionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

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
        banner_image_url: providerProfile?.banner_image_url || "",
      });

      setBankData({
        bank_name: providerProfile?.bank_name || "",
        branch_code: providerProfile?.branch_code || "",
        bank_account_number: providerProfile?.bank_account_number || "",
        bank_account_holder_name: providerProfile?.bank_account_holder_name || "",
        payout_frequency: providerProfile?.payout_frequency || "monthly",
        payout_date: providerProfile?.payout_date?.toString() || "10",
        payout_start_date: providerProfile?.payout_start_date || "",
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return null;

    try {
      setUploadingBanner(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `${user.id}-banner-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('business-logos')
        .upload(fileName, bannerFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to upload banner");
      return null;
    } finally {
      setUploadingBanner(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let bannerUrl = profileData.banner_image_url;
      if (bannerFile) {
        const uploadedUrl = await handleBannerUpload();
        if (uploadedUrl) bannerUrl = uploadedUrl;
      }

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
            banner_image_url: bannerUrl,
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
            banner_image_url: bannerUrl,
          },
        ]);
      }

      toast.success("Settings saved successfully");
      setBannerFile(null);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleBankDetailsClick = () => {
    setShowPasswordDialog(true);
  };

  const verifyPasswordAndUpdateBank = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setVerifying(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        toast.error("Incorrect password");
        return;
      }

      // Update bank details
      await supabase
        .from("provider_profiles")
        .update({
          bank_name: bankData.bank_name,
          branch_code: bankData.branch_code,
          bank_account_number: bankData.bank_account_number,
          bank_account_holder_name: bankData.bank_account_holder_name,
          payout_frequency: bankData.payout_frequency,
          payout_date: bankData.payout_frequency === 'monthly' ? parseInt(bankData.payout_date) : null,
          payout_start_date: bankData.payout_frequency === 'biweekly' ? bankData.payout_start_date : null,
        })
        .eq("user_id", user.id);

      toast.success("Bank details updated successfully");
      setShowPasswordDialog(false);
      setPassword("");
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error("Failed to update bank details");
    } finally {
      setVerifying(false);
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
            <Label htmlFor="banner_upload">Profile Banner</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload a banner image for your public profile
            </p>
            {profileData.banner_image_url && !bannerFile && (
              <div className="mb-3">
                <img 
                  src={profileData.banner_image_url} 
                  alt="Current banner" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <Input
              id="banner_upload"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              disabled={uploadingBanner}
            />
            {bannerFile && (
              <p className="text-sm text-muted-foreground">
                New banner selected: {bannerFile.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_description">About Section (Public Profile)</Label>
            <p className="text-sm text-muted-foreground">
              This will be displayed as your "About" section on your public profile
            </p>
            <Textarea
              id="business_description"
              value={profileData.business_description}
              onChange={(e) => setProfileData({ ...profileData, business_description: e.target.value })}
              rows={4}
              placeholder="Tell clients about your business, specialties, and what makes you unique..."
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

      <Card>
        <Collapsible open={isBankSectionOpen} onOpenChange={setIsBankSectionOpen}>
          <CardHeader className="p-0">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:opacity-80 transition-opacity">
              <div className="text-left space-y-1.5">
                <CardTitle>Bank & Payout Details</CardTitle>
                <CardDescription>Manage your banking information and payout schedule</CardDescription>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform flex-shrink-0 ${isBankSectionOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Select
                  value={bankData.bank_name}
                  onValueChange={(value) => setBankData({ 
                    ...bankData, 
                    bank_name: value,
                    branch_code: bankBranchCodes[value] || ""
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABSA">ABSA</SelectItem>
                    <SelectItem value="African Bank">African Bank</SelectItem>
                    <SelectItem value="Capitec Bank">Capitec Bank</SelectItem>
                    <SelectItem value="Discovery Bank">Discovery Bank</SelectItem>
                    <SelectItem value="First National Bank (FNB)">First National Bank (FNB)</SelectItem>
                    <SelectItem value="Investec">Investec</SelectItem>
                    <SelectItem value="Nedbank">Nedbank</SelectItem>
                    <SelectItem value="Standard Bank">Standard Bank</SelectItem>
                    <SelectItem value="TymeBank">TymeBank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch Code</Label>
                <Input
                  value={bankData.branch_code}
                  onChange={(e) => setBankData({ ...bankData, branch_code: e.target.value })}
                  placeholder="Auto-filled from bank selection"
                  maxLength={6}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  value={bankData.bank_account_holder_name}
                  onChange={(e) => setBankData({ ...bankData, bank_account_holder_name: e.target.value })}
                  placeholder="Full name as per bank account"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={bankData.bank_account_number}
                  onChange={(e) => setBankData({ ...bankData, bank_account_number: e.target.value })}
                  placeholder="Your bank account number"
                  type="password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payout Frequency</Label>
                  <Select
                    value={bankData.payout_frequency}
                    onValueChange={(value) => setBankData({ ...bankData, payout_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {bankData.payout_frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Payout Date</Label>
                    <Select
                      value={bankData.payout_date}
                      onValueChange={(value) => setBankData({ ...bankData, payout_date: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10th of the month</SelectItem>
                        <SelectItem value="15">15th of the month</SelectItem>
                        <SelectItem value="25">25th of the month</SelectItem>
                        <SelectItem value="31">Last day of the month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {bankData.payout_frequency === 'biweekly' && (
                  <div className="space-y-2">
                    <Label>Starting Date</Label>
                    <Input
                      type="date"
                      value={bankData.payout_start_date}
                      onChange={(e) => setBankData({ ...bankData, payout_start_date: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleBankDetailsClick} variant="outline" className="w-full">
                Update Bank Details (Requires Password)
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>Sync your appointments to your calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="google_calendar">Google Calendar</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync appointments to your Google Calendar
              </p>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="phone_calendar">Phone Calendar</Label>
              <p className="text-sm text-muted-foreground">
                Add appointments to your device calendar
              </p>
            </div>
            <Switch
              id="phone_calendar"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Note: Phone calendar sync is automatically available when you download appointments.
            Google Calendar requires authorization.
          </p>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} size="lg">Save Changes</Button>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Password</DialogTitle>
            <DialogDescription>
              Please enter your password to update bank details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setPassword("");
            }}>
              Cancel
            </Button>
            <Button onClick={verifyPasswordAndUpdateBank} disabled={verifying}>
              {verifying ? "Verifying..." : "Update Bank Details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
