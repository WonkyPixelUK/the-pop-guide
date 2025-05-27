import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const About = () => {
  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      bio: "Passionate collector with 10+ years in tech. Started PopGuide to solve his own collection management challenges.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      bio: "Former Google engineer with expertise in scalable web applications and machine learning.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Mike Rodriguez",
      role: "Head of Design",
      bio: "Award-winning designer focused on creating intuitive experiences for collectors.",
      image: "/api/placeholder/150/150"
    }
  ];

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in the power of collector communities and building tools that bring people together."
    },
    {
      icon: Target,
      title: "Precision & Accuracy",
      description: "Every detail matters in collecting. We strive for accuracy in pricing, data, and functionality."
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description: "Built by collectors, for collectors. We understand the joy and challenges of collecting."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We're committed to delivering the best possible experience for our users."
    }
  ];

  return (
    <>
      <SEO title="About | The Pop Guide" description="Learn more about The Pop Guide and our mission for UK Funko collectors." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              About <span className="text-orange-500">PopGuide</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              We're on a mission to empower collectors with the tools they need to build, track, and grow their Funko Pop collections with confidence.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                <p className="text-gray-300 mb-4">
                  PopGuide was born from a simple frustration: the lack of comprehensive tools for managing Funko Pop collections. As collectors ourselves, we found existing solutions either too basic or overly complicated.
                </p>
                <p className="text-gray-300 mb-4">
                  We wanted something that could track our collections, provide accurate market values, and connect us with other collectors. When we couldn't find it, we decided to build it ourselves.
                </p>
                <p className="text-gray-300">
                  Today, PopGuide serves thousands of collectors worldwide, helping them organize their collections, track values, and discover new additions to their passion.
                </p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-4">By the Numbers</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">10K+</div>
                    <div className="text-gray-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">500K+</div>
                    <div className="text-gray-400">Items Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">15K+</div>
                    <div className="text-gray-400">Funko Database</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">99.9%</div>
                    <div className="text-gray-400">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <value.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Journey</h2>
            <p className="text-xl text-gray-300 mb-8">Help us build the future of collection management</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                  Start Your Collection
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-700 hover:text-white px-8 py-3">
                  Get In Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Buy Me a Coffee Block */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg px-6 py-6 text-center shadow-lg mt-12 mb-8">
              <div className="text-yellow-700 font-bold text-lg mb-2">Support PopGuide</div>
              <div className="text-gray-800 mb-4">Your donation helps keep the lights on, supports admin and dev costs, and funds ongoing feature development.</div>
              <a href="https://www.buymeacoffee.com/thepopguide" target="_blank" rel="noopener noreferrer">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thepopguide&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" className="mx-auto" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
