import {
  Database,
} from "lucide-react";

import {
  LegalList,
  LegalNotice,
  LegalPage,
  LegalSection,
} from "../../components/legal/LegalPage";

function PrivacyPolicy() {
  return (
    <LegalPage
      titulo="Política de privacidad"
      descripcion="Información sobre cómo Taurus recopila, utiliza, protege y conserva los datos personales de sus clientes y visitantes."
      icono={Database}
    >
      <LegalNotice>
        Esta política constituye una base informativa para el sitio web.
        La publicación de este documento no reemplaza las demás
        obligaciones que puedan corresponder, como registrar bancos de
        datos personales, documentar consentimientos o implementar
        medidas internas de seguridad.
      </LegalNotice>

      <LegalSection titulo="1. Identidad del responsable">
        <p>
          El responsable del tratamiento de los datos personales es
          Fernando Hernandez de la Cruz, quien opera comercialmente bajo
          el nombre Taurus, con domicilio en Calle Ayacucho 146, Ica,
          Perú, 11000.
        </p>

        <p>
          Para consultas relacionadas con privacidad o para ejercer
          derechos sobre sus datos, puede escribir a
          {" "}
          <a
            href="mailto:taurusx23@gmail.com"
            className="font-semibold text-red-700 hover:underline"
          >
            taurusx23@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection titulo="2. Datos que podemos recopilar">
        <LegalList
          items={[
            "Nombres y apellidos, DNI, teléfono, correo y datos de contacto proporcionados por el cliente.",
            "Información del dispositivo: marca, modelo, IMEI, número de serie, color, estado y observaciones técnicas.",
            "Datos relacionados con reservas, diagnósticos, reparaciones, repuestos, pagos, entregas, garantías y reclamos.",
            "Fotografías del dispositivo antes, durante o después de una reparación.",
            "Datos técnicos de seguridad y sesión necesarios para operar el panel administrativo y proteger el sistema.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="3. Finalidades del tratamiento">
        <LegalList
          items={[
            "Identificar al cliente y registrar sus equipos.",
            "Gestionar reservas, diagnósticos, presupuestos, reparaciones, pagos y entregas.",
            "Permitir el seguimiento de reparaciones mediante DNI.",
            "Administrar garantías y reclamos relacionados con el servicio.",
            "Contactar al cliente mediante WhatsApp, teléfono o correo cuando sea necesario para prestar el servicio.",
            "Prevenir accesos no autorizados, fraudes y usos indebidos del sistema.",
            "Cumplir obligaciones legales, contables, contractuales y de atención al consumidor.",
            "Publicar fotografías de trabajos únicamente cuando exista autorización específica del cliente.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="4. Base para el tratamiento">
        <p>
          Taurus tratará los datos necesarios para ejecutar el servicio
          solicitado, gestionar la relación con el cliente, cumplir
          obligaciones legales y proteger la seguridad del sistema.
          Cuando una finalidad adicional requiera consentimiento, este
          deberá ser libre, previo, informado, expreso e inequívoco.
        </p>

        <p>
          La autorización para publicar fotografías es opcional,
          independiente del servicio técnico y puede ser revocada para
          usos futuros.
        </p>
      </LegalSection>

      <LegalSection titulo="5. Proveedores tecnológicos">
        <p>
          Para operar el sistema, Taurus puede utilizar servicios de
          alojamiento, base de datos y almacenamiento en la nube, como
          Render, Microsoft Azure y Cloudinary. Estos proveedores pueden
          procesar información en infraestructura ubicada fuera del Perú.
        </p>

        <p>
          Taurus debe limitar el acceso de estos proveedores a lo
          necesario para brindar el servicio y aplicar medidas razonables
          de seguridad y confidencialidad.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Conservación">
        <p>
          Los datos personales serán conservados únicamente durante el
          tiempo necesario para cumplir la finalidad del servicio
          contratado y, posteriormente, durante el plazo legal obligatorio
          establecido por la normativa peruana, salvo que el titular
          solicite su supresión y no exista una obligación que justifique
          su conservación.
        </p>

        <p>
          Cuando los datos dejen de ser necesarios, deberán ser eliminados,
          anonimizados o bloqueados según corresponda.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Derechos de los titulares">
        <p>
          El titular puede solicitar información, acceso, actualización,
          rectificación, cancelación o supresión, oposición y revocación
          del consentimiento, cuando corresponda.
        </p>

        <p>
          La solicitud debe enviarse a
          {" "}
          <a
            href="mailto:taurusx23@gmail.com"
            className="font-semibold text-red-700 hover:underline"
          >
            taurusx23@gmail.com
          </a>
          , indicando el derecho que desea ejercer y la información
          necesaria para verificar su identidad. Taurus atenderá la
          solicitud dentro de los plazos establecidos por la normativa
          aplicable.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Seguridad">
        <p>
          Taurus adoptará medidas técnicas y organizativas razonables para
          reducir riesgos de pérdida, alteración, acceso no autorizado o
          divulgación indebida. El acceso al panel administrativo se
          limita a usuarios autenticados y según sus funciones.
        </p>

        <p>
          Ningún sistema es completamente invulnerable. Ante un incidente
          de seguridad, Taurus evaluará su alcance y realizará las
          actuaciones que correspondan conforme a la normativa vigente.
        </p>
      </LegalSection>

      <LegalSection titulo="9. Menores de edad">
        <p>
          Cuando el cliente sea menor de edad, la contratación, entrega
          de datos y autorización de uso de imágenes deberá realizarse con
          intervención de su padre, madre o representante legal, cuando
          corresponda.
        </p>
      </LegalSection>

      <LegalSection titulo="10. Cambios en esta política">
        <p>
          Taurus puede actualizar esta política por cambios operativos,
          tecnológicos o normativos. La versión vigente estará disponible
          en esta página e indicará su fecha de actualización.
        </p>
      </LegalSection>

      <LegalSection titulo="11. Marco de referencia">
        <p>
          Esta política toma como referencia la Ley N.º 29733, Ley de
          Protección de Datos Personales, y su Reglamento aprobado por el
          Decreto Supremo N.º 016-2024-JUS, además de las normas peruanas
          que resulten aplicables.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default PrivacyPolicy;
