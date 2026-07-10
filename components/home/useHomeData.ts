"use client";

import { useEffect, useState } from "react";
import { fetchInicio } from "@/lib/api";
import type { EcommerceInicioCombo, EcommerceInicioImagenProducto, EcommercePortada, ProductoItem } from "@/types/producto";

export function useHomeData() {
  const [aleatorios, setAleatorios] = useState<ProductoItem[]>([]);
  const [combos, setCombos] = useState<EcommerceInicioCombo[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoItem[]>([]);
  const [portadas, setPortadas] = useState<EcommercePortada[]>([]);
  const [imagenesProductos, setImagenesProductos] = useState<EcommerceInicioImagenProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiendaConfigurada, setTiendaConfigurada] = useState(true);

  useEffect(() => {
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
  }, []);

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
