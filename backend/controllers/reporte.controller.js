const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const ReporteModel = require("../models/reporte.model");

function moneda(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

function fecha(valor, incluirHora = false) {
  if (!valor) return "No registrada";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    ...(incluirHora
      ? { timeStyle: "short" }
      : {}),
    timeZone: "America/Lima",
  }).format(new Date(valor));
}

function escribirLinea(doc, etiqueta, valor) {
  doc
    .font("Helvetica-Bold")
    .text(`${etiqueta}: `, {
      continued: true,
    })
    .font("Helvetica")
    .text(valor || "No registrado");
}

function verificarEspacio(doc, espacioNecesario = 100) {
  if (
    doc.y + espacioNecesario >
    doc.page.height - doc.page.margins.bottom
  ) {
    doc.addPage();
  }
}

class ReporteController {
  static async obtenerReporteGeneral(req, res) {
    try {
      const [
        resumen,
        ventasRecientes,
        reparacionesRecientes,
        stockBajo,
        ventasPorMes,
      ] = await Promise.all([
        ReporteModel.obtenerResumen(),
        ReporteModel.obtenerVentasRecientes(),
        ReporteModel.obtenerReparacionesRecientes(),
        ReporteModel.obtenerStockBajo(),
        ReporteModel.obtenerVentasPorMes(),
      ]);

      return res.json({
        ok: true,
        data: {
          resumen,
          ventasRecientes,
          reparacionesRecientes,
          stockBajo,
          ventasPorMes,
        },
      });
    } catch (error) {
      console.error("Error obteniendo reportes:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudieron obtener los reportes",
      });
    }
  }

  static async descargarComprobanteReparacion(
    req,
    res
  ) {
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

      const [reparacion, repuestos, pagos] =
        await Promise.all([
          ReporteModel.obtenerComprobanteReparacion(
            idReparacion
          ),
          ReporteModel.obtenerRepuestosComprobante(
            idReparacion
          ),
          ReporteModel.obtenerPagosComprobante(
            idReparacion
          ),
        ]);

      if (!reparacion) {
        return res.status(404).json({
          ok: false,
          message: "Reparación no encontrada",
        });
      }

      const totalReparacion = Number(
        reparacion.COSTO_FINAL ??
          reparacion.COSTO_ESTIMADO ??
          0
      );

      const totalPagado = pagos.reduce(
        (acumulado, pago) =>
          acumulado + Number(pago.MONTO || 0),
        0
      );

      const saldoPendiente = Math.max(
        totalReparacion - totalPagado,
        0
      );

      const estadoPago =
        totalReparacion <= 0
          ? "SIN COSTO"
          : totalPagado <= 0
            ? "PENDIENTE"
            : totalPagado < totalReparacion
              ? "PARCIAL"
              : "PAGADO";

      const nombreArchivo =
        `comprobante-${reparacion.CODIGO}.pdf`;

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nombreArchivo}"`
      );

      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        info: {
          Title: `Comprobante ${reparacion.CODIGO}`,
          Author: "Taurus Servicio Técnico",
        },
      });

      doc.pipe(res);

      const logoPath = path.join(
        __dirname,
        "../assets/logo-taurus.png"
      );

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 35, {
          width: 85,
          height: 85,
          fit: [85, 85],
          align: "center",
          valign: "center",
        });
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor("#991b1b")
        .text(
          "TAURUS",
          145,
          45,
          { align: "left" }
        );

      doc
        .fontSize(12)
        .fillColor("#111827")
        .text(
          "Servicio Técnico Especializado",
          145,
          75
        );

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#4b5563")
        .text(
          "Comprobante de recepción y reparación",
          145,
          96
        );

      doc
        .moveTo(45, 135)
        .lineTo(550, 135)
        .strokeColor("#991b1b")
        .lineWidth(2)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#111827")
        .text(
          "COMPROBANTE DE REPARACIÓN",
          45,
          155,
          { align: "center" }
        );

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor("#374151")
        .text(
          `Código: ${reparacion.CODIGO}`,
          { align: "center" }
        );

      doc.moveDown(1.3);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#991b1b")
        .text("DATOS DEL CLIENTE");

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#111827");

      escribirLinea(
        doc,
        "Cliente",
        reparacion.CLIENTE
      );
      escribirLinea(
        doc,
        "DNI",
        reparacion.DNI || "Sin DNI"
      );
      escribirLinea(
        doc,
        "Celular",
        reparacion.CELULAR
      );
      escribirLinea(
        doc,
        "Correo",
        reparacion.CORREO
      );
      escribirLinea(
        doc,
        "Dirección",
        reparacion.DIRECCION
      );

      doc.moveDown(1);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#991b1b")
        .text("DATOS DEL EQUIPO");

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#111827");

      escribirLinea(
        doc,
        "Equipo",
        `${reparacion.MARCA} ${reparacion.MODELO}`
      );
      escribirLinea(
        doc,
        "IMEI",
        reparacion.IMEI || "No registrado"
      );
      escribirLinea(
        doc,
        "Técnico",
        reparacion.TECNICO
      );
      escribirLinea(
        doc,
        "Estado",
        reparacion.ESTADO_REPARACION
      );

      doc.moveDown(1);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#991b1b")
        .text("DETALLE DE LA REPARACIÓN");

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#111827");

      escribirLinea(
        doc,
        "Falla reportada",
        reparacion.FALLA_REPORTADA
      );
      escribirLinea(
        doc,
        "Diagnóstico",
        reparacion.DIAGNOSTICO ||
          "Pendiente"
      );
      escribirLinea(
        doc,
        "Solución",
        reparacion.SOLUCION || "Pendiente"
      );
      escribirLinea(
        doc,
        "Observaciones",
        reparacion.OBSERVACIONES ||
          "Sin observaciones"
      );
      escribirLinea(
        doc,
        "Fecha de ingreso",
        fecha(reparacion.FECHA_INGRESO, true)
      );
      escribirLinea(
        doc,
        "Fecha estimada",
        fecha(reparacion.FECHA_ESTIMADA)
      );
      escribirLinea(
        doc,
        "Fecha de entrega",
        fecha(reparacion.FECHA_ENTREGA, true)
      );
      escribirLinea(
        doc,
        "Garantía",
        `${Number(
          reparacion.GARANTIA_DIAS || 0
        )} días`
      );

      doc.moveDown(1);
      verificarEspacio(doc, 150);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#991b1b")
        .text("REPUESTOS UTILIZADOS");

      doc.moveDown(0.5);

      if (repuestos.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#4b5563")
          .text("No se registraron repuestos.");
      } else {
        repuestos.forEach((repuesto, indice) => {
          verificarEspacio(doc, 45);

          doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#111827")
            .text(
              `${indice + 1}. ${repuesto.PRODUCTO}`
            );

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#4b5563")
            .text(
              `Código: ${repuesto.CODIGO} | Cantidad: ${repuesto.CANTIDAD} | Precio: ${moneda(
                repuesto.PRECIO_UNITARIO
              )} | Subtotal: ${moneda(
                repuesto.SUBTOTAL
              )}`
            );

          doc.moveDown(0.4);
        });
      }

      doc.moveDown(1);
      verificarEspacio(doc, 170);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#991b1b")
        .text("RESUMEN DE PAGOS");

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#111827");

      escribirLinea(
        doc,
        "Costo total",
        moneda(totalReparacion)
      );
      escribirLinea(
        doc,
        "Total pagado",
        moneda(totalPagado)
      );
      escribirLinea(
        doc,
        "Saldo pendiente",
        moneda(saldoPendiente)
      );
      escribirLinea(
        doc,
        "Estado del pago",
        estadoPago
      );

      doc.moveDown(0.7);

      if (pagos.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#4b5563")
          .text("No se registraron pagos.");
      } else {
        pagos.forEach((pago, indice) => {
          verificarEspacio(doc, 40);

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#374151")
            .text(
              `${indice + 1}. ${fecha(
                pago.FECHA_PAGO,
                true
              )} - ${pago.METODO_PAGO} - ${moneda(
                pago.MONTO
              )}`
            );
        });
      }

      verificarEspacio(doc, 140);
      doc.moveDown(2);

      doc
        .moveTo(70, doc.y)
        .lineTo(245, doc.y)
        .strokeColor("#6b7280")
        .lineWidth(1)
        .stroke();

      doc
        .moveTo(350, doc.y)
        .lineTo(525, doc.y)
        .stroke();

      doc.moveDown(0.4);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#374151")
        .text(
          "Firma del cliente",
          70,
          doc.y,
          {
            width: 175,
            align: "center",
          }
        );

      doc.text(
        "Responsable Taurus",
        350,
        doc.y - 11,
        {
          width: 175,
          align: "center",
        }
      );

      doc
        .fontSize(8)
        .fillColor("#6b7280")
        .text(
          "Documento generado automáticamente por el sistema Taurus.",
          45,
          doc.page.height - 70,
          {
            width: 505,
            align: "center",
            lineBreak: false,
          }
        );

      doc.end();
    } catch (error) {
      console.error(
        "Error generando comprobante PDF:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          ok: false,
          message:
            "No se pudo generar el comprobante PDF",
        });
      }

      res.end();
    }
  }
}

module.exports = ReporteController;