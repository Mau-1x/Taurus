const GarantiaModel = require(
  "../models/garantia.model"
);

const {
  registrarAuditoria,
} = require("../utils/auditoria");

const ESTADOS_PERMITIDOS = [
  "PENDIENTE",
  "EN_REVISION",
  "RESUELTA",
  "RECHAZADA",
];

function idValido(valor) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

async function auditoriaSegura(datos) {
  try {
    await registrarAuditoria(datos);
  } catch (error) {
    console.error(
      "No se pudo registrar la auditoría de garantía:",
      error
    );
  }
}

class GarantiaController {
  static async obtenerPanel(req, res) {
    try {
      const [
        garantias,
        reclamos,
      ] = await Promise.all([
        GarantiaModel.obtenerGarantias(),
        GarantiaModel.obtenerReclamos(),
      ]);

      const resumen = {
        total: garantias.length,

        activas: garantias.filter(
          (item) =>
            item.ESTADO_VIGENCIA ===
            "ACTIVA"
        ).length,

        porVencer: garantias.filter(
          (item) =>
            item.ESTADO_VIGENCIA ===
            "POR_VENCER"
        ).length,

        vencidas: garantias.filter(
          (item) =>
            item.ESTADO_VIGENCIA ===
            "VENCIDA"
        ).length,

        reclamosAbiertos: reclamos.filter(
          (item) =>
            item.ESTADO_GARANTIA ===
              "PENDIENTE" ||
            item.ESTADO_GARANTIA ===
              "EN_REVISION"
        ).length,

        resueltos: reclamos.filter(
          (item) =>
            item.ESTADO_GARANTIA ===
            "RESUELTA"
        ).length,
      };

      return res.json({
        ok: true,
        data: {
          resumen,
          garantias,
          reclamos,
        },
      });
    } catch (error) {
      console.error(
        "Error obteniendo el panel de garantías:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener las garantías",
      });
    }
  }

  static async crearReclamo(req, res) {
    try {
      const idReparacion = Number(
        req.params.id
      );

      const motivo = limpiarTexto(
        req.body.motivo
      );

      const observaciones =
        limpiarTexto(
          req.body.observaciones
        ) || null;

      if (!idValido(idReparacion)) {
        return res.status(400).json({
          ok: false,
          message:
            "La reparación no es válida",
        });
      }

      if (
        motivo.length < 5 ||
        motivo.length > 1000
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El motivo debe tener entre 5 y 1000 caracteres",
        });
      }

      if (
        observaciones &&
        observaciones.length > 1000
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Las observaciones no pueden superar los 1000 caracteres",
        });
      }

      const garantia =
        await GarantiaModel.crear(
          idReparacion,
          req.usuario.idUsuario,
          {
            motivo,
            observaciones,
          }
        );

      await auditoriaSegura({
        req,
        modulo: "GARANTIAS",
        accion: "REGISTRAR_RECLAMO",
        entidad: "GARANTIA",
        identidad:
          garantia.IDGARANTIA,
        descripcion:
          `Se registró un reclamo para la reparación ${garantia.CODIGO}`,
        datosNuevos: {
          idReparacion,
          motivo,
          observaciones,
          estadoGarantia:
            garantia.ESTADO_GARANTIA,
          fechaVencimiento:
            garantia.FECHA_VENCIMIENTO,
        },
      });

      return res.status(201).json({
        ok: true,
        message:
          "Reclamo de garantía registrado correctamente",
        data: garantia,
      });
    } catch (error) {
      console.error(
        "Error registrando reclamo de garantía:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message: error.statusCode
            ? error.message
            : "No se pudo registrar el reclamo de garantía",
        });
    }
  }

  static async actualizarReclamo(
    req,
    res
  ) {
    try {
      const idGarantia = Number(
        req.params.idGarantia
      );

      if (!idValido(idGarantia)) {
        return res.status(400).json({
          ok: false,
          message:
            "El reclamo de garantía no es válido",
        });
      }

      const anterior =
        await GarantiaModel.obtenerPorId(
          idGarantia
        );

      if (!anterior) {
        return res.status(404).json({
          ok: false,
          message:
            "El reclamo de garantía no existe",
        });
      }

      const estadoGarantia = String(
        req.body.estadoGarantia ??
          anterior.ESTADO_GARANTIA
      )
        .trim()
        .toUpperCase();

      const diagnostico =
        req.body.diagnostico ===
        undefined
          ? anterior.DIAGNOSTICO
          : limpiarTexto(
              req.body.diagnostico
            ) || null;

      const solucion =
        req.body.solucion === undefined
          ? anterior.SOLUCION
          : limpiarTexto(
              req.body.solucion
            ) || null;

      const observaciones =
        req.body.observaciones ===
        undefined
          ? anterior.OBSERVACIONES
          : limpiarTexto(
              req.body.observaciones
            ) || null;

      const comentario =
        limpiarTexto(
          req.body.comentario
        ) || null;

      if (
        !ESTADOS_PERMITIDOS.includes(
          estadoGarantia
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El estado de la garantía no es válido",
        });
      }

      for (const [
        nombre,
        valor,
      ] of [
        ["diagnóstico", diagnostico],
        ["solución", solucion],
        ["observaciones", observaciones],
      ]) {
        if (
          valor &&
          valor.length > 1000
        ) {
          return res.status(400).json({
            ok: false,
            message:
              `El campo ${nombre} no puede superar los 1000 caracteres`,
          });
        }
      }

      if (
        comentario &&
        comentario.length > 500
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El comentario del historial no puede superar los 500 caracteres",
        });
      }

      if (
        estadoGarantia ===
          "RECHAZADA" &&
        (
          comentario ||
          observaciones ||
          ""
        ).length < 5
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Indica el motivo por el cual se rechaza la garantía",
        });
      }

      const resultado =
        await GarantiaModel.actualizar(
          idGarantia,
          req.usuario.idUsuario,
          {
            estadoGarantia,
            diagnostico,
            solucion,
            observaciones,
            comentario:
              comentario ||
              `Estado actualizado a ${estadoGarantia}`,
          }
        );

      await auditoriaSegura({
        req,
        modulo: "GARANTIAS",
        accion: "ACTUALIZAR_RECLAMO",
        entidad: "GARANTIA",
        identidad: idGarantia,
        descripcion:
          "Se actualizó un reclamo de garantía",
        datosAnteriores:
          resultado.anterior,
        datosNuevos:
          resultado.actualizado,
      });

      return res.json({
        ok: true,
        message:
          "Garantía actualizada correctamente",
        data:
          resultado.actualizado,
      });
    } catch (error) {
      console.error(
        "Error actualizando reclamo de garantía:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message: error.statusCode
            ? error.message
            : "No se pudo actualizar la garantía",
        });
    }
  }

  static async obtenerHistorial(
    req,
    res
  ) {
    try {
      const idGarantia = Number(
        req.params.idGarantia
      );

      if (!idValido(idGarantia)) {
        return res.status(400).json({
          ok: false,
          message:
            "El reclamo de garantía no es válido",
        });
      }

      const garantia =
        await GarantiaModel.obtenerPorId(
          idGarantia
        );

      if (!garantia) {
        return res.status(404).json({
          ok: false,
          message:
            "El reclamo de garantía no existe",
        });
      }

      const historial =
        await GarantiaModel
          .obtenerHistorial(
            idGarantia
          );

      return res.json({
        ok: true,
        data: historial,
      });
    } catch (error) {
      console.error(
        "Error obteniendo historial de garantía:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo obtener el historial de la garantía",
      });
    }
  }
}

module.exports = GarantiaController;
