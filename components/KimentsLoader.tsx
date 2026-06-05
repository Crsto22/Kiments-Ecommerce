export function KimentsLoader() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-black">
      <div className="kiments-loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="mt-5 font-[family-name:var(--font-kiments)] text-4xl tracking-[0.16em]">
        KIMENTS
      </p>
      <p className="mt-2 text-[10px] font-light uppercase tracking-[0.24em]">
        Tienda de ropa
      </p>
    </div>
  );
}
