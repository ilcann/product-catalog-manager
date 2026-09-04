import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** ms gecikme — sıralı gelen kartlar için */
  delay?: number;
  /** yukarıdan mı yoksa aşağıdan mı gelsin */
  from?: "up" | "none";
};

/**
 * Viewport'a girince yumuşak şekilde beliren sarmalayıcı.
 * prefers-reduced-motion açıksa animasyon uygulanmaz.
 */
export function Reveal({ children, className, delay = 0, from = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);

    // Hızlı kaydırmada IO eşiği atlanabilir; scroll'da konumu doğrudan kontrol et.
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40) {
        setVisible(true);
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        visible
          ? "translate-y-0 opacity-100"
          : from === "up"
            ? "translate-y-8 opacity-0"
            : "opacity-0",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
