import { Suspense } from "react";
import ProductoDetalleClient from "@/components/productos/ProductoDetalleClient";

export default function ProductoDetallePage() {
  return (
    <Suspense fallback={null}>
      <ProductoDetalleClient />
    </Suspense>
  );
}
