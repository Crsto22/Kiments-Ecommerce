const policyIntro = [
  "En KIMENT'S nos comprometemos a ofrecer productos de calidad y una experiencia de compra segura. La presente política establece las condiciones aplicables para cambios, devoluciones y reembolsos de los productos adquiridos a través de nuestros canales de venta.",
  "Al realizar una compra, el cliente declara haber leído y aceptado la presente política.",
];

const termsSections = [
  {
    title: "01. Revisión del pedido",
    paragraphs: [
      "Al recibir su pedido, el cliente deberá verificar que:",
    ],
    bullets: [
      "El producto corresponda al modelo solicitado.",
      "La talla y color sean los seleccionados.",
      "La cantidad recibida sea la correcta.",
      "El producto no presente daños o defectos visibles.",
    ],
    closing: [
      "En caso de identificar alguna incidencia, deberá comunicarse con KIMENT'S dentro de las primeras 24 horas posteriores a la recepción del pedido, adjuntando fotografías claras del producto, del empaque y de la guía o comprobante de entrega.",
      "Las comunicaciones realizadas fuera de dicho plazo podrán ser evaluadas; sin embargo, KIMENT'S no garantiza su procedencia cuando no sea posible verificar que la incidencia existía al momento de la entrega.",
    ],
  },
  {
    title: "02. Condiciones para solicitar un cambio",
    paragraphs: [
      "Los cambios podrán realizarse siempre que el producto:",
    ],
    bullets: [
      "No haya sido usado, lavado ni alterado.",
      "No presente manchas, olores, desgaste o daños ocasionados por el cliente.",
      "Conserve todas sus etiquetas originales.",
      "Sea devuelto en las mismas condiciones en que fue entregado.",
      "Cuente con el comprobante de compra o número de pedido.",
    ],
    closing: [
      "Los cambios por talla, color o modelo estarán sujetos a disponibilidad de stock al momento de la solicitud.",
      "En caso de no existir disponibilidad del producto solicitado, el cliente podrá elegir otro producto de igual o mayor valor, asumiendo la diferencia correspondiente.",
    ],
  },
  {
    title: "03. Productos con fallas de fabricación",
    paragraphs: [
      "Si el producto presenta una falla atribuible a fabricación o el cliente recibe un producto distinto al solicitado, KIMENT'S realizará una evaluación del caso.",
      "De confirmarse la responsabilidad de KIMENT'S, se podrá ofrecer una de las siguientes soluciones:",
    ],
    bullets: [
      "Cambio del producto.",
      "Reposición por uno nuevo.",
      "Reembolso del importe pagado.",
      "Otra solución acordada con el cliente.",
    ],
    closing: [
      "Cuando la incidencia sea responsabilidad de KIMENT'S, los costos de envío y devolución serán asumidos por la empresa.",
    ],
  },
  {
    title: "04. Casos que no aplican para cambios o devoluciones",
    paragraphs: [
      "No procederán cambios ni devoluciones cuando:",
    ],
    bullets: [
      "El cliente seleccionó incorrectamente la talla, color o modelo y el producto fue enviado conforme al pedido realizado, salvo que KIMENT'S ofrezca el cambio por cortesía y exista disponibilidad.",
      "El producto presente señales de uso.",
      "El producto haya sido lavado, planchado, modificado o reparado por terceros.",
      "Se hayan retirado las etiquetas originales.",
      "El daño sea consecuencia del uso inadecuado, almacenamiento incorrecto o desgaste normal.",
      "No sea posible acreditar la compra.",
    ],
  },
  {
    title: "05. Reembolsos",
    paragraphs: [
      "Los reembolsos únicamente procederán cuando corresponda conforme a la legislación aplicable o luego de la evaluación realizada por KIMENT'S.",
      "En caso de aprobarse un reembolso, este se efectuará utilizando el mismo medio de pago empleado en la compra o mediante otro medio acordado entre ambas partes.",
      "El tiempo de procesamiento podrá variar según la entidad financiera o plataforma de pago utilizada.",
    ],
  },
  {
    title: "06. Evaluación de solicitudes",
    paragraphs: [
      "Toda solicitud será revisada individualmente. KIMENT'S podrá solicitar fotografías, videos u otra información necesaria para verificar el estado del producto y determinar la procedencia del cambio, devolución o reembolso.",
      "La aprobación de una solicitud estará sujeta al cumplimiento de las condiciones establecidas en esta política.",
    ],
  },
  {
    title: "07. Información importante",
    bullets: [
      "Las imágenes publicadas son referenciales; los tonos pueden presentar ligeras variaciones debido a la iluminación o configuración de cada pantalla.",
      "Las medidas publicadas pueden presentar pequeñas variaciones propias del proceso de fabricación.",
      "KIMENT'S se reserva el derecho de rechazar solicitudes cuando se detecte un uso indebido de la política de cambios o evidencia de manipulación del producto.",
    ],
    closing: [
      "Esta política no limita ni reemplaza los derechos reconocidos por la legislación peruana en materia de protección al consumidor.",
    ],
  },
];

export function TermsContent() {
  return (
    <section className="px-7 py-20 sm:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
            Política de Cambios, Devoluciones y Reembolsos
          </p>
          <h2 className="text-2xl font-medium tracking-[0.08em] text-black">
            KIMENT&apos;S
          </h2>
          {policyIntro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="space-y-16">
          {termsSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-6 text-xl font-medium tracking-[0.08em] text-black">
                {section.title}
              </h3>
              <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.closing?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
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
