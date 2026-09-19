import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { CartDrawer, FloatingCart } from "@/components/CartComponents";

import Index from "./pages/Index.tsx";
import Product from "./pages/Product.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import NotFound from "./pages/NotFound.tsx";

import Login from "./pages/admin/Login.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import { AdminRoute } from "./components/admin/AdminRoute.tsx";

import { AdminLayout } from "./components/admin/AdminLayout.tsx";

import Categories from "./pages/admin/Categories.tsx";
import Products from "./pages/admin/Products.tsx";
import Migration from "./pages/admin/Migration.tsx";

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <CartDrawer />
    <FloatingCart />
    {children}
  </>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
            <Route path="/product/:id" element={<PublicLayout><Product /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            
            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<Login />} />
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/categorias" element={<Categories />} />
                <Route path="/admin/produtos" element={<Products />} />
                <Route path="/admin/migracao" element={<Migration />} />
                <Route path="/admin/pedidos" element={<div className="p-4">Pedidos (Em breve)</div>} />
                <Route path="/admin/configuracoes" element={<div className="p-4">Configurações (Em breve)</div>} />
              </Route>
            </Route>

            {/* CATCH-ALL */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
