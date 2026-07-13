const { sql, getConnection } = require("../config/database");

class AuditoriaModel {
  static async registrar(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idUsuario",
        sql.Int,
        datos.idUsuario || null
      )
      .input(
        "modulo",
        sql.VarChar(50),
        datos.modulo
      )
      .input(
        "accion",
        sql.VarChar(50),
        datos.accion
      )
      .input(
        "entidad",
        sql.VarChar(50),
        datos.entidad
      )
      .input(
        "identidad",
        sql.Int,
        datos.identidad || null
      )
      .input(
        "descripcion",
        sql.VarChar(500),
        datos.descripcion || null
      )
      .input(
        "datosAnteriores",
        sql.VarChar(sql.MAX),
        datos.datosAnteriores || null
      )
      .input(
        "datosNuevos",
        sql.VarChar(sql.MAX),
        datos.datosNuevos || null
      )
      .input(
        "ip",
        sql.VarChar(45),
        datos.ip || null
      )
      .input(
        "userAgent",
        sql.VarChar(500),
        datos.userAgent || null
      )
      .query(`
        INSERT INTO AUDITORIA_SISTEMA (
          IDUSUARIO,
          MODULO,
          ACCION,
          ENTIDAD,
          IDENTIDAD,
          DESCRIPCION,
          DATOS_ANTERIORES,
          DATOS_NUEVOS,
          IP,
          USER_AGENT
        )
        OUTPUT INSERTED.IDAUDITORIA
        VALUES (
          @idUsuario,
          @modulo,
          @accion,
          @entidad,
          @identidad,
          @descripcion,
          @datosAnteriores,
          @datosNuevos,
          @ip,
          @userAgent
        )
      `);

    return {
      idAuditoria:
        result.recordset[0].IDAUDITORIA,
    };
  }

  static async obtenerTodos(filtros = {}) {
    const pool = await getConnection();

    const request = pool.request();

    request.input(
      "modulo",
      sql.VarChar(50),
      filtros.modulo || null
    );

    request.input(
      "accion",
      sql.VarChar(50),
      filtros.accion || null
    );

    request.input(
      "idUsuario",
      sql.Int,
      filtros.idUsuario || null
    );

    const result = await request.query(`
      SELECT TOP 500
        a.IDAUDITORIA,
        a.IDUSUARIO,
        a.MODULO,
        a.ACCION,
        a.ENTIDAD,
        a.IDENTIDAD,
        a.DESCRIPCION,
        a.DATOS_ANTERIORES,
        a.DATOS_NUEVOS,
        a.IP,
        a.USER_AGENT,
        a.FECHA,
        ISNULL(u.NOMBRE, 'Sistema') AS USUARIO
      FROM AUDITORIA_SISTEMA a
      LEFT JOIN USUARIO u
        ON a.IDUSUARIO = u.IDUSUARIO
      WHERE
        (@modulo IS NULL OR a.MODULO = @modulo)
        AND
        (@accion IS NULL OR a.ACCION = @accion)
        AND
        (@idUsuario IS NULL OR a.IDUSUARIO = @idUsuario)
      ORDER BY a.FECHA DESC
    `);

    return result.recordset;
  }
}

module.exports = AuditoriaModel;