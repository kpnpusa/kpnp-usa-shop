import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import RentalSection from "@/components/RentalSection";
import FAQSection from "@/components/FAQSection";
import CartDrawer from "@/components/CartDrawer";
import ChatBot from "@/components/ChatBot";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProductGrid />
      <RentalSection />
      <FAQSection />
      <CartDrawer />
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;
