const { sql, getConnection } = require("../config/database");

class EquipoModel {
  static async obtenerTodos() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        e.IDEQUIPO,
        e.IDCLIENTE,
        e.IDMODELO,
        e.TIPO_DISPOSITIVO,
        e.IMEI,
        e.NUMERO_SERIE,
        e.COLOR,
        e.OBSERVACIONES,
        e.FECHA_REGISTRO,
        e.ESTADO,
        m.NOMBRE AS MODELO,
        ma.IDMARCA,
        ma.NOMBRE AS MARCA,
        p.DNI,
        CONCAT(
          p.NOMBRES, ' ',
          p.APELLIDO_PATERNO, ' ',
          ISNULL(p.APELLIDO_MATERNO, '')
        ) AS CLIENTE
      FROM EQUIPO e
      INNER JOIN CLIENTE c
        ON e.IDCLIENTE = c.IDCLIENTE
      INNER JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA
      INNER JOIN MODELO m
        ON e.IDMODELO = m.IDMODELO
      INNER JOIN MARCA ma
        ON m.IDMARCA = ma.IDMARCA
      WHERE e.ESTADO = 1
      ORDER BY e.IDEQUIPO DESC
    `);

    return result.recordset;
  }

  static async obtenerPorId(idEquipo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .query(`
        SELECT
          e.*,
          m.NOMBRE AS MODELO,
          ma.IDMARCA,
          ma.NOMBRE AS MARCA,
          p.DNI,
          CONCAT(
            p.NOMBRES, ' ',
            p.APELLIDO_PATERNO, ' ',
            ISNULL(p.APELLIDO_MATERNO, '')
          ) AS CLIENTE
        FROM EQUIPO e
        INNER JOIN CLIENTE c
          ON e.IDCLIENTE = c.IDCLIENTE
        INNER JOIN PERSONA p
          ON c.IDPERSONA = p.IDPERSONA
        INNER JOIN MODELO m
          ON e.IDMODELO = m.IDMODELO
        INNER JOIN MARCA ma
          ON m.IDMARCA = ma.IDMARCA
        WHERE e.IDEQUIPO = @idEquipo
          AND e.ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async obtenerPorCliente(idCliente) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idCliente", sql.Int, idCliente)
      .query(`
        SELECT
          e.*,
          m.NOMBRE AS MODELO,
          ma.NOMBRE AS MARCA
        FROM EQUIPO e
        INNER JOIN MODELO m
          ON e.IDMODELO = m.IDMODELO
        INNER JOIN MARCA ma
          ON m.IDMARCA = ma.IDMARCA
        WHERE e.IDCLIENTE = @idCliente
          AND e.ESTADO = 1
        ORDER BY e.IDEQUIPO DESC
      `);

    return result.recordset;
  }

  static async validarModeloMarca(idModelo, idMarca) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idModelo", sql.Int, idModelo)
      .input("idMarca", sql.Int, idMarca)
      .query(`
        SELECT IDMODELO
        FROM MODELO
        WHERE IDMODELO = @idModelo
          AND IDMARCA = @idMarca
          AND ESTADO = 1
      `);

    return result.recordset.length > 0;
  }

  static async crear(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idCliente", sql.Int, datos.idCliente)
      .input("idModelo", sql.Int, datos.idModelo)
      .input(
        "tipoDispositivo",
        sql.VarChar(30),
        datos.tipoDispositivo || "Celular"
      )
      .input("imei", sql.VarChar(20), datos.imei || null)
      .input("numeroSerie", sql.VarChar(50), datos.numeroSerie || null)
      .input("color", sql.VarChar(50), datos.color || null)
      .input(
        "observaciones",
        sql.VarChar(500),
        datos.observaciones || null
      )
      .query(`
        INSERT INTO EQUIPO (
          IDCLIENTE,
          IDMODELO,
          TIPO_DISPOSITIVO,
          IMEI,
          NUMERO_SERIE,
          COLOR,
          OBSERVACIONES
        )
        OUTPUT INSERTED.IDEQUIPO
        VALUES (
          @idCliente,
          @idModelo,
          @tipoDispositivo,
          @imei,
          @numeroSerie,
          @color,
          @observaciones
        )
      `);

    return {
      idEquipo: result.recordset[0].IDEQUIPO,
    };
  }

  static async actualizar(idEquipo, datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .input("idCliente", sql.Int, datos.idCliente)
      .input("idModelo", sql.Int, datos.idModelo)
      .input(
        "tipoDispositivo",
        sql.VarChar(30),
        datos.tipoDispositivo || "Celular"
      )
      .input("imei", sql.VarChar(20), datos.imei || null)
      .input("numeroSerie", sql.VarChar(50), datos.numeroSerie || null)
      .input("color", sql.VarChar(50), datos.color || null)
      .input(
        "observaciones",
        sql.VarChar(500),
        datos.observaciones || null
      )
      .query(`
        UPDATE EQUIPO
        SET
          IDCLIENTE = @idCliente,
          IDMODELO = @idModelo,
          TIPO_DISPOSITIVO = @tipoDispositivo,
          IMEI = @imei,
          NUMERO_SERIE = @numeroSerie,
          COLOR = @color,
          OBSERVACIONES = @observaciones
        WHERE IDEQUIPO = @idEquipo
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }

  static async eliminar(idEquipo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .query(`
        UPDATE EQUIPO
        SET ESTADO = 0
        WHERE IDEQUIPO = @idEquipo
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }

    static async obtenerFotos(idEquipo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .query(`
        SELECT
          f.IDFOTO,
          f.IDEQUIPO,
          f.IDUSUARIO,
          f.TIPO_FOTO,
          f.URL_FOTO,
          f.PUBLIC_ID,
          f.DESCRIPCION,
          f.FECHA_REGISTRO,
          u.NOMBRE AS USUARIO
        FROM FOTO_EQUIPO f
        INNER JOIN USUARIO u
          ON f.IDUSUARIO = u.IDUSUARIO
        WHERE f.IDEQUIPO = @idEquipo
          AND f.ESTADO = 1
        ORDER BY f.FECHA_REGISTRO DESC
      `);

    return result.recordset;
  }

  static async crearFoto(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, datos.idEquipo)
      .input("idUsuario", sql.Int, datos.idUsuario)
      .input(
        "tipoFoto",
        sql.VarChar(30),
        datos.tipoFoto
      )
      .input(
        "urlFoto",
        sql.VarChar(500),
        datos.urlFoto
      )
      .input(
        "publicId",
        sql.VarChar(250),
        datos.publicId
      )
      .input(
        "descripcion",
        sql.VarChar(300),
        datos.descripcion || null
      )
      .query(`
        INSERT INTO FOTO_EQUIPO (
          IDEQUIPO,
          IDUSUARIO,
          TIPO_FOTO,
          URL_FOTO,
          PUBLIC_ID,
          DESCRIPCION
        )
        OUTPUT
          INSERTED.IDFOTO,
          INSERTED.URL_FOTO,
          INSERTED.FECHA_REGISTRO
        VALUES (
          @idEquipo,
          @idUsuario,
          @tipoFoto,
          @urlFoto,
          @publicId,
          @descripcion
        )
      `);

    return result.recordset[0];
  }

  static async obtenerFotoPorId(idEquipo, idFoto) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .input("idFoto", sql.Int, idFoto)
      .query(`
        SELECT
          IDFOTO,
          IDEQUIPO,
          PUBLIC_ID,
          URL_FOTO
        FROM FOTO_EQUIPO
        WHERE IDFOTO = @idFoto
          AND IDEQUIPO = @idEquipo
          AND ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async eliminarFoto(idEquipo, idFoto) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idEquipo", sql.Int, idEquipo)
      .input("idFoto", sql.Int, idFoto)
      .query(`
        UPDATE FOTO_EQUIPO
        SET ESTADO = 0
        WHERE IDFOTO = @idFoto
          AND IDEQUIPO = @idEquipo
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }

  static async obtenerMarcas() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT IDMARCA, NOMBRE
      FROM MARCA
      WHERE ESTADO = 1
      ORDER BY NOMBRE
    `);

    return result.recordset;
  }

  static async obtenerModelosPorMarca(idMarca) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idMarca", sql.Int, idMarca)
      .query(`
        SELECT IDMODELO, IDMARCA, NOMBRE
        FROM MODELO
        WHERE IDMARCA = @idMarca
          AND ESTADO = 1
        ORDER BY NOMBRE
      `);

    return result.recordset;
  }
  static async obtenerPorImei(imei) {
    if (!imei) return null;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("imei", sql.VarChar(20), imei)
      .query(`
        SELECT IDEQUIPO
        FROM EQUIPO
        WHERE IMEI = @imei
          AND ESTADO = 1
      `);

    return result.recordset[0] || null;
  }
}

module.exports = EquipoModel;