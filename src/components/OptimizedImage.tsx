import { useState, memo } from "react";
import { optimizeShopifyImage } from "@/lib/imageUtils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

const OptimizedImage = memo(({ src, alt, className = "", width = 400, loading = "lazy", fetchPriority }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const optimizedSrc = optimizeShopifyImage(src, width);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      loading={loading}
      fetchPriority={fetchPriority}
      onLoad={() => setLoaded(true)}
    />
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
