import { useEffect, useState } from "react";
import type { TocItem } from "../types";

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 90) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (!items.length) return <aside className="margin-notes" />;

  return (
    <aside className="margin-notes">
      <h2>In this section</h2>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`${item.level ? "sub" : ""}${active === item.id ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {item.text}
        </a>
      ))}
    </aside>
  );
}
