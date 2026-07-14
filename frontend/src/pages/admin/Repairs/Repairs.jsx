import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  RefreshCw,
  X,
  LoaderCircle,
  Wrench,
  PackagePlus,
  Trash2,
  Boxes,
  Wallet,
  CircleDollarSign,
  FileDown,
  MessageCircle,
  Send,
  Images,
  ImagePlus,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

import { obtenerProductos } from "../../../services/productoService";
import { obtenerEquipos } from "../../../services/equipoService";
import {
  descargarComprobanteReparacion,
} from "../../../services/reporteService";

import {
  obtenerReparaciones,
  obtenerEstadosReparacion,
  crearReparacion,
  actualizarReparacion,
  cambiarEstadoReparacion,
  obtenerRepuestosReparacion,
  agregarRepuestoReparacion,
  quitarRepuestoReparacion,
  obtenerPagosReparacion,
  registrarPagoReparacion,
  anularPagoReparacion,
  obtenerFotosReparacion,
  subirFotoReparacion,
  actualizarFotoReparacion,
  eliminarFotoReparacion,
} from "../../../services/reparacionAdminService";

const formularioInicial = {
  idEquipo: "",
  fallaReportada: "",
  diagnostico: "",
  solucion: "",
  costoEstimado: "",
  costoFinal: "",
  fechaEstimada: "",
  fechaEntrega: "",
  garantiaDias: 0,
  observaciones: "",
};

function Repairs() {
  const [reparaciones, setReparaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [productos, setProductos] = useState([]);
  const [modalRepuestos, setModalRepuestos] =
    useState(false);

  const [reparacionRepuestos, setReparacionRepuestos] =
    useState(null);

  const [repuestosUsados, setRepuestosUsados] =
    useState([]);

  const [modalPagos, setModalPagos] = useState(false);

  const [reparacionPagos, setReparacionPagos] =
    useState(null);

  const [pagos, setPagos] = useState([]);

  const [resumenPagos, setResumenPagos] =
    useState(null);

  const [montoPago, setMontoPago] = useState("");

  const [metodoPago, setMetodoPago] =
    useState("EFECTIVO");

  const [observacionPago, setObservacionPago] =
    useState("");

  const [cargandoPagos, setCargandoPagos] =
    useState(false);

  const [idProductoSeleccionado, setIdProductoSeleccionado] =
    useState("");

  const [cantidadRepuesto, setCantidadRepuesto] =
    useState("1");

  const [cargandoRepuestos, setCargandoRepuestos] =
    useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);

  const [reparacionEditando, setReparacionEditando] =
    useState(null);

  const [reparacionEstado, setReparacionEstado] =
    useState(null);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState("");

  const [comentarioEstado, setComentarioEstado] =
    useState("");

  const [descargandoPdf, setDescargandoPdf] =
    useState(null);

  const [modalWhatsApp, setModalWhatsApp] =
    useState(false);

  const [
    reparacionWhatsApp,
    setReparacionWhatsApp,
  ] = useState(null);

  const [
    tipoMensajeWhatsApp,
    setTipoMensajeWhatsApp,
  ] = useState("RECIBIDO");

  const [
    resumenWhatsApp,
    setResumenWhatsApp,
  ] = useState(null);

  const [
    cargandoWhatsApp,
    setCargandoWhatsApp,
  ] = useState(false);

  const [
    errorWhatsApp,
    setErrorWhatsApp,
  ] = useState("");

  const [modalFotos, setModalFotos] =
    useState(false);

  const [reparacionFotos, setReparacionFotos] =
    useState(null);

  const [fotosReparacion, setFotosReparacion] =
    useState([]);

  const [tipoFoto, setTipoFoto] =
    useState("ANTES");

  const [descripcionFoto, setDescripcionFoto] =
    useState("");

  const [visibleClienteFoto, setVisibleClienteFoto] =
    useState(true);

  const [archivoFoto, setArchivoFoto] =
    useState(null);

  const [vistaPreviaFoto, setVistaPreviaFoto] =
    useState("");

  const [cargandoFotos, setCargandoFotos] =
    useState(false);

  const [subiendoFoto, setSubiendoFoto] =
    useState(false);

  const [actualizandoFoto, setActualizandoFoto] =
    useState(null);

  const [errorFotos, setErrorFotos] =
    useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

    const [
      datosReparaciones,
      datosEquipos,
      datosEstados,
      datosProductos,
    ] = await Promise.all([
      obtenerReparaciones(),
      obtenerEquipos(),
      obtenerEstadosReparacion(),
      obtenerProductos(),
    ]);

      setReparaciones(datosReparaciones);
      setEquipos(datosEquipos);
      setEstados(datosEstados);
      setProductos(datosProductos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const reparacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return reparaciones;

    return reparaciones.filter((reparacion) => {
      return (
        reparacion.CODIGO?.toLowerCase().includes(texto) ||
        reparacion.CLIENTE?.toLowerCase().includes(texto) ||
        reparacion.DNI?.includes(texto) ||
        reparacion.MARCA?.toLowerCase().includes(texto) ||
        reparacion.MODELO?.toLowerCase().includes(texto) ||
        reparacion.ESTADO_REPARACION?.toLowerCase().includes(texto)
      );
    });
  }, [reparaciones, busqueda]);

  function abrirNuevaReparacion() {
    setReparacionEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setModalAbierto(true);
  }

  function abrirEditar(reparacion) {
    setReparacionEditando(reparacion);

    setFormulario({
      idEquipo: reparacion.IDEQUIPO,
      fallaReportada: reparacion.FALLA_REPORTADA || "",
      diagnostico: reparacion.DIAGNOSTICO || "",
      solucion: reparacion.SOLUCION || "",
      costoEstimado: reparacion.COSTO_ESTIMADO || "",
      costoFinal: reparacion.COSTO_FINAL || "",
      fechaEstimada: formatearInputFecha(
        reparacion.FECHA_ESTIMADA
      ),
      fechaEntrega: formatearInputFecha(
        reparacion.FECHA_ENTREGA
      ),
      garantiaDias: reparacion.GARANTIA_DIAS || 0,
      observaciones: reparacion.OBSERVACIONES || "",
    });

    setError("");
    setModalAbierto(true);
  }

  function abrirCambioEstado(reparacion) {
    setReparacionEstado(reparacion);
    setEstadoSeleccionado(reparacion.IDESTADO);
    setComentarioEstado("");
    setError("");
    setModalEstado(true);
  }

  function manejarCambio(evento) {
    const { name } = evento.target;
    let { value } = evento.target;

    if (
      name === "fallaReportada" ||
      name === "diagnostico" ||
      name === "solucion" ||
      name === "observaciones"
    ) {
      value = value.slice(0, 1000);
    }

    if (name === "garantiaDias") {
      value = value.replace(/\D/g, "").slice(0, 3);
    }

    if (
      name === "costoEstimado" ||
      name === "costoFinal"
    ) {
      if (!/^\d{0,8}(\.\d{0,2})?$/.test(value)) {
        return;
      }
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (!formulario.idEquipo && !reparacionEditando) {
        throw new Error("Selecciona un equipo");
      }

      if (
        !formulario.fallaReportada.trim() ||
        formulario.fallaReportada.trim().length < 5
      ) {
        throw new Error(
          "La falla reportada debe tener al menos 5 caracteres"
        );
      }

      if (formulario.fallaReportada.length > 1000) {
        throw new Error(
          "La falla reportada no puede superar los 1000 caracteres"
        );
      }

      if (
        formulario.diagnostico &&
        formulario.diagnostico.length > 1000
      ) {
        throw new Error(
          "El diagnóstico no puede superar los 1000 caracteres"
        );
      }

      if (
        formulario.solucion &&
        formulario.solucion.length > 1000
      ) {
        throw new Error(
          "La solución no puede superar los 1000 caracteres"
        );
      }

      if (
        formulario.observaciones &&
        formulario.observaciones.length > 1000
      ) {
        throw new Error(
          "Las observaciones no pueden superar los 1000 caracteres"
        );
      }

      if (
        formulario.costoEstimado !== "" &&
        Number(formulario.costoEstimado) < 0
      ) {
        throw new Error(
          "El costo estimado no puede ser negativo"
        );
      }

      if (
        formulario.costoFinal !== "" &&
        Number(formulario.costoFinal) < 0
      ) {
        throw new Error(
          "El costo final no puede ser negativo"
        );
      }

      const garantia = Number(formulario.garantiaDias || 0);

      if (
        !Number.isInteger(garantia) ||
        garantia < 0 ||
        garantia > 365
      ) {
        throw new Error(
          "La garantía debe estar entre 0 y 365 días"
        );
      }

      if (
        formulario.fechaEstimada &&
        formulario.fechaEntrega &&
        new Date(formulario.fechaEntrega) <
          new Date(formulario.fechaEstimada)
      ) {
        throw new Error(
          "La fecha de entrega no puede ser anterior a la fecha estimada"
        );
      }

      const datos = {
        ...formulario,
        idEquipo: Number(formulario.idEquipo),
        costoEstimado: formulario.costoEstimado
          ? Number(formulario.costoEstimado)
          : null,
        costoFinal: formulario.costoFinal
          ? Number(formulario.costoFinal)
          : null,
        garantiaDias: Number(formulario.garantiaDias || 0),
        fechaEstimada:
          formulario.fechaEstimada || null,
        fechaEntrega:
          formulario.fechaEntrega || null,
      };

      if (reparacionEditando) {
        await actualizarReparacion(
          reparacionEditando.IDREPARACION,
          datos
        );
      } else {
        await crearReparacion(datos);
      }

      await cargarDatos();
      setModalAbierto(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambioEstado(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const estadoActual = estados.find(
      (estado) =>
        Number(estado.IDESTADO) ===
        Number(estadoSeleccionado)
    );

    const nombreEstado =
      estadoActual?.NOMBRE?.trim().toUpperCase();

    if (
      nombreEstado === "NO REPARABLE" &&
      comentarioEstado.trim().length < 5
    ) {
      throw new Error(
        "Debes indicar el motivo por el cual el equipo no puede repararse"
      );
    }

    if (comentarioEstado.length > 500) {
      throw new Error(
        "El comentario no puede superar los 500 caracteres"
      );
    }

      await cambiarEstadoReparacion(
        reparacionEstado.IDREPARACION,
        {
          idEstado: Number(estadoSeleccionado),
          comentario: comentarioEstado || null,
        }
      );

      await cargarDatos();
      setModalEstado(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function abrirRepuestos(reparacion) {
  try {
    setReparacionRepuestos(reparacion);
    setModalRepuestos(true);
    setCargandoRepuestos(true);
    setError("");
    setIdProductoSeleccionado("");
    setCantidadRepuesto("1");

    const datos =
      await obtenerRepuestosReparacion(
        reparacion.IDREPARACION
      );

    setRepuestosUsados(datos);
  } catch (errorCarga) {
    setError(errorCarga.message);
  } finally {
    setCargandoRepuestos(false);
  }
}

async function recargarRepuestos() {
  const datos = await obtenerRepuestosReparacion(
    reparacionRepuestos.IDREPARACION
  );

  setRepuestosUsados(datos);
}

async function guardarRepuesto(evento) {
  evento.preventDefault();

  try {
    setGuardando(true);
    setError("");

    const idProducto = Number(
      idProductoSeleccionado
    );

    const cantidad = Number(cantidadRepuesto);

    if (
      !Number.isInteger(idProducto) ||
      idProducto <= 0
    ) {
      throw new Error("Selecciona un repuesto");
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw new Error(
        "La cantidad debe ser mayor a cero"
      );
    }

    await agregarRepuestoReparacion(
      reparacionRepuestos.IDREPARACION,
      {
        idProducto,
        cantidad,
      }
    );

    await recargarRepuestos();
    await cargarDatos();

    setIdProductoSeleccionado("");
    setCantidadRepuesto("1");
  } catch (errorGuardado) {
    setError(errorGuardado.message);
  } finally {
    setGuardando(false);
  }
}

  async function eliminarRepuesto(repuesto) {
    const confirmar = window.confirm(
      `¿Deseas quitar ${repuesto.PRODUCTO} de esta reparación?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      setError("");

      await quitarRepuestoReparacion(
        reparacionRepuestos.IDREPARACION,
        repuesto.IDPRODUCTO
      );

      await recargarRepuestos();
      await cargarDatos();
    } catch (errorEliminar) {
      setError(errorEliminar.message);
    } finally {
      setGuardando(false);
    }
  }

  async function abrirPagos(reparacion) {
  try {
    setReparacionPagos(reparacion);
    setModalPagos(true);
    setCargandoPagos(true);
    setError("");
    setMontoPago("");
    setMetodoPago("EFECTIVO");
    setObservacionPago("");

    const datos = await obtenerPagosReparacion(
      reparacion.IDREPARACION
    );

    setResumenPagos(datos.resumen);
    setPagos(datos.pagos);
  } catch (errorCarga) {
    setError(errorCarga.message);
  } finally {
    setCargandoPagos(false);
  }
}

async function recargarPagos() {
  const datos = await obtenerPagosReparacion(
    reparacionPagos.IDREPARACION
  );

  setResumenPagos(datos.resumen);
  setPagos(datos.pagos);
}

async function guardarPago(evento) {
  evento.preventDefault();

  try {
    setGuardando(true);
    setError("");

    const monto = Number(montoPago);

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      throw new Error(
        "Ingresa un monto mayor a cero"
      );
    }

    if (
      resumenPagos &&
      monto >
        Number(resumenPagos.SALDO_PENDIENTE)
    ) {
      throw new Error(
        `El pago no puede superar el saldo pendiente de S/ ${Number(
          resumenPagos.SALDO_PENDIENTE
        ).toFixed(2)}`
      );
    }

    await registrarPagoReparacion(
      reparacionPagos.IDREPARACION,
      {
        monto,
        metodoPago,
        observaciones:
          observacionPago.trim() || null,
      }
    );

    await recargarPagos();

    setMontoPago("");
    setMetodoPago("EFECTIVO");
    setObservacionPago("");
  } catch (errorGuardado) {
    setError(errorGuardado.message);
  } finally {
    setGuardando(false);
  }
}

  async function eliminarPago(pago) {
    const confirmar = window.confirm(
      `¿Deseas anular el pago de S/ ${Number(
        pago.MONTO
      ).toFixed(2)}?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      setError("");

      await anularPagoReparacion(
        reparacionPagos.IDREPARACION,
        pago.IDPAGO
      );

      await recargarPagos();
    } catch (errorEliminar) {
      setError(errorEliminar.message);
    } finally {
      setGuardando(false);
    }
  }

    async function descargarPdf(reparacion) {
    try {
      setDescargandoPdf(reparacion.IDREPARACION);
      setError("");

      await descargarComprobanteReparacion(
        reparacion.IDREPARACION,
        reparacion.CODIGO
      );
    } catch (errorDescarga) {
      setError(errorDescarga.message);
    } finally {
      setDescargandoPdf(null);
    }
  }

  async function abrirFotos(reparacion) {
    try {
      setReparacionFotos(reparacion);
      setFotosReparacion([]);
      setTipoFoto("ANTES");
      setDescripcionFoto("");
      setVisibleClienteFoto(true);
      limpiarArchivoFoto();
      setErrorFotos("");
      setModalFotos(true);
      setCargandoFotos(true);

      const datos = await obtenerFotosReparacion(
        reparacion.IDREPARACION
      );

      setFotosReparacion(datos);
    } catch (errorCarga) {
      setErrorFotos(errorCarga.message);
    } finally {
      setCargandoFotos(false);
    }
  }

  async function recargarFotos() {
    if (!reparacionFotos) return;

    const datos = await obtenerFotosReparacion(
      reparacionFotos.IDREPARACION
    );

    setFotosReparacion(datos);
  }

  function limpiarArchivoFoto() {
    if (vistaPreviaFoto) {
      URL.revokeObjectURL(vistaPreviaFoto);
    }

    setArchivoFoto(null);
    setVistaPreviaFoto("");
  }

  function seleccionarArchivoFoto(evento) {
    const archivo = evento.target.files?.[0];

    setErrorFotos("");
    limpiarArchivoFoto();

    if (!archivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      evento.target.value = "";
      setErrorFotos(
        "Solo se permiten imágenes JPG, PNG o WEBP."
      );
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      evento.target.value = "";
      setErrorFotos(
        "La imagen no puede superar los 5 MB."
      );
      return;
    }

    setArchivoFoto(archivo);
    setVistaPreviaFoto(URL.createObjectURL(archivo));
  }

  async function guardarFoto(evento) {
    evento.preventDefault();

    if (!archivoFoto) {
      setErrorFotos("Selecciona una imagen.");
      return;
    }

    if (descripcionFoto.trim().length > 300) {
      setErrorFotos(
        "La descripción no puede superar los 300 caracteres."
      );
      return;
    }

    try {
      setSubiendoFoto(true);
      setErrorFotos("");

      await subirFotoReparacion(
        reparacionFotos.IDREPARACION,
        {
          foto: archivoFoto,
          tipo: tipoFoto,
          descripcion:
            descripcionFoto.trim() || null,
          visibleCliente: visibleClienteFoto,
        }
      );

      await recargarFotos();

      setDescripcionFoto("");
      setVisibleClienteFoto(true);
      limpiarArchivoFoto();
    } catch (errorSubida) {
      setErrorFotos(errorSubida.message);
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function alternarVisibilidadFoto(foto) {
    try {
      setActualizandoFoto(foto.IDFOTO);
      setErrorFotos("");

      await actualizarFotoReparacion(
        reparacionFotos.IDREPARACION,
        foto.IDFOTO,
        {
          visibleCliente:
            !Boolean(foto.VISIBLE_CLIENTE),
        }
      );

      await recargarFotos();
    } catch (errorActualizacion) {
      setErrorFotos(errorActualizacion.message);
    } finally {
      setActualizandoFoto(null);
    }
  }

  async function borrarFoto(foto) {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta foto de la reparación?"
    );

    if (!confirmar) return;

    try {
      setActualizandoFoto(foto.IDFOTO);
      setErrorFotos("");

      await eliminarFotoReparacion(
        reparacionFotos.IDREPARACION,
        foto.IDFOTO
      );

      await recargarFotos();
    } catch (errorEliminacion) {
      setErrorFotos(errorEliminacion.message);
    } finally {
      setActualizandoFoto(null);
    }
  }

  function cerrarFotos() {
    limpiarArchivoFoto();
    setModalFotos(false);
    setReparacionFotos(null);
    setFotosReparacion([]);
    setErrorFotos("");
  }

  async function abrirWhatsApp(reparacion) {
    const numero = normalizarNumeroWhatsApp(
      reparacion.CELULAR
    );

    if (!numero) {
      setError(
        "El cliente no tiene un número de celular válido registrado."
      );
      return;
    }

    setReparacionWhatsApp(reparacion);
    setTipoMensajeWhatsApp("RECIBIDO");
    setResumenWhatsApp(null);
    setErrorWhatsApp("");
    setModalWhatsApp(true);
    setCargandoWhatsApp(true);

    try {
      const datos = await obtenerPagosReparacion(
        reparacion.IDREPARACION
      );

      setResumenWhatsApp(datos.resumen || null);
    } catch {
      setResumenWhatsApp(null);
    } finally {
      setCargandoWhatsApp(false);
    }
  }

  function enviarWhatsApp() {
    if (!reparacionWhatsApp) return;

    const numero = normalizarNumeroWhatsApp(
      reparacionWhatsApp.CELULAR
    );

    if (!numero) {
      setErrorWhatsApp(
        "El número del cliente no es válido."
      );
      return;
    }

    const mensaje = crearMensajeWhatsApp(
      reparacionWhatsApp,
      tipoMensajeWhatsApp,
      resumenWhatsApp
    );

    const enlace =
      `https://wa.me/${numero}?text=${encodeURIComponent(
        mensaje
      )}`;

    window.open(
      enlace,
      "_blank",
      "noopener,noreferrer"
    );

    setModalWhatsApp(false);
  }

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Gestión administrativa
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Reparaciones
          </h1>

          <p className="mt-2 text-gray-600">
            Registra diagnósticos y controla el estado de los equipos.
          </p>
        </div>

        <button
          onClick={abrirNuevaReparacion}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
        >
          <Plus size={20} />
          Nueva reparación
        </button>
      </div>

      {error &&
        !modalAbierto &&
        !modalEstado &&
        !modalRepuestos &&
        !modalPagos &&
        !modalWhatsApp &&
        !modalFotos && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
              placeholder="Buscar código, cliente, equipo o estado"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wrench size={19} />
            {reparacionesFiltradas.length} reparaciones
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {cargando ? (
            <div className="flex justify-center py-16">
              <LoaderCircle
                size={38}
                className="animate-spin text-red-700"
              />
            </div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">Código</th>
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Equipo</th>
                  <th className="pb-4">Falla</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4">Costo</th>
                  <th className="pb-4">Ingreso</th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {reparacionesFiltradas.map((reparacion) => (
                  <tr
                    key={reparacion.IDREPARACION}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-semibold">
                      {reparacion.CODIGO}
                    </td>

                    <td className="py-4">
                      <p className="font-semibold">
                        {reparacion.CLIENTE}
                      </p>
                      <p className="text-sm text-gray-500">
                        DNI: {reparacion.DNI}
                      </p>
                    </td>

                    <td className="py-4">
                      {reparacion.MARCA}{" "}
                      {reparacion.MODELO}
                    </td>

                    <td className="max-w-[250px] py-4">
                      <p className="truncate">
                        {reparacion.FALLA_REPORTADA}
                      </p>
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        {reparacion.ESTADO_REPARACION}
                      </span>
                    </td>

                    <td className="py-4">
                      {reparacion.COSTO_FINAL
                        ? `S/ ${Number(
                            reparacion.COSTO_FINAL
                          ).toFixed(2)}`
                        : reparacion.COSTO_ESTIMADO
                          ? `S/ ${Number(
                              reparacion.COSTO_ESTIMADO
                            ).toFixed(2)}`
                          : "Sin costo"}
                    </td>

                    <td className="py-4">
                      {formatearFecha(
                        reparacion.FECHA_INGRESO
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            abrirFotos(reparacion)
                          }
                          title="Fotos de la reparación"
                          className="rounded-lg bg-sky-50 p-2 text-sky-700 hover:bg-sky-100"
                        >
                          <Images size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirWhatsApp(reparacion)
                          }
                          title="Enviar aviso por WhatsApp"
                          className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"
                        >
                          <MessageCircle size={18} />
                        </button>

                        <button
                          onClick={() => descargarPdf(reparacion)}
                          disabled={
                            descargandoPdf === reparacion.IDREPARACION
                          }
                          title="Descargar comprobante PDF"
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {descargandoPdf === reparacion.IDREPARACION ? (
                            <LoaderCircle
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <FileDown size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => abrirPagos(reparacion)}
                          title="Administrar pagos"
                          className="rounded-lg bg-purple-50 p-2 text-purple-700 hover:bg-purple-100"
                        >
                          <Wallet size={18} />
                        </button>
                        <button
                          onClick={() => abrirRepuestos(reparacion)}
                          title="Administrar repuestos"
                          className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"
                        >
                          <PackagePlus size={18} />

                        </button>
                        <button
                          onClick={() =>
                            abrirCambioEstado(reparacion)
                          }
                          title="Cambiar estado"
                          className="rounded-lg bg-amber-50 p-2 text-amber-700"
                        >
                          <RefreshCw size={18} />
                        </button>

                        <button
                          onClick={() =>
                            abrirEditar(reparacion)
                          }
                          title="Editar reparación"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {reparacionesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron reparaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && (
        <ModalReparacion
          formulario={formulario}
          equipos={equipos}
          reparacionEditando={reparacionEditando}
          guardando={guardando}
          error={error}
          manejarCambio={manejarCambio}
          manejarGuardar={manejarGuardar}
          cerrar={() => setModalAbierto(false)}
        />
      )}

      {modalEstado && (
        <ModalEstado
          reparacion={reparacionEstado}
          estados={estados}
          estadoSeleccionado={estadoSeleccionado}
          setEstadoSeleccionado={setEstadoSeleccionado}
          comentario={comentarioEstado}
          setComentario={setComentarioEstado}
          guardando={guardando}
          error={error}
          guardar={guardarCambioEstado}
          cerrar={() => setModalEstado(false)}
        />
      )}
      {modalRepuestos && (
        <ModalRepuestos
          reparacion={reparacionRepuestos}
          productos={productos}
          repuestos={repuestosUsados}
          idProducto={idProductoSeleccionado}
          setIdProducto={setIdProductoSeleccionado}
          cantidad={cantidadRepuesto}
          setCantidad={setCantidadRepuesto}
          cargando={cargandoRepuestos}
          guardando={guardando}
          error={error}
          guardar={guardarRepuesto}
          eliminar={eliminarRepuesto}
          cerrar={() => {
            setModalRepuestos(false);
            setReparacionRepuestos(null);
            setRepuestosUsados([]);
            setError("");
          }}
        />
      )}
        {modalPagos && (
        <ModalPagos
          reparacion={reparacionPagos}
          resumen={resumenPagos}
          pagos={pagos}
          monto={montoPago}
          setMonto={setMontoPago}
          metodo={metodoPago}
          setMetodo={setMetodoPago}
          observacion={observacionPago}
          setObservacion={setObservacionPago}
          cargando={cargandoPagos}
          guardando={guardando}
          error={error}
          guardar={guardarPago}
          eliminar={eliminarPago}
          cerrar={() => {
            setModalPagos(false);
            setReparacionPagos(null);
            setResumenPagos(null);
            setPagos([]);
            setError("");
          }}
        />
      )}

      {modalFotos && (
        <ModalFotos
          reparacion={reparacionFotos}
          fotos={fotosReparacion}
          tipo={tipoFoto}
          setTipo={setTipoFoto}
          descripcion={descripcionFoto}
          setDescripcion={setDescripcionFoto}
          visibleCliente={visibleClienteFoto}
          setVisibleCliente={setVisibleClienteFoto}
          archivo={archivoFoto}
          vistaPrevia={vistaPreviaFoto}
          cargando={cargandoFotos}
          subiendo={subiendoFoto}
          actualizando={actualizandoFoto}
          error={errorFotos}
          seleccionarArchivo={seleccionarArchivoFoto}
          guardar={guardarFoto}
          alternarVisibilidad={alternarVisibilidadFoto}
          eliminar={borrarFoto}
          limpiarArchivo={limpiarArchivoFoto}
          cerrar={cerrarFotos}
        />
      )}

      {modalWhatsApp && (
        <ModalWhatsApp
          reparacion={reparacionWhatsApp}
          tipo={tipoMensajeWhatsApp}
          setTipo={setTipoMensajeWhatsApp}
          resumen={resumenWhatsApp}
          cargando={cargandoWhatsApp}
          error={errorWhatsApp}
          enviar={enviarWhatsApp}
          cerrar={() => {
            setModalWhatsApp(false);
            setReparacionWhatsApp(null);
            setResumenWhatsApp(null);
            setErrorWhatsApp("");
          }}
        />
      )}
    </section>
  );
}

function ModalFotos({
  reparacion,
  fotos,
  tipo,
  setTipo,
  descripcion,
  setDescripcion,
  visibleCliente,
  setVisibleCliente,
  archivo,
  vistaPrevia,
  cargando,
  subiendo,
  actualizando,
  error,
  seleccionarArchivo,
  guardar,
  alternarVisibilidad,
  eliminar,
  limpiarArchivo,
  cerrar,
}) {
  const grupos = [
    {
      tipo: "ANTES",
      titulo: "Antes de reparar",
      descripcion:
        "Estado del equipo cuando fue recibido.",
    },
    {
      tipo: "DIAGNOSTICO",
      titulo: "Diagnóstico",
      descripcion:
        "Daños encontrados durante la revisión.",
    },
    {
      tipo: "DESPUES",
      titulo: "Después de reparar",
      descripcion:
        "Resultado final del trabajo realizado.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2">
              <Images
                size={24}
                className="text-sky-700"
              />

              <h2 className="text-2xl font-bold text-gray-950">
                Evidencias fotográficas
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {reparacion?.CODIGO} — {reparacion?.MARCA}{" "}
              {reparacion?.MODELO}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={25} />
          </button>
        </div>

        <div className="grid gap-7 p-6 lg:grid-cols-[360px_1fr] lg:p-7">
          <form
            onSubmit={guardar}
            className="h-fit rounded-2xl border border-gray-200 bg-gray-50 p-5 lg:sticky lg:top-24"
          >
            <div className="flex items-center gap-2">
              <ImagePlus
                size={21}
                className="text-sky-700"
              />

              <h3 className="text-lg font-bold text-gray-950">
                Agregar fotografía
              </h3>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">
                Etapa de la reparación
              </span>

              <select
                value={tipo}
                onChange={(evento) =>
                  setTipo(evento.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-600"
              >
                <option value="ANTES">Antes</option>
                <option value="DIAGNOSTICO">
                  Diagnóstico
                </option>
                <option value="DESPUES">Después</option>
              </select>
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold">
                Imagen *
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={seleccionarArchivo}
                className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white text-sm file:mr-3 file:border-0 file:bg-sky-700 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-sky-800"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG o WEBP. Máximo 5 MB.
              </p>
            </label>

            {vistaPrevia && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <img
                  src={vistaPrevia}
                  alt="Vista previa"
                  className="h-52 w-full object-contain"
                />

                <button
                  type="button"
                  onClick={limpiarArchivo}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white"
                  title="Quitar imagen"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <label className="mt-4 block">
              <span className="mb-2 flex items-center justify-between text-sm font-semibold">
                <span>Descripción</span>
                <span className="text-xs font-normal text-gray-500">
                  {descripcion.length}/300
                </span>
              </span>

              <textarea
                value={descripcion}
                onChange={(evento) =>
                  setDescripcion(
                    evento.target.value.slice(0, 300)
                  )
                }
                rows="3"
                maxLength={300}
                placeholder="Ejemplo: pantalla rota al recibir el equipo"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <input
                type="checkbox"
                checked={visibleCliente}
                onChange={(evento) =>
                  setVisibleCliente(evento.target.checked)
                }
                className="mt-1 h-4 w-4 accent-sky-700"
              />

              <span>
                <span className="block font-semibold text-gray-900">
                  Visible para el cliente
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  Aparecerá en el seguimiento público por DNI.
                </span>
              </span>
            </label>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={subiendo || !archivo}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {subiendo ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <ImagePlus size={19} />
              )}

              {subiendo ? "Subiendo..." : "Guardar foto"}
            </button>
          </form>

          <div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-sky-700">
                  Galería de la reparación
                </p>

                <h3 className="mt-1 text-2xl font-black text-gray-950">
                  {fotos.length === 1
                    ? "1 fotografía registrada"
                    : `${fotos.length} fotografías registradas`}
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                <Eye size={17} />
                {
                  fotos.filter((foto) =>
                    Boolean(foto.VISIBLE_CLIENTE)
                  ).length
                }{" "}
                visibles al cliente
              </div>
            </div>

            {cargando ? (
              <div className="flex justify-center py-24">
                <LoaderCircle
                  size={40}
                  className="animate-spin text-sky-700"
                />
              </div>
            ) : fotos.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-500">
                <Images
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-semibold">
                  Todavía no hay fotografías
                </p>

                <p className="mt-1 text-sm">
                  Registra el estado antes, durante y después de la reparación.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {grupos.map((grupo) => {
                  const fotosGrupo = fotos.filter(
                    (foto) => foto.TIPO === grupo.tipo
                  );

                  return (
                    <section key={grupo.tipo}>
                      <div className="flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
                        <div>
                          <h4 className="font-bold text-gray-950">
                            {grupo.titulo}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {grupo.descripcion}
                          </p>
                        </div>

                        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">
                          {fotosGrupo.length}
                        </span>
                      </div>

                      {fotosGrupo.length === 0 ? (
                        <p className="py-6 text-sm text-gray-400">
                          Sin fotografías en esta etapa.
                        </p>
                      ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {fotosGrupo.map((foto) => (
                            <article
                              key={foto.IDFOTO}
                              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                            >
                              <a
                                href={foto.URL}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative block h-52 bg-gray-100"
                              >
                                <img
                                  src={foto.URL}
                                  alt={
                                    foto.DESCRIPCION ||
                                    `Foto ${foto.TIPO}`
                                  }
                                  className="h-full w-full object-contain transition group-hover:scale-[1.02]"
                                />

                                <span className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100">
                                  <ExternalLink size={17} />
                                </span>
                              </a>

                              <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="line-clamp-2 min-h-10 text-sm text-gray-700">
                                    {foto.DESCRIPCION ||
                                      "Sin descripción"}
                                  </p>

                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                                      foto.VISIBLE_CLIENTE
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {foto.VISIBLE_CLIENTE
                                      ? "Pública"
                                      : "Interna"}
                                  </span>
                                </div>

                                <p className="mt-3 text-xs text-gray-400">
                                  {formatearFechaHora(
                                    foto.FECHA_REGISTRO
                                  )}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      alternarVisibilidad(foto)
                                    }
                                    disabled={
                                      actualizando === foto.IDFOTO
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    {actualizando ===
                                    foto.IDFOTO ? (
                                      <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                      />
                                    ) : foto.VISIBLE_CLIENTE ? (
                                      <EyeOff size={17} />
                                    ) : (
                                      <Eye size={17} />
                                    )}

                                    {foto.VISIBLE_CLIENTE
                                      ? "Ocultar"
                                      : "Mostrar"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => eliminar(foto)}
                                    disabled={
                                      actualizando === foto.IDFOTO
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                  >
                                    <Trash2 size={17} />
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalWhatsApp({
  reparacion,
  tipo,
  setTipo,
  resumen,
  cargando,
  error,
  enviar,
  cerrar,
}) {
  const mensaje = crearMensajeWhatsApp(
    reparacion,
    tipo,
    resumen
  );

  const opciones = [
    {
      valor: "RECIBIDO",
      nombre: "Equipo recibido",
    },
    {
      valor: "DIAGNOSTICO",
      nombre: "Diagnóstico terminado",
    },
    {
      valor: "PRESUPUESTO",
      nombre: "Presupuesto listo",
    },
    {
      valor: "FINALIZADO",
      nombre: "Reparación finalizada",
    },
    {
      valor: "LISTO",
      nombre: "Listo para recoger",
    },
    {
      valor: "SALDO",
      nombre: "Recordatorio de saldo",
    },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle
                size={23}
                className="text-green-700"
              />

              <h2 className="text-2xl font-bold">
                Enviar aviso por WhatsApp
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {reparacion?.CLIENTE} —{" "}
              {reparacion?.CELULAR}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-7">
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Tipo de mensaje
            </span>

            <select
              value={tipo}
              onChange={(evento) =>
                setTipo(evento.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            >
              {opciones.map((opcion) => (
                <option
                  key={opcion.valor}
                  value={opcion.valor}
                >
                  {opcion.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">
              Vista previa
            </p>

            <div className="whitespace-pre-line rounded-2xl border border-green-200 bg-green-50 p-5 leading-relaxed text-gray-800">
              {cargando && tipo === "SALDO"
                ? "Consultando saldo..."
                : mensaje}
            </div>
          </div>

          {tipo === "SALDO" &&
            !cargando &&
            !resumen && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800">
                No se pudo consultar el saldo. El
                mensaje se enviará sin un monto
                específico.
              </div>
            )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={enviar}
              disabled={cargando && tipo === "SALDO"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={19} />
              Abrir WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalReparacion({
  formulario,
  equipos,
  reparacionEditando,
  guardando,
  error,
  manejarCambio,
  manejarGuardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <h2 className="text-2xl font-bold">
            {reparacionEditando
              ? "Editar reparación"
              : "Registrar reparación"}
          </h2>

          <button onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={manejarGuardar}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          {!reparacionEditando && (
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Equipo *
              </span>

              <select
                name="idEquipo"
                value={formulario.idEquipo}
                onChange={manejarCambio}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              >
                <option value="">Seleccionar equipo</option>

                {equipos.map((equipo) => (
                  <option
                    key={equipo.IDEQUIPO}
                    value={equipo.IDEQUIPO}
                  >
                    {equipo.CLIENTE} - {equipo.MARCA}{" "}
                    {equipo.MODELO}
                  </option>
                ))}
              </select>
            </label>
          )}

          <Area
            label="Falla reportada"
            name="fallaReportada"
            value={formulario.fallaReportada}
            onChange={manejarCambio}
            maxLength={1000}
            required
          />

          <Area
            label="Diagnóstico"
            name="diagnostico"
            value={formulario.diagnostico}
            onChange={manejarCambio}
            maxLength={1000}
          />

          <Area
            label="Solución"
            name="solucion"
            value={formulario.solucion}
            onChange={manejarCambio}
            maxLength={1000}
          />

          <Area
            label="Observaciones"
            name="observaciones"
            value={formulario.observaciones}
            onChange={manejarCambio}
            maxLength={1000}
          />

          <Campo
            label="Costo estimado"
            name="costoEstimado"
            type="number"
            value={formulario.costoEstimado}
            onChange={manejarCambio}
            min="0"
            max="99999999.99"
            step="0.01"
          />

          <Campo
            label="Costo final"
            name="costoFinal"
            type="number"
            value={formulario.costoFinal}
            onChange={manejarCambio}
            min="0"
            max="99999999.99"
            step="0.01"
          />

          <Campo
            label="Días de garantía"
            name="garantiaDias"
            type="number"
            value={formulario.garantiaDias}
            onChange={manejarCambio}
            min="0"
            max="365"
            step="1"
          />

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5 md:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEstado({
  reparacion,
  estados,
  estadoSeleccionado,
  setEstadoSeleccionado,
  comentario,
  setComentario,
  guardando,
  error,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={guardar}
        className="w-full max-w-lg rounded-3xl bg-white p-7"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Cambiar estado
            </h2>
            <p className="mt-1 text-gray-500">
              {reparacion.CODIGO}
            </p>
          </div>

          <button type="button" onClick={cerrar}>
            <X size={24} />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold">
            Nuevo estado
          </span>

          <select
            value={estadoSeleccionado}
            onChange={(evento) =>
              setEstadoSeleccionado(evento.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            {estados.map((estado) => (
              <option
                key={estado.IDESTADO}
                value={estado.IDESTADO}
              >
                {estado.NOMBRE}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">
            Comentario
          </span>

          <textarea
            value={comentario}
            onChange={(evento) =>
              setComentario(evento.target.value)
            }
            rows="4"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </label>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Cancelar
          </button>

          <button
            disabled={guardando}
            className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white"
          >
            {guardando ? "Guardando..." : "Actualizar estado"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalRepuestos({
  reparacion,
  productos,
  repuestos,
  idProducto,
  setIdProducto,
  cantidad,
  setCantidad,
  cargando,
  guardando,
  error,
  guardar,
  eliminar,
  cerrar,
}) {
  const productosDisponibles = productos.filter(
    (producto) =>
      producto.ESTADO &&
      Number(producto.STOCK) > 0
  );

  const total = repuestos.reduce(
    (acumulado, repuesto) =>
      acumulado + Number(repuesto.SUBTOTAL || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              Repuestos utilizados
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {reparacion?.CODIGO} —{" "}
              {reparacion?.MARCA}{" "}
              {reparacion?.MODELO}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={guardar}
          className="grid gap-4 border-b p-7 md:grid-cols-[1fr_150px_auto]"
        >
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Repuesto
            </span>

            <select
              value={idProducto}
              onChange={(evento) =>
                setIdProducto(evento.target.value)
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">
                Seleccionar repuesto
              </option>

              {productosDisponibles.map((producto) => (
                <option
                  key={producto.IDPRODUCTO}
                  value={producto.IDPRODUCTO}
                >
                  {producto.NOMBRE} — Stock:{" "}
                  {producto.STOCK} — S/{" "}
                  {Number(
                    producto.PRECIO_VENTA
                  ).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">
              Cantidad
            </span>

            <input
              type="number"
              min="1"
              max="999"
              step="1"
              value={cantidad}
              onChange={(evento) =>
                setCantidad(
                  evento.target.value
                    .replace(/\D/g, "")
                    .slice(0, 3)
                )
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {guardando ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Plus size={19} />
              )}

              Agregar
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-3">
              {error}
            </div>
          )}
        </form>

        <div className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes
                size={21}
                className="text-green-700"
              />

              <h3 className="text-lg font-bold">
                Repuestos agregados
              </h3>
            </div>

            <p className="font-bold text-gray-900">
              Total: S/ {total.toFixed(2)}
            </p>
          </div>

          {cargando ? (
            <div className="flex justify-center py-14">
              <LoaderCircle
                size={36}
                className="animate-spin text-red-700"
              />
            </div>
          ) : repuestos.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
              No se han registrado repuestos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">Cantidad</th>
                    <th className="pb-3">
                      Precio unitario
                    </th>
                    <th className="pb-3">
                      Subtotal
                    </th>
                    <th className="pb-3 text-right">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {repuestos.map((repuesto) => (
                    <tr
                      key={
                        repuesto.IDDETALLE_REPARACION_PRODUCTO
                      }
                      className="border-b border-gray-100"
                    >
                      <td className="py-4">
                        <p className="font-semibold">
                          {repuesto.PRODUCTO}
                        </p>

                        <p className="text-sm text-gray-500">
                          {repuesto.CODIGO}
                        </p>
                      </td>

                      <td className="py-4">
                        {repuesto.CANTIDAD}
                      </td>

                      <td className="py-4">
                        S/{" "}
                        {Number(
                          repuesto.PRECIO_UNITARIO
                        ).toFixed(2)}
                      </td>

                      <td className="py-4 font-semibold">
                        S/{" "}
                        {Number(
                          repuesto.SUBTOTAL
                        ).toFixed(2)}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            eliminar(repuesto)
                          }
                          disabled={guardando}
                          title="Quitar repuesto"
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalPagos({
  reparacion,
  resumen,
  pagos,
  monto,
  setMonto,
  metodo,
  setMetodo,
  observacion,
  setObservacion,
  cargando,
  guardando,
  error,
  guardar,
  eliminar,
  cerrar,
}) {
  const estadoPago =
    resumen?.ESTADO_PAGO || "PENDIENTE";

  const claseEstado =
    estadoPago === "PAGADO"
      ? "bg-green-100 text-green-700"
      : estadoPago === "PARCIAL"
        ? "bg-amber-100 text-amber-700"
        : estadoPago === "SIN COSTO"
          ? "bg-gray-100 text-gray-700"
          : "bg-red-100 text-red-700";

  const saldoPendiente = Number(
    resumen?.SALDO_PENDIENTE || 0
  );

  const puedeRegistrarPago =
    saldoPendiente > 0 &&
    estadoPago !== "PAGADO";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white">
        <div className="flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 className="text-2xl font-bold">
              Pagos de reparación
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {reparacion?.CODIGO} —{" "}
              {reparacion?.CLIENTE}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20">
            <LoaderCircle
              size={38}
              className="animate-spin text-red-700"
            />
          </div>
        ) : (
          <>
            <div className="grid gap-4 border-b p-7 sm:grid-cols-2 xl:grid-cols-4">
              <ResumenPago
                titulo="Total"
                valor={resumen?.TOTAL_REPARACION}
              />

              <ResumenPago
                titulo="Pagado"
                valor={resumen?.TOTAL_PAGADO}
              />

              <ResumenPago
                titulo="Saldo"
                valor={resumen?.SALDO_PENDIENTE}
              />

              <article className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Estado
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${claseEstado}`}
                >
                  {estadoPago}
                </span>
              </article>
            </div>

            {puedeRegistrarPago ? (
              <form
                onSubmit={guardar}
                className="grid gap-4 border-b p-7 md:grid-cols-2 xl:grid-cols-[160px_220px_1fr_auto]"
              >
                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Monto *
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    max={saldoPendiente}
                    step="0.01"
                    value={monto}
                    onChange={(evento) => {
                      const valor =
                        evento.target.value;

                      if (
                        /^\d{0,8}(\.\d{0,2})?$/.test(
                          valor
                        )
                      ) {
                        setMonto(valor);
                      }
                    }}
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Método de pago *
                  </span>

                  <select
                    value={metodo}
                    onChange={(evento) =>
                      setMetodo(evento.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="EFECTIVO">
                      Efectivo
                    </option>
                    <option value="YAPE">
                      Yape
                    </option>
                    <option value="PLIN">
                      Plin
                    </option>
                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>
                    <option value="TARJETA">
                      Tarjeta
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Observación
                  </span>

                  <input
                    value={observacion}
                    onChange={(evento) =>
                      setObservacion(
                        evento.target.value.slice(
                          0,
                          300
                        )
                      )
                    }
                    maxLength={300}
                    placeholder="Ejemplo: adelanto del cliente"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
                  >
                    {guardando ? (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <CircleDollarSign size={19} />
                    )}

                    Registrar
                  </button>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-red-700 md:col-span-2 xl:col-span-4">
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <div className="border-b p-7">
                <div className="rounded-xl bg-green-50 p-4 text-green-700">
                  {estadoPago === "PAGADO"
                    ? "La reparación ya se encuentra pagada completamente."
                    : "Primero registra un costo en la reparación para poder agregar pagos."}
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="p-7">
              <div className="mb-5 flex items-center gap-2">
                <Wallet
                  size={21}
                  className="text-purple-700"
                />

                <h3 className="text-lg font-bold">
                  Historial de pagos
                </h3>
              </div>

              {pagos.length === 0 ? (
                <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
                  No se han registrado pagos.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3">
                          Fecha
                        </th>
                        <th className="pb-3">
                          Monto
                        </th>
                        <th className="pb-3">
                          Método
                        </th>
                        <th className="pb-3">
                          Observación
                        </th>
                        <th className="pb-3">
                          Usuario
                        </th>
                        <th className="pb-3 text-right">
                          Acción
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagos.map((pago) => (
                        <tr
                          key={pago.IDPAGO}
                          className="border-b border-gray-100"
                        >
                          <td className="py-4">
                            {formatearFechaHora(
                              pago.FECHA_PAGO
                            )}
                          </td>

                          <td className="py-4 font-semibold">
                            S/{" "}
                            {Number(
                              pago.MONTO
                            ).toFixed(2)}
                          </td>

                          <td className="py-4">
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                              {pago.METODO_PAGO}
                            </span>
                          </td>

                          <td className="py-4">
                            {pago.OBSERVACIONES ||
                              "Sin observación"}
                          </td>

                          <td className="py-4">
                            {pago.USUARIO}
                          </td>

                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                eliminar(pago)
                              }
                              disabled={guardando}
                              title="Anular pago"
                              className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResumenPago({ titulo, valor }) {
  return (
    <article className="rounded-2xl bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        S/ {Number(valor || 0).toFixed(2)}
      </p>
    </article>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </label>
  );
}

function Area({
  label,
  name,
  value,
  onChange,
  required = false,
  maxLength = 1000,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="text-red-600"> *</span>
        )}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        rows="4"
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />

      <p className="mt-1 text-right text-xs text-gray-500">
        {value.length}/{maxLength}
      </p>
    </label>
  );
}

function normalizarNumeroWhatsApp(celular) {
  let numero = String(celular || "").replace(
    /\D/g,
    ""
  );

  if (numero.startsWith("0051")) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("51") && numero.length === 11) {
    return numero;
  }

  if (numero.length === 9) {
    return `51${numero}`;
  }

  return "";
}

function obtenerPrimerNombre(nombreCompleto) {
  return (
    String(nombreCompleto || "cliente")
      .trim()
      .split(/\s+/)[0] || "cliente"
  );
}

function crearMensajeWhatsApp(
  reparacion,
  tipo,
  resumen
) {
  if (!reparacion) return "";

  const cliente = obtenerPrimerNombre(
    reparacion.CLIENTE
  );

  const equipo = `${reparacion.MARCA || ""} ${
    reparacion.MODELO || ""
  }`.trim();

  const codigo = reparacion.CODIGO || "Sin código";

  const costo = Number(
    reparacion.COSTO_FINAL ??
      reparacion.COSTO_ESTIMADO ??
      0
  );

  const saldo = Number(
    resumen?.SALDO_PENDIENTE || 0
  );

  const seguimiento =
    `${window.location.origin}/seguimiento`;

  const encabezado =
    `Hola ${cliente}, te escribimos de Taurus Servicio Técnico.`;

  const mensajes = {
    RECIBIDO:
      `${encabezado}\n\n` +
      `Tu equipo ${equipo} fue recibido correctamente.\n` +
      `Código de reparación: ${codigo}.\n\n` +
      `Puedes revisar el avance con tu DNI aquí:\n${seguimiento}`,

    DIAGNOSTICO:
      `${encabezado}\n\n` +
      `El diagnóstico de tu equipo ${equipo} ya está listo.\n` +
      `Diagnóstico: ${
        reparacion.DIAGNOSTICO ||
        "Comunícate con nosotros para conocer el detalle."
      }\n\n` +
      `Código: ${codigo}.`,

    PRESUPUESTO:
      `${encabezado}\n\n` +
      `El presupuesto para tu equipo ${equipo} ya está listo.\n` +
      `${
        costo > 0
          ? `Monto: S/ ${costo.toFixed(2)}.`
          : "Comunícate con nosotros para confirmar el monto."
      }\n\n` +
      `Código: ${codigo}.`,

    FINALIZADO:
      `${encabezado}\n\n` +
      `La reparación de tu equipo ${equipo} ha sido finalizada.\n` +
      `Código: ${codigo}.\n\n` +
      `Puedes consultar los detalles con tu DNI en:\n${seguimiento}`,

    LISTO:
      `${encabezado}\n\n` +
      `Tu equipo ${equipo} ya está listo para recoger.\n` +
      `Código: ${codigo}.\n` +
      `Horario de atención: 10:00 a. m. a 9:00 p. m.`,

    SALDO:
      `${encabezado}\n\n` +
      `Te recordamos que tu reparación ${codigo} tiene ` +
      `${
        resumen
          ? `un saldo pendiente de S/ ${saldo.toFixed(
              2
            )}.`
          : "un saldo pendiente."
      }\n\n` +
      `Gracias por confiar en Taurus.`,
  };

  return mensajes[tipo] || mensajes.RECIBIDO;
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE").format(
    new Date(fecha)
  );
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(fecha));
}

function formatearInputFecha(fecha) {
  if (!fecha) return "";

  const fechaLocal = new Date(fecha);
  fechaLocal.setMinutes(
    fechaLocal.getMinutes() -
      fechaLocal.getTimezoneOffset()
  );

  return fechaLocal.toISOString().slice(0, 16);
}

export default Repairs;