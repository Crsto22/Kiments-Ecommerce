import type { EcommercePedidoCreateRequest } from "@/lib/api";

export interface CheckoutPedidoFormState {
  docNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wantsInvoice: boolean;
  rucNumber: string;
  shippingType: "delivery" | "pickup" | "";
  address: string;
  referencia: string;
  departamento: string;
  provincia: string;
  distrito: string;
  shippingRate: "shalom" | "olva" | "motorizado" | "";
  selectedPaymentMethod: string;
  turnstileToken: string;
}

interface CheckoutPedidoItem {
  idProductoVariante: number;
  quantity: number;
}

export function buildPedidoPayload(
  formState: CheckoutPedidoFormState,
  items: CheckoutPedidoItem[],
): EcommercePedidoCreateRequest {
  return {
    cliente: {
      dni: formState.docNumber.trim() ? formState.docNumber : undefined,
      nombres: formState.firstName,
      apellidos: formState.lastName,
      correo: formState.email,
      telefono: formState.phone,
      deseaFactura: formState.wantsInvoice,
      ruc: formState.wantsInvoice ? formState.rucNumber : undefined,
    },
    envio: {
      tipo: formState.shippingType === "delivery" ? "DELIVERY" : "PICKUP",
      direccion: formState.address,
      referencia: formState.referencia,
      departamento: formState.departamento,
      provincia: formState.provincia,
      distrito: formState.distrito,
      tarifa: formState.shippingRate.toUpperCase(),
    },
    metodoPago: formState.selectedPaymentMethod as "YAPE" | "BCP",
    items: items.map((item) => ({
      idProductoVariante: item.idProductoVariante,
      cantidad: item.quantity,
    })),
    turnstileToken: formState.turnstileToken || undefined,
  };
}
