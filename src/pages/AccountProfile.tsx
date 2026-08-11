import React from "react";
import { Link } from "react-router-dom";
import { User, Package, MapPin, Phone, Mail, ShoppingBag, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

export const AccountProfile: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-clay-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Card */}
        <div className="bg-background border border-border rounded-sm p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-accent/10 text-accent grid place-items-center font-display text-2xl font-bold">
                <User size={28} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Customer Portal</h1>
                <p className="text-sm text-muted-foreground font-body">Welcome back to House of Nuts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ROLE_BADGES[role].variant} className="text-xs px-3 py-1 font-mono">
                {ROLE_LABELS[role]}
              </Badge>
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-sm hover:bg-accent transition-colors font-body flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} /> Admin Portal
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-3 font-body">
              <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground font-semibold">
                Personal Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} className="text-accent" />
                  <span>customer@houseofnuts.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} className="text-accent" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} className="text-accent" />
                  <span>Bengaluru, Karnataka, India</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 font-body">
              <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground font-semibold">
                Quick Shortcuts
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/80 rounded-sm border border-border transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} className="text-accent" /> My Orders History
                  </span>
                  <span className="text-xs text-muted-foreground">&rarr;</span>
                </Link>

                <Link
                  to="/track"
                  className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/80 rounded-sm border border-border transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} className="text-accent" /> Track Live Order
                  </span>
                  <span className="text-xs text-muted-foreground">&rarr;</span>
                </Link>

                <Link
                  to="/shop"
                  className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/80 rounded-sm border border-border transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-accent" /> Explore Nuts & Dry Fruits
                  </span>
                  <span className="text-xs text-muted-foreground">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
