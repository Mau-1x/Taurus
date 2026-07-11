const { sql, getConnection } = require("../config/database");

class ProductoModel {
  static async obtenerTodos() {
    const pool = await getConnection();

    const result = await pool.request().query(`
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
        CASE
          WHEN p.STOCK = 0 THEN 'SIN STOCK'
          WHEN p.STOCK <= p.STOCK_MINIMO THEN 'STOCK BAJO'
          ELSE 'DISPONIBLE'
        END AS ESTADO_STOCK
      FROM PRODUCTO p
      INNER JOIN CATEGORIA c
        ON p.IDCATEGORIA = c.IDCATEGORIA
      LEFT JOIN MARCA ma
        ON p.IDMARCA = ma.IDMARCA
      LEFT JOIN MODELO mo
        ON p.IDMODELO = mo.IDMODELO
      WHERE p.ESTADO = 1
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

  static async crear(datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idCategoria", sql.Int, datos.idCategoria)
      .input("idMarca", sql.Int, datos.idMarca || null)
      .input("idModelo", sql.Int, datos.idModelo || null)
      .input("codigo", sql.VarChar(30), datos.codigo)
      .input("nombre", sql.VarChar(150), datos.nombre)
      .input("descripcion", sql.VarChar(500), datos.descripcion || null)
      .input("precioCompra", sql.Decimal(10, 2), datos.precioCompra || 0)
      .input("precioVenta", sql.Decimal(10, 2), datos.precioVenta || 0)
      .input("stock", sql.Int, datos.stock || 0)
      .input("stockMinimo", sql.Int, datos.stockMinimo || 2)
      .input("imagen", sql.VarChar(500), datos.imagen || null)
      .query(`
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

    return {
      idProducto: result.recordset[0].IDPRODUCTO,
    };
  }

  static async actualizar(idProducto, datos) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .input("idCategoria", sql.Int, datos.idCategoria)
      .input("idMarca", sql.Int, datos.idMarca || null)
      .input("idModelo", sql.Int, datos.idModelo || null)
      .input("codigo", sql.VarChar(30), datos.codigo)
      .input("nombre", sql.VarChar(150), datos.nombre)
      .input("descripcion", sql.VarChar(500), datos.descripcion || null)
      .input("precioCompra", sql.Decimal(10, 2), datos.precioCompra || 0)
      .input("precioVenta", sql.Decimal(10, 2), datos.precioVenta || 0)
      .input("stockMinimo", sql.Int, datos.stockMinimo || 2)
      .input("imagen", sql.VarChar(500), datos.imagen || null)
      .query(`
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

    return result.rowsAffected[0] > 0;
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

    try {
      await transaction.begin();

      const requestBuscar = new sql.Request(transaction);
      requestBuscar.input("idProducto", sql.Int, idProducto);

      const productoResult = await requestBuscar.query(`
        SELECT STOCK
        FROM PRODUCTO
        WHERE IDPRODUCTO = @idProducto
          AND ESTADO = 1
      `);

      if (productoResult.recordset.length === 0) {
        await transaction.rollback();
        return null;
      }

      const stockAnterior = productoResult.recordset[0].STOCK;
      let stockNuevo = stockAnterior;

      if (datos.tipo === "ENTRADA") {
        stockNuevo += datos.cantidad;
      } else if (datos.tipo === "SALIDA") {
        stockNuevo -= datos.cantidad;
      } else {
        stockNuevo = datos.cantidad;
      }

      if (stockNuevo < 0) {
        await transaction.rollback();

        const error = new Error("El stock no puede quedar negativo");
        error.statusCode = 400;
        throw error;
      }

      const requestActualizar = new sql.Request(transaction);

      requestActualizar.input("idProducto", sql.Int, idProducto);
      requestActualizar.input("stockNuevo", sql.Int, stockNuevo);

      await requestActualizar.query(`
        UPDATE PRODUCTO
        SET STOCK = @stockNuevo
        WHERE IDPRODUCTO = @idProducto
      `);

      const requestMovimiento = new sql.Request(transaction);

      requestMovimiento.input("idProducto", sql.Int, idProducto);
      requestMovimiento.input("tipo", sql.VarChar(20), datos.tipo);
      requestMovimiento.input("cantidad", sql.Int, datos.cantidad);
      requestMovimiento.input("stockAnterior", sql.Int, stockAnterior);
      requestMovimiento.input("stockNuevo", sql.Int, stockNuevo);
      requestMovimiento.input(
        "motivo",
        sql.VarChar(300),
        datos.motivo || null
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

      return {
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

  static async obtenerMovimientos(idProducto) {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
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
}

module.exports = ProductoModel;