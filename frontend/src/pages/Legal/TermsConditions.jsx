import {
  FileText,
} from "lucide-react";

import {
  LegalList,
  LegalNotice,
  LegalPage,
  LegalSection,
} from "../../components/legal/LegalPage";

function TermsConditions() {
  return (
    <LegalPage
      titulo="Términos y condiciones"
      descripcion="Condiciones generales aplicables a las reservas, diagnósticos, reparaciones, productos y herramientas digitales de Taurus."
      icono={FileText}
    >
      <LegalNotice>
        Estos términos no eliminan ni reducen los derechos que la
        legislación peruana reconoce a los consumidores. Cualquier
        limitación se interpretará únicamente dentro de lo permitido por
        la ley.
      </LegalNotice>

      <LegalSection titulo="1. Alcance">
        <p>
          Estos términos regulan el uso del sitio web y la contratación
          de servicios ofrecidos por Taurus, incluyendo reservas,
          diagnóstico técnico, reparación de celulares o tablets, venta
          de productos, seguimiento y garantías.
        </p>
      </LegalSection>

      <LegalSection titulo="2. Reservas">
        <LegalList
          items={[
            "La reserva solicita una fecha y hora de atención, pero no constituye por sí sola la aceptación de una reparación.",
            "Taurus puede contactar al cliente para confirmar disponibilidad, reprogramar o solicitar información adicional.",
            "El cliente debe proporcionar información verdadera y un medio de contacto disponible.",
            "La falta de asistencia puede ocasionar la liberación del horario reservado.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="3. Recepción y diagnóstico">
        <p>
          Al recibir el equipo, Taurus puede registrar su estado físico,
          accesorios entregados, identificadores técnicos, falla
          reportada y fotografías necesarias para documentar el servicio.
        </p>

        <p>
          El diagnóstico busca identificar la causa probable de la falla.
          En ciertos casos pueden aparecer daños adicionales que no eran
          visibles durante la recepción inicial.
        </p>
      </LegalSection>

      <LegalSection titulo="4. Presupuesto y autorización">
        <LegalList
          items={[
            "Taurus informará el costo estimado antes de iniciar una reparación que requiera aprobación.",
            "El precio final puede variar cuando el diagnóstico revele daños adicionales, siempre que el cliente sea informado antes de realizar trabajos adicionales.",
            "El cliente puede rechazar el presupuesto. En ese caso, puede corresponder el pago del diagnóstico cuando este costo haya sido informado previamente.",
            "Los plazos dependen del modelo, complejidad de la falla y disponibilidad de repuestos.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="5. Información y copias de seguridad">
        <p>
          Antes de entregar el dispositivo, el cliente debe realizar una
          copia de seguridad cuando sea posible y retirar información que
          no sea necesaria para el servicio.
        </p>

        <p>
          Taurus solo debe acceder a la información indispensable para
          diagnosticar o verificar el funcionamiento del equipo. Esta
          recomendación no excluye responsabilidades que legalmente
          correspondan por una actuación negligente o no autorizada.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Repuestos">
        <p>
          Los repuestos pueden ser originales, compatibles o alternativos,
          según disponibilidad y lo informado al cliente. La calidad,
          procedencia y condiciones relevantes deben comunicarse antes
          de su instalación cuando ello sea necesario para la decisión
          del cliente.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Pagos y entrega">
        <LegalList
          items={[
            "Los pagos pueden registrarse como adelantos o cancelaciones según el servicio.",
            "El equipo se entrega al cliente o a una persona autorizada, previa verificación razonable de identidad o información de la reparación.",
            "El cliente debe revisar el funcionamiento del equipo y comunicar cualquier observación al momento de la entrega o tan pronto como sea razonablemente posible.",
            "La falta de recojo prolongada podrá ser gestionada conforme a la normativa aplicable y previa comunicación al cliente.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="8. Productos">
        <p>
          La disponibilidad y el stock mostrados en la web pueden cambiar.
          La compra se confirma presencialmente o mediante el canal
          acordado. Las imágenes pueden ser referenciales, sin perjuicio
          de la obligación de brindar información clara y veraz.
        </p>
      </LegalSection>

      <LegalSection titulo="9. Uso permitido del sitio">
        <p>
          No está permitido intentar acceder sin autorización al panel,
          alterar información, automatizar solicitudes abusivas,
          introducir código malicioso o utilizar los datos del sitio para
          fines ilícitos.
        </p>
      </LegalSection>

      <LegalSection titulo="10. Atención de consultas y reclamos">
        <p>
          Las consultas pueden dirigirse al WhatsApp publicado o al correo
          {" "}
          <a
            href="mailto:taurusx23@gmail.com"
            className="font-semibold text-red-700 hover:underline"
          >
            taurusx23@gmail.com
          </a>
          . Estos canales no reemplazan el Libro de Reclamaciones cuando
          corresponda utilizarlo.
        </p>
      </LegalSection>

      <LegalSection titulo="11. Legislación aplicable">
        <p>
          Estos términos se interpretan conforme a la legislación
          peruana, incluyendo la Ley N.º 29571, Código de Protección y
          Defensa del Consumidor, sin perjuicio de otras normas
          aplicables.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default TermsConditions;
