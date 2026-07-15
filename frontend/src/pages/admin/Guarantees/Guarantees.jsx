import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  ShieldCheck,
  Clock3,
  TriangleAlert,
  BadgeCheck,
  ClipboardPlus,
  Pencil,
  X,
  LoaderCircle,
  Smartphone,
  UserRound,
  CalendarDays,
  History,
  CircleDot,
  RefreshCw,
} from "lucide-react";

import {
  obtenerPanelGarantias,
  registrarReclamoGarantia,
  actualizarReclamoGarantia,
  obtenerHistorialGarantia,
} from "../../../services/garantiaService";

const formularioNuevoInicial = {
  motivo: "",
  observaciones: "",
};

const formularioGestionInicial = {
  estadoGarantia: "PENDIENTE",
  diagnostico: "",
  solucion: "",
  observaciones: "",
  comentario: "",
};

function Guarantees() {
  const [panel, setPanel] = useState({
    resumen: {},
    garantias: [],
    reclamos: [],
  });

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroVigencia, setFiltroVigencia] =
    useState("TODAS");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [modalNuevo, setModalNuevo] =
    useState(false);

  const [garantiaSeleccionada, setGarantiaSeleccionada] =
    useState(null);

  const [formularioNuevo, setFormularioNuevo] =
    useState(formularioNuevoInicial);

  const [modalGestion, setModalGestion] =
    useState(false);

  const [reclamoSeleccionado, setReclamoSeleccionado] =
    useState(null);

  const [formularioGestion, setFormularioGestion] =
    useState(formularioGestionInicial);

  const [historial, setHistorial] =
    useState([]);

  const [cargandoHistorial, setCargandoHistorial] =
    useState(false);

  useEffect(() => {
    cargarPanel();
  }, []);

  async function cargarPanel() {
    try {
      setCargando(true);
      setError("");

      const datos =
        await obtenerPanelGarantias();

      setPanel(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  const garantiasFiltradas = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    return panel.garantias.filter(
      (garantia) => {
        const coincideFiltro =
          filtroVigencia === "TODAS" ||
          garantia.ESTADO_VIGENCIA ===
            filtroVigencia;

        if (!coincideFiltro) {
          return false;
        }

        if (!texto) {
          return true;
        }

        return [
          garantia.CODIGO,
          garantia.CLIENTE,
          garantia.DNI,
          garantia.CELULAR,
          garantia.MARCA,
          garantia.MODELO,
          garantia.ESTADO_VIGENCIA,
          garantia.ESTADO_GARANTIA,
        ].some((valor) =>
          String(valor || "")
            .toLowerCase()
            .includes(texto)
        );
      }
    );
  }, [
    panel.garantias,
    busqueda,
    filtroVigencia,
  ]);

  function abrirNuevoReclamo(garantia) {
    setGarantiaSeleccionada(garantia);
    setFormularioNuevo(
      formularioNuevoInicial
    );
    setError("");
    setModalNuevo(true);
  }

  async function guardarNuevoReclamo(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const motivo =
        formularioNuevo.motivo.trim();

      if (
        motivo.length < 5 ||
        motivo.length > 1000
      ) {
        throw new Error(
          "El motivo debe tener entre 5 y 1000 caracteres"
        );
      }

      await registrarReclamoGarantia(
        garantiaSeleccionada.IDREPARACION,
        {
          motivo,
          observaciones:
            formularioNuevo
              .observaciones
              .trim() || null,
        }
      );

      await cargarPanel();
      setModalNuevo(false);
      setGarantiaSeleccionada(null);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  async function abrirGestion(reclamo) {
    try {
      setReclamoSeleccionado(reclamo);

      setFormularioGestion({
        estadoGarantia:
          reclamo.ESTADO_GARANTIA ||
          "PENDIENTE",
        diagnostico:
          reclamo.DIAGNOSTICO || "",
        solucion:
          reclamo.SOLUCION || "",
        observaciones:
          reclamo.OBSERVACIONES || "",
        comentario: "",
      });

      setHistorial([]);
      setError("");
      setCargandoHistorial(true);
      setModalGestion(true);

      const datos =
        await obtenerHistorialGarantia(
          reclamo.IDGARANTIA
        );

      setHistorial(datos);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargandoHistorial(false);
    }
  }

  async function guardarGestion(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (
        formularioGestion
          .estadoGarantia ===
          "RECHAZADA" &&
        (
          formularioGestion.comentario ||
          formularioGestion.observaciones
        )
          .trim()
          .length < 5
      ) {
        throw new Error(
          "Indica el motivo por el cual se rechaza la garantía"
        );
      }

      await actualizarReclamoGarantia(
        reclamoSeleccionado.IDGARANTIA,
        {
          estadoGarantia:
            formularioGestion
              .estadoGarantia,
          diagnostico:
            formularioGestion
              .diagnostico
              .trim() || null,
          solucion:
            formularioGestion
              .solucion
              .trim() || null,
          observaciones:
            formularioGestion
              .observaciones
              .trim() || null,
          comentario:
            formularioGestion
              .comentario
              .trim() || null,
        }
      );

      const historialActualizado =
        await obtenerHistorialGarantia(
          reclamoSeleccionado.IDGARANTIA
        );

      setHistorial(historialActualizado);
      await cargarPanel();
      setModalGestion(false);
      setReclamoSeleccionado(null);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  function buscarReclamo(idGarantia) {
    return panel.reclamos.find(
      (reclamo) =>
        Number(reclamo.IDGARANTIA) ===
        Number(idGarantia)
    );
  }

  const resumen = panel.resumen || {};

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Servicio posventa
          </p>

          <h1 className="mt-1 text-3xl font-black text-gray-950">
            Garantías
          </h1>

          <p className="mt-2 text-gray-600">
            Controla vencimientos y reclamos relacionados con las reparaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarPanel}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={19}
            className={
              cargando
                ? "animate-spin"
                : ""
            }
          />
          Actualizar
        </button>
      </div>

      {error &&
        !modalNuevo &&
        !modalGestion && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TarjetaResumen
          titulo="Garantías activas"
          valor={resumen.activas || 0}
          icono={ShieldCheck}
          clase="bg-emerald-100 text-emerald-700"
        />

        <TarjetaResumen
          titulo="Por vencer"
          valor={resumen.porVencer || 0}
          icono={Clock3}
          clase="bg-amber-100 text-amber-700"
        />

        <TarjetaResumen
          titulo="Vencidas"
          valor={resumen.vencidas || 0}
          icono={TriangleAlert}
          clase="bg-red-100 text-red-700"
        />

        <TarjetaResumen
          titulo="Reclamos abiertos"
          valor={
            resumen.reclamosAbiertos || 0
          }
          icono={CircleDot}
          clase="bg-blue-100 text-blue-700"
        />

        <TarjetaResumen
          titulo="Reclamos resueltos"
          valor={resumen.resueltos || 0}
          icono={BadgeCheck}
          clase="bg-violet-100 text-violet-700"
        />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-lg">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value
                )
              }
              placeholder="Buscar código, cliente, DNI o equipo"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-red-600"
            />
          </div>

          <select
            value={filtroVigencia}
            onChange={(evento) =>
              setFiltroVigencia(
                evento.target.value
              )
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-600"
          >
            <option value="TODAS">
              Todas las garantías
            </option>
            <option value="ACTIVA">
              Activas
            </option>
            <option value="POR_VENCER">
              Por vencer
            </option>
            <option value="VENCIDA">
              Vencidas
            </option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          {cargando ? (
            <div className="flex justify-center py-20">
              <LoaderCircle
                size={40}
                className="animate-spin text-red-700"
              />
            </div>
          ) : (
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">
                    Reparación
                  </th>
                  <th className="pb-4">
                    Cliente
                  </th>
                  <th className="pb-4">
                    Equipo
                  </th>
                  <th className="pb-4">
                    Entrega
                  </th>
                  <th className="pb-4">
                    Vencimiento
                  </th>
                  <th className="pb-4">
                    Vigencia
                  </th>
                  <th className="pb-4">
                    Último reclamo
                  </th>
                  <th className="pb-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {garantiasFiltradas.map(
                  (garantia) => {
                    const vigente =
                      garantia.ESTADO_VIGENCIA ===
                        "ACTIVA" ||
                      garantia.ESTADO_VIGENCIA ===
                        "POR_VENCER";

                    const reclamo =
                      garantia.IDGARANTIA
                        ? buscarReclamo(
                            garantia.IDGARANTIA
                          )
                        : null;

                    return (
                      <tr
                        key={
                          garantia.IDREPARACION
                        }
                        className="border-b border-gray-100"
                      >
                        <td className="py-4">
                          <p className="font-black text-gray-950">
                            {garantia.CODIGO}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              garantia.ESTADO_REPARACION
                            }
                          </p>
                        </td>

                        <td className="py-4">
                          <p className="font-semibold">
                            {garantia.CLIENTE}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            DNI: {garantia.DNI}
                          </p>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Smartphone
                              size={17}
                              className="text-gray-400"
                            />

                            <span>
                              {garantia.MARCA}{" "}
                              {garantia.MODELO}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 text-gray-600">
                          {formatearFecha(
                            garantia.FECHA_ENTREGA
                          )}
                        </td>

                        <td className="py-4">
                          <p className="font-semibold">
                            {formatearFecha(
                              garantia.FECHA_VENCIMIENTO
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {textoDiasRestantes(
                              garantia.DIAS_RESTANTES
                            )}
                          </p>
                        </td>

                        <td className="py-4">
                          <Estado
                            estado={
                              garantia.ESTADO_VIGENCIA
                            }
                            tipo="vigencia"
                          />
                        </td>

                        <td className="py-4">
                          {garantia.IDGARANTIA ? (
                            <div>
                              <Estado
                                estado={
                                  garantia.ESTADO_GARANTIA
                                }
                                tipo="reclamo"
                              />

                              <p className="mt-2 max-w-[240px] truncate text-xs text-gray-500">
                                {garantia.MOTIVO}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Sin reclamos
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            {reclamo && (
                              <button
                                type="button"
                                onClick={() =>
                                  abrirGestion(
                                    reclamo
                                  )
                                }
                                title="Gestionar reclamo"
                                className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                              >
                                <Pencil size={18} />
                              </button>
                            )}

                            {vigente &&
                              !Boolean(
                                garantia.RECLAMO_ABIERTO
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirNuevoReclamo(
                                      garantia
                                    )
                                  }
                                  title="Registrar reclamo"
                                  className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                                >
                                  <ClipboardPlus
                                    size={18}
                                  />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}

                {garantiasFiltradas.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center text-gray-500"
                    >
                      No se encontraron garantías.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <History
            size={21}
            className="text-violet-700"
          />

          <h2 className="text-xl font-black text-gray-950">
            Historial de reclamos
          </h2>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <LoaderCircle
              size={36}
              className="animate-spin text-red-700"
            />
          </div>
        ) : panel.reclamos.length === 0 ? (
          <div className="mt-5 rounded-xl bg-gray-50 py-12 text-center text-gray-500">
            Todavía no se han registrado reclamos de garantía.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-4">
                    Fecha
                  </th>
                  <th className="pb-4">
                    Reparación
                  </th>
                  <th className="pb-4">
                    Cliente
                  </th>
                  <th className="pb-4">
                    Motivo
                  </th>
                  <th className="pb-4">
                    Estado
                  </th>
                  <th className="pb-4">
                    Cierre
                  </th>
                  <th className="pb-4 text-right">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {panel.reclamos.map(
                  (reclamo) => (
                    <tr
                      key={reclamo.IDGARANTIA}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 text-gray-600">
                        {formatearFechaHora(
                          reclamo.FECHA_RETORNO
                        )}
                      </td>

                      <td className="py-4 font-bold">
                        {reclamo.CODIGO}
                      </td>

                      <td className="py-4">
                        {reclamo.CLIENTE}
                      </td>

                      <td className="max-w-[300px] py-4">
                        <p className="truncate">
                          {reclamo.MOTIVO}
                        </p>
                      </td>

                      <td className="py-4">
                        <Estado
                          estado={
                            reclamo.ESTADO_GARANTIA
                          }
                          tipo="reclamo"
                        />
                      </td>

                      <td className="py-4 text-gray-600">
                        {reclamo.FECHA_CIERRE
                          ? formatearFechaHora(
                              reclamo.FECHA_CIERRE
                            )
                          : "Sin cerrar"}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            abrirGestion(
                              reclamo
                            )
                          }
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                          title="Gestionar reclamo"
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalNuevo && (
        <ModalNuevoReclamo
          garantia={garantiaSeleccionada}
          formulario={formularioNuevo}
          setFormulario={setFormularioNuevo}
          guardando={guardando}
          error={error}
          guardar={guardarNuevoReclamo}
          cerrar={() => {
            setModalNuevo(false);
            setGarantiaSeleccionada(null);
            setError("");
          }}
        />
      )}

      {modalGestion && (
        <ModalGestionReclamo
          reclamo={reclamoSeleccionado}
          formulario={formularioGestion}
          setFormulario={setFormularioGestion}
          historial={historial}
          cargandoHistorial={cargandoHistorial}
          guardando={guardando}
          error={error}
          guardar={guardarGestion}
          cerrar={() => {
            setModalGestion(false);
            setReclamoSeleccionado(null);
            setHistorial([]);
            setError("");
          }}
        />
      )}
    </section>
  );
}

function ModalNuevoReclamo({
  garantia,
  formulario,
  setFormulario,
  guardando,
  error,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/65 p-4">
      <form
        onSubmit={guardar}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b px-7 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardPlus
                size={23}
                className="text-emerald-700"
              />

              <h2 className="text-2xl font-black">
                Registrar reclamo
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {garantia?.CODIGO} —{" "}
              {garantia?.MARCA}{" "}
              {garantia?.MODELO}
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

        <div className="space-y-5 p-7">
          <div className="grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
            <Dato
              icono={UserRound}
              titulo="Cliente"
              valor={garantia?.CLIENTE}
            />

            <Dato
              icono={CalendarDays}
              titulo="Garantía hasta"
              valor={formatearFecha(
                garantia?.FECHA_VENCIMIENTO
              )}
            />
          </div>

          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-semibold">
              <span>Motivo del regreso *</span>
              <span className="font-normal text-gray-500">
                {formulario.motivo.length}/1000
              </span>
            </span>

            <textarea
              value={formulario.motivo}
              onChange={(evento) =>
                setFormulario(
                  (anterior) => ({
                    ...anterior,
                    motivo:
                      evento.target.value.slice(
                        0,
                        1000
                      ),
                  })
                )
              }
              rows="5"
              required
              placeholder="Explica qué problema volvió a presentar el equipo"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-semibold">
              <span>Observaciones</span>
              <span className="font-normal text-gray-500">
                {
                  formulario.observaciones
                    .length
                }/1000
              </span>
            </span>

            <textarea
              value={formulario.observaciones}
              onChange={(evento) =>
                setFormulario(
                  (anterior) => ({
                    ...anterior,
                    observaciones:
                      evento.target.value.slice(
                        0,
                        1000
                      ),
                  })
                )
              }
              rows="4"
              placeholder="Condición del equipo al regresar u otros detalles"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {guardando && (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              )}
              Registrar reclamo
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ModalGestionReclamo({
  reclamo,
  formulario,
  setFormulario,
  historial,
  cargandoHistorial,
  guardando,
  error,
  guardar,
  cerrar,
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-7 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={24}
                className="text-blue-700"
              />

              <h2 className="text-2xl font-black">
                Gestionar garantía
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {reclamo?.CODIGO} —{" "}
              {reclamo?.CLIENTE}
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

        <div className="grid gap-7 p-7 lg:grid-cols-[1fr_380px]">
          <form
            onSubmit={guardar}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-500">
                Motivo original
              </p>

              <p className="mt-2 whitespace-pre-line text-gray-900">
                {reclamo?.MOTIVO}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Estado del reclamo
              </span>

              <select
                value={
                  formulario.estadoGarantia
                }
                onChange={(evento) =>
                  setFormulario(
                    (anterior) => ({
                      ...anterior,
                      estadoGarantia:
                        evento.target.value,
                    })
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="PENDIENTE">
                  Pendiente
                </option>
                <option value="EN_REVISION">
                  En revisión
                </option>
                <option value="RESUELTA">
                  Resuelta
                </option>
                <option value="RECHAZADA">
                  Rechazada
                </option>
              </select>
            </label>

            <AreaGestion
              label="Diagnóstico de garantía"
              value={formulario.diagnostico}
              onChange={(valor) =>
                setFormulario(
                  (anterior) => ({
                    ...anterior,
                    diagnostico: valor,
                  })
                )
              }
            />

            <AreaGestion
              label="Solución aplicada"
              value={formulario.solucion}
              onChange={(valor) =>
                setFormulario(
                  (anterior) => ({
                    ...anterior,
                    solucion: valor,
                  })
                )
              }
            />

            <AreaGestion
              label="Observaciones"
              value={formulario.observaciones}
              onChange={(valor) =>
                setFormulario(
                  (anterior) => ({
                    ...anterior,
                    observaciones: valor,
                  })
                )
              }
            />

            <label className="block">
              <span className="mb-2 flex justify-between text-sm font-semibold">
                <span>
                  Comentario para el historial
                </span>

                <span className="font-normal text-gray-500">
                  {
                    formulario.comentario
                      .length
                  }/500
                </span>
              </span>

              <textarea
                value={formulario.comentario}
                onChange={(evento) =>
                  setFormulario(
                    (anterior) => ({
                      ...anterior,
                      comentario:
                        evento.target.value.slice(
                          0,
                          500
                        ),
                    })
                  )
                }
                rows="3"
                placeholder="Ejemplo: se inició la revisión del equipo"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrar}
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {guardando && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}
                Guardar cambios
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-gray-50 p-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <History
                size={20}
                className="text-violet-700"
              />

              <h3 className="font-black text-gray-950">
                Historial de estados
              </h3>
            </div>

            {cargandoHistorial ? (
              <div className="flex justify-center py-14">
                <LoaderCircle
                  size={32}
                  className="animate-spin text-violet-700"
                />
              </div>
            ) : historial.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                Sin movimientos registrados.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {historial.map(
                  (movimiento) => (
                    <article
                      key={
                        movimiento.IDHISTORIAL_GARANTIA
                      }
                      className="relative border-l-2 border-violet-200 pl-5"
                    >
                      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-violet-600" />

                      <Estado
                        estado={
                          movimiento.ESTADO_NUEVO
                        }
                        tipo="reclamo"
                      />

                      <p className="mt-2 text-sm text-gray-700">
                        {movimiento.COMENTARIO ||
                          "Sin comentario"}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatearFechaHora(
                          movimiento.FECHA
                        )}
                        {" · "}
                        {movimiento.USUARIO ||
                          "Usuario"}
                      </p>
                    </article>
                  )
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function TarjetaResumen({
  titulo,
  valor,
  icono: Icono,
  clase,
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div
        className={`inline-flex rounded-xl p-3 ${clase}`}
      >
        <Icono size={22} />
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-500">
        {titulo}
      </p>

      <p className="mt-1 text-3xl font-black text-gray-950">
        {valor}
      </p>
    </article>
  );
}

function Estado({ estado, tipo }) {
  const nombre = String(
    estado || "SIN ESTADO"
  );

  const clasesVigencia = {
    ACTIVA:
      "bg-emerald-100 text-emerald-700",
    POR_VENCER:
      "bg-amber-100 text-amber-700",
    VENCIDA:
      "bg-red-100 text-red-700",
  };

  const clasesReclamo = {
    PENDIENTE:
      "bg-amber-100 text-amber-700",
    EN_REVISION:
      "bg-blue-100 text-blue-700",
    RESUELTA:
      "bg-emerald-100 text-emerald-700",
    RECHAZADA:
      "bg-red-100 text-red-700",
  };

  const clase =
    tipo === "vigencia"
      ? clasesVigencia[nombre]
      : clasesReclamo[nombre];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        clase ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {nombre.replaceAll("_", " ")}
    </span>
  );
}

function Dato({
  icono: Icono,
  titulo,
  valor,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-white p-2 text-gray-500">
        <Icono size={18} />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500">
          {titulo}
        </p>

        <p className="mt-1 font-bold text-gray-950">
          {valor || "Sin información"}
        </p>
      </div>
    </div>
  );
}

function AreaGestion({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm font-semibold">
        <span>{label}</span>

        <span className="font-normal text-gray-500">
          {value.length}/1000
        </span>
      </span>

      <textarea
        value={value}
        onChange={(evento) =>
          onChange(
            evento.target.value.slice(
              0,
              1000
            )
          )
        }
        rows="4"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
      />
    </label>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-PE"
  ).format(valor);
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(valor);
}

function textoDiasRestantes(dias) {
  const numero = Number(dias);

  if (!Number.isFinite(numero)) {
    return "Sin información";
  }

  if (numero < 0) {
    const cantidad = Math.abs(numero);

    return `Venció hace ${cantidad} ${
      cantidad === 1 ? "día" : "días"
    }`;
  }

  if (numero === 0) {
    return "Vence hoy";
  }

  return `Quedan ${numero} ${
    numero === 1 ? "día" : "días"
  }`;
}

export default Guarantees;
