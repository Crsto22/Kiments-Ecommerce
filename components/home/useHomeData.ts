"use client";

import { useEffect, useState } from "react";
import { fetchInicio } from "@/lib/api";
import type { EcommerceInicioCombo, EcommerceInicioImagenProducto, EcommerceInicioResponse, EcommercePortada, ProductoItem } from "@/types/producto";

export function useHomeData(initialData: EcommerceInicioResponse | null) {
  const [aleatorios, setAleatorios] = useState<ProductoItem[]>(() => initialData?.aleatorios ?? []);
  const [combos, setCombos] = useState<EcommerceInicioCombo[]>(() => initialData?.combos ?? []);
  const [masVendidos, setMasVendidos] = useState<ProductoItem[]>(() => initialData?.masVendidos ?? []);
  const [portadas, setPortadas] = useState<EcommercePortada[]>(() => initialData?.portadas ?? []);
  const [imagenesProductos, setImagenesProductos] = useState<EcommerceInicioImagenProducto[]>(() => initialData?.imagenesProductos ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [tiendaConfigurada, setTiendaConfigurada] = useState(initialData?.tiendaConfigurada ?? true);

  useEffect(() => {
    if (initialData) return;
    fetchInicio()
      .then((res) => {
        setTiendaConfigurada(res.tiendaConfigurada);
        setPortadas(res.portadas ?? []);
        setImagenesProductos(res.imagenesProductos ?? []);
        setAleatorios(res.aleatorios ?? []);
        setCombos(res.combos ?? []);
        setMasVendidos(res.masVendidos ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [initialData]);

  return {
    aleatorios,
    combos,
    error,
    imagenesProductos,
    loading,
    masVendidos,
    portadas,
    tiendaConfigurada,
  };
}
