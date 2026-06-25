import { useState, useCallback, useRef, memo } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";

const rentalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(20).optional(),
  eventDate: z.string().optional(),
  location: z.string().trim().max(300).optional(),
  tournamentWebsite: z.string().trim().max(500).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type RentalForm = z.infer<typeof rentalSchema>;

const emptyForm: RentalForm = {
  name: "", email: "", phone: "", eventDate: "", location: "", tournamentWebsite: "", message: "",
};

const RentalSection = memo(() => {
  const { t } = useTranslation();
  const [form, setForm] = useState<RentalForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RentalForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const update = useCallback((field: keyof RentalForm, value: string) => {
    // Debounce validation clearing (300ms)
    if (debounceTimers.current[field]) clearTimeout(debounceTimers.current[field]);
    setForm((prev) => ({ ...prev, [field]: value }));
    debounceTimers.current[field] = setTimeout(() => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }, 300);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const result = rentalSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RentalForm;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const mailtoLink = `mailto:info@kpnpamerica.com?subject=${encodeURIComponent(
      `Rental Inquiry from ${form.name}`
    )}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "N/A"}\nEvent Date: ${form.eventDate || "N/A"}\nLocation: ${form.location || "N/A"}\nTournament Website: ${form.tournamentWebsite || "N/A"}\n\nMessage:\n${form.message}`
    )}`;
    window.open(mailtoLink, "_blank");
    toast.success(t("rental.emailOpening"));
    setSubmitted(true);
  }, [form, t]);

  if (submitted) {
    return (
      <section id="rental" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl text-foreground mb-3">{t("rental.sentTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("rental.sentMessage")}</p>
            <button
              onClick={() => { setSubmitted(false); setForm(emptyForm); }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("rental.submitAnother")}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="rental" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 italic">
            {t("rental.title_prefix")} <span className="text-red-600 font-extrabold">{t("rental.title_suffix")}</span>
          </h2>
          <p className="text-foreground/75 font-medium max-w-md mx-auto">{t("rental.description")}</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("rental.name")} required error={errors.name}>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="form-input" placeholder={t("rental.namePlaceholder")} />
            </Field>
            <Field label={t("rental.email")} required error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="form-input" placeholder={t("rental.emailPlaceholder")} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("rental.phone")} error={errors.phone}>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="form-input" placeholder={t("rental.phonePlaceholder")} />
            </Field>
            <Field label={t("rental.eventDate")} error={errors.eventDate}>
              <input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className="form-input" />
            </Field>
          </div>
          <Field label={t("rental.location")} error={errors.location}>
            <input value={form.location} onChange={(e) => update("location", e.target.value)} className="form-input" placeholder={t("rental.locationPlaceholder")} />
          </Field>
          <Field label={t("rental.tournamentWebsite")} error={errors.tournamentWebsite}>
            <input value={form.tournamentWebsite} onChange={(e) => update("tournamentWebsite", e.target.value)} className="form-input" placeholder={t("rental.websitePlaceholder")} />
          </Field>
          <Field label={t("rental.message")} required error={errors.message}>
            <textarea value={form.message} onChange={(e) => update("message", e.target.value)} className="form-input min-h-[100px] resize-y" placeholder={t("rental.messagePlaceholder")} />
          </Field>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
            {t("rental.submit")}
          </button>
        </motion.form>
      </div>
    </section>
  );
});

RentalSection.displayName = "RentalSection";

const Field = memo(({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}{required && <span className="text-primary">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
));

Field.displayName = "Field";

export default RentalSection;
