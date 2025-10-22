import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, Upload, Sparkles } from "lucide-react";

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

  // Step 3: Services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);

  // Step 4: Operating Hours
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    Monday: { open: true, start: "09:00", end: "17:00" },
    Tuesday: { open: true, start: "09:00", end: "17:00" },
    Wednesday: { open: true, start: "09:00", end: "17:00" },
    Thursday: { open: true, start: "09:00", end: "17:00" },
    Friday: { open: true, start: "09:00", end: "17:00" },
    Saturday: { open: false, start: "09:00", end: "17:00" },
    Sunday: { open: false, start: "09:00", end: "17:00" },
  });

  const services = [
    "Hair Styling",
    "Braiding",
    "Makeup",
    "Lash Extensions",
    "Nail Care",
    "Skincare",
    "Barbering",
  ];

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome to Ubuhle 💜",
        description: "Your beauty business just got smarter.",
      });
      navigate("/");
    }, 1500);
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

          {/* Step 3: Services Offered */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-6">Select your services</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl hover:border-primary transition-colors cursor-pointer"
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
                
                <div className="flex items-center space-x-3 p-4 border-2 border-border rounded-xl">
                  <Checkbox id="other" />
                  <label htmlFor="other" className="cursor-pointer text-sm font-medium">
                    Other
                  </label>
                </div>
              </div>

              {/* Custom Service Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add your custom service"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="h-12 text-base"
                />
                <Button onClick={handleAddCustomService} className="h-12 px-6">
                  + Add
                </Button>
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

          {/* Step 4: Operating Hours */}
          {currentStep === 4 && (
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
              <Button onClick={handleSubmit} disabled={isLoading} className="h-12 px-8 bg-gradient-to-r from-primary to-accent">
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
