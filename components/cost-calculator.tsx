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
import { 
  getBestAIModel, 
  getBestInfrastructure, 
  getBestDatabase, 
  getProviderName, 
  getTierName 
} from "@/lib/recommendations"
import { RecommendationCard } from "@/components/recommendation-card"

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

// Función para formatear números con comas
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    subscriptionPricePerUser: 9.99,
  })

  const [presets, setPresets] = useState<Project[]>([])
  const [presetName, setPresetName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Estado para las recomendaciones
  const [recommendations, setRecommendations] = useState({
    ai: getBestAIModel(1000, 10),
    infrastructure: getBestInfrastructure(1000),
    database: getBestDatabase(1000)
  });

  // Actualizar recomendaciones cuando cambian los parámetros
  useEffect(() => {
    setRecommendations({
      ai: getBestAIModel(project.userCount, project.apiCallsPerUserPerMonth),
      infrastructure: getBestInfrastructure(project.userCount),
      database: getBestDatabase(project.userCount)
    });
  }, [project.userCount, project.apiCallsPerUserPerMonth]);

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
    const revenue = calculateRevenue();
    const costBreakdown = `
COTIZACIÓN DE PROYECTO TECNOLÓGICO

Nombre del proyecto: ${project.name}
Número de usuarios: ${project.userCount.toLocaleString()}
Precio de suscripción por usuario: $${project.subscriptionPricePerUser.toFixed(2)}
Llamadas a API por usuario al mes: ${project.apiCallsPerUserPerMonth}

COSTOS MENSUALES:
- APIs y modelos de IA: $${formatNumber(costs.aiCosts)}
- Infraestructura: $${formatNumber(costs.infrastructureCosts)}
- Bases de datos: $${formatNumber(costs.databaseCosts)}

TOTAL COSTOS MENSUALES: $${formatNumber(costs.totalMonthlyCost)}
TOTAL COSTOS ANUALES: $${formatNumber(costs.totalYearlyCost)}

INGRESOS Y UTILIDAD:
- Ingresos mensuales: $${formatNumber(revenue.monthlyRevenue)}
- Ingresos anuales: $${formatNumber(revenue.yearlyRevenue)}
- Utilidad mensual: $${formatNumber(revenue.monthlyProfit)} (${revenue.profitMargin.toFixed(1)}%)
- Utilidad anual: $${formatNumber(revenue.yearlyProfit)}
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

  // Función para aplicar una recomendación de IA
  const applyAIRecommendation = () => {
    if (project.aiTechnologies.length === 0) {
      // Si no hay tecnologías, añade la recomendada
      setProject(prev => ({
        ...prev,
        aiTechnologies: [
          { id: Date.now().toString(), modelId: recommendations.ai.id, customCost: null }
        ]
      }));
    } else {
      // Si ya hay tecnologías, actualiza la primera
      setProject(prev => ({
        ...prev,
        aiTechnologies: prev.aiTechnologies.map((tech, index) => 
          index === 0 ? { ...tech, modelId: recommendations.ai.id, customCost: null } : tech
        )
      }));
    }
    
    toast({
      title: "Recomendación aplicada",
      description: `Se ha aplicado el modelo ${recommendations.ai.name}`,
    });
  };

  // Función para aplicar una recomendación de infraestructura
  const applyInfraRecommendation = () => {
    if (project.infrastructure.length === 0) {
      // Si no hay infraestructura, añade la recomendada
      setProject(prev => ({
        ...prev,
        infrastructure: [
          { 
            id: Date.now().toString(), 
            providerId: recommendations.infrastructure.providerId, 
            tier: recommendations.infrastructure.tier, 
            customCost: null 
          }
        ]
      }));
    } else {
      // Si ya hay infraestructura, actualiza la primera
      setProject(prev => ({
        ...prev,
        infrastructure: prev.infrastructure.map((infra, index) => 
          index === 0 ? { 
            ...infra, 
            providerId: recommendations.infrastructure.providerId, 
            tier: recommendations.infrastructure.tier, 
            customCost: null 
          } : infra
        )
      }));
    }
    
    toast({
      title: "Recomendación aplicada",
      description: `Se ha aplicado ${getProviderName(recommendations.infrastructure.providerId, 'infrastructure')} (${getTierName(recommendations.infrastructure.providerId, recommendations.infrastructure.tier, 'infrastructure')})`,
    });
  };

  // Función para aplicar una recomendación de base de datos
  const applyDBRecommendation = () => {
    if (project.databases.length === 0) {
      // Si no hay bases de datos, añade la recomendada
      setProject(prev => ({
        ...prev,
        databases: [
          { 
            id: Date.now().toString(), 
            providerId: recommendations.database.providerId, 
            tier: recommendations.database.tier, 
            customCost: null 
          }
        ]
      }));
    } else {
      // Si ya hay bases de datos, actualiza la primera
      setProject(prev => ({
        ...prev,
        databases: prev.databases.map((db, index) => 
          index === 0 ? { 
            ...db, 
            providerId: recommendations.database.providerId, 
            tier: recommendations.database.tier, 
            customCost: null 
          } : db
        )
      }));
    }
    
    toast({
      title: "Recomendación aplicada",
      description: `Se ha aplicado ${getProviderName(recommendations.database.providerId, 'database')} (${getTierName(recommendations.database.providerId, recommendations.database.tier, 'database')})`,
    });
  };

  // Calcular ingresos y utilidad
  const calculateRevenue = () => {
    const monthlyRevenue = project.userCount * project.subscriptionPricePerUser;
    const yearlyRevenue = monthlyRevenue * 12;
    const monthlyProfit = monthlyRevenue - costs.totalMonthlyCost;
    const yearlyProfit = yearlyRevenue - costs.totalYearlyCost;
    const profitMargin = (monthlyProfit / monthlyRevenue) * 100;

    return {
      monthlyRevenue,
      yearlyRevenue,
      monthlyProfit,
      yearlyProfit,
      profitMargin
    };
  };

  const revenue = calculateRevenue();

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
            <div className="flex items-center justify-between">
              <Label htmlFor="subscription-price">Precio de Suscripción por Usuario (USD)</Label>
              <div className="relative w-32">
                <div className="flex">
                  <div className="flex items-center justify-center h-10 w-8 rounded-l-md border border-r-0 border-input bg-muted">
                    <span className="text-muted-foreground">$</span>
                  </div>
                  <Input
                    id="subscription-price"
                    type="number"
                    step={0.01}
                    value={project.subscriptionPricePerUser === 0 ? "" : project.subscriptionPricePerUser}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setProject((prev) => ({ ...prev, subscriptionPricePerUser: 0 }));
                      } else {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          setProject((prev) => ({ ...prev, subscriptionPricePerUser: value }));
                        }
                      }
                    }}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
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
          <RecommendationCard
            title="Recomendación"
            subtitle={`Para tus parámetros actuales, te recomendamos: ${recommendations.ai.name}`}
            reason={recommendations.ai.reason}
            colorScheme="green"
            onClick={applyAIRecommendation}
          />
          
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
                      ${formatNumber(calculateModelCost(tech.modelId, project.userCount, project.apiCallsPerUserPerMonth))}
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
          <RecommendationCard
            title="Recomendación"
            subtitle={`Para ${project.userCount.toLocaleString()} usuarios, recomendamos: ${getProviderName(recommendations.infrastructure.providerId, 'infrastructure')} (${getTierName(recommendations.infrastructure.providerId, recommendations.infrastructure.tier, 'infrastructure')})`}
            reason={recommendations.infrastructure.reason}
            colorScheme="blue"
            onClick={applyInfraRecommendation}
          />
          
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
                      ${formatNumber(calculateInfraCost(infra.providerId, infra.tier, project.userCount))}
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
          <RecommendationCard
            title="Recomendación"
            subtitle={`Para ${project.userCount.toLocaleString()} usuarios, recomendamos: ${getProviderName(recommendations.database.providerId, 'database')} (${getTierName(recommendations.database.providerId, recommendations.database.tier, 'database')})`}
            reason={recommendations.database.reason}
            colorScheme="purple"
            onClick={applyDBRecommendation}
          />
          
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
                      ${formatNumber(calculateDBCost(db.providerId, db.tier, project.userCount))}
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
          <CardTitle>Resumen de Costos e Ingresos</CardTitle>
          <CardDescription>Desglose financiero estimado para tu proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Costos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Mensual</TableHead>
                      <TableHead className="text-right">Anual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>APIs y Modelos de IA</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.aiCosts)}</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.aiCosts * 12)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Infraestructura</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.infrastructureCosts)}</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.infrastructureCosts * 12)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bases de Datos</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.databaseCosts)}</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.databaseCosts * 12)}</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>Total de Costos</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.totalMonthlyCost)}</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.totalYearlyCost)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ingresos y Utilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Métrica</TableHead>
                      <TableHead className="text-right">Mensual</TableHead>
                      <TableHead className="text-right">Anual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ingresos por Suscripciones</TableCell>
                      <TableCell className="text-right">${formatNumber(revenue.monthlyRevenue)}</TableCell>
                      <TableCell className="text-right">${formatNumber(revenue.yearlyRevenue)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Costos Totales</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.totalMonthlyCost)}</TableCell>
                      <TableCell className="text-right">${formatNumber(costs.totalYearlyCost)}</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>
                        Utilidad Neta 
                        <span className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full ${revenue.monthlyProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {revenue.profitMargin >= 0 ? `+${revenue.profitMargin.toFixed(1)}%` : `${revenue.profitMargin.toFixed(1)}%`}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right ${revenue.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${formatNumber(Math.abs(revenue.monthlyProfit))}
                        {revenue.monthlyProfit < 0 && <span className="ml-1">(Pérdida)</span>}
                      </TableCell>
                      <TableCell className={`text-right ${revenue.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${formatNumber(Math.abs(revenue.yearlyProfit))}
                        {revenue.yearlyProfit < 0 && <span className="ml-1">(Pérdida)</span>}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
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

