import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_KEYS = [
  "whatIsKPNP",
  "shippingTime",
  "internationalShipping",
  "returnPolicy",
  "rentalHow",
  "paymentMethods",
  "productWarranty",
  "contactSupport",
] as const;

const FAQSection = memo(() => {
  const { t } = useTranslation();

  return (
    <section id="faq" className="py-20 bg-gradient-dark">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-display text-foreground mb-3">
            {t("faq.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("faq.subtitle")}
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <AccordionItem
                value={key}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/40 transition-all duration-200 hover:bg-accent/30 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-5">
                  {t(`faq.items.${key}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {t(`faq.items.${key}.a`)}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";

export default FAQSection;
