const { sql, getConnection } = require("../config/database");

class ReparacionModel {
  static async obtenerTodos() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        r.IDREPARACION,
        r.CODIGO,
        r.IDEQUIPO,
        r.IDTECNICO,
        r.IDESTADO,
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
        c.IDCLIENTE,
        p.DNI,
        CONCAT(
          p.NOMBRES, ' ',
          p.APELLIDO_PATERNO, ' ',
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
      ORDER BY r.IDREPARACION DESC
    `);

    return result.recordset;
  }

  static async obtenerPorId(idReparacion) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .query(`
        SELECT
          r.*,
          er.NOMBRE AS ESTADO_REPARACION,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,
          e.IMEI,
          p.DNI,
          CONCAT(
            p.NOMBRES, ' ',
            p.APELLIDO_PATERNO, ' ',
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
        WHERE r.IDREPARACION = @idReparacion
          AND r.ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async obtenerPorCodigo(codigo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("codigo", sql.VarChar(30), codigo)
      .query(`
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          r.FALLA_REPORTADA,
          r.DIAGNOSTICO,
          r.FECHA_INGRESO,
          r.FECHA_ESTIMADA,
          r.FECHA_ENTREGA,
          r.GARANTIA_DIAS,
          er.NOMBRE AS ESTADO_REPARACION,
          er.ORDEN,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO
        FROM REPARACION r
        INNER JOIN ESTADO_REPARACION er
          ON r.IDESTADO = er.IDESTADO
        INNER JOIN EQUIPO e
          ON r.IDEQUIPO = e.IDEQUIPO
        INNER JOIN MODELO mo
          ON e.IDMODELO = mo.IDMODELO
        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA
        WHERE r.CODIGO = @codigo
          AND r.ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async obtenerEstadoPorId(idEstado) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEstado", sql.Int, idEstado)
      .query(`
        SELECT IDESTADO, NOMBRE, ORDEN
        FROM ESTADO_REPARACION
        WHERE IDESTADO = @idEstado
          AND ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async equipoExiste(idEquipo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .query(`
        SELECT IDEQUIPO
        FROM EQUIPO
        WHERE IDEQUIPO = @idEquipo
          AND ESTADO = 1
      `);

    return result.recordset.length > 0;
  }

  static async crear(datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const codigo = `TAU-${Date.now()}`;

      const requestReparacion = new sql.Request(transaction);

      requestReparacion.input("codigo", sql.VarChar(30), codigo);
      requestReparacion.input("idEquipo", sql.Int, datos.idEquipo);
      requestReparacion.input(
        "idTecnico",
        sql.Int,
        datos.idTecnico || null
      );
      requestReparacion.input("idEstado", sql.Int, 1);
      requestReparacion.input(
        "fallaReportada",
        sql.VarChar(1000),
        datos.fallaReportada
      );
      requestReparacion.input(
        "costoEstimado",
        sql.Decimal(10, 2),
        datos.costoEstimado || null
      );
      requestReparacion.input(
        "fechaEstimada",
        sql.DateTime2,
        datos.fechaEstimada || null
      );
      requestReparacion.input(
        "observaciones",
        sql.VarChar(1000),
        datos.observaciones || null
      );

      const reparacionResult = await requestReparacion.query(`
        INSERT INTO REPARACION (
          CODIGO,
          IDEQUIPO,
          IDTECNICO,
          IDESTADO,
          FALLA_REPORTADA,
          COSTO_ESTIMADO,
          FECHA_ESTIMADA,
          OBSERVACIONES
        )
        OUTPUT INSERTED.IDREPARACION, INSERTED.CODIGO
        VALUES (
          @codigo,
          @idEquipo,
          @idTecnico,
          @idEstado,
          @fallaReportada,
          @costoEstimado,
          @fechaEstimada,
          @observaciones
        )
      `);

      const reparacion = reparacionResult.recordset[0];

      const requestHistorial = new sql.Request(transaction);

      requestHistorial.input(
        "idReparacion",
        sql.Int,
        reparacion.IDREPARACION
      );
      requestHistorial.input("idEstado", sql.Int, 1);
      requestHistorial.input(
        "comentario",
        sql.VarChar(500),
        "Equipo recibido en el servicio técnico"
      );

      await requestHistorial.query(`
        INSERT INTO HISTORIAL_REPARACION (
          IDREPARACION,
          IDESTADO,
          COMENTARIO
        )
        VALUES (
          @idReparacion,
          @idEstado,
          @comentario
        )
      `);

      await transaction.commit();

      return {
        idReparacion: reparacion.IDREPARACION,
        codigo: reparacion.CODIGO,
      };
    } catch (error) {
      if (transaction._aborted === false) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  static async actualizar(idReparacion, datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .input("idTecnico", sql.Int, datos.idTecnico || null)
      .input(
        "fallaReportada",
        sql.VarChar(1000),
        datos.fallaReportada
      )
      .input(
        "diagnostico",
        sql.VarChar(1000),
        datos.diagnostico || null
      )
      .input("solucion", sql.VarChar(1000), datos.solucion || null)
      .input(
        "costoEstimado",
        sql.Decimal(10, 2),
        datos.costoEstimado || null
      )
      .input(
        "costoFinal",
        sql.Decimal(10, 2),
        datos.costoFinal || null
      )
      .input(
        "fechaEstimada",
        sql.DateTime2,
        datos.fechaEstimada || null
      )
      .input(
        "fechaEntrega",
        sql.DateTime2,
        datos.fechaEntrega || null
      )
      .input(
        "garantiaDias",
        sql.Int,
        datos.garantiaDias || 0
      )
      .input(
        "observaciones",
        sql.VarChar(1000),
        datos.observaciones || null
      )
      .query(`
        UPDATE REPARACION
        SET
          IDTECNICO = @idTecnico,
          FALLA_REPORTADA = @fallaReportada,
          DIAGNOSTICO = @diagnostico,
          SOLUCION = @solucion,
          COSTO_ESTIMADO = @costoEstimado,
          COSTO_FINAL = @costoFinal,
          FECHA_ESTIMADA = @fechaEstimada,
          FECHA_ENTREGA = @fechaEntrega,
          GARANTIA_DIAS = @garantiaDias,
          OBSERVACIONES = @observaciones
        WHERE IDREPARACION = @idReparacion
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }

  static async cambiarEstado(idReparacion, datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const requestActualizar = new sql.Request(transaction);

      requestActualizar.input(
        "idReparacion",
        sql.Int,
        idReparacion
      );
      requestActualizar.input("idEstado", sql.Int, datos.idEstado);

      const result = await requestActualizar.query(`
        UPDATE REPARACION
        SET
          IDESTADO = @idEstado,
          FECHA_ENTREGA =
            CASE
              WHEN @idEstado = 8 THEN SYSDATETIME()
              ELSE FECHA_ENTREGA
            END
        WHERE IDREPARACION = @idReparacion
          AND ESTADO = 1
      `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return false;
      }

      const requestHistorial = new sql.Request(transaction);

      requestHistorial.input(
        "idReparacion",
        sql.Int,
        idReparacion
      );
      requestHistorial.input("idEstado", sql.Int, datos.idEstado);
      requestHistorial.input(
        "comentario",
        sql.VarChar(500),
        datos.comentario || null
      );

      await requestHistorial.query(`
        INSERT INTO HISTORIAL_REPARACION (
          IDREPARACION,
          IDESTADO,
          COMENTARIO
        )
        VALUES (
          @idReparacion,
          @idEstado,
          @comentario
        )
      `);

      await transaction.commit();
      return true;
    } catch (error) {
      if (transaction._aborted === false) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  static async obtenerHistorial(idReparacion) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .query(`
        SELECT
          h.IDHISTORIAL,
          h.IDREPARACION,
          h.IDESTADO,
          er.NOMBRE AS ESTADO,
          h.COMENTARIO,
          h.FECHA
        FROM HISTORIAL_REPARACION h
        INNER JOIN ESTADO_REPARACION er
          ON h.IDESTADO = er.IDESTADO
        WHERE h.IDREPARACION = @idReparacion
        ORDER BY h.FECHA ASC
      `);

    return result.recordset;
  }

  static async obtenerEstados() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT IDESTADO, NOMBRE, ORDEN
      FROM ESTADO_REPARACION
      WHERE ESTADO = 1
      ORDER BY ORDEN
    `);

    return result.recordset;
  }
}

module.exports = ReparacionModel;