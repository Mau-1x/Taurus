const {
  sql,
  getConnection,
} = require("../config/database");

class GaleriaPublicaModel {
  static async obtenerFotos(limite) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input(
        "limite",
        sql.Int,
        limite
      )
      .query(`
        SELECT TOP (@limite)
          rf.IDFOTO,
          rf.TIPO,
          rf.URL,
          rf.DESCRIPCION,
          rf.FECHA_REGISTRO,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO
        FROM REPARACION_FOTO rf
        INNER JOIN REPARACION r
          ON rf.IDREPARACION =
            r.IDREPARACION
        INNER JOIN EQUIPO e
          ON r.IDEQUIPO =
            e.IDEQUIPO
        INNER JOIN MODELO mo
          ON e.IDMODELO =
            mo.IDMODELO
        INNER JOIN MARCA ma
          ON mo.IDMARCA =
            ma.IDMARCA
        WHERE
          rf.VISIBLE_CLIENTE = 1
          AND rf.ESTADO = 1
          AND r.ESTADO = 1
          AND e.ESTADO = 1
        ORDER BY
          CASE rf.TIPO
            WHEN 'DESPUES' THEN 1
            WHEN 'DIAGNOSTICO' THEN 2
            WHEN 'ANTES' THEN 3
            ELSE 4
          END,
          rf.FECHA_REGISTRO DESC,
          rf.IDFOTO DESC
      `);

    return resultado.recordset;
  }
}

module.exports = GaleriaPublicaModel;
