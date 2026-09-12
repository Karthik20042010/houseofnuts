import React from "react";
import { Link, useLocation } from "react-router-dom";
import { categories, products } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryVisibleToUser, isPrivilegedUser, RESTRICTED_COMING_SOON_CATEGORIES } from "@/lib/accessControl";
import { Nut, Cookie, Sparkles, Flame, Droplets, Sun, Sprout, LayoutGrid, Gift, Zap, LucideIcon, ShieldCheck } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  nuts: Nut,
  "dry-fruits": Cookie,
  chocolates: Sparkles,
  mixes: Zap,
  gifting: Gift,
  spices: Flame,
  honey: Droplets,
  seeds: Sprout,
  "solar-dried": Sun,
};

export const CategoryStrip: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const currentSlug = location.pathname.startsWith("/category/")
    ? location.pathname.replace("/category/", "")
    : location.pathname === "/shop"
    ? "all"
    : "";

  const visibleCategories = categories.filter((cat) => isCategoryVisibleToUser(cat.id, auth));
  const isPrivileged = isPrivilegedUser(auth);

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b border-border/50 py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max mx-auto py-0.5">
          {visibleCategories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || LayoutGrid;
            const isActive = currentSlug === cat.id || (currentSlug === "" && cat.id === "all");
            const isRestricted = RESTRICTED_COMING_SOON_CATEGORIES.includes(cat.id.toLowerCase());
            
            // Calculate visible count
            const visibleProducts = products.filter((p) => isCategoryVisibleToUser(p.category, auth));
            const count =
              cat.id === "all"
                ? visibleProducts.length
                : visibleProducts.filter((p) => p.category === cat.id).length;

            const targetUrl = cat.id === "all" ? "/shop" : `/category/${cat.id}`;

            return (
              <Link
                key={cat.id}
                to={targetUrl}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-body tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-accent/10 text-foreground border-accent/60 font-medium shadow-xs"
                    : "bg-background text-muted-foreground border-border/70 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <Icon size={13} className={isActive ? "text-accent" : "text-muted-foreground/70"} />
                <span>{cat.label}</span>
                {isRestricted && isPrivileged ? (
                  <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                    <ShieldCheck size={9} /> Admin
                  </span>
                ) : (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-accent/20 text-accent font-semibold"
                        : "bg-muted/70 text-muted-foreground/80"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryStrip;
