const { getConnection } = require("../config/database");

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
        ) AS LISTOS_PARA_RECOGER
    `);

    return result.recordset[0];
  }

  static async obtenerReparacionesRecientes() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 5
        r.IDREPARACION,
        r.CODIGO,
        r.FECHA_INGRESO,
        er.NOMBRE AS ESTADO,
        ma.NOMBRE AS MARCA,
        mo.NOMBRE AS MODELO,
        CONCAT(
          p.NOMBRES, ' ',
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
      ORDER BY r.FECHA_INGRESO DESC
    `);

    return result.recordset;
  }
}

module.exports = DashboardModel;