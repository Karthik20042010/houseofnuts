import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import MobileTabBar from "./components/MobileTabBar.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import Chatbot from "./components/Chatbot.tsx";

const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const Category = lazy(() => import("./pages/Category.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const OrderDetail = lazy(() => import("./pages/OrderDetail.tsx"));
const TrackOrder = lazy(() => import("./pages/TrackOrder.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminOrderDetail = lazy(() => import("./pages/AdminOrderDetail.tsx"));
const AdminInventory = lazy(() => import("./pages/AdminInventory.tsx"));
const AdminImages = lazy(() => import("./pages/AdminImages.tsx"));
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
      <InventoryProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="pb-14 md:pb-0">
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/shop" element={<Category />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/track" element={<TrackOrder />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/admin/images" element={<AdminImages />} />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
