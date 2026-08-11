import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Package, MapPin, Phone, Mail, Heart, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

export const AccountProfile: React.FC = () => {
  const { role, googleUser, isGoogleAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

  const displayName = googleUser ? googleUser.name : "House of Nuts Customer";
  const displayEmail = googleUser ? googleUser.email : "customer@houseofnuts.com";

  return (
    <div className="min-h-screen bg-clay-light py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* User Banner Header */}
        <div className="bg-background border border-border rounded-sm p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-accent/10 text-accent grid place-items-center font-display text-2xl font-bold">
              {googleUser?.picture ? (
                <img src={googleUser.picture} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={30} />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{displayName}</h1>
              <p className="text-sm text-muted-foreground font-body">{displayEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
            <button
              onClick={logout}
              className="text-xs border border-border px-3 py-1.5 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors font-body flex items-center gap-1.5"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Flipkart-Style Main Layout with Sidebar Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-background border border-border rounded-sm p-4 space-y-2 font-body h-fit">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold px-3 py-1">
              Account Navigation
            </p>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                activeTab === "profile" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-clay-light text-muted-foreground"
              }`}
            >
              <User size={16} /> Personal Profile
            </button>

            <Link
              to="/orders"
              className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium text-muted-foreground hover:bg-clay-light hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Package size={16} /> My Orders
              </span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">&rarr;</span>
            </Link>

            <Link
              to="/wishlist"
              className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium text-muted-foreground hover:bg-clay-light hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Heart size={16} /> My Wishlist
              </span>
              <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-mono">
                {wishlistCount}
              </span>
            </Link>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                activeTab === "addresses" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-clay-light text-muted-foreground"
              }`}
            >
              <MapPin size={16} /> Delivery Addresses
            </button>
          </div>

          {/* Content Panel */}
          <div className="md:col-span-3 bg-background border border-border rounded-sm p-6 font-body space-y-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="font-display text-xl font-semibold border-b border-border pb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-clay-light p-4 rounded-sm border border-border">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">Full Name</p>
                    <p className="font-medium text-foreground">{displayName}</p>
                  </div>
                  <div className="bg-clay-light p-4 rounded-sm border border-border">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">Email Address</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <Mail size={14} className="text-accent" /> {displayEmail}
                    </p>
                  </div>
                  <div className="bg-clay-light p-4 rounded-sm border border-border">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">Phone Number</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <Phone size={14} className="text-accent" /> +91 98765 43210
                    </p>
                  </div>
                  <div className="bg-clay-light p-4 rounded-sm border border-border">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">Account Type</p>
                    <p className="font-medium text-foreground capitalize flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" /> {isGoogleAuthenticated ? "Google Verified" : "Standard Account"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold border-b border-border pb-3">
                  Manage Delivery Addresses
                </h3>
                <div className="border border-border p-4 rounded-sm bg-clay-light/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 uppercase tracking-wider font-mono rounded-xs">
                      Default Address
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{displayName}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    #42, Palm Heights, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103
                  </p>
                  <p className="text-xs text-muted-foreground">Mobile: +91 98765 43210</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
