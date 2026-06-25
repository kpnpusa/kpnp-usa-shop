import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg-new.png";

const HeroSection = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen flex items-end justify-start overflow-hidden pb-24 sm:pb-32">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Taekwondo athletes competing"
          className="w-full h-full object-cover contrast-[1.1] brightness-110 saturate-[1.15]"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="font-semibold tracking-widest uppercase mb-4 text-xl text-primary font-sans">
            {t("hero.subtitle")}
          </p>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-foreground leading-none mb-6 italic">
            {t("hero.line1")}
            <br />
            <span className="text-red-600 font-extrabold">{t("hero.line2")}</span>
            <br />
            {t("hero.line3")}
          </h1>
          <p className="text-foreground/80 text-xl font-medium max-w-md mb-8">
            {t("hero.description")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={scrollToProducts}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("hero.shopNow")}
            </button>
            <button
              onClick={() => navigate("/equipment")}
              className="px-8 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-colors"
            >
              {t("hero.viewEquipment")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
