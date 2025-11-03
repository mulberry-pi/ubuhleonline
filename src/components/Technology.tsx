import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import stylistMatchingPreviews from "@/assets/stylist-matching-previews.png";

const Technology = () => {
  const navigate = useNavigate();

  return (
    <section id="technology" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Fast. Easy. <span className="text-primary">Reliable.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload your style inspiration and let our AI match you with the perfect stylist 
              who specializes in your desired look. Get personalized recommendations based on 
              style compatibility, ratings, and location.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 hover-glow" onClick={() => navigate('/search-real')}>
              Try It Out Now
            </Button>
          </div>

          <div className="relative fade-in-up animation-delay-200">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-card">
              <img
                src={stylistMatchingPreviews}
                alt="AI Stylist Matching Previews"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
