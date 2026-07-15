const {
  sql,
  getConnection,
} = require("../config/database");

class ClienteHistorialModel {
  static async obtenerCliente(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          c.IDCLIENTE,
          p.DNI,
          p.NOMBRES,
          p.APELLIDO_PATERNO,
          p.APELLIDO_MATERNO,
          p.CELULAR,
          p.EMAIL,
          p.DIRECCION,
          c.FECHA_REGISTRO
        FROM CLIENTE c
        INNER JOIN PERSONA p
          ON c.IDPERSONA = p.IDPERSONA
        WHERE c.IDCLIENTE = @idCliente
          AND c.ESTADO = 1
      `);

    return resultado.recordset[0] || null;
  }

  static async obtenerResumen(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          (
            SELECT COUNT(*)
            FROM EQUIPO
            WHERE IDCLIENTE = @idCliente
              AND ESTADO = 1
          ) AS EQUIPOS,

          (
            SELECT COUNT(*)
            FROM REPARACION r
            INNER JOIN EQUIPO e
              ON r.IDEQUIPO = e.IDEQUIPO
            WHERE e.IDCLIENTE = @idCliente
              AND r.ESTADO = 1
          ) AS REPARACIONES,

          (
            SELECT COUNT(*)
            FROM REPARACION r
            INNER JOIN EQUIPO e
              ON r.IDEQUIPO = e.IDEQUIPO
            WHERE e.IDCLIENTE = @idCliente
              AND r.ESTADO = 1
              AND r.IDESTADO NOT IN (8, 9)
          ) AS REPARACIONES_ACTIVAS,

          CAST(
            COALESCE(
              (
                SELECT SUM(pr.MONTO)
                FROM PAGO_REPARACION pr
                INNER JOIN REPARACION r
                  ON pr.IDREPARACION =
                    r.IDREPARACION
                INNER JOIN EQUIPO e
                  ON r.IDEQUIPO =
                    e.IDEQUIPO
                WHERE e.IDCLIENTE =
                    @idCliente
                  AND pr.ESTADO = 1
                  AND r.ESTADO = 1
              ),
              0
            )
            AS DECIMAL(12, 2)
          ) AS TOTAL_PAGADO,

          CAST(
            COALESCE(
              (
                SELECT SUM(
                  CASE
                    WHEN
                      COALESCE(
                        r.COSTO_FINAL,
                        r.COSTO_ESTIMADO,
                        0
                      ) >
                      COALESCE(
                        pagos.TOTAL_PAGADO,
                        0
                      )
                      THEN
                        COALESCE(
                          r.COSTO_FINAL,
                          r.COSTO_ESTIMADO,
                          0
                        )
                        -
                        COALESCE(
                          pagos.TOTAL_PAGADO,
                          0
                        )
                    ELSE 0
                  END
                )
                FROM REPARACION r
                INNER JOIN EQUIPO e
                  ON r.IDEQUIPO =
                    e.IDEQUIPO
                OUTER APPLY (
                  SELECT
                    SUM(pr.MONTO)
                      AS TOTAL_PAGADO
                  FROM PAGO_REPARACION pr
                  WHERE pr.IDREPARACION =
                      r.IDREPARACION
                    AND pr.ESTADO = 1
                ) pagos
                WHERE e.IDCLIENTE =
                    @idCliente
                  AND r.ESTADO = 1
              ),
              0
            )
            AS DECIMAL(12, 2)
          ) AS SALDO_PENDIENTE,

          (
            SELECT COUNT(*)
            FROM REPARACION_FOTO rf
            INNER JOIN REPARACION r
              ON rf.IDREPARACION =
                r.IDREPARACION
            INNER JOIN EQUIPO e
              ON r.IDEQUIPO =
                e.IDEQUIPO
            WHERE e.IDCLIENTE = @idCliente
              AND rf.ESTADO = 1
              AND r.ESTADO = 1
          ) AS FOTOS
      `);

    return resultado.recordset[0];
  }

  static async obtenerEquipos(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          e.IDEQUIPO,
          e.TIPO_DISPOSITIVO,
          e.IMEI,
          e.NUMERO_SERIE,
          e.COLOR,
          e.OBSERVACIONES,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO
        FROM EQUIPO e
        INNER JOIN MODELO mo
          ON e.IDMODELO = mo.IDMODELO
        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA
        WHERE e.IDCLIENTE = @idCliente
          AND e.ESTADO = 1
        ORDER BY e.IDEQUIPO DESC
      `);

    return resultado.recordset;
  }

  static async obtenerReparaciones(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          r.FALLA_REPORTADA,
          r.DIAGNOSTICO,
          r.SOLUCION,
          r.FECHA_INGRESO,
          r.FECHA_ESTIMADA,
          r.FECHA_ENTREGA,
          r.GARANTIA_DIAS,
          er.NOMBRE AS ESTADO_REPARACION,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,

          CAST(
            COALESCE(
              r.COSTO_FINAL,
              r.COSTO_ESTIMADO,
              0
            )
            AS DECIMAL(10, 2)
          ) AS TOTAL_REPARACION,

          CAST(
            COALESCE(
              pagos.TOTAL_PAGADO,
              0
            )
            AS DECIMAL(10, 2)
          ) AS TOTAL_PAGADO,

          CAST(
            CASE
              WHEN
                COALESCE(
                  pagos.TOTAL_PAGADO,
                  0
                ) >=
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                THEN 0
              ELSE
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                -
                COALESCE(
                  pagos.TOTAL_PAGADO,
                  0
                )
            END
            AS DECIMAL(10, 2)
          ) AS SALDO_PENDIENTE,

          COALESCE(
            fotos.CANTIDAD,
            0
          ) AS FOTOS

        FROM REPARACION r

        INNER JOIN EQUIPO e
          ON r.IDEQUIPO = e.IDEQUIPO

        INNER JOIN MODELO mo
          ON e.IDMODELO = mo.IDMODELO

        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA

        INNER JOIN ESTADO_REPARACION er
          ON r.IDESTADO = er.IDESTADO

        OUTER APPLY (
          SELECT SUM(pr.MONTO)
            AS TOTAL_PAGADO
          FROM PAGO_REPARACION pr
          WHERE pr.IDREPARACION =
              r.IDREPARACION
            AND pr.ESTADO = 1
        ) pagos

        OUTER APPLY (
          SELECT COUNT(*) AS CANTIDAD
          FROM REPARACION_FOTO rf
          WHERE rf.IDREPARACION =
              r.IDREPARACION
            AND rf.ESTADO = 1
        ) fotos

        WHERE e.IDCLIENTE = @idCliente
          AND r.ESTADO = 1

        ORDER BY
          r.FECHA_INGRESO DESC,
          r.IDREPARACION DESC
      `);

    return resultado.recordset;
  }

  static async obtenerPagos(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          pr.IDPAGO,
          r.CODIGO,
          pr.MONTO,
          pr.METODO_PAGO,
          pr.OBSERVACIONES,
          pr.FECHA_PAGO
        FROM PAGO_REPARACION pr
        INNER JOIN REPARACION r
          ON pr.IDREPARACION =
            r.IDREPARACION
        INNER JOIN EQUIPO e
          ON r.IDEQUIPO =
            e.IDEQUIPO
        WHERE e.IDCLIENTE = @idCliente
          AND pr.ESTADO = 1
          AND r.ESTADO = 1
        ORDER BY
          pr.FECHA_PAGO DESC,
          pr.IDPAGO DESC
      `);

    return resultado.recordset;
  }

  static async obtenerFotos(idCliente) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idCliente",
        sql.Int,
        idCliente
      )
      .query(`
        SELECT
          rf.IDFOTO,
          r.CODIGO,
          rf.TIPO,
          rf.URL,
          rf.DESCRIPCION,
          rf.VISIBLE_CLIENTE,
          rf.FECHA_REGISTRO
        FROM REPARACION_FOTO rf
        INNER JOIN REPARACION r
          ON rf.IDREPARACION =
            r.IDREPARACION
        INNER JOIN EQUIPO e
          ON r.IDEQUIPO =
            e.IDEQUIPO
        WHERE e.IDCLIENTE = @idCliente
          AND rf.ESTADO = 1
          AND r.ESTADO = 1
        ORDER BY
          rf.FECHA_REGISTRO DESC,
          rf.IDFOTO DESC
      `);

    return resultado.recordset;
  }
}

module.exports = ClienteHistorialModel;
