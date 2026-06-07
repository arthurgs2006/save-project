import { useRef } from "react";
import { motion } from "framer-motion";

interface MobileCarouselProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function MobileCarousel({
  title,
  children,
  className = "",
}: MobileCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`mobile-carousel ${className}`}>
      {title && <h3 className="mobile-carousel-title">{title}</h3>}

      <div className="mobile-carousel-wrapper">
        <button
          type="button"
          className="mobile-carousel-control left"
          aria-label="Scroll para a esquerda"
          onClick={() => scroll("left")}
        >
          <i className="bi bi-chevron-left" />
        </button>

        <motion.div
          ref={scrollRef}
          className="mobile-carousel-track"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          {children}
        </motion.div>

        <button
          type="button"
          className="mobile-carousel-control right"
          aria-label="Scroll para a direita"
          onClick={() => scroll("right")}
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </section>
  );
}
