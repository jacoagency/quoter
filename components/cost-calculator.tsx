"use client"

import { TableFooter } from "@/components/ui/table"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Download, Copy, Save, Trash2, Plus, FileText } from "lucide-react"
import { aiModels, infrastructureOptions, databaseOptions, calculateCosts } from "@/lib/cost-calculator"
import type { Project } from "@/lib/types"

// Función auxiliar para calcular el costo de un modelo de IA
function calculateModelCost(modelId: string, userCount: number, apiCallsPerUserPerMonth: number): number {
  const model = aiModels.find((m) => m.id === modelId)
  if (!model) return 0
  
  // Asumimos un promedio de 1000 tokens por llamada
  const costPerCall = model.costPer1000Tokens
  const totalCalls = userCount * apiCallsPerUserPerMonth
  return costPerCall * totalCalls
}

// Función auxiliar para calcular el costo de infraestructura
function calculateInfraCost(providerId: string, tier: string, userCount: number): number {
  const provider = infrastructureOptions.find((p) => p.id === providerId)
  if (!provider) return 0
  
  const tierMultiplier = provider.tiers[tier]?.multiplier || 1
  const baseCost = provider.baseCost * tierMultiplier
  const scalingCost = provider.scalingFactor * userCount * tierMultiplier

  return baseCost + scalingCost
}

// Función auxiliar para calcular el costo de base de datos
function calculateDBCost(providerId: string, tier: string, userCount: number): number {
  const provider = databaseOptions.find((p) => p.id === providerId)
  if (!provider) return 0
  
  const tierMultiplier = provider.tiers[tier]?.multiplier || 1
  const baseCost = provider.baseCost * tierMultiplier
  const scalingCost = provider.scalingFactor * userCount * tierMultiplier

  return baseCost + scalingCost
}

// Función auxiliar para obtener los tiers de un proveedor
function getProviderTiers(providerId: string, type: 'infrastructure' | 'database'): { id: string, name: string }[] {
  const options = type === 'infrastructure' ? infrastructureOptions : databaseOptions
  const provider = options.find((p) => p.id === providerId)
  
  if (!provider) return []
  
  return Object.entries(provider.tiers).map(([id, tier]) => ({
    id,
    name: tier.name
  }))
}

// Función auxiliar para obtener el tier por defecto
function getDefaultTier(providerId: string, type: 'infrastructure' | 'database'): string {
  const tiers = getProviderTiers(providerId, type)
  return tiers.length > 0 ? tiers[0].id : ''
}

export default function CostCalculator() {
  const { toast } = useToast()
  const [project, setProject] = useState<Project>({
    name: "Nuevo Proyecto",
    userCount: 1000,
    aiTechnologies: [],
    infrastructure: [],
    databases: [],
    apiCallsPerUserPerMonth: 10,
  })

  const [presets, setPresets] = useState<Project[]>([])
  const [presetName, setPresetName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load presets from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem("costCalculatorPresets")
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets))
    }
  }, [])

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("costCalculatorPresets", JSON.stringify(presets))
  }, [presets])

  const costs = calculateCosts(project)

  const addAITechnology = () => {
    setProject((prev) => ({
      ...prev,
      aiTechnologies: [
        ...prev.aiTechnologies,
        { id: Date.now().toString(), modelId: aiModels[0].id, customCost: null },
      ],
    }))
  }

  const removeAITechnology = (id: string) => {
    setProject((prev) => ({
      ...prev,
      aiTechnologies: prev.aiTechnologies.filter((tech) => tech.id !== id),
    }))
  }

  const updateAITechnology = (id: string, modelId: string, customCost: number | null) => {
    setProject((prev) => ({
      ...prev,
      aiTechnologies: prev.aiTechnologies.map((tech) => (tech.id === id ? { ...tech, modelId, customCost } : tech)),
    }))
  }

  const addInfrastructure = () => {
    setProject((prev) => ({
      ...prev,
      infrastructure: [
        ...prev.infrastructure,
        { id: Date.now().toString(), providerId: infrastructureOptions[0].id, tier: "basic", customCost: null },
      ],
    }))
  }

  const removeInfrastructure = (id: string) => {
    setProject((prev) => ({
      ...prev,
      infrastructure: prev.infrastructure.filter((infra) => infra.id !== id),
    }))
  }

  const updateInfrastructure = (id: string, providerId: string, tier: string, customCost: number | null) => {
    setProject((prev) => ({
      ...prev,
      infrastructure: prev.infrastructure.map((infra) =>
        infra.id === id ? { ...infra, providerId, tier, customCost } : infra,
      ),
    }))
  }

  const addDatabase = () => {
    setProject((prev) => ({
      ...prev,
      databases: [
        ...prev.databases,
        { id: Date.now().toString(), providerId: databaseOptions[0].id, tier: "basic", customCost: null },
      ],
    }))
  }

  const removeDatabase = (id: string) => {
    setProject((prev) => ({
      ...prev,
      databases: prev.databases.filter((db) => db.id !== id),
    }))
  }

  const updateDatabase = (id: string, providerId: string, tier: string, customCost: number | null) => {
    setProject((prev) => ({
      ...prev,
      databases: prev.databases.map((db) => (db.id === id ? { ...db, providerId, tier, customCost } : db)),
    }))
  }

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre para el preset",
        variant: "destructive",
      })
      return
    }

    const newPreset = {
      ...project,
      name: presetName,
    }

    setPresets((prev) => [...prev, newPreset])
    setPresetName("")
    setShowSaveDialog(false)

    toast({
      title: "Preset guardado",
      description: `El preset "${presetName}" ha sido guardado correctamente`,
    })
  }

  const loadPreset = (preset: Project) => {
    setProject(preset)
    toast({
      title: "Preset cargado",
      description: `El preset "${preset.name}" ha sido cargado correctamente`,
    })
  }

  const deletePreset = (index: number) => {
    const presetName = presets[index].name
    setPresets((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "Preset eliminado",
      description: `El preset "${presetName}" ha sido eliminado`,
    })
  }

  const copyToClipboard = () => {
    const costBreakdown = `
COTIZACIÓN DE PROYECTO TECNOLÓGICO

Nombre del proyecto: ${project.name}
Número de usuarios: ${project.userCount.toLocaleString()}
Llamadas a API por usuario al mes: ${project.apiCallsPerUserPerMonth.toLocaleString()}

COSTOS MENSUALES:
- APIs y modelos de IA: $${costs.aiCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Infraestructura: $${costs.infrastructureCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Bases de datos: $${costs.databaseCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

COSTO TOTAL MENSUAL: $${costs.totalMonthlyCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
COSTO TOTAL ANUAL: $${costs.totalYearlyCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
    `

    navigator.clipboard.writeText(costBreakdown)
    toast({
      title: "Copiado al portapapeles",
      description: "La cotización ha sido copiada al portapapeles",
    })
  }

  const exportToPDF = () => {
    // En una implementación real, aquí se generaría un PDF
    toast({
      title: "Exportar a PDF",
      description: "Esta funcionalidad requiere una biblioteca adicional como jsPDF o react-pdf",
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Proyecto</CardTitle>
          <CardDescription>Define los parámetros básicos de tu proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del Proyecto</Label>
            <Input
              id="project-name"
              value={project.name}
              onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="user-count">Número de Usuarios</Label>
              <Badge variant="outline">{project.userCount.toLocaleString()}</Badge>
            </div>
            <Slider
              id="user-count"
              min={100}
              max={1000000}
              step={1000}
              value={[project.userCount]}
              onValueChange={(value) => setProject((prev) => ({ ...prev, userCount: value[0] }))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100</span>
              <span>330,000</span>
              <span>660,000</span>
              <span>1M</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="api-calls">Llamadas a API por Usuario al Mes</Label>
              <Badge variant="outline">{project.apiCallsPerUserPerMonth}</Badge>
            </div>
            <Slider
              id="api-calls"
              min={1}
              max={1000}
              step={10}
              value={[project.apiCallsPerUserPerMonth]}
              onValueChange={(value) => setProject((prev) => ({ ...prev, apiCallsPerUserPerMonth: value[0] }))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ai">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="ai">APIs y Modelos de IA</TabsTrigger>
          <TabsTrigger value="infrastructure">Infraestructura</TabsTrigger>
          <TabsTrigger value="database">Bases de Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>APIs y Modelos de IA</CardTitle>
              <CardDescription>Selecciona los modelos de IA que utilizarás en tu proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              {project.aiTechnologies.map((tech, index) => (
                <div key={tech.id} className="flex flex-wrap gap-4 items-end mb-4 pb-4 border-b last:border-0">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor={`ai-model-${index}`} className="mb-2 block">
                      Modelo
                    </Label>
                    <Select
                      value={tech.modelId}
                      onValueChange={(value) => updateAITechnology(tech.id, value, null)}
                    >
                      <SelectTrigger id={`ai-model-${index}`}>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} (${model.costPer1000Tokens})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[180px]">
                    <Label htmlFor={`calculated-cost-${index}`} className="mb-2 block">
                      Costo Estimado
                    </Label>
                    <div id={`calculated-cost-${index}`} className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      ${calculateModelCost(tech.modelId, project.userCount, project.apiCallsPerUserPerMonth).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>

                  <Button variant="destructive" size="icon" onClick={() => removeAITechnology(tech.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2" onClick={addAITechnology}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Modelo de IA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Infraestructura</CardTitle>
              <CardDescription>Configura los servidores y servicios de infraestructura</CardDescription>
            </CardHeader>
            <CardContent>
              {project.infrastructure.map((infra, index) => (
                <div key={infra.id} className="flex flex-wrap gap-4 items-end mb-4 pb-4 border-b last:border-0">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor={`infra-provider-${index}`} className="mb-2 block">
                      Proveedor
                    </Label>
                    <Select
                      value={infra.providerId}
                      onValueChange={(value) => updateInfrastructure(infra.id, value, getDefaultTier(value, 'infrastructure'), null)}
                    >
                      <SelectTrigger id={`infra-provider-${index}`}>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {infrastructureOptions.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[150px]">
                    <Label htmlFor={`infra-tier-${index}`} className="mb-2 block">
                      Nivel
                    </Label>
                    <Select
                      value={infra.tier}
                      onValueChange={(value) =>
                        updateInfrastructure(infra.id, infra.providerId, value, null)
                      }
                    >
                      <SelectTrigger id={`infra-tier-${index}`}>
                        <SelectValue placeholder="Nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProviderTiers(infra.providerId, 'infrastructure').map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[180px]">
                    <Label htmlFor={`calculated-infra-cost-${index}`} className="mb-2 block">
                      Costo Estimado
                    </Label>
                    <div id={`calculated-infra-cost-${index}`} className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      ${calculateInfraCost(infra.providerId, infra.tier, project.userCount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>

                  <Button variant="destructive" size="icon" onClick={() => removeInfrastructure(infra.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2" onClick={addInfrastructure}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Infraestructura
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bases de Datos</CardTitle>
              <CardDescription>Configura las bases de datos para tu proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              {project.databases.map((db, index) => (
                <div key={db.id} className="flex flex-wrap gap-4 items-end mb-4 pb-4 border-b last:border-0">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor={`db-provider-${index}`} className="mb-2 block">
                      Proveedor
                    </Label>
                    <Select
                      value={db.providerId}
                      onValueChange={(value) => updateDatabase(db.id, value, getDefaultTier(value, 'database'), null)}
                    >
                      <SelectTrigger id={`db-provider-${index}`}>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseOptions.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[150px]">
                    <Label htmlFor={`db-tier-${index}`} className="mb-2 block">
                      Nivel
                    </Label>
                    <Select
                      value={db.tier}
                      onValueChange={(value) => updateDatabase(db.id, db.providerId, value, null)}
                    >
                      <SelectTrigger id={`db-tier-${index}`}>
                        <SelectValue placeholder="Nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProviderTiers(db.providerId, 'database').map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[180px]">
                    <Label htmlFor={`calculated-db-cost-${index}`} className="mb-2 block">
                      Costo Estimado
                    </Label>
                    <div id={`calculated-db-cost-${index}`} className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      ${calculateDBCost(db.providerId, db.tier, project.userCount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>

                  <Button variant="destructive" size="icon" onClick={() => removeDatabase(db.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2" onClick={addDatabase}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Base de Datos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Costos</CardTitle>
          <CardDescription>Desglose de costos estimados para tu proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Costo Mensual</TableHead>
                <TableHead className="text-right">Costo Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>APIs y Modelos de IA</TableCell>
                <TableCell className="text-right">${costs.aiCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right">${(costs.aiCosts * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Infraestructura</TableCell>
                <TableCell className="text-right">${costs.infrastructureCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right">${(costs.infrastructureCosts * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bases de Datos</TableCell>
                <TableCell className="text-right">${costs.databaseCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right">${(costs.databaseCosts * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell className="text-right">${costs.totalMonthlyCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right">${costs.totalYearlyCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" /> Guardar Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar Configuración</DialogTitle>
                  <DialogDescription>Guarda esta configuración para usarla en el futuro</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="preset-name" className="mb-2 block">
                    Nombre del Preset
                  </Label>
                  <Input
                    id="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Ej: Proyecto IA Básico"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={savePreset}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Cargar Preset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cargar Configuración</DialogTitle>
                  <DialogDescription>Selecciona una configuración guardada</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[300px] overflow-y-auto">
                  {presets.length === 0 ? (
                    <p className="text-center text-muted-foreground">No hay presets guardados</p>
                  ) : (
                    <div className="space-y-2">
                      {presets.map((preset, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{preset.name}</span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => loadPreset(preset)}>
                              Cargar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePreset(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

