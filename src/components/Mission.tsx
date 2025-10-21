const Mission = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden mt-0">
      {/* Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_hsl(266_80%_82%)_1px,_transparent_1px)] bg-[length:50px_50px]" />
      </div>

      <div className="container mx-auto relative z-10 max-w-4xl text-center">
        <div className="space-y-6 fade-in-up">
          <h2
            className="text-4xl lg:text-5xl font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our mission is to connect{" "}
            <span className="text-primary">beauty professionals</span> with clients through
            seamless, smart technology.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're bridging the gap between talented beauty professionals and clients seeking
            quality services. Through innovative technology and thoughtful design, we make
            discovering, booking, and managing beauty services effortless for everyone.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
