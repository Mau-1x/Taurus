import {
  ShieldCheck,
} from "lucide-react";

import {
  LegalList,
  LegalNotice,
  LegalPage,
  LegalSection,
} from "../../components/legal/LegalPage";

function WarrantyPolicy() {
  return (
    <LegalPage
      titulo="Política de garantías"
      descripcion="Condiciones generales para solicitar la revisión de una reparación realizada por Taurus."
      icono={ShieldCheck}
    >
      <LegalNotice>
        La garantía comercial ofrecida por Taurus complementa y no
        sustituye los derechos reconocidos al consumidor por la
        legislación peruana.
      </LegalNotice>

      <LegalSection titulo="1. Registro de la garantía">
        <p>
          Los días de garantía aplicables se registran en la reparación y
          se comunican al cliente. El plazo se cuenta desde la fecha de
          entrega del equipo, salvo que se informe expresamente una fecha
          distinta más favorable.
        </p>

        <p>
          No todos los diagnósticos, mantenimientos o servicios tienen el
          mismo periodo de garantía. La duración depende del trabajo y
          del repuesto utilizado.
        </p>
      </LegalSection>

      <LegalSection titulo="2. Qué puede cubrir">
        <p>
          Luego de la evaluación técnica, la garantía puede cubrir la
          repetición de la misma falla cuando sea atribuible al trabajo
          realizado o al repuesto instalado por Taurus dentro del periodo
          registrado.
        </p>
      </LegalSection>

      <LegalSection titulo="3. Situaciones que normalmente no corresponden a la garantía">
        <LegalList
          items={[
            "Golpes, caídas, presión, ruptura, humedad, ingreso de líquidos, calor excesivo o daño eléctrico posterior a la entrega.",
            "Manipulación, apertura, modificación o reparación realizada por terceros después del servicio de Taurus.",
            "Fallas diferentes o no relacionadas con el trabajo realizado.",
            "Daños ocasionados por cargadores, cables, accesorios, instalaciones o software externos.",
            "Pérdida de información, cuentas o contraseñas que no formen parte del servicio contratado.",
            "Desgaste normal o uso contrario a las recomendaciones proporcionadas.",
          ]}
        />

        <p>
          Estas exclusiones se aplican únicamente cuando exista una
          relación comprobable entre la causa excluida y la falla
          reclamada, y no limitan derechos que legalmente correspondan al
          consumidor.
        </p>
      </LegalSection>

      <LegalSection titulo="4. Cómo solicitar una revisión">
        <LegalList
          items={[
            "Contactar a Taurus antes del vencimiento de la garantía.",
            "Identificar la reparación mediante DNI, código o datos del equipo.",
            "Describir el problema y entregar el dispositivo para evaluación.",
            "Permitir que Taurus registre el motivo, diagnóstico, fotografías técnicas y resultado de la revisión.",
          ]}
        />
      </LegalSection>

      <LegalSection titulo="5. Evaluación">
        <p>
          Taurus revisará si el problema está relacionado con la
          reparación original. El resultado podrá ser: garantía
          procedente, garantía rechazada con motivo técnico, o nueva
          reparación independiente.
        </p>

        <p>
          Cuando la garantía proceda, Taurus podrá corregir el trabajo,
          reemplazar el repuesto afectado o adoptar otra solución
          razonable, según la naturaleza del caso y los derechos del
          consumidor.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Plazos">
        <p>
          El tiempo de atención depende de la evaluación, disponibilidad
          de repuestos y complejidad del equipo. Taurus comunicará un
          plazo estimado y mantendrá actualizado el estado del reclamo.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Evidencia y comprobación">
        <p>
          Para facilitar la revisión, Taurus conserva el registro de la
          reparación, diagnóstico, solución, fechas, repuestos,
          fotografías técnicas y garantía otorgada. El cliente puede
          solicitar información relacionada con su propio servicio.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Marco de referencia">
        <p>
          Esta política se interpreta conforme a la Ley N.º 29571,
          Código de Protección y Defensa del Consumidor, incluyendo las
          reglas aplicables a idoneidad, información y servicios de
          reparación.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default WarrantyPolicy;
