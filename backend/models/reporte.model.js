const { getConnection } = require("../config/database");

class ReporteModel {
  static async obtenerResumen() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM VENTA
          WHERE ESTADO = 'COMPLETADA'
        ) AS TOTAL_VENTAS,

        (
          SELECT ISNULL(SUM(TOTAL), 0)
          FROM VENTA
          WHERE ESTADO = 'COMPLETADA'
        ) AS INGRESOS_VENTAS,

        (
          SELECT COUNT(*)
          FROM REPARACION
          WHERE ESTADO = 1
            AND IDESTADO NOT IN (8, 9)
        ) AS REPARACIONES_ACTIVAS,

        (
          SELECT COUNT(*)
          FROM REPARACION
          WHERE ESTADO = 1
            AND IDESTADO = 8
        ) AS REPARACIONES_ENTREGADAS,

        (
          SELECT COUNT(*)
          FROM RESERVA
          WHERE ESTADO = 'PENDIENTE'
        ) AS RESERVAS_PENDIENTES,

        (
          SELECT COUNT(*)
          FROM PRODUCTO
          WHERE ESTADO = 1
            AND STOCK <= STOCK_MINIMO
        ) AS PRODUCTOS_STOCK_BAJO
    `);

    return result.recordset[0];
  }

  static async obtenerVentasRecientes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        v.IDVENTA,
        v.NUMERO_VENTA,
        v.FECHA,
        v.TOTAL,
        v.METODO_PAGO,
        v.ESTADO,

        CASE
          WHEN c.IDCLIENTE IS NULL THEN 'Cliente general'
          ELSE CONCAT(
            p.NOMBRES,
            ' ',
            p.APELLIDO_PATERNO,
            ' ',
            ISNULL(p.APELLIDO_MATERNO, '')
          )
        END AS CLIENTE

      FROM VENTA v

      LEFT JOIN CLIENTE c
        ON v.IDCLIENTE = c.IDCLIENTE

      LEFT JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA

      ORDER BY v.FECHA DESC
    `);

    return result.recordset;
  }

  static async obtenerReparacionesRecientes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        r.IDREPARACION,
        r.CODIGO,
        r.FECHA_INGRESO,
        r.COSTO_ESTIMADO,
        r.COSTO_FINAL,

        er.NOMBRE AS ESTADO_REPARACION,
        ma.NOMBRE AS MARCA,
        mo.NOMBRE AS MODELO,

        CONCAT(
          p.NOMBRES,
          ' ',
          p.APELLIDO_PATERNO,
          ' ',
          ISNULL(p.APELLIDO_MATERNO, '')
        ) AS CLIENTE

      FROM REPARACION r

      INNER JOIN ESTADO_REPARACION er
        ON r.IDESTADO = er.IDESTADO

      INNER JOIN EQUIPO e
        ON r.IDEQUIPO = e.IDEQUIPO

      INNER JOIN MODELO mo
        ON e.IDMODELO = mo.IDMODELO

      INNER JOIN MARCA ma
        ON mo.IDMARCA = ma.IDMARCA

      INNER JOIN CLIENTE c
        ON e.IDCLIENTE = c.IDCLIENTE

      INNER JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA

      WHERE r.ESTADO = 1

      ORDER BY r.FECHA_INGRESO DESC
    `);

    return result.recordset;
  }

  static async obtenerStockBajo() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        IDPRODUCTO,
        CODIGO,
        NOMBRE,
        STOCK,
        STOCK_MINIMO,
        PRECIO_VENTA
      FROM PRODUCTO
      WHERE ESTADO = 1
        AND STOCK <= STOCK_MINIMO
      ORDER BY STOCK ASC
    `);

    return result.recordset;
  }

  static async obtenerVentasPorMes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        YEAR(FECHA) AS ANIO,
        MONTH(FECHA) AS MES,
        COUNT(*) AS CANTIDAD_VENTAS,
        ISNULL(SUM(TOTAL), 0) AS TOTAL_VENDIDO
      FROM VENTA
      WHERE ESTADO = 'COMPLETADA'
        AND FECHA >= DATEADD(MONTH, -5, GETDATE())
      GROUP BY
        YEAR(FECHA),
        MONTH(FECHA)
      ORDER BY
        YEAR(FECHA),
        MONTH(FECHA)
    `);

    return result.recordset;
  }
    static async obtenerComprobanteReparacion(idReparacion) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", idReparacion)
      .query(`
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          r.FALLA_REPORTADA,
          r.DIAGNOSTICO,
          r.SOLUCION,
          r.COSTO_ESTIMADO,
          r.COSTO_FINAL,
          r.FECHA_INGRESO,
          r.FECHA_ESTIMADA,
          r.FECHA_ENTREGA,
          r.GARANTIA_DIAS,
          r.OBSERVACIONES,

          er.NOMBRE AS ESTADO_REPARACION,

          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,
          e.IMEI,

          p.DNI,
          p.CELULAR,
          p.EMAIL,
          p.DIRECCION,

          CONCAT(
            p.NOMBRES,
            ' ',
            p.APELLIDO_PATERNO,
            ' ',
            ISNULL(p.APELLIDO_MATERNO, '')
          ) AS CLIENTE,

          ISNULL(u.NOMBRE, 'Sin técnico asignado') AS TECNICO

        FROM REPARACION r

        INNER JOIN ESTADO_REPARACION er
          ON r.IDESTADO = er.IDESTADO

        INNER JOIN EQUIPO e
          ON r.IDEQUIPO = e.IDEQUIPO

        INNER JOIN MODELO mo
          ON e.IDMODELO = mo.IDMODELO

        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA

        INNER JOIN CLIENTE c
          ON e.IDCLIENTE = c.IDCLIENTE

        INNER JOIN PERSONA p
          ON c.IDPERSONA = p.IDPERSONA

        LEFT JOIN USUARIO u
          ON r.IDTECNICO = u.IDUSUARIO

        WHERE r.IDREPARACION = @idReparacion
          AND r.ESTADO = 1
      `);

    return resultado.recordset[0] || null;
  }

  static async obtenerRepuestosComprobante(idReparacion) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", idReparacion)
      .query(`
        SELECT
          p.CODIGO,
          p.NOMBRE AS PRODUCTO,
          drp.CANTIDAD,
          drp.PRECIO_UNITARIO,
          CAST(
            drp.CANTIDAD * drp.PRECIO_UNITARIO
            AS DECIMAL(10,2)
          ) AS SUBTOTAL
        FROM DETALLE_REPARACION_PRODUCTO drp

        INNER JOIN PRODUCTO p
          ON drp.IDPRODUCTO = p.IDPRODUCTO

        WHERE drp.IDREPARACION = @idReparacion
          AND drp.ESTADO = 1

        ORDER BY drp.IDDETALLE_REPARACION_PRODUCTO
      `);

    return resultado.recordset;
  }

  static async obtenerPagosComprobante(idReparacion) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", idReparacion)
      .query(`
        SELECT
          pr.IDPAGO,
          pr.MONTO,
          pr.METODO_PAGO,
          pr.OBSERVACIONES,
          pr.FECHA_PAGO,
          u.NOMBRE AS USUARIO
        FROM PAGO_REPARACION pr

        INNER JOIN USUARIO u
          ON pr.IDUSUARIO = u.IDUSUARIO

        WHERE pr.IDREPARACION = @idReparacion
          AND pr.ESTADO = 1

        ORDER BY pr.FECHA_PAGO
      `);

    return resultado.recordset;
  }
}

module.exports = ReporteModel;