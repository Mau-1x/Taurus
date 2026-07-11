const { sql, getConnection } = require("../config/database");

class ClienteModel {
  static async obtenerTodos() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        c.IDCLIENTE,
        p.IDPERSONA,
        p.DNI,
        p.NOMBRES,
        p.APELLIDO_PATERNO,
        p.APELLIDO_MATERNO,
        p.CELULAR,
        p.EMAIL,
        p.DIRECCION,
        c.FECHA_REGISTRO,
        c.ESTADO
      FROM CLIENTE c
      INNER JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA
      WHERE c.ESTADO = 1
      ORDER BY c.IDCLIENTE DESC
    `);

    return result.recordset;
  }

  static async crear(datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const requestPersona = new sql.Request(transaction);

      requestPersona.input("dni", sql.VarChar(8), datos.dni);
      requestPersona.input("nombres", sql.VarChar(100), datos.nombres);
      requestPersona.input(
        "apellidoPaterno",
        sql.VarChar(100),
        datos.apellidoPaterno
      );
      requestPersona.input(
        "apellidoMaterno",
        sql.VarChar(100),
        datos.apellidoMaterno || null
      );
      requestPersona.input("celular", sql.VarChar(20), datos.celular);
      requestPersona.input("email", sql.VarChar(100), datos.email || null);
      requestPersona.input(
        "direccion",
        sql.VarChar(200),
        datos.direccion || null
      );

      const personaResult = await requestPersona.query(`
        INSERT INTO PERSONA (
          DNI,
          NOMBRES,
          APELLIDO_PATERNO,
          APELLIDO_MATERNO,
          CELULAR,
          EMAIL,
          DIRECCION
        )
        OUTPUT INSERTED.IDPERSONA
        VALUES (
          @dni,
          @nombres,
          @apellidoPaterno,
          @apellidoMaterno,
          @celular,
          @email,
          @direccion
        )
      `);

      const idPersona = personaResult.recordset[0].IDPERSONA;

      const requestCliente = new sql.Request(transaction);
      requestCliente.input("idPersona", sql.Int, idPersona);

      const clienteResult = await requestCliente.query(`
        INSERT INTO CLIENTE (IDPERSONA)
        OUTPUT INSERTED.IDCLIENTE
        VALUES (@idPersona)
      `);

      await transaction.commit();

      return {
        idCliente: clienteResult.recordset[0].IDCLIENTE,
        idPersona,
      };
    } catch (error) {
      if (transaction._aborted === false) {
        await transaction.rollback();
      }

      throw error;
    }
  }
  static async actualizar(idCliente, datos) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestBuscar = new sql.Request(transaction);
    requestBuscar.input("idCliente", sql.Int, idCliente);

    const clienteResult = await requestBuscar.query(`
      SELECT IDPERSONA
      FROM CLIENTE
      WHERE IDCLIENTE = @idCliente
        AND ESTADO = 1
    `);

    if (clienteResult.recordset.length === 0) {
      await transaction.rollback();
      return null;
    }

    const idPersona = clienteResult.recordset[0].IDPERSONA;

    const requestActualizar = new sql.Request(transaction);

    requestActualizar.input("idPersona", sql.Int, idPersona);
    requestActualizar.input("dni", sql.VarChar(8), datos.dni);
    requestActualizar.input("nombres", sql.VarChar(100), datos.nombres);
    requestActualizar.input(
      "apellidoPaterno",
      sql.VarChar(100),
      datos.apellidoPaterno
    );
    requestActualizar.input(
      "apellidoMaterno",
      sql.VarChar(100),
      datos.apellidoMaterno || null
    );
    requestActualizar.input("celular", sql.VarChar(20), datos.celular);
    requestActualizar.input("email", sql.VarChar(100), datos.email || null);
    requestActualizar.input(
      "direccion",
      sql.VarChar(200),
      datos.direccion || null
    );

    await requestActualizar.query(`
      UPDATE PERSONA
      SET
        DNI = @dni,
        NOMBRES = @nombres,
        APELLIDO_PATERNO = @apellidoPaterno,
        APELLIDO_MATERNO = @apellidoMaterno,
        CELULAR = @celular,
        EMAIL = @email,
        DIRECCION = @direccion
      WHERE IDPERSONA = @idPersona
    `);

    await transaction.commit();

    return {
      idCliente,
      idPersona,
    };
  } catch (error) {
    if (transaction._aborted === false) {
      await transaction.rollback();
    }

    throw error;
  }
}
static async obtenerPorId(idCliente) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("idCliente", sql.Int, idCliente)
    .query(`
      SELECT
        c.IDCLIENTE,
        p.IDPERSONA,
        p.DNI,
        p.NOMBRES,
        p.APELLIDO_PATERNO,
        p.APELLIDO_MATERNO,
        p.CELULAR,
        p.EMAIL,
        p.DIRECCION,
        c.FECHA_REGISTRO,
        c.ESTADO
      FROM CLIENTE c
      INNER JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA
      WHERE c.IDCLIENTE = @idCliente
        AND c.ESTADO = 1
    `);

  return result.recordset[0] || null;
}

static async obtenerPorDni(dni) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("dni", sql.VarChar(8), dni)
    .query(`
      SELECT
        c.IDCLIENTE,
        p.IDPERSONA,
        p.DNI,
        p.NOMBRES,
        p.APELLIDO_PATERNO,
        p.APELLIDO_MATERNO,
        p.CELULAR,
        p.EMAIL,
        p.DIRECCION,
        c.FECHA_REGISTRO,
        c.ESTADO
      FROM CLIENTE c
      INNER JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA
      WHERE p.DNI = @dni
        AND c.ESTADO = 1
    `);

  return result.recordset[0] || null;
}

static async eliminar(idCliente) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestBuscar = new sql.Request(transaction);
    requestBuscar.input("idCliente", sql.Int, idCliente);

    const clienteResult = await requestBuscar.query(`
      SELECT IDPERSONA
      FROM CLIENTE
      WHERE IDCLIENTE = @idCliente
        AND ESTADO = 1
    `);

    if (clienteResult.recordset.length === 0) {
      await transaction.rollback();
      return false;
    }

    const idPersona = clienteResult.recordset[0].IDPERSONA;

    const requestEliminarCliente = new sql.Request(transaction);
    requestEliminarCliente.input("idCliente", sql.Int, idCliente);

    await requestEliminarCliente.query(`
      UPDATE CLIENTE
      SET ESTADO = 0
      WHERE IDCLIENTE = @idCliente
    `);

    const requestEliminarPersona = new sql.Request(transaction);
    requestEliminarPersona.input("idPersona", sql.Int, idPersona);

    await requestEliminarPersona.query(`
      UPDATE PERSONA
      SET ESTADO = 0
      WHERE IDPERSONA = @idPersona
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
}

module.exports = ClienteModel;