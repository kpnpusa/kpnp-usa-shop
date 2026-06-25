import { useTranslation } from "react-i18next";
import kpnpLogo from "@/assets/kpnp-logo.png";
import wtLogo from "@/assets/world-taekwondo-logo.png";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={kpnpLogo} alt="KPNP" className="h-5" />
              <span className="text-foreground text-3xl tracking-tight" style={{ fontFamily: "Arial Black, sans-serif", fontWeight: 900, transform: "skewX(-8deg)" }}>USA</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.officialDistributor")}<br />
              <a href="https://www.kpnpamerica.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.KPNPAMERICA.com</a>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              {t("footer.contact")}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>info@kpnpamerica.com</p>
              <p>1-585-570-KPNP (5767)</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              {t("footer.followUs")}
            </h4>
            <div className="flex gap-4 mb-4">
              {[
                { name: "Facebook", url: "https://www.facebook.com/kpnppss/" },
                { name: "Instagram", url: "https://www.instagram.com/kpnp_hq/" },
                { name: "TikTok", url: "https://www.tiktok.com/@kpnp.hq" },
              ].map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {social.name}
                </a>
              ))}
            </div>
            <img src={wtLogo} alt="World Taekwondo" className="h-10 bg-white rounded px-2 py-1" />
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
