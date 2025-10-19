import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Services from "@/components/Services";
import Technology from "@/components/Technology";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Header />
      <main>
        <Hero />
        <Mission />
        <Services />
        <Technology />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
