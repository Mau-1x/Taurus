const { sql, getConnection } = require("../config/database");

class UsuarioModel {
  static async obtenerTodos() {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      SELECT
        u.IDUSUARIO,
        u.IDROL,
        u.NOMBRE,
        u.CORREO,
        u.FECHA_REGISTRO,
        u.ULTIMO_ACCESO,
        u.ESTADO,
        r.NOMBRE AS ROL
      FROM USUARIO u
      INNER JOIN ROL r
        ON u.IDROL = r.IDROL
      ORDER BY u.IDUSUARIO DESC
    `);

    return resultado.recordset;
  }

  static async obtenerRoles() {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      SELECT IDROL, NOMBRE
      FROM ROL
      WHERE ESTADO = 1
      ORDER BY NOMBRE
    `);

    return resultado.recordset;
  }

  static async buscarPorCorreo(correo) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("correo", sql.VarChar(150), correo)
      .query(`
        SELECT IDUSUARIO
        FROM USUARIO
        WHERE CORREO = @correo
      `);

    return resultado.recordset[0] || null;
  }

  static async rolExiste(idRol) {
  const pool = await getConnection();

  const resultado = await pool
    .request()
    .input("idRol", sql.Int, idRol)
    .query(`
      SELECT IDROL
      FROM ROL
      WHERE IDROL = @idRol
        AND ESTADO = 1
    `);

  return resultado.recordset.length > 0;
}

  static async obtenerPorId(idUsuario) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .query(`
        SELECT
          u.IDUSUARIO,
          u.IDROL,
          u.NOMBRE,
          u.CORREO,
          u.ESTADO,
          r.NOMBRE AS ROL
        FROM USUARIO u
        INNER JOIN ROL r
          ON u.IDROL = r.IDROL
        WHERE u.IDUSUARIO = @idUsuario
      `);

    return resultado.recordset[0] || null;
  }

  static async crear(datos) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idRol", sql.Int, datos.idRol)
      .input("nombre", sql.VarChar(120), datos.nombre)
      .input("correo", sql.VarChar(150), datos.correo)
      .input("passwordHash", sql.VarChar(255), datos.passwordHash)
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
      idUsuario: resultado.recordset[0].IDUSUARIO,
    };
  }

  static async actualizar(idUsuario, datos) {
    const pool = await getConnection();

    const request = pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .input("idRol", sql.Int, datos.idRol)
      .input("nombre", sql.VarChar(120), datos.nombre)
      .input("correo", sql.VarChar(150), datos.correo);

    let consulta = `
      UPDATE USUARIO
      SET
        IDROL = @idRol,
        NOMBRE = @nombre,
        CORREO = @correo
    `;

    if (datos.passwordHash) {
      request.input(
        "passwordHash",
        sql.VarChar(255),
        datos.passwordHash
      );

      consulta += `,
        PASSWORD_HASH = @passwordHash
      `;
    }

    consulta += `
      WHERE IDUSUARIO = @idUsuario
    `;

    const resultado = await request.query(consulta);

    return resultado.rowsAffected[0] > 0;
  }

  static async cambiarEstado(idUsuario, estado) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idUsuario", sql.Int, idUsuario)
      .input("estado", sql.Bit, estado)
      .query(`
        UPDATE USUARIO
        SET ESTADO = @estado
        WHERE IDUSUARIO = @idUsuario
      `);

    return resultado.rowsAffected[0] > 0;
  }
}

module.exports = UsuarioModel;