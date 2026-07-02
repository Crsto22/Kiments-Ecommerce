const termsSections = [
  {
    title: "01. ASPECTOS GENERALES",
    paragraphs: [
      <>
        Bienvenido a <span className="font-semibold text-black">KIMENTS</span>. El acceso y uso de este sitio web, así como la compra de nuestros productos, están sujetos a los siguientes términos y condiciones. Al utilizar nuestro sitio, aceptas estas políticas en su totalidad.
      </>,
      "KIMENTS se reserva el derecho de actualizar, modificar o reemplazar cualquier parte de estas condiciones mediante la publicación de actualizaciones en nuestro sitio web. Es tu responsabilidad revisar esta página periódicamente para verificar los cambios.",
    ],
  },
  {
    title: "02. POLÍTICA DE COMPRA Y PAGOS",
    paragraphs: [
      "Todos los precios indicados en nuestro sitio web incluyen los impuestos correspondientes vigentes en Perú, salvo que se indique lo contrario. Los costos de envío se calculan de manera independiente al finalizar la compra.",
      "Aceptamos como métodos de pago únicamente transferencias bancarias directas y Yape. Todo el proceso es seguro y tu información financiera no es almacenada en nuestros servidores.",
    ],
  },
  {
    title: "03. ENVÍOS Y ENTREGAS",
    paragraphs: [
      "Procesamos los pedidos con la mayor agilidad posible. Los tiempos de entrega estimados varían entre 2 a 5 días hábiles para Lima Metropolitana, y de 5 a 10 días hábiles para provincias, dependiendo del operador logístico.",
      "KIMENTS no se hace responsable por retrasos generados por eventos de fuerza mayor o problemas ajenos a nuestra logística, pero siempre estaremos a tu disposición para ayudarte a rastrear tu pedido.",
    ],
  },
  {
    title: "04. PRIVACIDAD DE DATOS",
    paragraphs: [
      "Respetamos tu privacidad. Los datos personales proporcionados durante la navegación o compra serán utilizados única y exclusivamente para procesar tus pedidos y, si nos autorizas, para enviarte comunicaciones exclusivas sobre nuestras colecciones. No compartiremos tu información con terceros sin tu consentimiento.",
    ],
  },
];

export function TermsContent() {
  return (
    <section className="px-7 py-20 sm:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-3xl space-y-16">
        {termsSections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-6 text-xl font-medium tracking-[0.08em] text-black">
              {section.title}
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-3xl border-t border-black/10 pt-12 text-center">
        <p className="text-sm font-light text-black/60">
          ¿Tienes alguna duda adicional sobre nuestras políticas? <br className="sm:hidden" />
          Escríbenos a nuestro WhatsApp al{" "}
          <a href="https://wa.me/51933918047" target="_blank" rel="noopener noreferrer" className="border-b border-black/20 pb-0.5 font-medium text-black transition-colors hover:border-black">
            +51 933918047
          </a>
        </p>
      </div>
    </section>
  );
}
