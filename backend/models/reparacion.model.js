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
        p.CELULAR,
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
          p.CELULAR,
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

  static async obtenerSeguimientosPorDni(dni) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "dni",
        sql.VarChar(8),
        dni
      )
      .query(`
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          r.FALLA_REPORTADA,
          r.DIAGNOSTICO,
          r.SOLUCION,
          r.COSTO_ESTIMADO,
          r.COSTO_FINAL,
          r.FECHA_INGRESO,
          r.FECHA_ESTIMADA,
          r.FECHA_ENTREGA,
          r.GARANTIA_DIAS,
          er.NOMBRE AS ESTADO_REPARACION,
          er.ORDEN AS ORDEN_ESTADO,

          (
            SELECT MAX(ORDEN)
            FROM ESTADO_REPARACION
            WHERE ESTADO = 1
          ) AS TOTAL_ESTADOS,

          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,

          CAST(
            COALESCE(
              r.COSTO_FINAL,
              r.COSTO_ESTIMADO,
              0
            )
            AS DECIMAL(10, 2)
          ) AS TOTAL_REPARACION,

          CAST(
            COALESCE(
              pagos.TOTAL_PAGADO,
              0
            )
            AS DECIMAL(10, 2)
          ) AS TOTAL_PAGADO,

          CAST(
            CASE
              WHEN
                COALESCE(
                  pagos.TOTAL_PAGADO,
                  0
                ) >=
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                THEN 0
              ELSE
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                -
                COALESCE(
                  pagos.TOTAL_PAGADO,
                  0
                )
            END
            AS DECIMAL(10, 2)
          ) AS SALDO_PENDIENTE,

          CASE
            WHEN
              COALESCE(
                r.COSTO_FINAL,
                r.COSTO_ESTIMADO,
                0
              ) <= 0
              THEN 'SIN COSTO'

            WHEN
              COALESCE(
                pagos.TOTAL_PAGADO,
                0
              ) = 0
              THEN 'PENDIENTE'

            WHEN
              COALESCE(
                pagos.TOTAL_PAGADO,
                0
              ) <
              COALESCE(
                r.COSTO_FINAL,
                r.COSTO_ESTIMADO,
                0
              )
              THEN 'PARCIAL'

            ELSE 'PAGADO'
          END AS ESTADO_PAGO

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

        OUTER APPLY (
          SELECT
            SUM(pr.MONTO) AS TOTAL_PAGADO
          FROM PAGO_REPARACION pr
          WHERE
            pr.IDREPARACION =
              r.IDREPARACION
            AND pr.ESTADO = 1
        ) pagos

        WHERE
          p.DNI = @dni
          AND r.ESTADO = 1

        ORDER BY
          r.FECHA_INGRESO DESC,
          r.IDREPARACION DESC
      `);

    return result.recordset;
  }

  static async obtenerHistorialPublico(
    idReparacion
  ) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idReparacion",
        sql.Int,
        idReparacion
      )
      .query(`
        SELECT
          h.IDESTADO,
          er.NOMBRE AS ESTADO,
          er.ORDEN,
          h.FECHA
        FROM HISTORIAL_REPARACION h
        INNER JOIN ESTADO_REPARACION er
          ON h.IDESTADO = er.IDESTADO
        WHERE
          h.IDREPARACION = @idReparacion
        ORDER BY h.FECHA ASC
      `);

    return result.recordset;
  }

  static async obtenerRepuestosPublicos(
    idReparacion
  ) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idReparacion",
        sql.Int,
        idReparacion
      )
      .query(`
        SELECT
          p.NOMBRE AS PRODUCTO,
          drp.CANTIDAD
        FROM DETALLE_REPARACION_PRODUCTO drp
        INNER JOIN PRODUCTO p
          ON drp.IDPRODUCTO =
            p.IDPRODUCTO
        WHERE
          drp.IDREPARACION =
            @idReparacion
          AND drp.ESTADO = 1
        ORDER BY
          drp.FECHA_REGISTRO ASC
      `);

    return result.recordset;
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

  static async obtenerRepuestos(idReparacion) {
  const pool = await getConnection();

  const resultado = await pool
    .request()
    .input("idReparacion", sql.Int, idReparacion)
    .query(`
      SELECT
        drp.IDDETALLE_REPARACION_PRODUCTO,
        drp.IDREPARACION,
        drp.IDPRODUCTO,
        p.CODIGO,
        p.NOMBRE AS PRODUCTO,
        drp.CANTIDAD,
        drp.PRECIO_UNITARIO,
        CAST(
          drp.CANTIDAD * drp.PRECIO_UNITARIO
          AS DECIMAL(10,2)
        ) AS SUBTOTAL,
        drp.FECHA_REGISTRO
      FROM DETALLE_REPARACION_PRODUCTO drp
      INNER JOIN PRODUCTO p
        ON drp.IDPRODUCTO = p.IDPRODUCTO
      WHERE drp.IDREPARACION = @idReparacion
        AND drp.ESTADO = 1
      ORDER BY drp.FECHA_REGISTRO DESC
    `);

  return resultado.recordset;
}

static async agregarRepuesto(
  idReparacion,
  idProducto,
  cantidad
) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(
      sql.ISOLATION_LEVEL.SERIALIZABLE
    );

    const reparacionResult = await new sql.Request(
      transaction
    )
      .input("idReparacion", sql.Int, idReparacion)
      .query(`
        SELECT IDREPARACION, CODIGO
        FROM REPARACION WITH (UPDLOCK, HOLDLOCK)
        WHERE IDREPARACION = @idReparacion
          AND ESTADO = 1
      `);

    if (reparacionResult.recordset.length === 0) {
      const error = new Error(
        "La reparación no existe"
      );
      error.statusCode = 404;
      throw error;
    }

    const productoResult = await new sql.Request(
      transaction
    )
      .input("idProducto", sql.Int, idProducto)
      .query(`
        SELECT
          IDPRODUCTO,
          NOMBRE,
          PRECIO_VENTA,
          STOCK
        FROM PRODUCTO WITH (UPDLOCK, HOLDLOCK)
        WHERE IDPRODUCTO = @idProducto
          AND ESTADO = 1
      `);

    if (productoResult.recordset.length === 0) {
      const error = new Error(
        "El producto no existe o está inactivo"
      );
      error.statusCode = 404;
      throw error;
    }

    const producto = productoResult.recordset[0];

    if (producto.STOCK < cantidad) {
      const error = new Error(
        `Stock insuficiente. Disponible: ${producto.STOCK}`
      );
      error.statusCode = 400;
      throw error;
    }

    const stockAnterior = producto.STOCK;
    const stockNuevo = stockAnterior - cantidad;

    const detalleResult = await new sql.Request(
      transaction
    )
      .input("idReparacion", sql.Int, idReparacion)
      .input("idProducto", sql.Int, idProducto)
      .query(`
        SELECT
          IDDETALLE_REPARACION_PRODUCTO,
          CANTIDAD,
          ESTADO
        FROM DETALLE_REPARACION_PRODUCTO
          WITH (UPDLOCK, HOLDLOCK)
        WHERE IDREPARACION = @idReparacion
          AND IDPRODUCTO = @idProducto
      `);

    if (detalleResult.recordset.length > 0) {
      await new sql.Request(transaction)
        .input("idReparacion", sql.Int, idReparacion)
        .input("idProducto", sql.Int, idProducto)
        .input("cantidad", sql.Int, cantidad)
        .input(
          "precioUnitario",
          sql.Decimal(10, 2),
          producto.PRECIO_VENTA
        )
        .query(`
          UPDATE DETALLE_REPARACION_PRODUCTO
          SET
            CANTIDAD =
              CASE
                WHEN ESTADO = 1
                  THEN CANTIDAD + @cantidad
                ELSE @cantidad
              END,
            PRECIO_UNITARIO = @precioUnitario,
            FECHA_REGISTRO = SYSDATETIME(),
            ESTADO = 1
          WHERE IDREPARACION = @idReparacion
            AND IDPRODUCTO = @idProducto
        `);
    } else {
      await new sql.Request(transaction)
        .input("idReparacion", sql.Int, idReparacion)
        .input("idProducto", sql.Int, idProducto)
        .input("cantidad", sql.Int, cantidad)
        .input(
          "precioUnitario",
          sql.Decimal(10, 2),
          producto.PRECIO_VENTA
        )
        .query(`
          INSERT INTO DETALLE_REPARACION_PRODUCTO (
            IDREPARACION,
            IDPRODUCTO,
            CANTIDAD,
            PRECIO_UNITARIO
          )
          VALUES (
            @idReparacion,
            @idProducto,
            @cantidad,
            @precioUnitario
          )
        `);
    }

    await new sql.Request(transaction)
      .input("idProducto", sql.Int, idProducto)
      .input("stockNuevo", sql.Int, stockNuevo)
      .query(`
        UPDATE PRODUCTO
        SET STOCK = @stockNuevo
        WHERE IDPRODUCTO = @idProducto
      `);

    await new sql.Request(transaction)
      .input("idProducto", sql.Int, idProducto)
      .input("cantidad", sql.Int, cantidad)
      .input("stockAnterior", sql.Int, stockAnterior)
      .input("stockNuevo", sql.Int, stockNuevo)
      .input(
        "motivo",
        sql.VarChar(300),
        `Repuesto usado en reparación ${
          reparacionResult.recordset[0].CODIGO
        }`
      )
      .query(`
        INSERT INTO MOVIMIENTO_INVENTARIO (
          IDPRODUCTO,
          TIPO,
          CANTIDAD,
          STOCK_ANTERIOR,
          STOCK_NUEVO,
          MOTIVO
        )
        VALUES (
          @idProducto,
          'SALIDA',
          @cantidad,
          @stockAnterior,
          @stockNuevo,
          @motivo
        )
      `);

    await transaction.commit();

    return {
      idProducto,
      producto: producto.NOMBRE,
      cantidad,
      stockAnterior,
      stockNuevo,
    };
  } catch (error) {
    if (transaction._aborted === false) {
      await transaction.rollback();
    }

    throw error;
  }
}

  static async quitarRepuesto(
    idReparacion,
    idProducto
  ) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin(
        sql.ISOLATION_LEVEL.SERIALIZABLE
      );

      const detalleResult = await new sql.Request(
        transaction
      )
        .input("idReparacion", sql.Int, idReparacion)
        .input("idProducto", sql.Int, idProducto)
        .query(`
          SELECT
            drp.CANTIDAD,
            r.CODIGO
          FROM DETALLE_REPARACION_PRODUCTO drp
          INNER JOIN REPARACION r
            ON drp.IDREPARACION = r.IDREPARACION
          WHERE drp.IDREPARACION = @idReparacion
            AND drp.IDPRODUCTO = @idProducto
            AND drp.ESTADO = 1
        `);

      if (detalleResult.recordset.length === 0) {
        const error = new Error(
          "El repuesto no está registrado en la reparación"
        );
        error.statusCode = 404;
        throw error;
      }

      const detalle = detalleResult.recordset[0];

      const productoResult = await new sql.Request(
        transaction
      )
        .input("idProducto", sql.Int, idProducto)
        .query(`
          SELECT STOCK
          FROM PRODUCTO WITH (UPDLOCK, HOLDLOCK)
          WHERE IDPRODUCTO = @idProducto
        `);

      if (productoResult.recordset.length === 0) {
        const error = new Error(
          "Producto no encontrado"
        );
        error.statusCode = 404;
        throw error;
      }

      const stockAnterior =
        productoResult.recordset[0].STOCK;

      const stockNuevo =
        stockAnterior + detalle.CANTIDAD;

      await new sql.Request(transaction)
        .input("idReparacion", sql.Int, idReparacion)
        .input("idProducto", sql.Int, idProducto)
        .query(`
          UPDATE DETALLE_REPARACION_PRODUCTO
          SET ESTADO = 0
          WHERE IDREPARACION = @idReparacion
            AND IDPRODUCTO = @idProducto
        `);

      await new sql.Request(transaction)
        .input("idProducto", sql.Int, idProducto)
        .input("stockNuevo", sql.Int, stockNuevo)
        .query(`
          UPDATE PRODUCTO
          SET STOCK = @stockNuevo
          WHERE IDPRODUCTO = @idProducto
        `);

      await new sql.Request(transaction)
        .input("idProducto", sql.Int, idProducto)
        .input("cantidad", sql.Int, detalle.CANTIDAD)
        .input("stockAnterior", sql.Int, stockAnterior)
        .input("stockNuevo", sql.Int, stockNuevo)
        .input(
          "motivo",
          sql.VarChar(300),
          `Repuesto retirado de reparación ${detalle.CODIGO}`
        )
        .query(`
          INSERT INTO MOVIMIENTO_INVENTARIO (
            IDPRODUCTO,
            TIPO,
            CANTIDAD,
            STOCK_ANTERIOR,
            STOCK_NUEVO,
            MOTIVO
          )
          VALUES (
            @idProducto,
            'ENTRADA',
            @cantidad,
            @stockAnterior,
            @stockNuevo,
            @motivo
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

    static async obtenerPagos(idReparacion) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .query(`
        SELECT
          pr.IDPAGO,
          pr.IDREPARACION,
          pr.IDUSUARIO,
          pr.MONTO,
          pr.METODO_PAGO,
          pr.OBSERVACIONES,
          pr.FECHA_PAGO,
          u.NOMBRE AS USUARIO
        FROM PAGO_REPARACION pr
        INNER JOIN USUARIO u
          ON pr.IDUSUARIO = u.IDUSUARIO
        WHERE pr.IDREPARACION = @idReparacion
          AND pr.ESTADO = 1
        ORDER BY pr.FECHA_PAGO DESC,
                pr.IDPAGO DESC
      `);

    return resultado.recordset;
  }

  static async obtenerResumenPagos(idReparacion) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .query(`
        SELECT
          r.IDREPARACION,
          r.CODIGO,
          CAST(
            COALESCE(
              r.COSTO_FINAL,
              r.COSTO_ESTIMADO,
              0
            )
            AS DECIMAL(10,2)
          ) AS TOTAL_REPARACION,

          CAST(
            COALESCE(
              SUM(
                CASE
                  WHEN pr.ESTADO = 1
                    THEN pr.MONTO
                  ELSE 0
                END
              ),
              0
            )
            AS DECIMAL(10,2)
          ) AS TOTAL_PAGADO,

          CAST(
            CASE
              WHEN
                COALESCE(
                  SUM(
                    CASE
                      WHEN pr.ESTADO = 1
                        THEN pr.MONTO
                      ELSE 0
                    END
                  ),
                  0
                ) >=
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                THEN 0
              ELSE
                COALESCE(
                  r.COSTO_FINAL,
                  r.COSTO_ESTIMADO,
                  0
                )
                -
                COALESCE(
                  SUM(
                    CASE
                      WHEN pr.ESTADO = 1
                        THEN pr.MONTO
                      ELSE 0
                    END
                  ),
                  0
                )
            END
            AS DECIMAL(10,2)
          ) AS SALDO_PENDIENTE,

          CASE
            WHEN
              COALESCE(
                r.COSTO_FINAL,
                r.COSTO_ESTIMADO,
                0
              ) <= 0
              THEN 'SIN COSTO'

            WHEN
              COALESCE(
                SUM(
                  CASE
                    WHEN pr.ESTADO = 1
                      THEN pr.MONTO
                    ELSE 0
                  END
                ),
                0
              ) = 0
              THEN 'PENDIENTE'

            WHEN
              COALESCE(
                SUM(
                  CASE
                    WHEN pr.ESTADO = 1
                      THEN pr.MONTO
                    ELSE 0
                  END
                ),
                0
              ) <
              COALESCE(
                r.COSTO_FINAL,
                r.COSTO_ESTIMADO,
                0
              )
              THEN 'PARCIAL'

            ELSE 'PAGADO'
          END AS ESTADO_PAGO
        FROM REPARACION r
        LEFT JOIN PAGO_REPARACION pr
          ON r.IDREPARACION = pr.IDREPARACION
        WHERE r.IDREPARACION = @idReparacion
          AND r.ESTADO = 1
        GROUP BY
          r.IDREPARACION,
          r.CODIGO,
          r.COSTO_FINAL,
          r.COSTO_ESTIMADO
      `);

    return resultado.recordset[0] || null;
  }

  static async registrarPago(
    idReparacion,
    idUsuario,
    datos
  ) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin(
        sql.ISOLATION_LEVEL.SERIALIZABLE
      );

      const reparacionResult = await new sql.Request(
        transaction
      )
        .input("idReparacion", sql.Int, idReparacion)
        .query(`
          SELECT
            IDREPARACION,
            CODIGO,
            COALESCE(
              COSTO_FINAL,
              COSTO_ESTIMADO,
              0
            ) AS TOTAL_REPARACION
          FROM REPARACION WITH (UPDLOCK, HOLDLOCK)
          WHERE IDREPARACION = @idReparacion
            AND ESTADO = 1
        `);

      if (reparacionResult.recordset.length === 0) {
        const error = new Error(
          "La reparación no existe"
        );
        error.statusCode = 404;
        throw error;
      }

      const reparacion =
        reparacionResult.recordset[0];

      const totalReparacion = Number(
        reparacion.TOTAL_REPARACION
      );

      if (totalReparacion <= 0) {
        const error = new Error(
          "Primero debes registrar el costo de la reparación"
        );
        error.statusCode = 400;
        throw error;
      }

      const pagosResult = await new sql.Request(
        transaction
      )
        .input("idReparacion", sql.Int, idReparacion)
        .query(`
          SELECT
            COALESCE(SUM(MONTO), 0) AS TOTAL_PAGADO
          FROM PAGO_REPARACION WITH (UPDLOCK, HOLDLOCK)
          WHERE IDREPARACION = @idReparacion
            AND ESTADO = 1
        `);

      const totalPagado = Number(
        pagosResult.recordset[0].TOTAL_PAGADO
      );

      const saldoPendiente =
        totalReparacion - totalPagado;

      if (datos.monto > saldoPendiente) {
        const error = new Error(
          `El pago supera el saldo pendiente de S/ ${saldoPendiente.toFixed(
            2
          )}`
        );
        error.statusCode = 400;
        throw error;
      }

      const pagoResult = await new sql.Request(
        transaction
      )
        .input("idReparacion", sql.Int, idReparacion)
        .input("idUsuario", sql.Int, idUsuario)
        .input(
          "monto",
          sql.Decimal(10, 2),
          datos.monto
        )
        .input(
          "metodoPago",
          sql.VarChar(20),
          datos.metodoPago
        )
        .input(
          "observaciones",
          sql.VarChar(300),
          datos.observaciones || null
        )
        .query(`
          INSERT INTO PAGO_REPARACION (
            IDREPARACION,
            IDUSUARIO,
            MONTO,
            METODO_PAGO,
            OBSERVACIONES
          )
          OUTPUT
            INSERTED.IDPAGO,
            INSERTED.MONTO,
            INSERTED.FECHA_PAGO
          VALUES (
            @idReparacion,
            @idUsuario,
            @monto,
            @metodoPago,
            @observaciones
          )
        `);

      await transaction.commit();

      return pagoResult.recordset[0];
    } catch (error) {
      if (transaction._aborted === false) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  static async anularPago(
    idReparacion,
    idPago
  ) {
    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("idReparacion", sql.Int, idReparacion)
      .input("idPago", sql.Int, idPago)
      .query(`
        UPDATE PAGO_REPARACION
        SET ESTADO = 0
        WHERE IDPAGO = @idPago
          AND IDREPARACION = @idReparacion
          AND ESTADO = 1
      `);

    return resultado.rowsAffected[0] > 0;
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