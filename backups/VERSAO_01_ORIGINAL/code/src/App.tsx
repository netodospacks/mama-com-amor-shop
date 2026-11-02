import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { CartDrawer, FloatingCart } from "@/components/CartComponents";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";

const Product = lazy(() => import("./pages/Product.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const Login = lazy(() => import("./pages/admin/Login.tsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute.tsx").then(m => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx").then(m => ({ default: m.AdminLayout })));
const Categories = lazy(() => import("./pages/admin/Categories.tsx"));
const Products = lazy(() => import("./pages/admin/Products.tsx"));
const Migration = lazy(() => import("./pages/admin/Migration.tsx"));

const RouteLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
  </div>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <CartDrawer />
    <FloatingCart />
    {children}
  </>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteLoading />}>
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
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
