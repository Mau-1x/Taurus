import {
  Camera,
} from "lucide-react";

import {
  LegalList,
  LegalNotice,
  LegalPage,
  LegalSection,
} from "../../components/legal/LegalPage";

function PhotoAuthorization() {
  return (
    <LegalPage
      titulo="Autorización de fotografías"
      descripcion="Condiciones para registrar fotografías técnicas y para publicar imágenes de trabajos realizados."
      icono={Camera}
    >
      <LegalNotice>
        Las fotografías técnicas necesarias para documentar una
        reparación no equivalen automáticamente a una autorización para
        publicarlas. La difusión pública requiere una autorización
        específica del cliente.
      </LegalNotice>

      <LegalSection titulo="1. Fotografías técnicas internas">
        <p>
          Taurus puede tomar fotografías del dispositivo antes, durante o
          después del servicio para documentar su estado, diagnóstico,
          componentes, reparación, entrega o garantía.
        </p>

        <p>
          Estas imágenes se utilizan para gestionar el servicio,
          comprobar el estado del equipo y resolver consultas o reclamos.
          No deben mostrar información personal innecesaria.
        </p>
      </LegalSection>

      <LegalSection titulo="2. Publicación opcional">
        <p>
          Taurus solo publicará una fotografía en su galería, sitio web o
          redes sociales cuando el cliente haya otorgado autorización
          específica. Negarse a autorizar la publicación no afecta la
          atención, precio, garantía ni calidad del servicio.
        </p>
      </LegalSection>

      <LegalSection titulo="3. Contenido que debe evitarse">
        <LegalList
          items={[
            "DNI, nombres completos, teléfonos, correos o direcciones.",
            "IMEI, números de serie, códigos QR, comprobantes o documentos del cliente.",
            "Pantallas con conversaciones, fotografías personales, cuentas, contraseñas o notificaciones.",
            "Rostros, voces o imágenes de personas que no hayan autorizado su aparición.",
            "Cualquier elemento que permita identificar innecesariamente al cliente.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="4. Alcance de la autorización">
        <p>
          La autorización puede comprender la publicación de imágenes del
          dispositivo y una descripción general del trabajo, por ejemplo:
          marca, modelo, tipo de daño, diagnóstico o resultado.
        </p>

        <p>
          Taurus no deberá utilizar la imagen para una finalidad distinta
          de la informada sin obtener una nueva autorización cuando esta
          sea necesaria.
        </p>
      </LegalSection>

      <LegalSection titulo="5. Revocación">
        <p>
          El cliente puede solicitar que se deje de utilizar públicamente
          una fotografía enviando un mensaje a
          {" "}
          <a
            href="mailto:taurusx23@gmail.com"
            className="font-semibold text-red-700 hover:underline"
          >
            taurusx23@gmail.com
          </a>
          . La revocación se aplicará a los usos futuros dentro de un
          plazo razonable, sin efectos retroactivos sobre publicaciones o
          materiales ya distribuidos cuando su retiro inmediato no sea
          técnicamente posible.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Menores de edad y personas visibles">
        <p>
          Cuando aparezca una persona menor de edad, la autorización debe
          provenir de su padre, madre o representante legal. Taurus
          procurará que las fotografías públicas se limiten al dispositivo
          y no incluyan personas.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Constancia recomendada">
        <p>
          Para que la autorización sea verificable, Taurus debe registrar
          la decisión del cliente mediante una casilla independiente,
          firma, formulario, mensaje o registro electrónico que identifique
          la reparación, la finalidad, la fecha y la persona que autoriza.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Texto sugerido de autorización">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 italic leading-7 text-gray-700">
          “Autorizo de manera libre, previa, informada y específica a
          Taurus a publicar fotografías de mi dispositivo relacionadas
          con la reparación identificada, únicamente para mostrar trabajos
          realizados en su sitio web o redes sociales. Se me ha informado
          que la autorización es opcional, que no afecta el servicio y que
          puedo revocarla para usos futuros mediante el correo
          taurusx23@gmail.com.”
        </div>
      </LegalSection>

      <LegalSection titulo="9. Marco de referencia">
        <p>
          Esta autorización toma como referencia la Ley N.º 29733 y su
          Reglamento aprobado por el Decreto Supremo N.º 016-2024-JUS.
          La imagen de una persona y otros elementos identificables pueden
          constituir datos personales.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default PhotoAuthorization;
