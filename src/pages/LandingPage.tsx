import React from 'react';
import Navbar from '../components/landingpage/Navbar';
import Carousel from '../components/landingpage/Carousel';
import HowItWorks from '../components/landingpage/HowItWorks';
import Hero from '../components/landingpage/Hero';
import AuthSection from '../components/landingpage/AuthSection';
import Footer from '../components/landingpage/Footer';
import ScrollToTop from '../components/landingpage/ScrollToTop';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Carousel />
      <main className="flex-grow">
        <HowItWorks />
        <Hero />
        <AuthSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
