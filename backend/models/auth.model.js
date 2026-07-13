const { sql, getConnection } = require("../config/database");

class AuthModel {
  static async buscarPorCorreo(correo) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("correo", sql.VarChar(150), correo)
      .query(`
        SELECT
          u.IDUSUARIO,
          u.IDROL,
          u.NOMBRE,
          u.CORREO,
          u.PASSWORD_HASH,
          u.ESTADO,
          r.NOMBRE AS ROL
        FROM USUARIO u
        INNER JOIN ROL r
          ON u.IDROL = r.IDROL
        WHERE u.CORREO = @correo
      `);

    return result.recordset[0] || null;
  }

  static async crearAdministrador(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idRol", sql.Int, 1)
      .input("nombre", sql.VarChar(120), datos.nombre)
      .input("correo", sql.VarChar(150), datos.correo)
      .input(
        "passwordHash",
        sql.VarChar(255),
        datos.passwordHash
      )
      .query(`
        INSERT INTO USUARIO (
          IDROL,
          NOMBRE,
          CORREO,
          PASSWORD_HASH
        )
        OUTPUT INSERTED.IDUSUARIO
        VALUES (
          @idRol,
          @nombre,
          @correo,
          @passwordHash
        )
      `);

    return {
      idUsuario: result.recordset[0].IDUSUARIO,
    };
  }

  static async actualizarUltimoAcceso(idUsuario) {
    const pool = await getConnection();

    await pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .query(`
        UPDATE USUARIO
        SET ULTIMO_ACCESO = SYSDATETIME()
        WHERE IDUSUARIO = @idUsuario
      `);
  }

  static async obtenerPorId(idUsuario) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .query(`
        SELECT
          u.IDUSUARIO,
          u.NOMBRE,
          u.CORREO,
          u.ESTADO,
          r.NOMBRE AS ROL
        FROM USUARIO u
        INNER JOIN ROL r
          ON u.IDROL = r.IDROL
        WHERE u.IDUSUARIO = @idUsuario
          AND u.ESTADO = 1
      `);

    return result.recordset[0] || null;
  }

  static async obtenerConPasswordPorId(idUsuario) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("idUsuario", sql.Int, idUsuario)
    .query(`
      SELECT
        IDUSUARIO,
        NOMBRE,
        CORREO,
        PASSWORD_HASH,
        ESTADO
      FROM USUARIO
      WHERE IDUSUARIO = @idUsuario
    `);

  return result.recordset[0] || null;
}

  static async actualizarPassword(
    idUsuario,
    passwordHash
  ) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .input(
        "passwordHash",
        sql.VarChar(255),
        passwordHash
      )
      .query(`
        UPDATE USUARIO
        SET PASSWORD_HASH = @passwordHash
        WHERE IDUSUARIO = @idUsuario
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }
}

module.exports = AuthModel;