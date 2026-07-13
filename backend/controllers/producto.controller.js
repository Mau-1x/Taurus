const ProductoModel = require("../models/producto.model");

function esBooleanoValido(valor) {
  return [
    true,
    false,
    1,
    0,
    "1",
    "0",
    "true",
    "false",
  ].includes(valor);
}

function numeroOpcional(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  return Number(valor);
}

function normalizarBooleano(valor) {
  return ![
    false,
    0,
    "0",
    "false",
  ].includes(valor);
}

function validarDetalleCelular(detalle) {
  if (
    detalle === null ||
    detalle === undefined
  ) {
    return null;
  }

  if (
    typeof detalle !== "object" ||
    Array.isArray(detalle)
  ) {
    return "La ficha técnica del celular no es válida";
  }

  const condicion = String(
    detalle.condicion || ""
  )
    .trim()
    .toUpperCase();

  if (
    !["NUEVO", "SEMINUEVO", "USADO"].includes(
      condicion
    )
  ) {
    return "La condición debe ser NUEVO, SEMINUEVO o USADO";
  }

  const ramGb = Number(detalle.ramGb);

  if (
    !Number.isInteger(ramGb) ||
    ramGb < 1 ||
    ramGb > 128
  ) {
    return "La memoria RAM debe ser un número entero entre 1 y 128 GB";
  }

  const almacenamientoGb = Number(
    detalle.almacenamientoGb
  );

  if (
    !Number.isInteger(almacenamientoGb) ||
    almacenamientoGb < 1 ||
    almacenamientoGb > 4096
  ) {
    return "El almacenamiento debe ser un número entero entre 1 y 4096 GB";
  }

  const color = String(detalle.color || "").trim();

  if (color.length < 2 || color.length > 50) {
    return "El color debe tener entre 2 y 50 caracteres";
  }

  if (!esBooleanoValido(detalle.liberado)) {
    return "El estado de liberación no es válido";
  }

  const bateriaPorcentaje = numeroOpcional(
    detalle.bateriaPorcentaje
  );

  if (
    bateriaPorcentaje !== null &&
    (!Number.isInteger(bateriaPorcentaje) ||
      bateriaPorcentaje < 0 ||
      bateriaPorcentaje > 100)
  ) {
    return "La batería debe ser un número entero entre 0 y 100";
  }

  const garantiaDias = Number(
    detalle.garantiaDias
  );

  if (
    !Number.isInteger(garantiaDias) ||
    garantiaDias < 0 ||
    garantiaDias > 3650
  ) {
    return "La garantía debe ser un número entero entre 0 y 3650 días";
  }

  return null;
}

function normalizarDetalleCelular(detalle) {
  if (!detalle) {
    return null;
  }

  return {
    condicion: String(detalle.condicion)
      .trim()
      .toUpperCase(),
    ramGb: Number(detalle.ramGb),
    almacenamientoGb: Number(
      detalle.almacenamientoGb
    ),
    color: String(detalle.color).trim(),
    liberado: normalizarBooleano(
      detalle.liberado
    ),
    bateriaPorcentaje: numeroOpcional(
      detalle.bateriaPorcentaje
    ),
    garantiaDias: Number(
      detalle.garantiaDias
    ),
  };
}

function validarProducto(datos, esEdicion = false) {
  const {
    idCategoria,
    idMarca,
    idModelo,
    codigo,
    nombre,
    descripcion,
    precioCompra,
    precioVenta,
    stock,
    stockMinimo,
    imagen,
    detalleCelular,
  } = datos;

  if (
    !Number.isInteger(Number(idCategoria)) ||
    Number(idCategoria) <= 0
  ) {
    return "La categoría no es válida";
  }

  if (
    !codigo ||
    !/^[A-Za-z0-9_-]{2,30}$/.test(
      codigo.trim()
    )
  ) {
    return "El código debe tener entre 2 y 30 caracteres y solo puede contener letras, números, guion y guion bajo";
  }

  if (
    !nombre ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 150
  ) {
    return "El nombre debe tener entre 2 y 150 caracteres";
  }

  if (
    descripcion &&
    descripcion.trim().length > 500
  ) {
    return "La descripción no puede superar los 500 caracteres";
  }

  const compra = Number(precioCompra);
  const venta = Number(precioVenta);

  if (
    !Number.isFinite(compra) ||
    compra < 0 ||
    compra > 99999999.99
  ) {
    return "El precio de compra no es válido";
  }

  if (
    !Number.isFinite(venta) ||
    venta < 0 ||
    venta > 99999999.99
  ) {
    return "El precio de venta no es válido";
  }

  if (venta < compra) {
    return "El precio de venta no puede ser menor al precio de compra";
  }

  if (!esEdicion) {
    const stockInicial = Number(stock);

    if (
      !Number.isInteger(stockInicial) ||
      stockInicial < 0 ||
      stockInicial > 999999
    ) {
      return "El stock inicial debe ser un número entero entre 0 y 999999";
    }
  }

  const minimo = Number(stockMinimo);

  if (
    !Number.isInteger(minimo) ||
    minimo < 0 ||
    minimo > 999999
  ) {
    return "El stock mínimo debe ser un número entero entre 0 y 999999";
  }

  if (
    idMarca &&
    !Number.isInteger(Number(idMarca))
  ) {
    return "La marca no es válida";
  }

  if (
    idModelo &&
    !Number.isInteger(Number(idModelo))
  ) {
    return "El modelo no es válido";
  }

  if (idModelo && !idMarca) {
    return "Debes seleccionar una marca antes de seleccionar un modelo";
  }

  if (imagen && imagen.length > 500) {
    return "La URL de la imagen no puede superar los 500 caracteres";
  }

  if (
    imagen &&
    !/^https?:\/\/.+/i.test(imagen.trim())
  ) {
    return "La URL de la imagen debe comenzar con http:// o https://";
  }

  return validarDetalleCelular(
    detalleCelular
  );
}

class ProductoController {
  static async obtenerTodos(req, res) {
    try {
      const idMarca = req.query.idMarca
        ? Number(req.query.idMarca)
        : null;

      const idModelo = req.query.idModelo
        ? Number(req.query.idModelo)
        : null;

      if (
        idMarca !== null &&
        (!Number.isInteger(idMarca) ||
          idMarca <= 0)
      ) {
        return res.status(400).json({
          ok: false,
          message: "La marca no es válida",
        });
      }

      if (
        idModelo !== null &&
        (!Number.isInteger(idModelo) ||
          idModelo <= 0)
      ) {
        return res.status(400).json({
          ok: false,
          message: "El modelo no es válido",
        });
      }

      const productos =
        await ProductoModel.obtenerTodos({
          idMarca,
          idModelo,
        });

      return res.json({
        ok: true,
        total: productos.length,
        data: productos,
      });
    } catch (error) {
      console.error(
        "Error obteniendo productos:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener los productos",
      });
    }
  }

  static async obtenerCategorias(req, res) {
    try {
      const categorias =
        await ProductoModel.obtenerCategorias();

      return res.json({
        ok: true,
        data: categorias,
      });
    } catch (error) {
      console.error(
        "Error obteniendo categorías:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener las categorías",
      });
    }
  }

  static async obtenerMarcas(req, res) {
    try {
      const marcas =
        await ProductoModel.obtenerMarcas();

      return res.json({
        ok: true,
        data: marcas,
      });
    } catch (error) {
      console.error(
        "Error obteniendo marcas:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener las marcas",
      });
    }
  }

  static async obtenerModelos(req, res) {
    try {
      const idMarca = req.query.idMarca
        ? Number(req.query.idMarca)
        : null;

      if (
        idMarca !== null &&
        (!Number.isInteger(idMarca) ||
          idMarca <= 0)
      ) {
        return res.status(400).json({
          ok: false,
          message: "La marca no es válida",
        });
      }

      const modelos =
        await ProductoModel.obtenerModelos(
          idMarca
        );

      return res.json({
        ok: true,
        data: modelos,
      });
    } catch (error) {
      console.error(
        "Error obteniendo modelos:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener los modelos",
      });
    }
  }

  static async obtenerCompatibilidades(
    req,
    res
  ) {
    try {
      const idProducto = Number(req.params.id);

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El producto no es válido",
        });
      }

      const modelos =
        await ProductoModel.obtenerCompatibilidades(
          idProducto
        );

      return res.json({
        ok: true,
        total: modelos.length,
        data: modelos,
      });
    } catch (error) {
      console.error(
        "Error obteniendo compatibilidades:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener las compatibilidades",
      });
    }
  }

  static async actualizarCompatibilidades(
    req,
    res
  ) {
    try {
      const idProducto = Number(req.params.id);
      const { idsModelos } = req.body;

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "El producto no es válido",
        });
      }

      if (!Array.isArray(idsModelos)) {
        return res.status(400).json({
          ok: false,
          message:
            "Debes enviar una lista de modelos",
        });
      }

      if (idsModelos.length > 300) {
        return res.status(400).json({
          ok: false,
          message:
            "No puedes asignar más de 300 modelos",
        });
      }

      const idsNormalizados = [
        ...new Set(idsModelos.map(Number)),
      ];

      const contieneIdInvalido =
        idsNormalizados.some(
          (idModelo) =>
            !Number.isInteger(idModelo) ||
            idModelo <= 0
        );

      if (contieneIdInvalido) {
        return res.status(400).json({
          ok: false,
          message:
            "Uno de los modelos seleccionados no es válido",
        });
      }

      const resultado =
        await ProductoModel.guardarCompatibilidades(
          idProducto,
          idsNormalizados
        );

      return res.json({
        ok: true,
        message:
          "Compatibilidades actualizadas correctamente",
        data: resultado,
      });
    } catch (error) {
      console.error(
        "Error actualizando compatibilidades:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message: error.statusCode
            ? error.message
            : "No se pudieron actualizar las compatibilidades",
        });
    }
  }

  static async importarModelos(req, res) {
    try {
      const { filas } = req.body;

      if (!Array.isArray(filas)) {
        return res.status(400).json({
          ok: false,
          message:
            "Debes enviar una lista de marcas y modelos",
        });
      }

      if (filas.length === 0) {
        return res.status(400).json({
          ok: false,
          message:
            "El archivo no contiene modelos",
        });
      }

      if (filas.length > 5000) {
        return res.status(400).json({
          ok: false,
          message:
            "Solo se permiten hasta 5000 modelos por importación",
        });
      }

      const filasNormalizadas = [];

      for (const fila of filas) {
        const marca = String(
          fila.marca || fila.MARCA || ""
        )
          .trim()
          .replace(/\s+/g, " ");

        const modelo = String(
          fila.modelo || fila.MODELO || ""
        )
          .trim()
          .replace(/\s+/g, " ");

        if (!marca || !modelo) {
          continue;
        }

        if (marca.length > 100) {
          return res.status(400).json({
            ok: false,
            message: `La marca "${marca}" supera los 100 caracteres`,
          });
        }

        if (modelo.length > 150) {
          return res.status(400).json({
            ok: false,
            message: `El modelo "${modelo}" supera los 150 caracteres`,
          });
        }

        filasNormalizadas.push({
          marca,
          modelo,
        });
      }

      if (filasNormalizadas.length === 0) {
        return res.status(400).json({
          ok: false,
          message:
            "No se encontraron filas válidas",
        });
      }

      const resultado =
        await ProductoModel.importarModelos(
          filasNormalizadas
        );

      return res.json({
        ok: true,
        message:
          "Catálogo de dispositivos importado correctamente",
        data: resultado,
      });
    } catch (error) {
      console.error(
        "Error importando modelos:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron importar las marcas y modelos",
      });
    }
  }

  static async crear(req, res) {
    try {
      const errorValidacion =
        validarProducto(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const producto =
        await ProductoModel.crear({
          ...req.body,
          idCategoria: Number(
            req.body.idCategoria
          ),
          idMarca: req.body.idMarca
            ? Number(req.body.idMarca)
            : null,
          idModelo: req.body.idModelo
            ? Number(req.body.idModelo)
            : null,
          codigo: req.body.codigo
            .trim()
            .toUpperCase(),
          nombre: req.body.nombre.trim(),
          descripcion:
            req.body.descripcion?.trim() ||
            null,
          precioCompra: Number(
            req.body.precioCompra
          ),
          precioVenta: Number(
            req.body.precioVenta
          ),
          stock: Number(req.body.stock),
          stockMinimo: Number(
            req.body.stockMinimo
          ),
          imagen:
            req.body.imagen?.trim() || null,
          detalleCelular:
            normalizarDetalleCelular(
              req.body.detalleCelular
            ),
        });

      return res.status(201).json({
        ok: true,
        message:
          "Producto registrado correctamente",
        data: producto,
      });
    } catch (error) {
      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          ok: false,
          message:
            "Ya existe un producto con ese código",
        });
      }

      console.error(
        "Error al registrar producto:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo registrar el producto",
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const idProducto =
        Number(req.params.id);

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El ID del producto no es válido",
        });
      }

      const errorValidacion =
        validarProducto(req.body, true);

      if (errorValidacion) {
        return res.status(400).json({
          ok: false,
          message: errorValidacion,
        });
      }

      const actualizado =
        await ProductoModel.actualizar(
          idProducto,
          {
            ...req.body,
            idCategoria: Number(
              req.body.idCategoria
            ),
            idMarca: req.body.idMarca
              ? Number(req.body.idMarca)
              : null,
            idModelo: req.body.idModelo
              ? Number(req.body.idModelo)
              : null,
            codigo: req.body.codigo
              .trim()
              .toUpperCase(),
            nombre:
              req.body.nombre.trim(),
            descripcion:
              req.body.descripcion?.trim() ||
              null,
            precioCompra: Number(
              req.body.precioCompra
            ),
            precioVenta: Number(
              req.body.precioVenta
            ),
            stockMinimo: Number(
              req.body.stockMinimo
            ),
            imagen:
              req.body.imagen?.trim() ||
              null,
            detalleCelular:
              normalizarDetalleCelular(
                req.body.detalleCelular
              ),
          }
        );

      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message:
          "Producto actualizado correctamente",
      });
    } catch (error) {
      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          ok: false,
          message:
            "Ya existe otro producto con ese código",
        });
      }

      console.error(
        "Error actualizando producto:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo actualizar el producto",
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const idProducto =
        Number(req.params.id);

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El ID del producto no es válido",
        });
      }

      const eliminado =
        await ProductoModel.eliminar(
          idProducto
        );

      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message:
          "Producto eliminado correctamente",
      });
    } catch (error) {
      console.error(
        "Error eliminando producto:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudo eliminar el producto",
      });
    }
  }

  static async moverStock(req, res) {
    try {
      const idProducto =
        Number(req.params.id);

      const {
        tipo,
        cantidad,
        motivo,
      } = req.body;

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El producto no es válido",
        });
      }

      if (
        !["ENTRADA", "SALIDA", "AJUSTE"].includes(
          tipo
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El tipo de movimiento no es válido",
        });
      }

      const cantidadNumerica =
        Number(cantidad);

      if (
        !Number.isInteger(cantidadNumerica) ||
        cantidadNumerica < 0 ||
        cantidadNumerica > 999999
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La cantidad debe ser un número entero entre 0 y 999999",
        });
      }

      if (
        tipo !== "AJUSTE" &&
        cantidadNumerica === 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "La cantidad debe ser mayor que cero para entradas y salidas",
        });
      }

      if (
        !motivo ||
        motivo.trim().length < 3
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Debes indicar un motivo de al menos 3 caracteres",
        });
      }

      if (motivo.trim().length > 300) {
        return res.status(400).json({
          ok: false,
          message:
            "El motivo no puede superar los 300 caracteres",
        });
      }

      const resultado =
        await ProductoModel.moverStock(
          idProducto,
          {
            tipo,
            cantidad: cantidadNumerica,
            motivo: motivo.trim(),
          }
        );

      if (!resultado) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      return res.json({
        ok: true,
        message:
          "Stock actualizado correctamente",
        data: resultado,
      });
    } catch (error) {
      console.error(
        "Error moviendo stock:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          ok: false,
          message: error.statusCode
            ? error.message
            : "No se pudo actualizar el stock",
        });
    }
  }

  static async obtenerMovimientos(req, res) {
    try {
      const idProducto =
        Number(req.params.id);

      if (
        !Number.isInteger(idProducto) ||
        idProducto <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "El producto no es válido",
        });
      }

      const movimientos =
        await ProductoModel.obtenerMovimientos(
          idProducto
        );

      return res.json({
        ok: true,
        data: movimientos,
      });
    } catch (error) {
      console.error(
        "Error obteniendo movimientos:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No se pudieron obtener los movimientos",
      });
    }
  }
}

module.exports = ProductoController;
