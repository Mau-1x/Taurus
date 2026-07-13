const ReparacionModel = require("../models/reparacion.model");
const {
  registrarAuditoria,
} = require("../utils/auditoria");

function validarDatosReparacion(datos, esEdicion = false) {
  const {
    idEquipo,
    fallaReportada,
    diagnostico,
    solucion,
    costoEstimado,
    costoFinal,
    fechaEstimada,
    fechaEntrega,
    garantiaDias,
    observaciones,
  } = datos;

  if (
    !esEdicion &&
    (!Number.isInteger(Number(idEquipo)) ||
      Number(idEquipo) <= 0)
  ) {
    return "El equipo seleccionado no es válido";
  }

  if (
    !fallaReportada ||
    fallaReportada.trim().length < 5
  ) {
    return "La falla reportada debe tener al menos 5 caracteres";
  }

  if (fallaReportada.trim().length > 1000) {
    return "La falla reportada no puede superar los 1000 caracteres";
  }

  if (diagnostico && diagnostico.trim().length > 1000) {
    return "El diagnóstico no puede superar los 1000 caracteres";
  }

  if (solucion && solucion.trim().length > 1000) {
    return "La solución no puede superar los 1000 caracteres";
  }

  if (
    observaciones &&
    observaciones.trim().length > 1000
  ) {
    return "Las observaciones no pueden superar los 1000 caracteres";
  }

  if (
    costoEstimado !== null &&
    costoEstimado !== "" &&
    (!Number.isFinite(Number(costoEstimado)) ||
      Number(costoEstimado) < 0 ||
      Number(costoEstimado) > 99999999.99)
  ) {
    return "El costo estimado no es válido";
  }

  if (
    costoFinal !== null &&
    costoFinal !== "" &&
    (!Number.isFinite(Number(costoFinal)) ||
      Number(costoFinal) < 0 ||
      Number(costoFinal) > 99999999.99)
  ) {
    return "El costo final no es válido";
  }

  const garantia = Number(garantiaDias || 0);

  if (
    !Number.isInteger(garantia) ||
    garantia < 0 ||
    garantia > 365
  ) {
    return "La garantía debe estar entre 0 y 365 días";
  }

  if (
    fechaEstimada &&
    Number.isNaN(new Date(fechaEstimada).getTime())
  ) {
    return "La fecha estimada no es válida";
  }

  if (
    fechaEntrega &&
    Number.isNaN(new Date(fechaEntrega).getTime())
  ) {
    return "La fecha de entrega no es válida";
  }

  if (
    fechaEstimada &&
    fechaEntrega &&
    new Date(fechaEntrega) < new Date(fechaEstimada)
  ) {
    return "La fecha de entrega no puede ser anterior a la fecha estimada";
  }

  return null;
}

class ReparacionController {
  static async obtenerTodos(req, res) {
    try {
      const reparaciones = await ReparacionModel.obtenerTodos();

      return res.json({
        ok: true,
        total: reparaciones.length,
        data: reparaciones,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener las reparaciones",
        error: error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const reparacion = await ReparacionModel.obtenerPorId(
        Number(req.params.id)
      );

      if (!reparacion) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      return res.json({
        ok: true,
        data: reparacion,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener la reparación",
        error: error.message,
      });
    }
  }

  static async obtenerPorCodigo(req, res) {
    try {
      const reparacion = await ReparacionModel.obtenerPorCodigo(
        req.params.codigo
      );

      if (!reparacion) {
        return res.status(404).json({
          ok: false,
          message: "Código de reparación no encontrado",
        });
      }

      const historial = await ReparacionModel.obtenerHistorial(
        reparacion.IDREPARACION
      );

      return res.json({
        ok: true,
        data: {
          reparacion,
          historial,
        },
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo consultar la reparación",
        error: error.message,
      });
    }
  }

  static async crear(req, res) {
    try {
      const errorValidacion =
        validarDatosReparacion(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const idEquipo = Number(req.body.idEquipo);

      const existeEquipo =
        await ReparacionModel.equipoExiste(idEquipo);

      if (!existeEquipo) {
        return res.status(404).json({
          ok: false,
          message: "El equipo seleccionado no existe",
        });
      }

      const reparacion = await ReparacionModel.crear({
        ...req.body,
        idEquipo,
        fallaReportada:
          req.body.fallaReportada.trim(),
        costoEstimado:
          req.body.costoEstimado === "" ||
          req.body.costoEstimado == null
            ? null
            : Number(req.body.costoEstimado),
        fechaEstimada:
          req.body.fechaEstimada || null,
        observaciones:
          req.body.observaciones?.trim() || null,
      });

      return res.status(201).json({
        ok: true,
        message: "Reparación registrada correctamente",
        data: reparacion,
      });
    } catch (error) {
      console.error("Error al registrar reparación:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo registrar la reparación",
        error: error.message,
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const idReparacion = Number(req.params.id);

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El ID de la reparación no es válido",
        });
      }

      const errorValidacion =
        validarDatosReparacion(req.body, true);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const actualizado =
        await ReparacionModel.actualizar(
          idReparacion,
          {
            ...req.body,
            fallaReportada:
              req.body.fallaReportada.trim(),
            diagnostico:
              req.body.diagnostico?.trim() || null,
            solucion:
              req.body.solucion?.trim() || null,
            costoEstimado:
              req.body.costoEstimado === "" ||
              req.body.costoEstimado == null
                ? null
                : Number(req.body.costoEstimado),
            costoFinal:
              req.body.costoFinal === "" ||
              req.body.costoFinal == null
                ? null
                : Number(req.body.costoFinal),
            fechaEstimada:
              req.body.fechaEstimada || null,
            fechaEntrega:
              req.body.fechaEntrega || null,
            garantiaDias: Number(
              req.body.garantiaDias || 0
            ),
            observaciones:
              req.body.observaciones?.trim() || null,
          }
        );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      await registrarAuditoria({
        req,
        modulo: "REPARACIONES",
        accion: "CAMBIAR_ESTADO",
        entidad: "REPARACION",
        identidad: idReparacion,
        descripcion: `Estado de reparación cambiado a ${estado.NOMBRE}`,
        datosAnteriores: {
          idEstado: reparacionAnterior?.IDESTADO,
          estado: reparacionAnterior?.ESTADO_REPARACION,
        },
        datosNuevos: {
          idEstado,
          estado: estado.NOMBRE,
          comentario: comentario || null,
        },
      });

      return res.json({
        ok: true,
        message: "Reparación actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar reparación:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo actualizar la reparación",
        error: error.message,
      });
    }
  }

  static async cambiarEstado(req, res) {
    try {
      const idReparacion = Number(req.params.id);
      const idEstado = Number(req.body.idEstado);
      const comentario =
        req.body.comentario?.trim() || "";

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "La reparación no es válida",
        });
      }

      if (
        !Number.isInteger(idEstado) ||
        idEstado <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El estado es obligatorio",
        });
      }

      const estado =
        await ReparacionModel.obtenerEstadoPorId(idEstado);

      if (!estado) {
        return res.status(400).json({
          ok: false,
          message: "El estado seleccionado no existe",
        });
      }

      const nombreEstado = estado.NOMBRE
        .trim()
        .toUpperCase();

      if (
        nombreEstado === "NO REPARABLE" &&
        comentario.length < 5
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Debes indicar el motivo por el cual el equipo no puede repararse",
        });
      }

      if (comentario.length > 500) {
        return res.status(400).json({
          ok: false,
          message:
            "El comentario no puede superar los 500 caracteres",
        });
      }

      const reparacionAnterior =
        await ReparacionModel.obtenerPorId(idReparacion);

      const actualizado =
        await ReparacionModel.cambiarEstado(
          idReparacion,
          {
            idEstado,
            comentario: comentario || null,
          }
        );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }


      return res.json({
        ok: true,
        message: "Estado actualizado correctamente",
      });
    } catch (error) {
      console.error(
        "Error al cambiar estado de reparación:",
        error
      );

      return res.status(500).json({
        ok: false,
        message: "No se pudo cambiar el estado",
        error: error.message,
      });
    }
  }

  static async obtenerRepuestos(req, res) {
  try {
    const idReparacion = Number(req.params.id);

    if (
      !Number.isInteger(idReparacion) ||
      idReparacion <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "La reparación no es válida",
      });
    }

    const repuestos =
      await ReparacionModel.obtenerRepuestos(
        idReparacion
      );

    return res.json({
      ok: true,
      total: repuestos.length,
      data: repuestos,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message:
        "No se pudieron obtener los repuestos",
      error: error.message,
    });
  }
}

static async agregarRepuesto(req, res) {
  try {
    const idReparacion = Number(req.params.id);
    const idProducto = Number(req.body.idProducto);
    const cantidad = Number(req.body.cantidad);

    if (
      !Number.isInteger(idReparacion) ||
      idReparacion <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "La reparación no es válida",
      });
    }

    if (
      !Number.isInteger(idProducto) ||
      idProducto <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "Selecciona un producto válido",
      });
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0 ||
      cantidad > 999
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "La cantidad debe ser un número entre 1 y 999",
      });
    }

    const resultado =
      await ReparacionModel.agregarRepuesto(
        idReparacion,
        idProducto,
        cantidad
      );
    
    await registrarAuditoria({
      req,
      modulo: "REPARACIONES",
      accion: "AGREGAR_REPUESTO",
      entidad: "REPARACION",
      identidad: idReparacion,
      descripcion: `Se agregó un repuesto a la reparación`,
      datosNuevos: {
        idProducto,
        producto: resultado.producto,
        cantidad,
        stockAnterior: resultado.stockAnterior,
        stockNuevo: resultado.stockNuevo,
      },
    });

    return res.status(201).json({
      ok: true,
      message:
        "Repuesto agregado y stock actualizado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error(
      "Error agregando repuesto:",
      error
    );

    return res
      .status(error.statusCode || 500)
      .json({
        ok: false,
        message:
          error.message ||
          "No se pudo agregar el repuesto",
      });
  }
}

  static async quitarRepuesto(req, res) {
    try {
      const idReparacion = Number(req.params.id);
      const idProducto = Number(
        req.params.idProducto
      );

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0 ||
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La reparación o el producto no son válidos",
        });
      }

    const repuestosAnteriores =
      await ReparacionModel.obtenerRepuestos(
        idReparacion
      );

    const repuestoAnterior =
      repuestosAnteriores.find(
        (repuesto) =>
          Number(repuesto.IDPRODUCTO) === idProducto
      );

      await ReparacionModel.quitarRepuesto(
        idReparacion,
        idProducto
      );

      await registrarAuditoria({
        req,
        modulo: "REPARACIONES",
        accion: "QUITAR_REPUESTO",
        entidad: "REPARACION",
        identidad: idReparacion,
        descripcion:
          "Se retiró un repuesto de la reparación",
        datosAnteriores: repuestoAnterior
          ? {
              idProducto:
                repuestoAnterior.IDPRODUCTO,
              producto:
                repuestoAnterior.PRODUCTO,
              cantidad:
                repuestoAnterior.CANTIDAD,
              precioUnitario:
                repuestoAnterior.PRECIO_UNITARIO,
            }
          : {
              idProducto,
            },
      });

      return res.json({
        ok: true,
        message:
          "Repuesto retirado y stock restaurado correctamente",
      });
    } catch (error) {
      console.error(
        "Error retirando repuesto:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message:
            error.message ||
            "No se pudo retirar el repuesto",
        });
    }
  }

    static async obtenerPagos(req, res) {
    try {
      const idReparacion = Number(req.params.id);

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "La reparación no es válida",
        });
      }

      const resumen =
        await ReparacionModel.obtenerResumenPagos(
          idReparacion
        );

      if (!resumen) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      const pagos =
        await ReparacionModel.obtenerPagos(
          idReparacion
        );

      return res.json({
        ok: true,
        data: {
          resumen,
          pagos,
        },
      });
    } catch (error) {
      console.error(
        "Error obteniendo pagos:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener los pagos",
      });
    }
  }

  static async registrarPago(req, res) {
    try {
      const idReparacion = Number(req.params.id);
      const monto = Number(req.body.monto);

      const metodoPago = String(
        req.body.metodoPago || ""
      )
        .trim()
        .toUpperCase();

      const observaciones =
        req.body.observaciones?.trim() || null;

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "La reparación no es válida",
        });
      }

      if (
        !Number.isFinite(monto) ||
        monto <= 0 ||
        monto > 99999999.99
      ) {
        return res.status(400).json({
          ok: false,
          message: "El monto del pago no es válido",
        });
      }

      const metodosPermitidos = [
        "EFECTIVO",
        "YAPE",
        "PLIN",
        "TRANSFERENCIA",
        "TARJETA",
      ];

      if (!metodosPermitidos.includes(metodoPago)) {
        return res.status(400).json({
          ok: false,
          message:
            "El método de pago seleccionado no es válido",
        });
      }

      if (
        observaciones &&
        observaciones.length > 300
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Las observaciones no pueden superar los 300 caracteres",
        });
      }

      const pago =
        await ReparacionModel.registrarPago(
          idReparacion,
          req.usuario.idUsuario,
          {
            monto,
            metodoPago,
            observaciones,
          }
        );

      const resumen =
        await ReparacionModel.obtenerResumenPagos(
          idReparacion
        );

      return res.status(201).json({
        ok: true,
        message: "Pago registrado correctamente",
        data: {
          pago,
          resumen,
        },
      });
    } catch (error) {
      console.error(
        "Error registrando pago:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message:
            error.message ||
            "No se pudo registrar el pago",
        });
    }
    await registrarAuditoria({
      req,
      modulo: "REPARACIONES",
      accion: "REGISTRAR_PAGO",
      entidad: "REPARACION",
      identidad: idReparacion,
      descripcion:
        "Se registró un pago para la reparación",
      datosNuevos: {
        idPago: pago.IDPAGO,
        monto,
        metodoPago,
        observaciones,
        totalPagado: resumen.TOTAL_PAGADO,
        saldoPendiente:
          resumen.SALDO_PENDIENTE,
        estadoPago: resumen.ESTADO_PAGO,
      },
    });
  }

  static async anularPago(req, res) {
    try {
      const idReparacion = Number(req.params.id);
      const idPago = Number(req.params.idPago);

      if (
        !Number.isInteger(idReparacion) ||
        idReparacion <= 0 ||
        !Number.isInteger(idPago) ||
        idPago <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La reparación o el pago no son válidos",
        });
      }

      const pagosAnteriores =
        await ReparacionModel.obtenerPagos(
          idReparacion
        );

      const pagoAnterior = pagosAnteriores.find(
        (pago) => Number(pago.IDPAGO) === idPago
      );

      const anulado =
        await ReparacionModel.anularPago(
          idReparacion,
          idPago
        );

      if (!anulado) {
        return res.status(404).json({
          ok: false,
          message:
            "El pago no existe o ya fue anulado",
        });
      }

      const resumen =
        await ReparacionModel.obtenerResumenPagos(
          idReparacion
        );

      return res.json({
        ok: true,
        message: "Pago anulado correctamente",
        data: resumen,
      });
    } catch (error) {
      console.error(
        "Error anulando pago:",
        error
      );

      return res.status(500).json({
        ok: false,
        message: "No se pudo anular el pago",
      });
    }
    await registrarAuditoria({
      req,
      modulo: "REPARACIONES",
      accion: "ANULAR_PAGO",
      entidad: "REPARACION",
      identidad: idReparacion,
      descripcion:
        "Se anuló un pago de la reparación",
      datosAnteriores: pagoAnterior
        ? {
            idPago: pagoAnterior.IDPAGO,
            monto: pagoAnterior.MONTO,
            metodoPago:
              pagoAnterior.METODO_PAGO,
            observaciones:
              pagoAnterior.OBSERVACIONES,
          }
        : {
            idPago,
          },
      datosNuevos: {
        totalPagado: resumen.TOTAL_PAGADO,
        saldoPendiente:
          resumen.SALDO_PENDIENTE,
        estadoPago: resumen.ESTADO_PAGO,
      },
    });
  }

  static async obtenerHistorial(req, res) {
    try {
      const historial = await ReparacionModel.obtenerHistorial(
        Number(req.params.id)
      );

      return res.json({
        ok: true,
        data: historial,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudo obtener el historial",
        error: error.message,
      });
    }
  }

  static async obtenerEstados(req, res) {
    try {
      const estados = await ReparacionModel.obtenerEstados();

      return res.json({
        ok: true,
        data: estados,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los estados",
        error: error.message,
      });
    }
  }
}

module.exports = ReparacionController;