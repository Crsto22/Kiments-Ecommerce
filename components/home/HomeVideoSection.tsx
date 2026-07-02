export function HomeVideoSection() {
  return (
    <section className="relative min-h-[460px] overflow-hidden bg-black sm:min-h-[560px] lg:min-h-[640px]">
      <video
        className="absolute inset-0 size-full object-cover"
        src="/Video/Video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        Tu navegador no puede reproducir este video.
      </video>
      <div className="absolute inset-0 bg-black/28" />
    </section>
  );
}
