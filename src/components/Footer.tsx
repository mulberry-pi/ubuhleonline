const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  Style Previewing
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  Service Providers
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  Stylist Search
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Tagline */}
          <div className="md:text-right">
            <p
              className="text-2xl font-bold mb-2"
            >
              Connecting you to the right people, <span className="text-primary">faster.</span>
            </p>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-70">
          <p>© {new Date().getFullYear()} Ubuhle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
