const { sql, getConnection } = require("../config/database");

class ProductoModel {
  static async obtenerTodos(filtros = {}) {
    const pool = await getConnection();

    const idMarca = filtros.idMarca
      ? Number(filtros.idMarca)
      : null;

    const idModelo = filtros.idModelo
      ? Number(filtros.idModelo)
      : null;

    const result = await pool
      .request()
      .input("idMarca", sql.Int, idMarca)
      .input("idModelo", sql.Int, idModelo)
      .query(`
        SELECT
          p.IDPRODUCTO,
          p.IDCATEGORIA,
          p.IDMARCA,
          p.IDMODELO,
          p.CODIGO,
          p.NOMBRE,
          p.DESCRIPCION,
          p.PRECIO_COMPRA,
          p.PRECIO_VENTA,
          p.STOCK,
          p.STOCK_MINIMO,
          p.IMAGEN,
          p.FECHA_REGISTRO,
          p.ESTADO,
          c.NOMBRE AS CATEGORIA,
          ma.NOMBRE AS MARCA,
          mo.NOMBRE AS MODELO,

          cd.CONDICION,
          cd.RAM_GB,
          cd.ALMACENAMIENTO_GB,
          cd.COLOR,
          cd.LIBERADO,
          cd.BATERIA_PORCENTAJE,
          cd.GARANTIA_DIAS,

          (
            SELECT STRING_AGG(
              CAST(
                CONCAT(ma2.NOMBRE, ' ', mo2.NOMBRE)
                AS VARCHAR(MAX)
              ),
              ', '
            )
            FROM PRODUCTO_MODELO_COMPATIBLE pmc
            INNER JOIN MODELO mo2
              ON pmc.IDMODELO = mo2.IDMODELO
            INNER JOIN MARCA ma2
              ON mo2.IDMARCA = ma2.IDMARCA
            WHERE pmc.IDPRODUCTO = p.IDPRODUCTO
              AND pmc.ESTADO = 1
              AND mo2.ESTADO = 1
              AND ma2.ESTADO = 1
          ) AS MODELOS_COMPATIBLES,

          CASE
            WHEN p.STOCK = 0 THEN 'SIN STOCK'
            WHEN p.STOCK <= p.STOCK_MINIMO
              THEN 'STOCK BAJO'
            ELSE 'DISPONIBLE'
          END AS ESTADO_STOCK

        FROM PRODUCTO p
        INNER JOIN CATEGORIA c
          ON p.IDCATEGORIA = c.IDCATEGORIA
        LEFT JOIN MARCA ma
          ON p.IDMARCA = ma.IDMARCA
        LEFT JOIN MODELO mo
          ON p.IDMODELO = mo.IDMODELO
        LEFT JOIN CELULAR_DETALLE cd
          ON p.IDPRODUCTO = cd.IDPRODUCTO

        WHERE p.ESTADO = 1

          AND (
            @idMarca IS NULL
            OR p.IDMARCA = @idMarca
            OR EXISTS (
              SELECT 1
              FROM PRODUCTO_MODELO_COMPATIBLE pmcMarca
              INNER JOIN MODELO modeloMarca
                ON pmcMarca.IDMODELO =
                  modeloMarca.IDMODELO
              WHERE pmcMarca.IDPRODUCTO =
                    p.IDPRODUCTO
                AND pmcMarca.ESTADO = 1
                AND modeloMarca.IDMARCA = @idMarca
            )
          )

          AND (
            @idModelo IS NULL
            OR p.IDMODELO = @idModelo
            OR EXISTS (
              SELECT 1
              FROM PRODUCTO_MODELO_COMPATIBLE pmcModelo
              WHERE pmcModelo.IDPRODUCTO =
                    p.IDPRODUCTO
                AND pmcModelo.IDMODELO = @idModelo
                AND pmcModelo.ESTADO = 1
            )
          )

        ORDER BY p.IDPRODUCTO DESC
      `);

    return result.recordset;
  }

  static async obtenerCategorias() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT IDCATEGORIA, NOMBRE
      FROM CATEGORIA
      WHERE ESTADO = 1
      ORDER BY NOMBRE
    `);

    return result.recordset;
  }

  static async guardarDetalleCelular(
    transaction,
    idProducto,
    detalle
  ) {
    const request = new sql.Request(transaction);

    request.input("idProducto", sql.Int, idProducto);
    request.input(
      "condicion",
      sql.VarChar(20),
      detalle.condicion
    );
    request.input("ramGb", sql.Int, detalle.ramGb);
    request.input(
      "almacenamientoGb",
      sql.Int,
      detalle.almacenamientoGb
    );
    request.input(
      "color",
      sql.VarChar(50),
      detalle.color
    );
    request.input(
      "liberado",
      sql.Bit,
      detalle.liberado
    );
    request.input(
      "bateriaPorcentaje",
      sql.TinyInt,
      detalle.bateriaPorcentaje
    );
    request.input(
      "garantiaDias",
      sql.Int,
      detalle.garantiaDias
    );

    await request.query(`
      IF EXISTS (
        SELECT 1
        FROM CELULAR_DETALLE
        WHERE IDPRODUCTO = @idProducto
      )
      BEGIN
        UPDATE CELULAR_DETALLE
        SET
          CONDICION = @condicion,
          RAM_GB = @ramGb,
          ALMACENAMIENTO_GB = @almacenamientoGb,
          COLOR = @color,
          LIBERADO = @liberado,
          BATERIA_PORCENTAJE = @bateriaPorcentaje,
          GARANTIA_DIAS = @garantiaDias,
          FECHA_ACTUALIZACION = SYSDATETIME()
        WHERE IDPRODUCTO = @idProducto;
      END
      ELSE
      BEGIN
        INSERT INTO CELULAR_DETALLE (
          IDPRODUCTO,
          CONDICION,
          RAM_GB,
          ALMACENAMIENTO_GB,
          COLOR,
          LIBERADO,
          BATERIA_PORCENTAJE,
          GARANTIA_DIAS
        )
        VALUES (
          @idProducto,
          @condicion,
          @ramGb,
          @almacenamientoGb,
          @color,
          @liberado,
          @bateriaPorcentaje,
          @garantiaDias
        );
      END
    `);
  }

  static async crear(datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    let transaccionActiva = false;

    try {
      await transaction.begin();
      transaccionActiva = true;

      const request = new sql.Request(transaction);

      request.input(
        "idCategoria",
        sql.Int,
        datos.idCategoria
      );
      request.input(
        "idMarca",
        sql.Int,
        datos.idMarca ?? null
      );
      request.input(
        "idModelo",
        sql.Int,
        datos.idModelo ?? null
      );
      request.input(
        "codigo",
        sql.VarChar(30),
        datos.codigo
      );
      request.input(
        "nombre",
        sql.VarChar(150),
        datos.nombre
      );
      request.input(
        "descripcion",
        sql.VarChar(500),
        datos.descripcion ?? null
      );
      request.input(
        "precioCompra",
        sql.Decimal(10, 2),
        datos.precioCompra ?? 0
      );
      request.input(
        "precioVenta",
        sql.Decimal(10, 2),
        datos.precioVenta ?? 0
      );
      request.input(
        "stock",
        sql.Int,
        datos.stock ?? 0
      );
      request.input(
        "stockMinimo",
        sql.Int,
        datos.stockMinimo ?? 2
      );
      request.input(
        "imagen",
        sql.VarChar(500),
        datos.imagen ?? null
      );

      const result = await request.query(`
        INSERT INTO PRODUCTO (
          IDCATEGORIA,
          IDMARCA,
          IDMODELO,
          CODIGO,
          NOMBRE,
          DESCRIPCION,
          PRECIO_COMPRA,
          PRECIO_VENTA,
          STOCK,
          STOCK_MINIMO,
          IMAGEN
        )
        OUTPUT INSERTED.IDPRODUCTO
        VALUES (
          @idCategoria,
          @idMarca,
          @idModelo,
          @codigo,
          @nombre,
          @descripcion,
          @precioCompra,
          @precioVenta,
          @stock,
          @stockMinimo,
          @imagen
        )
      `);

      const idProducto =
        result.recordset[0].IDPRODUCTO;

      if (datos.detalleCelular) {
        await ProductoModel.guardarDetalleCelular(
          transaction,
          idProducto,
          datos.detalleCelular
        );
      }

      await transaction.commit();
      transaccionActiva = false;

      return { idProducto };
    } catch (error) {
      if (transaccionActiva) {
        try {
          await transaction.rollback();
        } catch {
          // La transacción ya pudo haberse cerrado.
        }
      }

      throw error;
    }
  }

  static async actualizar(idProducto, datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    let transaccionActiva = false;

    try {
      await transaction.begin();
      transaccionActiva = true;

      const request = new sql.Request(transaction);

      request.input(
        "idProducto",
        sql.Int,
        idProducto
      );
      request.input(
        "idCategoria",
        sql.Int,
        datos.idCategoria
      );
      request.input(
        "idMarca",
        sql.Int,
        datos.idMarca ?? null
      );
      request.input(
        "idModelo",
        sql.Int,
        datos.idModelo ?? null
      );
      request.input(
        "codigo",
        sql.VarChar(30),
        datos.codigo
      );
      request.input(
        "nombre",
        sql.VarChar(150),
        datos.nombre
      );
      request.input(
        "descripcion",
        sql.VarChar(500),
        datos.descripcion ?? null
      );
      request.input(
        "precioCompra",
        sql.Decimal(10, 2),
        datos.precioCompra ?? 0
      );
      request.input(
        "precioVenta",
        sql.Decimal(10, 2),
        datos.precioVenta ?? 0
      );
      request.input(
        "stockMinimo",
        sql.Int,
        datos.stockMinimo ?? 2
      );
      request.input(
        "imagen",
        sql.VarChar(500),
        datos.imagen ?? null
      );

      const result = await request.query(`
        UPDATE PRODUCTO
        SET
          IDCATEGORIA = @idCategoria,
          IDMARCA = @idMarca,
          IDMODELO = @idModelo,
          CODIGO = @codigo,
          NOMBRE = @nombre,
          DESCRIPCION = @descripcion,
          PRECIO_COMPRA = @precioCompra,
          PRECIO_VENTA = @precioVenta,
          STOCK_MINIMO = @stockMinimo,
          IMAGEN = @imagen
        WHERE IDPRODUCTO = @idProducto
          AND ESTADO = 1
      `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        transaccionActiva = false;
        return false;
      }

      if (datos.detalleCelular) {
        await ProductoModel.guardarDetalleCelular(
          transaction,
          idProducto,
          datos.detalleCelular
        );
      } else {
        const requestEliminarDetalle =
          new sql.Request(transaction);

        requestEliminarDetalle.input(
          "idProducto",
          sql.Int,
          idProducto
        );

        await requestEliminarDetalle.query(`
          DELETE FROM CELULAR_DETALLE
          WHERE IDPRODUCTO = @idProducto
        `);
      }

      await transaction.commit();
      transaccionActiva = false;

      return true;
    } catch (error) {
      if (transaccionActiva) {
        try {
          await transaction.rollback();
        } catch {
          // La transacción ya pudo haberse cerrado.
        }
      }

      throw error;
    }
  }

  static async eliminar(idProducto) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .query(`
        UPDATE PRODUCTO
        SET ESTADO = 0
        WHERE IDPRODUCTO = @idProducto
          AND ESTADO = 1
      `);

    return result.rowsAffected[0] > 0;
  }

  static async moverStock(idProducto, datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    let transaccionActiva = false;

    try {
      await transaction.begin();
      transaccionActiva = true;

      const requestBuscar =
        new sql.Request(transaction);

      requestBuscar.input(
        "idProducto",
        sql.Int,
        idProducto
      );

      const productoResult =
        await requestBuscar.query(`
          SELECT STOCK
          FROM PRODUCTO
          WHERE IDPRODUCTO = @idProducto
            AND ESTADO = 1
        `);

      if (productoResult.recordset.length === 0) {
        await transaction.rollback();
        transaccionActiva = false;
        return null;
      }

      const stockAnterior =
        productoResult.recordset[0].STOCK;

      let stockNuevo = stockAnterior;

      if (datos.tipo === "ENTRADA") {
        stockNuevo += datos.cantidad;
      } else if (datos.tipo === "SALIDA") {
        stockNuevo -= datos.cantidad;
      } else {
        stockNuevo = datos.cantidad;
      }

      if (stockNuevo < 0) {
        const error = new Error(
          "El stock no puede quedar negativo"
        );

        error.statusCode = 400;
        throw error;
      }

      const requestActualizar =
        new sql.Request(transaction);

      requestActualizar.input(
        "idProducto",
        sql.Int,
        idProducto
      );
      requestActualizar.input(
        "stockNuevo",
        sql.Int,
        stockNuevo
      );

      await requestActualizar.query(`
        UPDATE PRODUCTO
        SET STOCK = @stockNuevo
        WHERE IDPRODUCTO = @idProducto
      `);

      const requestMovimiento =
        new sql.Request(transaction);

      requestMovimiento.input(
        "idProducto",
        sql.Int,
        idProducto
      );
      requestMovimiento.input(
        "tipo",
        sql.VarChar(20),
        datos.tipo
      );
      requestMovimiento.input(
        "cantidad",
        sql.Int,
        datos.cantidad
      );
      requestMovimiento.input(
        "stockAnterior",
        sql.Int,
        stockAnterior
      );
      requestMovimiento.input(
        "stockNuevo",
        sql.Int,
        stockNuevo
      );
      requestMovimiento.input(
        "motivo",
        sql.VarChar(300),
        datos.motivo ?? null
      );

      await requestMovimiento.query(`
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
          @tipo,
          @cantidad,
          @stockAnterior,
          @stockNuevo,
          @motivo
        )
      `);

      await transaction.commit();
      transaccionActiva = false;

      return {
        stockAnterior,
        stockNuevo,
      };
    } catch (error) {
      if (transaccionActiva) {
        try {
          await transaction.rollback();
        } catch {
          // La transacción ya pudo haberse cerrado.
        }
      }

      throw error;
    }
  }

  static async obtenerMovimientos(idProducto) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idProducto",
        sql.Int,
        idProducto
      )
      .query(`
        SELECT
          IDMOVIMIENTO,
          IDPRODUCTO,
          TIPO,
          CANTIDAD,
          STOCK_ANTERIOR,
          STOCK_NUEVO,
          MOTIVO,
          FECHA
        FROM MOVIMIENTO_INVENTARIO
        WHERE IDPRODUCTO = @idProducto
        ORDER BY FECHA DESC
      `);

    return result.recordset;
  }

  static async obtenerMarcas() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        IDMARCA,
        NOMBRE
      FROM MARCA
      WHERE ESTADO = 1
      ORDER BY NOMBRE
    `);

    return result.recordset;
  }

  static async obtenerModelos(idMarca = null) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idMarca",
        sql.Int,
        idMarca ?? null
      )
      .query(`
        SELECT
          mo.IDMODELO,
          mo.IDMARCA,
          mo.NOMBRE,
          ma.NOMBRE AS MARCA
        FROM MODELO mo
        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA
        WHERE mo.ESTADO = 1
          AND ma.ESTADO = 1
          AND (
            @idMarca IS NULL
            OR mo.IDMARCA = @idMarca
          )
        ORDER BY ma.NOMBRE, mo.NOMBRE
      `);

    return result.recordset;
  }

  static async obtenerCompatibilidades(
    idProducto
  ) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input(
        "idProducto",
        sql.Int,
        idProducto
      )
      .query(`
        SELECT
          pmc.IDPRODUCTO,
          pmc.IDMODELO,
          mo.IDMARCA,
          mo.NOMBRE AS MODELO,
          ma.NOMBRE AS MARCA
        FROM PRODUCTO_MODELO_COMPATIBLE pmc
        INNER JOIN MODELO mo
          ON pmc.IDMODELO = mo.IDMODELO
        INNER JOIN MARCA ma
          ON mo.IDMARCA = ma.IDMARCA
        WHERE pmc.IDPRODUCTO = @idProducto
          AND pmc.ESTADO = 1
          AND mo.ESTADO = 1
          AND ma.ESTADO = 1
        ORDER BY ma.NOMBRE, mo.NOMBRE
      `);

    return result.recordset;
  }

  static async guardarCompatibilidades(
    idProducto,
    idsModelos
  ) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    let transaccionActiva = false;

    const idsUnicos = [
      ...new Set(idsModelos.map(Number)),
    ];

    try {
      await transaction.begin();
      transaccionActiva = true;

      const requestProducto =
        new sql.Request(transaction);

      requestProducto.input(
        "idProducto",
        sql.Int,
        idProducto
      );

      const productoResult =
        await requestProducto.query(`
          SELECT IDPRODUCTO
          FROM PRODUCTO
          WHERE IDPRODUCTO = @idProducto
            AND ESTADO = 1
        `);

      if (productoResult.recordset.length === 0) {
        const error = new Error(
          "Producto no encontrado"
        );

        error.statusCode = 404;
        throw error;
      }

      const requestEliminar =
        new sql.Request(transaction);

      requestEliminar.input(
        "idProducto",
        sql.Int,
        idProducto
      );

      await requestEliminar.query(`
        DELETE FROM PRODUCTO_MODELO_COMPATIBLE
        WHERE IDPRODUCTO = @idProducto
      `);

      for (const idModelo of idsUnicos) {
        const requestModelo =
          new sql.Request(transaction);

        requestModelo.input(
          "idProducto",
          sql.Int,
          idProducto
        );
        requestModelo.input(
          "idModelo",
          sql.Int,
          idModelo
        );

        const insertado =
          await requestModelo.query(`
            INSERT INTO PRODUCTO_MODELO_COMPATIBLE (
              IDPRODUCTO,
              IDMODELO
            )
            SELECT
              @idProducto,
              IDMODELO
            FROM MODELO
            WHERE IDMODELO = @idModelo
              AND ESTADO = 1
          `);

        if (insertado.rowsAffected[0] === 0) {
          const error = new Error(
            "Uno de los modelos seleccionados no existe"
          );

          error.statusCode = 400;
          throw error;
        }
      }

      await transaction.commit();
      transaccionActiva = false;

      return {
        idProducto,
        totalModelos: idsUnicos.length,
      };
    } catch (error) {
      if (transaccionActiva) {
        try {
          await transaction.rollback();
        } catch {
          // La transacción ya pudo haberse cerrado.
        }
      }

      throw error;
    }
  }

  static async importarModelos(filas) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    let transaccionActiva = false;

    let marcasCreadas = 0;
    let marcasReactivadas = 0;
    let modelosCreados = 0;
    let modelosReactivados = 0;
    let duplicados = 0;

    try {
      await transaction.begin();
      transaccionActiva = true;

      for (const fila of filas) {
        const marca = fila.marca;
        const modelo = fila.modelo;

        const requestMarca =
          new sql.Request(transaction);

        requestMarca.input(
          "marca",
          sql.VarChar(100),
          marca
        );

        const resultadoMarca =
          await requestMarca.query(`
            SELECT TOP 1
              IDMARCA,
              ESTADO
            FROM MARCA
            WHERE UPPER(LTRIM(RTRIM(NOMBRE))) =
                  UPPER(LTRIM(RTRIM(@marca)))
          `);

        let idMarca;

        if (resultadoMarca.recordset.length > 0) {
          const marcaGuardada =
            resultadoMarca.recordset[0];

          idMarca = marcaGuardada.IDMARCA;

          if (!marcaGuardada.ESTADO) {
            const requestReactivarMarca =
              new sql.Request(transaction);

            requestReactivarMarca.input(
              "idMarca",
              sql.Int,
              idMarca
            );

            await requestReactivarMarca.query(`
              UPDATE MARCA
              SET ESTADO = 1
              WHERE IDMARCA = @idMarca
            `);

            marcasReactivadas++;
          }
        } else {
          const requestCrearMarca =
            new sql.Request(transaction);

          requestCrearMarca.input(
            "marca",
            sql.VarChar(100),
            marca
          );

          const marcaCreada =
            await requestCrearMarca.query(`
              INSERT INTO MARCA (
                NOMBRE,
                ESTADO
              )
              OUTPUT INSERTED.IDMARCA
              VALUES (
                @marca,
                1
              )
            `);

          idMarca =
            marcaCreada.recordset[0].IDMARCA;

          marcasCreadas++;
        }

        const requestModelo =
          new sql.Request(transaction);

        requestModelo.input(
          "idMarca",
          sql.Int,
          idMarca
        );
        requestModelo.input(
          "modelo",
          sql.VarChar(150),
          modelo
        );

        const resultadoModelo =
          await requestModelo.query(`
            SELECT TOP 1
              IDMODELO,
              ESTADO
            FROM MODELO
            WHERE IDMARCA = @idMarca
              AND UPPER(LTRIM(RTRIM(NOMBRE))) =
                  UPPER(LTRIM(RTRIM(@modelo)))
          `);

        if (resultadoModelo.recordset.length > 0) {
          const modeloGuardado =
            resultadoModelo.recordset[0];

          if (!modeloGuardado.ESTADO) {
            const requestReactivarModelo =
              new sql.Request(transaction);

            requestReactivarModelo.input(
              "idModelo",
              sql.Int,
              modeloGuardado.IDMODELO
            );

            await requestReactivarModelo.query(`
              UPDATE MODELO
              SET ESTADO = 1
              WHERE IDMODELO = @idModelo
            `);

            modelosReactivados++;
          } else {
            duplicados++;
          }
        } else {
          const requestCrearModelo =
            new sql.Request(transaction);

          requestCrearModelo.input(
            "idMarca",
            sql.Int,
            idMarca
          );
          requestCrearModelo.input(
            "modelo",
            sql.VarChar(150),
            modelo
          );

          await requestCrearModelo.query(`
            INSERT INTO MODELO (
              IDMARCA,
              NOMBRE,
              ESTADO
            )
            VALUES (
              @idMarca,
              @modelo,
              1
            )
          `);

          modelosCreados++;
        }
      }

      await transaction.commit();
      transaccionActiva = false;

      return {
        filasProcesadas: filas.length,
        marcasCreadas,
        marcasReactivadas,
        modelosCreados,
        modelosReactivados,
        duplicados,
      };
    } catch (error) {
      if (transaccionActiva) {
        try {
          await transaction.rollback();
        } catch {
          // La transacción ya pudo haberse cerrado.
        }
      }

      throw error;
    }
  }
}

module.exports = ProductoModel;
