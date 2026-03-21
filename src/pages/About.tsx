import logo from "@/assets/logo.jpeg";

const About = () => (
  <div className="min-h-screen bg-background">
    <div className="container max-w-4xl py-16 px-4">
      <div className="flex items-center gap-4 mb-8">
        <img src={logo} alt="" className="w-16 h-16 rounded-full object-cover shadow-card" />
        <h1 className="text-3xl font-display font-bold text-primary">About Us</h1>
      </div>
      <div className="prose prose-lg max-w-none text-foreground">
        <p className="text-muted-foreground text-lg leading-relaxed">
          <strong className="text-primary">Habibi Come to Crete Transfers</strong> is a premium private transfer service operating across the beautiful island of Crete, Greece.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          With our modern Mercedes fleet and experienced, English-speaking drivers, we provide safe, comfortable, and reliable airport, port, and hotel transfers — available 24 hours a day, 7 days a week.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Whether you're arriving at Heraklion or Chania airport, disembarking at the port, or heading to your villa in the countryside, we make sure your journey is smooth, stress-free, and enjoyable.
        </p>
        <h2 className="text-xl font-display font-bold text-primary mt-10 mb-4">Why Choose Us</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>✓ Professional, licensed drivers</li>
          <li>✓ Premium Mercedes vehicles</li>
          <li>✓ Fixed prices — no hidden fees</li>
          <li>✓ Free cancellation up to 24h before</li>
          <li>✓ Flight monitoring for airport pickups</li>
          <li>✓ Child seats available on request</li>
        </ul>
      </div>
    </div>
  </div>
);

export default About;
