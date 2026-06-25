import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Equipment from "./pages/Equipment";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AdminLogin from "./pages/AdminLogin";
import AdminChat from "./pages/AdminChat";
import AdminOrders from "./pages/AdminOrders";
import AdminNotifications from "./pages/AdminNotifications";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Checkout from "./pages/Checkout";
import ResetPassword from "./pages/ResetPassword";
import Unsubscribe from "./pages/Unsubscribe";
import NotFound from "./pages/NotFound";
import { useFCMToken } from "@/hooks/useFCMToken";
import { PushOnboarding } from "@/components/PushOnboarding";

const queryClient = new QueryClient();

const FCMRegistrar = () => {
  useFCMToken();
  return null;
};

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PushOnboarding />
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <FCMRegistrar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/chat" element={<AdminChat />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
