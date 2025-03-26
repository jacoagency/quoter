import { Suspense } from "react"
import CostCalculator from "@/components/cost-calculator"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
          Cotizador de Proyectos Tecnológicos
        </h1>
        <p className="text-center mb-8 text-slate-600 dark:text-slate-300">
          Estima los costos de desarrollo y operación de tus proyectos
        </p>

        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <CostCalculator />
        </Suspense>
      </div>
      <Toaster />
    </main>
  )
}

