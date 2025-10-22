import { useNavigate } from "react-router-dom";
import { Users, Scissors } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C9B3F6] to-[#F7F2EE]">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl p-12 animate-fade-in">
          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="w-64 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
              <div className="flex gap-8">
                <Users className="w-16 h-16 text-primary" />
                <Scissors className="w-16 h-16 text-accent" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-semibold text-center text-[#261E36] mb-4">
            Who are you joining Ubuhle as?
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-center text-[#261E36]/70 font-medium mb-12" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '32px' }}>
            We'll tailor your experience based on your role.
          </p>

          {/* Account Type Cards */}
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            {/* Client Card */}
            <button
              onClick={() => navigate("/signup/client")}
              className="flex-1 bg-white border-2 border-[#E8E0F5] rounded-3xl p-8 hover:scale-[1.03] hover:shadow-[0_6px_16px_rgba(134,134,249,0.25)] transition-all duration-300 text-left group"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#261E36] mb-3">🪞 Client</h3>
              <p className="text-[#261E36]/70 mb-6 leading-relaxed">
                I'm looking for stylists, artists, and beauty experts.
              </p>
              <div className="text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Continue as Client →
              </div>
            </button>

            {/* Service Provider Card */}
            <button
              onClick={() => navigate("/signup/provider")}
              className="flex-1 bg-white border-2 border-[#E8E0F5] rounded-3xl p-8 hover:scale-[1.03] hover:shadow-[0_6px_16px_rgba(134,134,249,0.25)] transition-all duration-300 text-left group"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                  <Scissors className="w-10 h-10 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#261E36] mb-3">💼 Service Provider</h3>
              <p className="text-[#261E36]/70 mb-6 leading-relaxed">
                I'm a beauty professional or salon owner looking to grow my business.
              </p>
              <div className="text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Continue as Service Provider →
              </div>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
