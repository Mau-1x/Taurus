const {
  getConnection,
} = require("../config/database");

class DashboardModel {
  static async obtenerResumen() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM CLIENTE
          WHERE ESTADO = 1
        ) AS CLIENTES,

        (
          SELECT COUNT(*)
          FROM EQUIPO
          WHERE ESTADO = 1
        ) AS EQUIPOS,

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
            AND IDESTADO = 7
        ) AS LISTOS_PARA_RECOGER,

        (
          SELECT COUNT(*)
          FROM REPARACION
          WHERE ESTADO = 1
            AND IDESTADO NOT IN (7, 8, 9)
            AND FECHA_ESTIMADA IS NOT NULL
            AND FECHA_ESTIMADA <
              CAST(SYSDATETIME() AS DATE)
        ) AS REPARACIONES_ATRASADAS,

        (
          SELECT COUNT(*)
          FROM PRODUCTO
          WHERE ESTADO = 1
            AND STOCK BETWEEN 1 AND 5
        ) AS STOCK_BAJO,

        (
          SELECT COUNT(*)
          FROM PRODUCTO
          WHERE ESTADO = 1
            AND STOCK <= 0
        ) AS SIN_STOCK,

        CAST(
          COALESCE(
            (
              SELECT SUM(MONTO)
              FROM PAGO_REPARACION
              WHERE ESTADO = 1
                AND FECHA_PAGO >=
                  CAST(SYSDATETIME() AS DATE)
                AND FECHA_PAGO <
                  DATEADD(
                    DAY,
                    1,
                    CAST(SYSDATETIME() AS DATE)
                  )
            ),
            0
          )
          AS DECIMAL(12, 2)
        ) AS INGRESOS_DIA,

        CAST(
          COALESCE(
            (
              SELECT SUM(MONTO)
              FROM PAGO_REPARACION
              WHERE ESTADO = 1
                AND FECHA_PAGO >=
                  DATEFROMPARTS(
                    YEAR(SYSDATETIME()),
                    MONTH(SYSDATETIME()),
                    1
                  )
                AND FECHA_PAGO <
                  DATEADD(
                    MONTH,
                    1,
                    DATEFROMPARTS(
                      YEAR(SYSDATETIME()),
                      MONTH(SYSDATETIME()),
                      1
                    )
                  )
            ),
            0
          )
          AS DECIMAL(12, 2)
        ) AS INGRESOS_MES
    `);

    return result.recordset[0];
  }

  static async obtenerReparacionesRecientes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 6
        r.IDREPARACION,
        r.CODIGO,
        r.FECHA_INGRESO,
        er.NOMBRE AS ESTADO,
        ma.NOMBRE AS MARCA,
        mo.NOMBRE AS MODELO,
        CONCAT(
          p.NOMBRES,
          ' ',
          p.APELLIDO_PATERNO
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
      ORDER BY
        r.FECHA_INGRESO DESC,
        r.IDREPARACION DESC
    `);

    return result.recordset;
  }

  static async obtenerReparacionesAtrasadas() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 5
        r.IDREPARACION,
        r.CODIGO,
        r.FECHA_ESTIMADA,
        DATEDIFF(
          DAY,
          CAST(r.FECHA_ESTIMADA AS DATE),
          CAST(SYSDATETIME() AS DATE)
        ) AS DIAS_ATRASO,
        er.NOMBRE AS ESTADO,
        ma.NOMBRE AS MARCA,
        mo.NOMBRE AS MODELO,
        CONCAT(
          p.NOMBRES,
          ' ',
          p.APELLIDO_PATERNO
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
        AND r.IDESTADO NOT IN (7, 8, 9)
        AND r.FECHA_ESTIMADA IS NOT NULL
        AND r.FECHA_ESTIMADA <
          CAST(SYSDATETIME() AS DATE)
      ORDER BY
        r.FECHA_ESTIMADA ASC,
        r.IDREPARACION ASC
    `);

    return result.recordset;
  }

  static async obtenerProductosStockBajo() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 6
        IDPRODUCTO,
        CODIGO,
        NOMBRE,
        STOCK
      FROM PRODUCTO
      WHERE ESTADO = 1
        AND STOCK <= 5
      ORDER BY
        STOCK ASC,
        NOMBRE ASC
    `);

    return result.recordset;
  }

  static async obtenerPagosRecientes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 6
        pr.IDPAGO,
        pr.MONTO,
        pr.METODO_PAGO,
        pr.FECHA_PAGO,
        r.CODIGO
      FROM PAGO_REPARACION pr
      INNER JOIN REPARACION r
        ON pr.IDREPARACION = r.IDREPARACION
      WHERE pr.ESTADO = 1
        AND r.ESTADO = 1
      ORDER BY
        pr.FECHA_PAGO DESC,
        pr.IDPAGO DESC
    `);

    return result.recordset;
  }
}

module.exports = DashboardModel;
