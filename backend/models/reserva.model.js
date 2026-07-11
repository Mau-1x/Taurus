const { sql, getConnection } = require("../config/database");

function convertirHora(hora) {
  if (!hora || !/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) {
    throw new Error("La hora ingresada no es válida");
  }

  const [horas, minutos, segundos = "0"] = hora.split(":");

  return new Date(
    Date.UTC(
      1970,
      0,
      1,
      Number(horas),
      Number(minutos),
      Number(segundos),
      0
    )
  );
}

class ReservaModel {
  static async obtenerTodas() {
  const pool = await getConnection();

  const resultado = await pool.request().query(`
      SELECT
        r.IDRESERVA,
        r.IDCLIENTE,
        r.NOMBRE_CLIENTE,
        r.CELULAR,
        r.CORREO,
        r.SERVICIO,
        r.DESCRIPCION,
        r.FECHA_RESERVA,
        CONVERT(VARCHAR(5), r.HORA_RESERVA, 108) AS HORA_RESERVA,
        r.OBSERVACIONES,
        r.ESTADO
      FROM RESERVA r
      ORDER BY r.IDRESERVA DESC
    `);

    return resultado.recordset;
  }

  static async obtenerPorId(idReserva) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReserva", sql.Int, idReserva)
      .query(`
        SELECT *
        FROM RESERVA
        WHERE IDRESERVA = @idReserva
      `);

    return result.recordset[0] || null;
  }

  static async crear(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idCliente", sql.Int, datos.idCliente || null)
      .input("nombreCliente", sql.VarChar(150), datos.nombreCliente)
      .input("celular", sql.VarChar(20), datos.celular)
      .input("correo", sql.VarChar(150), datos.correo || null)
      .input("servicio", sql.VarChar(150), datos.servicio)
      .input(
        "descripcion",
        sql.VarChar(500),
        datos.descripcion || null
      )
      .input("fechaReserva", sql.Date, datos.fechaReserva)
      .input(
        "horaReserva",
        sql.Time,
        convertirHora(datos.horaReserva)
        )
      .input(
        "observaciones",
        sql.VarChar(500),
        datos.observaciones || null
      )
      .query(`
        INSERT INTO RESERVA (
          IDCLIENTE,
          NOMBRE_CLIENTE,
          CELULAR,
          CORREO,
          SERVICIO,
          DESCRIPCION,
          FECHA_RESERVA,
          HORA_RESERVA,
          OBSERVACIONES
        )
        OUTPUT INSERTED.IDRESERVA
        VALUES (
          @idCliente,
          @nombreCliente,
          @celular,
          @correo,
          @servicio,
          @descripcion,
          @fechaReserva,
          @horaReserva,
          @observaciones
        )
      `);

    return {
      idReserva: result.recordset[0].IDRESERVA,
    };
  }

  static async actualizar(idReserva, datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReserva", sql.Int, idReserva)
      .input("idCliente", sql.Int, datos.idCliente || null)
      .input("nombreCliente", sql.VarChar(150), datos.nombreCliente)
      .input("celular", sql.VarChar(20), datos.celular)
      .input("correo", sql.VarChar(150), datos.correo || null)
      .input("servicio", sql.VarChar(150), datos.servicio)
      .input(
        "descripcion",
        sql.VarChar(500),
        datos.descripcion || null
      )
      .input("fechaReserva", sql.Date, datos.fechaReserva)
        .input(
        "horaReserva",
        sql.Time,
        convertirHora(datos.horaReserva)
        )
      .input(
        "observaciones",
        sql.VarChar(500),
        datos.observaciones || null
      )
      .query(`
        UPDATE RESERVA
        SET
          IDCLIENTE = @idCliente,
          NOMBRE_CLIENTE = @nombreCliente,
          CELULAR = @celular,
          CORREO = @correo,
          SERVICIO = @servicio,
          DESCRIPCION = @descripcion,
          FECHA_RESERVA = @fechaReserva,
          HORA_RESERVA = @horaReserva,
          OBSERVACIONES = @observaciones
        WHERE IDRESERVA = @idReserva
      `);

    return result.rowsAffected[0] > 0;
  }

  static async cambiarEstado(idReserva, estado) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReserva", sql.Int, idReserva)
      .input("estado", sql.VarChar(20), estado)
      .query(`
        UPDATE RESERVA
        SET ESTADO = @estado
        WHERE IDRESERVA = @idReserva
      `);

    return result.rowsAffected[0] > 0;
  }

  static async eliminar(idReserva) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idReserva", sql.Int, idReserva)
      .query(`
        DELETE FROM RESERVA
        WHERE IDRESERVA = @idReserva
      `);

    return result.rowsAffected[0] > 0;
  }
}

module.exports = ReservaModel;