import { Package, CheckCircle, Truck, Clock, XCircle, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const STEPS = [
  { key: "pending", icon: Clock },
  { key: "confirmed", icon: CheckCircle },
  { key: "processing", icon: Settings },
  { key: "shipped", icon: Truck },
  { key: "delivered", icon: Package },
] as const;

type Props = { status: string };

const OrderTimeline = ({ status }: Props) => {
  const { t } = useTranslation();

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-destructive/10">
        <XCircle className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">{t("orderStatus.cancelled")}</span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `calc(${(activeIdx / (STEPS.length - 1)) * 100}% - 32px)` }}
        />

        {STEPS.map((step, i) => {
          const done = i <= activeIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center z-10 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium transition-colors ${
                  done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t(`orderStatus.${step.key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
