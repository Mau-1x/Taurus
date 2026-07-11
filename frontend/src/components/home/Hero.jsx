import { ArrowRight, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white">

      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-700/20 blur-3xl"></div>
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-between gap-16 px-6 py-20 lg:flex-row">

        {/* Texto */}

        <motion.div
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
          className="max-w-2xl"
        >

          <span className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold">
            Servicio Técnico Especializado
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-7xl">
            Tu celular en las
            <span className="text-red-500"> mejores manos.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-300 leading-8">
            Especialistas en reparación de celulares y tablets.
            Pantallas, baterías, software, liberaciones,
            puertos de carga, cámaras y accesorios con garantía.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <button className="flex items-center gap-2 rounded-xl bg-red-700 px-7 py-4 font-semibold transition hover:scale-105 hover:bg-red-800">

              Reservar ahora

              <ArrowRight size={20}/>

            </button>

            <button className="rounded-xl border border-white px-7 py-4 font-semibold hover:bg-white hover:text-black transition">

              Ver servicios

            </button>

          </div>

          <div className="mt-14 grid grid-cols-3 gap-6">

            <div>
              <h2 className="text-3xl font-bold text-red-500">
                +3000
              </h2>

              <p className="text-gray-400">
                Reparaciones
              </p>

            </div>

            <div>

              <h2 className="text-3xl font-bold text-red-500">
                +5
              </h2>

              <p className="text-gray-400">
                Años
              </p>

            </div>

            <div>

              <h2 className="text-3xl font-bold text-red-500">
                100%
              </h2>

              <p className="text-gray-400">
                Garantía
              </p>

            </div>

          </div>

        </motion.div>

        {/* Tarjeta */}

        <motion.div
          initial={{ opacity:0, y:60 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.8 }}
          className="rounded-3xl border border-white/10 bg-white/10 p-10 backdrop-blur-xl"
        >

          <div className="space-y-8">

            <div className="flex items-center gap-5">

              <Smartphone size={45} className="text-red-500"/>

              <div>

                <h3 className="font-bold text-xl">
                  Reparación Express
                </h3>

                <p className="text-gray-300">
                  Diagnóstico rápido.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-5">

              <ShieldCheck size={45} className="text-green-400"/>

              <div>

                <h3 className="font-bold text-xl">
                  Garantía
                </h3>

                <p className="text-gray-300">
                  Todas las reparaciones tienen garantía.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-5">

              <Wrench size={45} className="text-yellow-400"/>

              <div>

                <h3 className="font-bold text-xl">
                  Hardware & Software
                </h3>

                <p className="text-gray-300">
                  Soluciones completas para cualquier falla.
                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default Hero;