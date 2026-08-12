import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppFloatingButton({
  numeroInternacional,
}: Readonly<{ numeroInternacional: string | null | undefined }>) {
  if (!numeroInternacional) return null;

  return (
    <a
      href={`https://wa.me/${numeroInternacional}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-20 right-5 z-[65] flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111318] sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  );
}
