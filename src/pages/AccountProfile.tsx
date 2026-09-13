import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
  Save,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
}

const LOCAL_ADDRESSES_KEY = "hon_user_addresses";
const LOCAL_PROFILE_KEY = "hon_user_profile_data";

export const AccountProfile: React.FC = () => {
  const navigate = useNavigate();
  const { role, googleUser, isLoggedIn, isGoogleAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

  // User-scoped storage keys
  const userEmail = googleUser?.email || "customer@houseofnuts.com";
  const userKeySanitized = userEmail.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const userAddressKey = `${LOCAL_ADDRESSES_KEY}_${userKeySanitized}`;
  const userProfileKey = `${LOCAL_PROFILE_KEY}_${userKeySanitized}`;

  // Redirect to /login immediately if not authenticated or upon logout
  useEffect(() => {
    if (!isLoggedIn && !isGoogleAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, isGoogleAuthenticated, navigate]);

  // Profile Edit State
  const [profileData, setProfileData] = useState<UserProfileData>(() => {
    const raw = localStorage.getItem(userProfileKey) || localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return {
      name: googleUser ? googleUser.name : "House of Nuts Customer",
      email: googleUser ? googleUser.email : "customer@houseofnuts.com",
      phone: "",
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profileData.name);
  const [editPhone, setEditPhone] = useState(profileData.phone);

  // Address Management State
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const raw = localStorage.getItem(userAddressKey) || localStorage.getItem(LOCAL_ADDRESSES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (a: Address) => !a.street?.includes("Palm Heights") && a.pincode !== "560103"
          );
          return filtered;
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Re-sync profile and address when user session changes
  useEffect(() => {
    const rawProfile = localStorage.getItem(userProfileKey);
    if (rawProfile) {
      try {
        setProfileData(JSON.parse(rawProfile));
      } catch {
        /* ignore storage parse error */
      }
    } else if (googleUser) {
      setProfileData((prev) => ({
        ...prev,
        name: googleUser.name,
        email: googleUser.email,
      }));
    }

    const rawAddr = localStorage.getItem(userAddressKey);
    if (rawAddr) {
      try {
        const parsed = JSON.parse(rawAddr);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (a: Address) => !a.street?.includes("Palm Heights") && a.pincode !== "560103"
          );
          setAddresses(filtered);
        }
      } catch {
        /* ignore storage parse error */
      }
    }
  }, [userProfileKey, userAddressKey, googleUser]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfileData = {
      ...profileData,
      name: editName.trim() || profileData.name,
      phone: editPhone.trim(),
    };
    setProfileData(updated);
    localStorage.setItem(userProfileKey, JSON.stringify(updated));
    setIsEditingProfile(false);
    toast.success("Profile information updated successfully!");
  };

  // Open address modal for add or edit
  const openAddressModal = (addr?: Address) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddrName(addr.name);
      setAddrPhone(addr.phone);
      setAddrStreet(addr.street);
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrPincode(addr.pincode);
      setAddrLandmark(addr.landmark || "");
      setAddrIsDefault(!!addr.isDefault);
    } else {
      setEditingAddressId(null);
      setAddrName(profileData.name);
      setAddrPhone(profileData.phone || "");
      setAddrStreet("");
      setAddrCity("");
      setAddrState("");
      setAddrPincode("");
      setAddrLandmark("");
      setAddrIsDefault(addresses.length === 0);
    }
    setIsAddressModalOpen(true);
  };

  // Save address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrPincode) {
      toast.error("Please fill in street, city, and pincode.");
      return;
    }

    let updatedAddresses: Address[] = [];
    if (editingAddressId) {
      updatedAddresses = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            name: addrName,
            phone: addrPhone,
            street: addrStreet,
            city: addrCity,
            state: addrState,
            pincode: addrPincode,
            landmark: addrLandmark,
            isDefault: addrIsDefault,
          };
        }
        return addrIsDefault ? { ...a, isDefault: false } : a;
      });
      toast.success("Delivery address updated!");
    } else {
      const newAddr: Address = {
        id: "addr_" + Date.now(),
        name: addrName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        landmark: addrLandmark,
        isDefault: addrIsDefault || addresses.length === 0,
      };

      if (addrIsDefault) {
        updatedAddresses = addresses.map((a) => ({ ...a, isDefault: false }));
        updatedAddresses.push(newAddr);
      } else {
        updatedAddresses = [...addresses, newAddr];
      }
      toast.success("New delivery address added!");
    }

    setAddresses(updatedAddresses);
    localStorage.setItem(userAddressKey, JSON.stringify(updatedAddresses));
    setIsAddressModalOpen(false);
  };

  // Delete address
  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem(userAddressKey, JSON.stringify(updated));
    toast.success("Delivery address deleted.");
  };

  // Set default address
  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    localStorage.setItem(userAddressKey, JSON.stringify(updated));
    toast.success("Set as default delivery address!");
  };

  const handleLogoutClick = () => {
    logout();
    toast.info("Signed out successfully.");
    navigate("/login", { replace: true });
  };

  const [imgError, setImgError] = useState(false);

  if (!isLoggedIn && !isGoogleAuthenticated) {
    return null;
  }

  const displayName = profileData.name;
  const displayEmail = profileData.email;

  return (
    <div className="min-h-screen flex flex-col bg-clay-light text-foreground">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* User Banner Header */}
          <div className="bg-background border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-accent/15 text-accent grid place-items-center font-display text-2xl font-bold shrink-0 overflow-hidden border border-accent/20">
                {googleUser?.picture && !imgError ? (
                  <img
                    src={googleUser.picture}
                    alt=""
                    onError={() => setImgError(true)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{displayName}</h1>
                <p className="text-xs text-muted-foreground font-body flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-accent" /> {displayEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={ROLE_BADGES[role].variant} className="text-xs px-3 py-1 font-mono">
                {ROLE_LABELS[role]}
              </Badge>
              {(role === "admin" || role === "developer" || role === "staff") && (
                <Link
                  to="/admin"
                  className="text-xs bg-primary text-primary-foreground px-3.5 py-2 rounded-xl hover:bg-accent transition-colors font-body flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck size={14} /> Role Portal
                </Link>
              )}
              <button
                onClick={handleLogoutClick}
                type="button"
                className="text-xs border border-border px-3.5 py-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors font-body flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Flipkart-Style Main Layout with Sidebar Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="bg-background border border-border rounded-2xl p-4 space-y-2 font-body h-fit">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold px-3 py-1">
                Account Settings
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-accent text-accent-foreground font-bold"
                    : "hover:bg-clay-light text-muted-foreground"
                }`}
              >
                <User size={16} /> Personal Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-accent text-accent-foreground font-bold"
                    : "hover:bg-clay-light text-muted-foreground"
                }`}
              >
                <MapPin size={16} /> Delivery Addresses ({addresses.length})
              </button>

              <Link
                to="/orders"
                className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-clay-light hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Package size={16} /> My Orders
                </span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">&rarr;</span>
              </Link>

              <Link
                to="/wishlist"
                className="w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-clay-light hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Heart size={16} /> My Wishlist
                </span>
                <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-mono">
                  {wishlistCount}
                </span>
              </Link>
            </div>

            {/* Content Panel */}
            <div className="md:col-span-3 bg-background border border-border rounded-2xl p-6 font-body space-y-6">
              {/* TAB 1: PERSONAL PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-xl font-semibold">Personal Information</h3>
                    {!isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(profileData.name);
                          setEditPhone(profileData.phone);
                          setIsEditingProfile(true);
                        }}
                        className="text-xs text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Edit2 size={14} /> Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md bg-clay-light/50 p-5 rounded-2xl border border-border">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-border bg-background px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full border border-border bg-background px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full border border-border bg-muted/60 px-3.5 py-2 text-xs rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          className="py-2 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-accent transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="py-2 px-4 border border-border text-xs rounded-xl hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-clay-light p-4 rounded-xl border border-border/80">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Full Name</p>
                        <p className="font-medium text-foreground text-sm">{displayName}</p>
                      </div>
                      <div className="bg-clay-light p-4 rounded-xl border border-border/80">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Email Address</p>
                        <p className="font-medium text-foreground text-sm flex items-center gap-1.5 truncate">
                          <Mail size={14} className="text-accent shrink-0" /> {displayEmail}
                        </p>
                      </div>
                      <div className="bg-clay-light p-4 rounded-xl border border-border/80">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Phone Number</p>
                        <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                          <Phone size={14} className="text-accent shrink-0" /> {profileData.phone || "Not set (click Edit Profile to add)"}
                        </p>
                      </div>
                      <div className="bg-clay-light p-4 rounded-xl border border-border/80">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Account Verification</p>
                        <p className="font-medium text-foreground text-sm capitalize flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" /> {isGoogleAuthenticated ? "Google Verified" : "Active Member"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DELIVERY ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-xl font-semibold">Manage Delivery Addresses</h3>
                    <button
                      type="button"
                      onClick={() => openAddressModal()}
                      className="text-xs bg-primary text-primary-foreground px-3.5 py-2 rounded-xl hover:bg-accent transition-colors font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} /> Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-2">
                      <MapPin size={32} className="mx-auto text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">No saved delivery addresses found.</p>
                      <button
                        type="button"
                        onClick={() => openAddressModal()}
                        className="text-xs text-accent font-semibold hover:underline"
                      >
                        + Add your first address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`border p-4 rounded-2xl space-y-3 transition-all ${
                            addr.isDefault ? "border-accent bg-accent/5 shadow-xs" : "border-border bg-clay-light/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {addr.isDefault && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 uppercase tracking-wider font-mono rounded-full font-bold">
                                  Default Address
                                </span>
                              )}
                              <span className="text-xs font-semibold text-foreground">{addr.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-[11px] text-accent hover:underline font-medium"
                                >
                                  Make Default
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openAddressModal(addr)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit Address"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete Address"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-medium text-foreground leading-relaxed">
                            {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ""}{addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          {addr.phone && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-body">
                              <Phone size={12} className="text-accent" /> Phone: {addr.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Address Edit / Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 max-w-lg w-full rounded-3xl p-6 font-body space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-semibold text-lg">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="size-7 rounded-full bg-secondary text-muted-foreground hover:text-foreground grid place-items-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Flat / Building / Street Address</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. #42, Palm Heights, Outer Ring Road"
                  className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    placeholder="560103"
                    className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                  placeholder="e.g. Near EcoSpace Tech Park"
                  className="w-full border border-border bg-background px-3 py-2 rounded-xl focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addrDefault"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="addrDefault" className="text-muted-foreground cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-accent flex items-center gap-1.5 font-semibold"
                >
                  <Save size={14} /> Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfile;
