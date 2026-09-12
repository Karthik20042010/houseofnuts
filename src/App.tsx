import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AnalyticsTracker from "./components/AnalyticsTracker.tsx";
import MobileTabBar from "./components/MobileTabBar.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import Chatbot from "./components/Chatbot.tsx";

const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const Category = lazy(() => import("./pages/Category.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const OrderDetail = lazy(() => import("./pages/OrderDetail.tsx"));
const TrackOrder = lazy(() => import("./pages/TrackOrder.tsx"));
const AccountProfile = lazy(() => import("./pages/AccountProfile.tsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.tsx"));
const Gifting = lazy(() => import("./pages/Gifting.tsx"));
const Journal = lazy(() => import("./pages/Journal.tsx"));
const StoreInfo = lazy(() => import("./pages/StoreInfo.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics.tsx"));
const AdminOrders = lazy(() => import("./pages/AdminOrders.tsx"));
const AdminOrderDetail = lazy(() => import("./pages/AdminOrderDetail.tsx"));
const AdminInventory = lazy(() => import("./pages/AdminInventory.tsx"));
const AdminMessages = lazy(() => import("./pages/AdminMessages.tsx"));
const AdminImages = lazy(() => import("./pages/AdminImages.tsx"));
const DeveloperConsole = lazy(() => import("./pages/DeveloperConsole.tsx"));
const AdminRoleManagement = lazy(() => import("./pages/AdminRoleManagement.tsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <div className="size-8 border-2 border-border border-t-accent rounded-full animate-spin" />
    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-body">Loading</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WishlistProvider>
          <InventoryProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <AnalyticsTracker />
                <div className="pb-14 md:pb-0">
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Public Customer Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/shop" element={<Category />} />
                      <Route path="/category/:slug" element={<Category />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetail />} />
                      <Route path="/track" element={<TrackOrder />} />
                      <Route path="/account" element={<AccountProfile />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/gifting" element={<Gifting />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="/faq" element={<StoreInfo />} />
                      <Route path="/shipping" element={<StoreInfo />} />
                      <Route path="/returns" element={<StoreInfo />} />
                      <Route path="/privacy" element={<StoreInfo />} />
                      <Route path="/terms" element={<StoreInfo />} />
                      <Route path="/contact" element={<StoreInfo />} />

                      {/* Authentication Login Routes */}
                      <Route path="/login" element={<AdminLogin />} />
                      <Route path="/admin/login" element={<AdminLogin />} />

                      {/* Role Protected Administration Routes */}
                      <Route element={<AdminLayout />}>
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer", "staff"]}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/analytics"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer"]} requiredPermission="canViewAnalytics">
                              <AdminAnalytics />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer", "staff"]}>
                              <AdminOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/orders/:id"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer", "staff"]}>
                              <AdminOrderDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/messages"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer", "staff"]}>
                              <AdminMessages />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/inventory"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer", "staff"]}>
                              <AdminInventory />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/images"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer"]}>
                              <AdminImages />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/developer"
                          element={
                            <ProtectedRoute allowedRoles={["admin", "developer"]}>
                              <DeveloperConsole />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/roles"
                          element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                              <AdminRoleManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
                <MobileTabBar />
              </BrowserRouter>
              <WhatsAppButton />
              <Chatbot />
            </CartProvider>
          </InventoryProvider>
        </WishlistProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
