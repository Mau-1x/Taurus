const {
  sql,
  getConnection,
} = require("../config/database");

class GarantiaModel {
  static async obtenerGarantias() {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      WITH GARANTIAS_BASE AS (
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          r.FECHA_ENTREGA,
          r.GARANTIA_DIAS,
          DATEADD(
            DAY,
            r.GARANTIA_DIAS,
            r.FECHA_ENTREGA
          ) AS FECHA_VENCIMIENTO,
          er.NOMBRE AS ESTADO_REPARACION,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,
          p.DNI,
          p.CELULAR,
          CONCAT(
            p.NOMBRES,
            ' ',
            p.APELLIDO_PATERNO,
            ' ',
            ISNULL(
              p.APELLIDO_MATERNO,
              ''
            )
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
        WHERE
          r.ESTADO = 1
          AND r.FECHA_ENTREGA IS NOT NULL
          AND ISNULL(
            r.GARANTIA_DIAS,
            0
          ) > 0
      )
      SELECT
        gb.*,

        DATEDIFF(
          DAY,
          CAST(SYSDATETIME() AS DATE),
          CAST(
            gb.FECHA_VENCIMIENTO
            AS DATE
          )
        ) AS DIAS_RESTANTES,

        CASE
          WHEN SYSDATETIME() >
            gb.FECHA_VENCIMIENTO
            THEN 'VENCIDA'

          WHEN DATEDIFF(
            DAY,
            CAST(SYSDATETIME() AS DATE),
            CAST(
              gb.FECHA_VENCIMIENTO
              AS DATE
            )
          ) <= 7
            THEN 'POR_VENCER'

          ELSE 'ACTIVA'
        END AS ESTADO_VIGENCIA,

        ultimo.IDGARANTIA,
        ultimo.MOTIVO,
        ultimo.DIAGNOSTICO,
        ultimo.SOLUCION,
        ultimo.OBSERVACIONES,
        ultimo.ESTADO_GARANTIA,
        ultimo.FECHA_RETORNO,
        ultimo.FECHA_CIERRE,

        CAST(
          CASE
            WHEN ultimo.ESTADO_GARANTIA IN (
              'PENDIENTE',
              'EN_REVISION'
            )
              THEN 1
            ELSE 0
          END
          AS BIT
        ) AS RECLAMO_ABIERTO

      FROM GARANTIAS_BASE gb

      OUTER APPLY (
        SELECT TOP 1
          g.IDGARANTIA,
          g.MOTIVO,
          g.DIAGNOSTICO,
          g.SOLUCION,
          g.OBSERVACIONES,
          g.ESTADO_GARANTIA,
          g.FECHA_RETORNO,
          g.FECHA_CIERRE
        FROM GARANTIA g
        WHERE
          g.IDREPARACION =
            gb.IDREPARACION
          AND g.ESTADO = 1
        ORDER BY
          g.FECHA_RETORNO DESC,
          g.IDGARANTIA DESC
      ) ultimo

      ORDER BY
        CASE
          WHEN SYSDATETIME() >
            gb.FECHA_VENCIMIENTO
            THEN 3

          WHEN DATEDIFF(
            DAY,
            CAST(SYSDATETIME() AS DATE),
            CAST(
              gb.FECHA_VENCIMIENTO
              AS DATE
            )
          ) <= 7
            THEN 1

          ELSE 2
        END,
        gb.FECHA_VENCIMIENTO ASC
    `);

    return resultado.recordset;
  }

  static async obtenerReclamos() {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      SELECT
        g.IDGARANTIA,
        g.IDREPARACION,
        g.MOTIVO,
        g.DIAGNOSTICO,
        g.SOLUCION,
        g.OBSERVACIONES,
        g.ESTADO_GARANTIA,
        g.FECHA_RETORNO,
        g.FECHA_ACTUALIZACION,
        g.FECHA_CIERRE,
        r.CODIGO,
        r.FECHA_ENTREGA,
        r.GARANTIA_DIAS,
        DATEADD(
          DAY,
          r.GARANTIA_DIAS,
          r.FECHA_ENTREGA
        ) AS FECHA_VENCIMIENTO,
        ma.NOMBRE AS MARCA,
        mo.NOMBRE AS MODELO,
        p.DNI,
        p.CELULAR,
        CONCAT(
          p.NOMBRES,
          ' ',
          p.APELLIDO_PATERNO,
          ' ',
          ISNULL(
            p.APELLIDO_MATERNO,
            ''
          )
        ) AS CLIENTE,
        ur.NOMBRE AS USUARIO_REGISTRO,
        ua.NOMBRE AS USUARIO_ACTUALIZA
      FROM GARANTIA g
      INNER JOIN REPARACION r
        ON g.IDREPARACION =
          r.IDREPARACION
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
      LEFT JOIN USUARIO ur
        ON g.IDUSUARIO_REGISTRO =
          ur.IDUSUARIO
      LEFT JOIN USUARIO ua
        ON g.IDUSUARIO_ACTUALIZA =
          ua.IDUSUARIO
      WHERE
        g.ESTADO = 1
        AND r.ESTADO = 1
      ORDER BY
        g.FECHA_RETORNO DESC,
        g.IDGARANTIA DESC
    `);

    return resultado.recordset;
  }

  static async obtenerPorId(idGarantia) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idGarantia",
        sql.Int,
        idGarantia
      )
      .query(`
        SELECT
          g.IDGARANTIA,
          g.IDREPARACION,
          g.MOTIVO,
          g.DIAGNOSTICO,
          g.SOLUCION,
          g.OBSERVACIONES,
          g.ESTADO_GARANTIA,
          g.FECHA_RETORNO,
          g.FECHA_ACTUALIZACION,
          g.FECHA_CIERRE,
          r.CODIGO
        FROM GARANTIA g
        INNER JOIN REPARACION r
          ON g.IDREPARACION =
            r.IDREPARACION
        WHERE
          g.IDGARANTIA = @idGarantia
          AND g.ESTADO = 1
          AND r.ESTADO = 1
      `);

    return resultado.recordset[0] || null;
  }

  static async obtenerHistorial(idGarantia) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "idGarantia",
        sql.Int,
        idGarantia
      )
      .query(`
        SELECT
          gh.IDHISTORIAL_GARANTIA,
          gh.IDGARANTIA,
          gh.ESTADO_ANTERIOR,
          gh.ESTADO_NUEVO,
          gh.COMENTARIO,
          gh.FECHA,
          u.NOMBRE AS USUARIO
        FROM GARANTIA_HISTORIAL gh
        LEFT JOIN USUARIO u
          ON gh.IDUSUARIO = u.IDUSUARIO
        WHERE
          gh.IDGARANTIA = @idGarantia
        ORDER BY
          gh.FECHA ASC,
          gh.IDHISTORIAL_GARANTIA ASC
      `);

    return resultado.recordset;
  }

  static async crear(
    idReparacion,
    idUsuario,
    datos
  ) {
    const pool = await getConnection();
    const transaction =
      new sql.Transaction(pool);

    try {
      await transaction.begin(
        sql.ISOLATION_LEVEL.SERIALIZABLE
      );

      const reparacionResultado =
        await new sql.Request(transaction)
          .input(
            "idReparacion",
            sql.Int,
            idReparacion
          )
          .query(`
            SELECT
              IDREPARACION,
              CODIGO,
              FECHA_ENTREGA,
              GARANTIA_DIAS,
              DATEADD(
                DAY,
                GARANTIA_DIAS,
                FECHA_ENTREGA
              ) AS FECHA_VENCIMIENTO,

              CAST(
                CASE
                  WHEN
                    FECHA_ENTREGA
                      IS NOT NULL
                    AND ISNULL(
                      GARANTIA_DIAS,
                      0
                    ) > 0
                    AND SYSDATETIME() <=
                      DATEADD(
                        DAY,
                        GARANTIA_DIAS,
                        FECHA_ENTREGA
                      )
                    THEN 1
                  ELSE 0
                END
                AS BIT
              ) AS GARANTIA_VIGENTE

            FROM REPARACION
              WITH (UPDLOCK, HOLDLOCK)

            WHERE
              IDREPARACION =
                @idReparacion
              AND ESTADO = 1
          `);

      if (
        reparacionResultado
          .recordset.length === 0
      ) {
        const error = new Error(
          "La reparación no existe"
        );
        error.statusCode = 404;
        throw error;
      }

      const reparacion =
        reparacionResultado.recordset[0];

      if (
        !reparacion.FECHA_ENTREGA ||
        Number(
          reparacion.GARANTIA_DIAS
        ) <= 0
      ) {
        const error = new Error(
          "La reparación no tiene una garantía registrada"
        );
        error.statusCode = 400;
        throw error;
      }

      if (
        !Boolean(
          reparacion.GARANTIA_VIGENTE
        )
      ) {
        const error = new Error(
          "La garantía de esta reparación ya venció"
        );
        error.statusCode = 400;
        throw error;
      }

      const reclamoAbierto =
        await new sql.Request(transaction)
          .input(
            "idReparacion",
            sql.Int,
            idReparacion
          )
          .query(`
            SELECT TOP 1 IDGARANTIA
            FROM GARANTIA
              WITH (UPDLOCK, HOLDLOCK)
            WHERE
              IDREPARACION =
                @idReparacion
              AND ESTADO = 1
              AND ESTADO_GARANTIA IN (
                'PENDIENTE',
                'EN_REVISION'
              )
          `);

      if (
        reclamoAbierto.recordset.length > 0
      ) {
        const error = new Error(
          "Esta reparación ya tiene un reclamo de garantía abierto"
        );
        error.statusCode = 409;
        throw error;
      }

      const garantiaResultado =
        await new sql.Request(transaction)
          .input(
            "idReparacion",
            sql.Int,
            idReparacion
          )
          .input(
            "idUsuario",
            sql.Int,
            idUsuario
          )
          .input(
            "motivo",
            sql.VarChar(1000),
            datos.motivo
          )
          .input(
            "observaciones",
            sql.VarChar(1000),
            datos.observaciones || null
          )
          .query(`
            INSERT INTO GARANTIA (
              IDREPARACION,
              IDUSUARIO_REGISTRO,
              MOTIVO,
              OBSERVACIONES,
              ESTADO_GARANTIA
            )
            OUTPUT
              INSERTED.IDGARANTIA,
              INSERTED.IDREPARACION,
              INSERTED.MOTIVO,
              INSERTED.OBSERVACIONES,
              INSERTED.ESTADO_GARANTIA,
              INSERTED.FECHA_RETORNO
            VALUES (
              @idReparacion,
              @idUsuario,
              @motivo,
              @observaciones,
              'PENDIENTE'
            )
          `);

      const garantia =
        garantiaResultado.recordset[0];

      await new sql.Request(transaction)
        .input(
          "idGarantia",
          sql.Int,
          garantia.IDGARANTIA
        )
        .input(
          "idUsuario",
          sql.Int,
          idUsuario
        )
        .input(
          "estadoNuevo",
          sql.VarChar(20),
          "PENDIENTE"
        )
        .input(
          "comentario",
          sql.VarChar(500),
          "Reclamo de garantía registrado"
        )
        .query(`
          INSERT INTO GARANTIA_HISTORIAL (
            IDGARANTIA,
            IDUSUARIO,
            ESTADO_ANTERIOR,
            ESTADO_NUEVO,
            COMENTARIO
          )
          VALUES (
            @idGarantia,
            @idUsuario,
            NULL,
            @estadoNuevo,
            @comentario
          )
        `);

      await transaction.commit();

      return {
        ...garantia,
        CODIGO: reparacion.CODIGO,
        FECHA_VENCIMIENTO:
          reparacion.FECHA_VENCIMIENTO,
      };
    } catch (error) {
      if (
        transaction._aborted === false
      ) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  static async actualizar(
    idGarantia,
    idUsuario,
    datos
  ) {
    const pool = await getConnection();
    const transaction =
      new sql.Transaction(pool);

    try {
      await transaction.begin(
        sql.ISOLATION_LEVEL.SERIALIZABLE
      );

      const anteriorResultado =
        await new sql.Request(transaction)
          .input(
            "idGarantia",
            sql.Int,
            idGarantia
          )
          .query(`
            SELECT
              IDGARANTIA,
              IDREPARACION,
              ESTADO_GARANTIA,
              DIAGNOSTICO,
              SOLUCION,
              OBSERVACIONES
            FROM GARANTIA
              WITH (UPDLOCK, HOLDLOCK)
            WHERE
              IDGARANTIA =
                @idGarantia
              AND ESTADO = 1
          `);

      if (
        anteriorResultado
          .recordset.length === 0
      ) {
        const error = new Error(
          "El reclamo de garantía no existe"
        );
        error.statusCode = 404;
        throw error;
      }

      const anterior =
        anteriorResultado.recordset[0];

      const actualizadoResultado =
        await new sql.Request(transaction)
          .input(
            "idGarantia",
            sql.Int,
            idGarantia
          )
          .input(
            "idUsuario",
            sql.Int,
            idUsuario
          )
          .input(
            "estadoGarantia",
            sql.VarChar(20),
            datos.estadoGarantia
          )
          .input(
            "diagnostico",
            sql.VarChar(1000),
            datos.diagnostico || null
          )
          .input(
            "solucion",
            sql.VarChar(1000),
            datos.solucion || null
          )
          .input(
            "observaciones",
            sql.VarChar(1000),
            datos.observaciones || null
          )
          .query(`
            UPDATE GARANTIA
            SET
              ESTADO_GARANTIA =
                @estadoGarantia,
              DIAGNOSTICO =
                @diagnostico,
              SOLUCION =
                @solucion,
              OBSERVACIONES =
                @observaciones,
              IDUSUARIO_ACTUALIZA =
                @idUsuario,
              FECHA_ACTUALIZACION =
                SYSDATETIME(),
              FECHA_CIERRE =
                CASE
                  WHEN @estadoGarantia IN (
                    'RESUELTA',
                    'RECHAZADA'
                  )
                    THEN COALESCE(
                      FECHA_CIERRE,
                      SYSDATETIME()
                    )
                  ELSE NULL
                END
            OUTPUT
              INSERTED.IDGARANTIA,
              INSERTED.IDREPARACION,
              INSERTED.ESTADO_GARANTIA,
              INSERTED.DIAGNOSTICO,
              INSERTED.SOLUCION,
              INSERTED.OBSERVACIONES,
              INSERTED.FECHA_ACTUALIZACION,
              INSERTED.FECHA_CIERRE
            WHERE
              IDGARANTIA =
                @idGarantia
              AND ESTADO = 1
          `);

      const actualizado =
        actualizadoResultado.recordset[0];

      await new sql.Request(transaction)
        .input(
          "idGarantia",
          sql.Int,
          idGarantia
        )
        .input(
          "idUsuario",
          sql.Int,
          idUsuario
        )
        .input(
          "estadoAnterior",
          sql.VarChar(20),
          anterior.ESTADO_GARANTIA
        )
        .input(
          "estadoNuevo",
          sql.VarChar(20),
          datos.estadoGarantia
        )
        .input(
          "comentario",
          sql.VarChar(500),
          datos.comentario || null
        )
        .query(`
          INSERT INTO GARANTIA_HISTORIAL (
            IDGARANTIA,
            IDUSUARIO,
            ESTADO_ANTERIOR,
            ESTADO_NUEVO,
            COMENTARIO
          )
          VALUES (
            @idGarantia,
            @idUsuario,
            @estadoAnterior,
            @estadoNuevo,
            @comentario
          )
        `);

      await transaction.commit();

      return {
        anterior,
        actualizado,
      };
    } catch (error) {
      if (
        transaction._aborted === false
      ) {
        await transaction.rollback();
      }

      throw error;
    }
  }
}

module.exports = GarantiaModel;
