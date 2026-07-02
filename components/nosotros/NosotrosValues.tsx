const values = [
  {
    number: "01",
    title: "Elegancia Atemporal",
    description: "Disenos que trascienden las tendencias pasajeras, creados para mantener su relevancia y sofisticacion a lo largo del tiempo.",
  },
  {
    number: "02",
    title: "Calidad Premium",
    description: "Seleccionamos cada tejido y perfeccionamos cada costura, garantizando que cada pieza se sienta tan lujosa como se ve.",
  },
  {
    number: "03",
    title: "Autenticidad",
    description: "Creemos que tu estilo es tu voz. Ofrecemos prendas que empoderan tu individualidad con caracter y sutileza.",
  },
];

export function NosotrosValues() {
  return (
    <section className="border-t border-black/5 bg-white px-7 py-20 sm:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-[#242424] sm:text-3xl">
            Nuestros Valores
          </h2>
          <div className="mx-auto mt-6 h-[1px] w-12 bg-black/20" />
        </div>

        <div className="grid gap-12 sm:grid-cols-3 lg:gap-16">
          {values.map((value) => (
            <div key={value.number} className="flex flex-col items-center text-center">
              <span className="mb-4 text-[10px] font-light uppercase tracking-[0.2em] text-black/40">
                {value.number}
              </span>
              <h3 className="mb-4 text-xl font-medium tracking-[0.08em] text-black">
                {value.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-black/60">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
