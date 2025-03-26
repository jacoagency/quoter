import type { AIModel, InfrastructureProvider, DatabaseProvider, Project, CostBreakdown } from "./types"

// Modelos de IA y sus costos aproximados
export const aiModels: AIModel[] = [
  {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    costPer1000Tokens: 0.01,
    provider: "OpenAI",
  },
  {
    id: "gpt-3.5-turbo",
    name: "OpenAI GPT-3.5 Turbo",
    costPer1000Tokens: 0.002,
    provider: "OpenAI",
  },
  {
    id: "claude-3-opus",
    name: "Anthropic Claude 3 Opus",
    costPer1000Tokens: 0.015,
    provider: "Anthropic",
  },
  {
    id: "claude-3-sonnet",
    name: "Anthropic Claude 3 Sonnet",
    costPer1000Tokens: 0.008,
    provider: "Anthropic",
  },
  {
    id: "gemini-pro",
    name: "Google Gemini Pro",
    costPer1000Tokens: 0.0025,
    provider: "Google",
  },
  {
    id: "gemini-ultra",
    name: "Google Gemini Ultra",
    costPer1000Tokens: 0.012,
    provider: "Google",
  },
  {
    id: "grok-1",
    name: "xAI Grok-1",
    costPer1000Tokens: 0.005,
    provider: "xAI",
  },
]

// Opciones de infraestructura y sus costos aproximados
export const infrastructureOptions: InfrastructureProvider[] = [
  {
    id: "vercel",
    name: "Vercel",
    baseCost: 20,
    scalingFactor: 0.00014, // $0.14 por GB/hora adicional
    tiers: {
      basic: {
        multiplier: 1,
        name: "Hobby",
      },
      pro: {
        multiplier: 2,
        name: "Pro",
      },
      enterprise: {
        multiplier: 5,
        name: "Enterprise",
      },
    },
  },
  {
    id: "aws-ec2",
    name: "AWS EC2",
    baseCost: 30,
    scalingFactor: 0.0001, // $0.01 por hora para t3.micro
    tiers: {
      basic: {
        multiplier: 1,
        name: "t3.micro",
      },
      pro: {
        multiplier: 3,
        name: "t3.medium",
      },
      enterprise: {
        multiplier: 8,
        name: "t3.xlarge",
      },
    },
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    baseCost: 25,
    scalingFactor: 0.00012,
    tiers: {
      basic: {
        multiplier: 1,
        name: "e2-small",
      },
      pro: {
        multiplier: 2.5,
        name: "e2-medium",
      },
      enterprise: {
        multiplier: 7,
        name: "e2-standard-4",
      },
    },
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    baseCost: 28,
    scalingFactor: 0.00013,
    tiers: {
      basic: {
        multiplier: 1,
        name: "B1s",
      },
      pro: {
        multiplier: 2.8,
        name: "B2s",
      },
      enterprise: {
        multiplier: 7.5,
        name: "B4ms",
      },
    },
  },
]

// Opciones de bases de datos y sus costos aproximados
export const databaseOptions: DatabaseProvider[] = [
  {
    id: "mongodb-atlas",
    name: "MongoDB Atlas",
    baseCost: 0.01, // $0.01 por hora para un cluster básico
    scalingFactor: 0.00001, // Factor de escala por usuario
    tiers: {
      basic: {
        multiplier: 1,
        name: "M0 Sandbox",
      },
      pro: {
        multiplier: 57,
        name: "M10",
      },
      enterprise: {
        multiplier: 400,
        name: "M40",
      },
    },
  },
  {
    id: "upstash",
    name: "Upstash Redis",
    baseCost: 0.5, // $0.50 por 10,000 operaciones
    scalingFactor: 0.00005, // Factor de escala por usuario
    tiers: {
      basic: {
        multiplier: 1,
        name: "Pay as you go",
      },
      pro: {
        multiplier: 2,
        name: "Pro",
      },
      enterprise: {
        multiplier: 5,
        name: "Enterprise",
      },
    },
  },
  {
    id: "supabase",
    name: "Supabase",
    baseCost: 0,
    scalingFactor: 0.00002,
    tiers: {
      basic: {
        multiplier: 1,
        name: "Free",
      },
      pro: {
        multiplier: 25,
        name: "Pro",
      },
      enterprise: {
        multiplier: 100,
        name: "Enterprise",
      },
    },
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    baseCost: 0,
    scalingFactor: 0.00003,
    tiers: {
      basic: {
        multiplier: 1,
        name: "Hobby",
      },
      pro: {
        multiplier: 29,
        name: "Scaler",
      },
      enterprise: {
        multiplier: 99,
        name: "Enterprise",
      },
    },
  },
]

// Función para calcular los costos basados en la configuración del proyecto
export function calculateCosts(project: Project): CostBreakdown {
  // Calcular costos de IA
  const aiCosts = project.aiTechnologies.reduce((total, tech) => {
    const model = aiModels.find((m) => m.id === tech.modelId)
    if (!model) return total

    // Si hay un costo personalizado, usarlo
    if (tech.customCost !== null) {
      return total + tech.customCost
    }

    // Calcular costo basado en el número de usuarios y llamadas a API
    // Asumimos un promedio de 1000 tokens por llamada
    const costPerCall = model.costPer1000Tokens
    const totalCalls = project.userCount * project.apiCallsPerUserPerMonth
    return total + costPerCall * totalCalls
  }, 0)

  // Calcular costos de infraestructura
  const infrastructureCosts = project.infrastructure.reduce((total, infra) => {
    const provider = infrastructureOptions.find((p) => p.id === infra.providerId)
    if (!provider) return total

    // Si hay un costo personalizado, usarlo
    if (infra.customCost !== null) {
      return total + infra.customCost
    }

    // Calcular costo basado en el proveedor, nivel y número de usuarios
    const tierMultiplier = provider.tiers[infra.tier]?.multiplier || 1
    const baseCost = provider.baseCost * tierMultiplier
    const scalingCost = provider.scalingFactor * project.userCount * tierMultiplier

    return total + baseCost + scalingCost
  }, 0)

  // Calcular costos de bases de datos
  const databaseCosts = project.databases.reduce((total, db) => {
    const provider = databaseOptions.find((p) => p.id === db.providerId)
    if (!provider) return total

    // Si hay un costo personalizado, usarlo
    if (db.customCost !== null) {
      return total + db.customCost
    }

    // Calcular costo basado en el proveedor, nivel y número de usuarios
    const tierMultiplier = provider.tiers[db.tier]?.multiplier || 1
    const baseCost = provider.baseCost * tierMultiplier
    const scalingCost = provider.scalingFactor * project.userCount * tierMultiplier

    return total + baseCost + scalingCost
  }, 0)

  // Calcular costos totales
  const totalMonthlyCost = aiCosts + infrastructureCosts + databaseCosts
  const totalYearlyCost = totalMonthlyCost * 12

  return {
    aiCosts,
    infrastructureCosts,
    databaseCosts,
    totalMonthlyCost,
    totalYearlyCost,
  }
}

