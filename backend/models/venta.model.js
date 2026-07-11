const { sql, getConnection } = require("../config/database");

class VentaModel {
  static async obtenerTodas() {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        v.IDVENTA,
        v.NUMERO_VENTA,
        v.FECHA,
        v.SUBTOTAL,
        v.DESCUENTO,
        v.TOTAL,
        v.METODO_PAGO,
        v.ESTADO,
        v.OBSERVACIONES,

        c.IDCLIENTE,

        CASE
          WHEN c.IDCLIENTE IS NULL THEN 'Cliente general'
          ELSE CONCAT(
            p.NOMBRES,
            ' ',
            p.APELLIDO_PATERNO,
            ' ',
            ISNULL(p.APELLIDO_MATERNO, '')
          )
        END AS CLIENTE,

        p.DNI,

        (
          SELECT SUM(dv.CANTIDAD)
          FROM DETALLE_VENTA dv
          WHERE dv.IDVENTA = v.IDVENTA
        ) AS TOTAL_PRODUCTOS

      FROM VENTA v

      LEFT JOIN CLIENTE c
        ON v.IDCLIENTE = c.IDCLIENTE

      LEFT JOIN PERSONA p
        ON c.IDPERSONA = p.IDPERSONA

      ORDER BY v.FECHA DESC
    `);

    return result.recordset;
  }

  static async obtenerPorId(idVenta) {
    const pool = await getConnection();

    const ventaResult = await pool
      .request()
      .input("idVenta", sql.Int, idVenta)
      .query(`
        SELECT
          v.IDVENTA,
          v.IDCLIENTE,
          v.NUMERO_VENTA,
          v.FECHA,
          v.SUBTOTAL,
          v.DESCUENTO,
          v.TOTAL,
          v.METODO_PAGO,
          v.ESTADO,
          v.OBSERVACIONES,

          CASE
            WHEN c.IDCLIENTE IS NULL THEN 'Cliente general'
            ELSE CONCAT(
              p.NOMBRES,
              ' ',
              p.APELLIDO_PATERNO,
              ' ',
              ISNULL(p.APELLIDO_MATERNO, '')
            )
          END AS CLIENTE,

          p.DNI

        FROM VENTA v

        LEFT JOIN CLIENTE c
          ON v.IDCLIENTE = c.IDCLIENTE

        LEFT JOIN PERSONA p
          ON c.IDPERSONA = p.IDPERSONA

        WHERE v.IDVENTA = @idVenta
      `);

    if (ventaResult.recordset.length === 0) {
      return null;
    }

    const detalleResult = await pool
      .request()
      .input("idVenta", sql.Int, idVenta)
      .query(`
        SELECT
          dv.IDDETALLE,
          dv.IDVENTA,
          dv.IDPRODUCTO,
          dv.CANTIDAD,
          dv.PRECIO_UNITARIO,
          dv.SUBTOTAL,

          pr.CODIGO,
          pr.NOMBRE AS PRODUCTO

        FROM DETALLE_VENTA dv

        INNER JOIN PRODUCTO pr
          ON dv.IDPRODUCTO = pr.IDPRODUCTO

        WHERE dv.IDVENTA = @idVenta

        ORDER BY dv.IDDETALLE
      `);

    return {
      venta: ventaResult.recordset[0],
      detalle: detalleResult.recordset,
    };
  }

  static async crear(datos) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const numeroVenta = `VEN-${Date.now()}`;

      let subtotal = 0;

      for (const item of datos.productos) {
        const requestProducto = new sql.Request(transaction);

        requestProducto.input(
          "idProducto",
          sql.Int,
          item.idProducto
        );

        const productoResult = await requestProducto.query(`
          SELECT
            IDPRODUCTO,
            NOMBRE,
            PRECIO_VENTA,
            STOCK
          FROM PRODUCTO
          WHERE IDPRODUCTO = @idProducto
            AND ESTADO = 1
        `);

        if (productoResult.recordset.length === 0) {
          throw new Error(
            `El producto con ID ${item.idProducto} no existe`
          );
        }

        const producto = productoResult.recordset[0];

        if (producto.STOCK < item.cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.NOMBRE}`
          );
        }

        subtotal +=
          Number(producto.PRECIO_VENTA) *
          Number(item.cantidad);
      }

      const descuento = Number(datos.descuento || 0);
      const total = subtotal - descuento;

      if (total < 0) {
        throw new Error(
          "El descuento no puede ser mayor al subtotal"
        );
      }

      const requestVenta = new sql.Request(transaction);

      requestVenta.input(
        "idCliente",
        sql.Int,
        datos.idCliente || null
      );

      requestVenta.input(
        "numeroVenta",
        sql.VarChar(30),
        numeroVenta
      );

      requestVenta.input(
        "subtotal",
        sql.Decimal(10, 2),
        subtotal
      );

      requestVenta.input(
        "descuento",
        sql.Decimal(10, 2),
        descuento
      );

      requestVenta.input(
        "total",
        sql.Decimal(10, 2),
        total
      );

      requestVenta.input(
        "metodoPago",
        sql.VarChar(30),
        datos.metodoPago
      );

      requestVenta.input(
        "observaciones",
        sql.VarChar(500),
        datos.observaciones || null
      );

      const ventaResult = await requestVenta.query(`
        INSERT INTO VENTA (
          IDCLIENTE,
          NUMERO_VENTA,
          SUBTOTAL,
          DESCUENTO,
          TOTAL,
          METODO_PAGO,
          OBSERVACIONES
        )
        OUTPUT INSERTED.IDVENTA
        VALUES (
          @idCliente,
          @numeroVenta,
          @subtotal,
          @descuento,
          @total,
          @metodoPago,
          @observaciones
        )
      `);

      const idVenta =
        ventaResult.recordset[0].IDVENTA;

      for (const item of datos.productos) {
        const requestProducto = new sql.Request(transaction);

        requestProducto.input(
          "idProducto",
          sql.Int,
          item.idProducto
        );

        const productoResult = await requestProducto.query(`
          SELECT
            NOMBRE,
            PRECIO_VENTA,
            STOCK
          FROM PRODUCTO
          WHERE IDPRODUCTO = @idProducto
            AND ESTADO = 1
        `);

        const producto = productoResult.recordset[0];

        const precioUnitario =
          Number(producto.PRECIO_VENTA);

        const subtotalDetalle =
          precioUnitario * Number(item.cantidad);

        const stockAnterior = producto.STOCK;
        const stockNuevo =
          stockAnterior - Number(item.cantidad);

        const requestDetalle =
          new sql.Request(transaction);

        requestDetalle.input(
          "idVenta",
          sql.Int,
          idVenta
        );

        requestDetalle.input(
          "idProducto",
          sql.Int,
          item.idProducto
        );

        requestDetalle.input(
          "cantidad",
          sql.Int,
          item.cantidad
        );

        requestDetalle.input(
          "precioUnitario",
          sql.Decimal(10, 2),
          precioUnitario
        );

        requestDetalle.input(
          "subtotal",
          sql.Decimal(10, 2),
          subtotalDetalle
        );

        await requestDetalle.query(`
          INSERT INTO DETALLE_VENTA (
            IDVENTA,
            IDPRODUCTO,
            CANTIDAD,
            PRECIO_UNITARIO,
            SUBTOTAL
          )
          VALUES (
            @idVenta,
            @idProducto,
            @cantidad,
            @precioUnitario,
            @subtotal
          )
        `);

        const requestStock =
          new sql.Request(transaction);

        requestStock.input(
          "idProducto",
          sql.Int,
          item.idProducto
        );

        requestStock.input(
          "stockNuevo",
          sql.Int,
          stockNuevo
        );

        await requestStock.query(`
          UPDATE PRODUCTO
          SET STOCK = @stockNuevo
          WHERE IDPRODUCTO = @idProducto
        `);

        const requestMovimiento =
          new sql.Request(transaction);

        requestMovimiento.input(
          "idProducto",
          sql.Int,
          item.idProducto
        );

        requestMovimiento.input(
          "cantidad",
          sql.Int,
          item.cantidad
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
          `Venta ${numeroVenta}`
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
            'SALIDA',
            @cantidad,
            @stockAnterior,
            @stockNuevo,
            @motivo
          )
        `);
      }

      await transaction.commit();

      return {
        idVenta,
        numeroVenta,
        subtotal,
        descuento,
        total,
      };
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Error al revertir la venta:",
          rollbackError
        );
      }

      throw error;
    }
  }

  static async anular(idVenta) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const requestVenta = new sql.Request(transaction);

      requestVenta.input("idVenta", sql.Int, idVenta);

      const ventaResult = await requestVenta.query(`
        SELECT
          IDVENTA,
          NUMERO_VENTA,
          ESTADO
        FROM VENTA
        WHERE IDVENTA = @idVenta
      `);

      if (ventaResult.recordset.length === 0) {
        await transaction.rollback();
        return null;
      }

      const venta = ventaResult.recordset[0];

      if (venta.ESTADO === "ANULADA") {
        throw new Error("La venta ya se encuentra anulada");
      }

      const requestDetalle =
        new sql.Request(transaction);

      requestDetalle.input("idVenta", sql.Int, idVenta);

      const detalleResult = await requestDetalle.query(`
        SELECT
          IDPRODUCTO,
          CANTIDAD
        FROM DETALLE_VENTA
        WHERE IDVENTA = @idVenta
      `);

      for (const item of detalleResult.recordset) {
        const requestProducto =
          new sql.Request(transaction);

        requestProducto.input(
          "idProducto",
          sql.Int,
          item.IDPRODUCTO
        );

        const productoResult =
          await requestProducto.query(`
            SELECT STOCK
            FROM PRODUCTO
            WHERE IDPRODUCTO = @idProducto
          `);

        const stockAnterior =
          productoResult.recordset[0].STOCK;

        const stockNuevo =
          stockAnterior + item.CANTIDAD;

        const requestActualizar =
          new sql.Request(transaction);

        requestActualizar.input(
          "idProducto",
          sql.Int,
          item.IDPRODUCTO
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
          item.IDPRODUCTO
        );

        requestMovimiento.input(
          "cantidad",
          sql.Int,
          item.CANTIDAD
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
          `Anulación de venta ${venta.NUMERO_VENTA}`
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
            'ENTRADA',
            @cantidad,
            @stockAnterior,
            @stockNuevo,
            @motivo
          )
        `);
      }

      const requestAnular =
        new sql.Request(transaction);

      requestAnular.input("idVenta", sql.Int, idVenta);

      await requestAnular.query(`
        UPDATE VENTA
        SET ESTADO = 'ANULADA'
        WHERE IDVENTA = @idVenta
      `);

      await transaction.commit();

      return true;
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Error al revertir anulación:",
          rollbackError
        );
      }

      throw error;
    }
  }
}

module.exports = VentaModel;