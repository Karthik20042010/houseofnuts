import React from "react";
import { Link, useLocation } from "react-router-dom";
import { categories, products } from "@/data/products";
import { Nut, Cookie, Sparkles, Flame, Droplets, Sun, Sprout, LayoutGrid } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  all: LayoutGrid,
  nuts: Nut,
  "dry-fruits": Cookie,
  chocolates: Sparkles,
  spices: Flame,
  honey: Droplets,
  seeds: Sprout,
  "solar-dried": Sun,
};

export const CategoryStrip: React.FC = () => {
  const location = useLocation();
  const currentSlug = location.pathname.startsWith("/category/")
    ? location.pathname.replace("/category/", "")
    : location.pathname === "/shop"
    ? "all"
    : "";

  return (
    <div className="w-full bg-background border-y border-border py-4 px-4 sm:px-8 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-3 sm:gap-6 min-w-max">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || LayoutGrid;
          const isActive = currentSlug === cat.id || (currentSlug === "" && cat.id === "all");
          const count =
            cat.id === "all"
              ? products.length
              : products.filter((p) => p.category === cat.id).length;

          const targetUrl = cat.id === "all" ? "/shop" : `/category/${cat.id}`;

          return (
            <Link
              key={cat.id}
              to={targetUrl}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-body transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105 font-medium"
                  : "bg-clay-light/60 text-muted-foreground border-border hover:border-accent hover:text-foreground hover:bg-background"
              }`}
            >
              <Icon size={15} className={isActive ? "text-primary-foreground" : "text-accent"} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStrip;
