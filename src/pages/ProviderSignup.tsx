import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserAgreementDialog } from "@/components/UserAgreementDialog";
import { ChevronLeft, ChevronRight, Upload, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ServicePrice {
  service: string;
  price: string;
}

interface OperatingHours {
  [key: string]: {
    open: boolean;
    start: string;
    end: string;
  };
}

const ProviderSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Owner Information
  const [ownerInfo, setOwnerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  // Step 2: Business Information
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    address: "",
    description: "",
    logo: null as File | null,
  });

  // Step 3: Payment Information
  const [paymentInfo, setPaymentInfo] = useState({
    bankAccountHolderName: "",
    bankName: "",
    branchCode: "",
    bankAccountNumber: "",
    payoutFrequency: "monthly" as "weekly" | "biweekly" | "monthly",
    payoutDate: 15 as 15 | 25 | 30,
    payoutStartDate: "",
  });

  // Step 4: Portfolio Upload
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);

  // Step 5: Services
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);

  // Step 6: Operating Hours
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    Monday: { open: true, start: "09:00", end: "17:00" },
    Tuesday: { open: true, start: "09:00", end: "17:00" },
    Wednesday: { open: true, start: "09:00", end: "17:00" },
    Thursday: { open: true, start: "09:00", end: "17:00" },
    Friday: { open: true, start: "09:00", end: "17:00" },
    Saturday: { open: false, start: "09:00", end: "17:00" },
    Sunday: { open: false, start: "09:00", end: "17:00" },
  });

  const serviceCategories = {
    "Hair Styling": [
      "Blow Out",
      "Box Braids",
      "Boho Braids",
      "Big Chop",
      "Cornrows",
      "Cornrows with Extensions",
      "Fulani Braids",
      "Traditional Sew-In",
      "Weave Installation",
      "Wig Installation",
      "Locs Installation",
      "Locs Maintenance",
      "Silk Press",
      "Hair Coloring",
      "Highlights",
      "Hair Treatment",
    ],
    "Lash Extensions": [
      "Wispy Set",
      "Individual Lashes",
      "Cluster Lashes",
      "Volume Set",
      "Cat Eye Set",
      "Natural Set",
      "Mega Volume Set",
      "Hybrid Set",
      "Lash Fill",
      "Lash Removal",
    ],
  };

  const totalSteps = 6;
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handlePortfolioImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPortfolioImages([...portfolioImages, ...files].slice(0, 10)); // Max 10 images
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };
  const progress = (currentStep / totalSteps) * 100;

  const handleCategoryToggle = (category: string) => {
    if (selectedServiceCategories.includes(category)) {
      // Remove category and all its subcategories
      setSelectedServiceCategories(selectedServiceCategories.filter(c => c !== category));
      const categoryServices = serviceCategories[category as keyof typeof serviceCategories] || [];
      setSelectedServices(selectedServices.filter(s => !categoryServices.includes(s)));
      setServicePrices(servicePrices.filter(sp => !categoryServices.includes(sp.service)));
    } else {
      // Add category
      setSelectedServiceCategories([...selectedServiceCategories, category]);
    }
  };

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
      setServicePrices(servicePrices.filter(sp => sp.service !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
      setServicePrices([...servicePrices, { service, price: "" }]);
    }
  };

  const handleAddCustomService = () => {
    if (customService.trim()) {
      const newService = customService.trim();
      setSelectedServices([...selectedServices, newService]);
      setServicePrices([...servicePrices, { service: newService, price: "" }]);
      setCustomService("");
    }
  };

  const updateServicePrice = (service: string, price: string) => {
    setServicePrices(servicePrices.map(sp => 
      sp.service === service ? { ...sp, price } : sp
    ));
  };

  const copyToAllDays = () => {
    const mondayHours = operatingHours.Monday;
    const newHours = { ...operatingHours };
    Object.keys(newHours).forEach(day => {
      newHours[day] = { ...mondayHours };
    });
    setOperatingHours(newHours);
    toast({
      title: "Hours copied",
      description: "Monday's hours have been applied to all days.",
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast({
        title: "Agreement required",
        description: "Please accept the Ubuhle Platform User Agreement to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create auth account
      const { data, error } = await supabase.auth.signUp({
        email: ownerInfo.email,
        password: ownerInfo.password,
        options: {
          emailRedirectTo: `${window.location.origin}/provider/dashboard`,
          data: { full_name: ownerInfo.fullName },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Upload portfolio images to storage
        const portfolioImageUrls: string[] = [];
        if (portfolioImages.length > 0) {
          for (const image of portfolioImages) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${data.user.id}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('portfolio-images')
              .upload(fileName, image);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('portfolio-images')
                .getPublicUrl(fileName);
              portfolioImageUrls.push(urlData.publicUrl);
            }
          }
        }

        // Call edge function to create profile and assign provider role
        const { error: roleError } = await supabase.functions.invoke('assign-user-role', {
          body: { role: 'provider', full_name: ownerInfo.fullName, terms_accepted: true }
        });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        // Create provider profile
        const { error: profileError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: data.user.id,
            business_name: businessInfo.businessName,
            business_description: businessInfo.description,
            business_address: businessInfo.address || null,
            is_public: true,
            rating: 0,
            gallery_images: portfolioImageUrls,
            bank_account_holder_name: paymentInfo.bankAccountHolderName,
            bank_name: paymentInfo.bankName,
            branch_code: paymentInfo.branchCode,
            bank_account_number: paymentInfo.bankAccountNumber,
            payout_frequency: paymentInfo.payoutFrequency,
            payout_date: paymentInfo.payoutFrequency === 'monthly' ? paymentInfo.payoutDate : null,
            payout_start_date: paymentInfo.payoutFrequency === 'biweekly' ? paymentInfo.payoutStartDate : null,
            service_categories: selectedServiceCategories,
          });

        if (profileError) {
          console.error('Provider profile error:', profileError);
        }

        // Create services
        if (servicePrices.length > 0) {
          const servicesData = servicePrices
            .filter(sp => sp.price && parseFloat(sp.price) > 0)
            .map(sp => ({
              provider_id: data.user.id,
              name: sp.service,
              price: parseFloat(sp.price),
              duration_minutes: 60, // Default duration
              is_available: true
            }));

          if (servicesData.length > 0) {
            const { error: servicesError } = await supabase
              .from('services')
              .insert(servicesData);

            if (servicesError) {
              console.error('Services error:', servicesError);
            }
          }
        }

        // Sync initial appointment to calendar (if any future appointments exist)
        // This will be handled automatically when appointments are created
      }

      toast({
        title: "Welcome to Ubuhle 💜",
        description: "Your beauty business just got smarter.",
      });
      navigate("/provider/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Intro Section */}
        {currentStep === 1 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Grow your beauty business with Ubuhle.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a network of trusted professionals and connect directly with clients who match your services.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="max-w-3xl mx-auto bg-card rounded-3xl shadow-xl p-8 md:p-12">
          {/* Step 1: Owner Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-6">Owner Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={ownerInfo.fullName}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, fullName: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={ownerInfo.email}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, email: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={ownerInfo.phone}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, phone: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={ownerInfo.password}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, password: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-6">Business Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your salon or business name"
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street, Cape Town"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business, your specialties, and what makes you unique..."
                  value={businessInfo.description}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                  className="min-h-32 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBusinessInfo({ ...businessInfo, logo: e.target.files?.[0] || null })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-6">Payment Information</h2>
              <p className="text-muted-foreground mb-6">
                Configure where you'd like to receive your payouts from bookings.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="bankAccountHolderName">Account Holder Name</Label>
                <Input
                  id="bankAccountHolderName"
                  type="text"
                  placeholder="Full name on bank account"
                  value={paymentInfo.bankAccountHolderName}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bankAccountHolderName: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select
                  value={paymentInfo.bankName}
                  onValueChange={(value) => setPaymentInfo({ ...paymentInfo, bankName: value })}
                >
                  <SelectTrigger className="h-12">
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
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  type="text"
                  placeholder="6-digit branch code"
                  value={paymentInfo.branchCode}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, branchCode: e.target.value })}
                  className="h-12 text-base"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  placeholder="Your account number"
                  value={paymentInfo.bankAccountNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bankAccountNumber: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-4 pt-6 border-t">
                <Label>Payout Frequency</Label>
                <RadioGroup
                  value={paymentInfo.payoutFrequency}
                  onValueChange={(value) => setPaymentInfo({ ...paymentInfo, payoutFrequency: value as "weekly" | "biweekly" | "monthly" })}
                >
                  <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer flex-1 font-normal">
                      Weekly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="biweekly" id="biweekly" />
                    <Label htmlFor="biweekly" className="cursor-pointer flex-1 font-normal">
                      Every 2 Weeks
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer flex-1 font-normal">
                      Monthly
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentInfo.payoutFrequency === 'monthly' && (
                <div className="space-y-4">
                  <Label>Payout Date</Label>
                  <RadioGroup
                    value={paymentInfo.payoutDate.toString()}
                    onValueChange={(value) => setPaymentInfo({ ...paymentInfo, payoutDate: parseInt(value) as 15 | 25 | 30 })}
                  >
                    <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="15" id="day-15" />
                      <Label htmlFor="day-15" className="cursor-pointer flex-1 font-normal">
                        15th of each month
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="25" id="day-25" />
                      <Label htmlFor="day-25" className="cursor-pointer flex-1 font-normal">
                        25th of each month
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="30" id="day-30" />
                      <Label htmlFor="day-30" className="cursor-pointer flex-1 font-normal">
                        30th of each month (or last day)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {paymentInfo.payoutFrequency === 'biweekly' && (
                <div className="space-y-2">
                  <Label htmlFor="payoutStartDate">First Payout Date</Label>
                  <Input
                    id="payoutStartDate"
                    type="date"
                    value={paymentInfo.payoutStartDate}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, payoutStartDate: e.target.value })}
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Select the date for your first biweekly payout. Future payouts will occur every 2 weeks from this date.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Portfolio Upload */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-6">Showcase Your Work</h2>
              <p className="text-muted-foreground mb-6">
                Upload 3-10 images of your best work to show potential clients your skills and style.
              </p>
              
              <div className="space-y-4">
                <Label htmlFor="portfolio">Portfolio Images (Max 10)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PNG, JPG, WEBP up to 5MB each
                  </p>
                  <Input
                    id="portfolio"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePortfolioImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('portfolio')?.click()}
                  >
                    Select Images
                  </Button>
                </div>

                {/* Preview uploaded images */}
                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {portfolioImages.map((image, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-border">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {portfolioImages.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {portfolioImages.length} image{portfolioImages.length !== 1 ? 's' : ''} selected (Max 10)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Services Offered */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">What services do you offer?</h2>
                <p className="text-muted-foreground">Select the main categories that apply to your business. This helps us show you relevant market trends.</p>
              </div>

              {/* Info Box */}
              {selectedServiceCategories.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Choose your service categories</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select Hair Styling, Lash Extensions, or both to see specific service options. 
                      Your selection will determine the market trends you receive.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Main Service Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(serviceCategories).map((category) => (
                  <div
                    key={category}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedServiceCategories.includes(category)
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedServiceCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label className="cursor-pointer text-lg font-semibold">
                        {category}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subcategories for Hair Styling */}
              {selectedServiceCategories.includes("Hair Styling") && (
                <div className="space-y-4 p-6 bg-accent/5 rounded-xl border border-border">
                  <h3 className="text-xl font-semibold text-foreground">Hair Styling Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviceCategories["Hair Styling"].map((service) => (
                      <div
                        key={service}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedServices.includes(service)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <Checkbox
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label className="cursor-pointer text-sm font-medium">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories for Lash Extensions */}
              {selectedServiceCategories.includes("Lash Extensions") && (
                <div className="space-y-4 p-6 bg-accent/5 rounded-xl border border-border">
                  <h3 className="text-xl font-semibold text-foreground">Lash Extension Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviceCategories["Lash Extensions"].map((service) => (
                      <div
                        key={service}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedServices.includes(service)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <Checkbox
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label className="cursor-pointer text-sm font-medium">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other/Custom Services */}
              <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
                <h3 className="text-xl font-semibold text-foreground">Other Services</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add any additional services you offer that aren't listed above
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom service name"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomService()}
                    className="h-12 text-base"
                  />
                  <Button onClick={handleAddCustomService} className="h-12 px-6">
                    + Add
                  </Button>
                </div>
              </div>

              {/* Price Inputs for Selected Services */}
              {selectedServices.length > 0 && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-xl font-semibold">Set your pricing</h3>
                  {servicePrices.map((sp) => (
                    <div key={sp.service} className="flex items-center gap-4">
                      <Label className="w-1/2">{sp.service}</Label>
                      <div className="flex items-center gap-2 w-1/2">
                        <span className="text-muted-foreground">R</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={sp.price}
                          onChange={(e) => updateServicePrice(sp.service, e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Operating Hours */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-foreground">Set your availability</h2>
                <Button variant="outline" onClick={copyToAllDays}>
                  Copy to All Days
                </Button>
              </div>
              
              <div className="space-y-4">
                {Object.keys(operatingHours).map((day) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-xl">
                    <div className="w-32">
                      <Label className="font-semibold">{day}</Label>
                    </div>
                    <Checkbox
                      checked={operatingHours[day].open}
                      onCheckedChange={(checked) => 
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...operatingHours[day], open: checked as boolean }
                        })
                      }
                    />
                    <span className="text-sm text-muted-foreground w-12">Open</span>
                    <Input
                      type="time"
                      value={operatingHours[day].start}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...operatingHours[day], start: e.target.value }
                        })
                      }
                      disabled={!operatingHours[day].open}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={operatingHours[day].end}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...operatingHours[day], end: e.target.value }
                        })
                      }
                      disabled={!operatingHours[day].open}
                      className="w-32"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms Agreement - Show on Last Step */}
          {currentStep === totalSteps && (
            <div className="space-y-6 mt-8 pt-8 border-t">
              <div className="flex items-start space-x-3 p-4 border-2 border-border rounded-xl">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                  I have read and agree to the{" "}
                  <UserAgreementDialog>
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                    >
                      Ubuhle Platform User Agreement
                    </button>
                  </UserAgreementDialog>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Service Provider Note:</strong> By joining as a Service Provider, you confirm that you are an independent contractor responsible for your own compliance, safety, and taxes.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="h-12 px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="h-12 px-6">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !termsAccepted} 
                className="h-12 px-8 bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? "Submitting..." : "Complete Sign Up"}
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderSignup;
