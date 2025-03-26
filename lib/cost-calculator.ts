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
    id: "gpt-4-turbo",
    name: "OpenAI GPT-4 Turbo",
    costPer1000Tokens: 0.01,
    provider: "OpenAI",
  },
  {
    id: "gpt-4-vision",
    name: "OpenAI GPT-4 Vision",
    costPer1000Tokens: 0.015,
    provider: "OpenAI",
  },
  {
    id: "gpt-3.5-turbo",
    name: "OpenAI GPT-3.5 Turbo",
    costPer1000Tokens: 0.0015,
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
    id: "claude-3-haiku",
    name: "Anthropic Claude 3 Haiku",
    costPer1000Tokens: 0.0025,
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
    id: "gemini-flash",
    name: "Google Gemini Flash",
    costPer1000Tokens: 0.0007,
    provider: "Google",
  },
  {
    id: "llama-3-70b",
    name: "Meta Llama 3 70B",
    costPer1000Tokens: 0.0045,
    provider: "Meta",
  },
  {
    id: "llama-3-8b",
    name: "Meta Llama 3 8B",
    costPer1000Tokens: 0.0008,
    provider: "Meta",
  },
  {
    id: "grok-1",
    name: "xAI Grok-1",
    costPer1000Tokens: 0.005,
    provider: "xAI",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    costPer1000Tokens: 0.008,
    provider: "Mistral AI",
  },
  {
    id: "mistral-medium",
    name: "Mistral Medium",
    costPer1000Tokens: 0.0027,
    provider: "Mistral AI",
  },
  {
    id: "mistral-small",
    name: "Mistral Small",
    costPer1000Tokens: 0.0007,
    provider: "Mistral AI",
  },
  {
    id: "cohere-command",
    name: "Cohere Command R",
    costPer1000Tokens: 0.005,
    provider: "Cohere",
  },
  {
    id: "cohere-command-light",
    name: "Cohere Command R Light",
    costPer1000Tokens: 0.0015,
    provider: "Cohere",
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    costPer1000Tokens: 0.008,
    provider: "Microsoft",
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
      hobby: {
        multiplier: 0,
        name: "Hobby",
      },
      pro: {
        multiplier: 1,
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
      micro: {
        multiplier: 0.5,
        name: "t4g.micro",
      },
      small: {
        multiplier: 1,
        name: "t4g.small",
      },
      medium: {
        multiplier: 2,
        name: "t4g.medium",
      },
      large: {
        multiplier: 4,
        name: "t4g.large",
      },
      xlarge: {
        multiplier: 8,
        name: "t4g.xlarge",
      },
    },
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    baseCost: 25,
    scalingFactor: 0.00012,
    tiers: {
      e2micro: {
        multiplier: 0.5,
        name: "e2-micro",
      },
      e2small: {
        multiplier: 1,
        name: "e2-small",
      },
      e2medium: {
        multiplier: 2,
        name: "e2-medium",
      },
      e2standard2: {
        multiplier: 4,
        name: "e2-standard-2",
      },
      e2standard4: {
        multiplier: 8,
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
      b1s: {
        multiplier: 0.5,
        name: "B1s",
      },
      b1ms: {
        multiplier: 1,
        name: "B1ms",
      },
      b2s: {
        multiplier: 2,
        name: "B2s",
      },
      b2ms: {
        multiplier: 4,
        name: "B2ms",
      },
      b4ms: {
        multiplier: 8,
        name: "B4ms",
      },
    },
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    baseCost: 4,
    scalingFactor: 0.0001,
    tiers: {
      basic: {
        multiplier: 1,
        name: "Basic Droplet 1GB",
      },
      premium: {
        multiplier: 2,
        name: "Premium Droplet 2GB",
      },
      cpu2gb: {
        multiplier: 4,
        name: "CPU-Optimized 2GB",
      },
      cpu4gb: {
        multiplier: 8,
        name: "CPU-Optimized 4GB",
      },
      mem8gb: {
        multiplier: 12,
        name: "Memory-Optimized 8GB",
      },
    },
  },
  {
    id: "cloudflare",
    name: "Cloudflare Pages",
    baseCost: 0,
    scalingFactor: 0.00002,
    tiers: {
      free: {
        multiplier: 0,
        name: "Free",
      },
      pro: {
        multiplier: 20,
        name: "Pro",
      },
      business: {
        multiplier: 200,
        name: "Business",
      },
      enterprise: {
        multiplier: 500,
        name: "Enterprise",
      },
    },
  },
  {
    id: "render",
    name: "Render",
    baseCost: 0,
    scalingFactor: 0.00005,
    tiers: {
      free: {
        multiplier: 0,
        name: "Free",
      },
      starter: {
        multiplier: 7,
        name: "Starter",
      },
      standard: {
        multiplier: 20,
        name: "Standard",
      },
      pro: {
        multiplier: 60,
        name: "Pro",
      },
    },
  },
  {
    id: "heroku",
    name: "Heroku",
    baseCost: 0,
    scalingFactor: 0.00004,
    tiers: {
      eco: {
        multiplier: 5,
        name: "Eco",
      },
      basic: {
        multiplier: 7,
        name: "Basic",
      },
      standard1x: {
        multiplier: 25,
        name: "Standard-1X",
      },
      standard2x: {
        multiplier: 50,
        name: "Standard-2X",
      },
      performance: {
        multiplier: 250,
        name: "Performance-M",
      },
    },
  },
]

// Opciones de bases de datos y sus costos aproximados
export const databaseOptions: DatabaseProvider[] = [
  {
    id: "mongodb-atlas",
    name: "MongoDB Atlas",
    baseCost: 0,
    scalingFactor: 0.00001,
    tiers: {
      free: {
        multiplier: 0,
        name: "M0 Free",
      },
      shared: {
        multiplier: 15,
        name: "M2 Shared",
      },
      serverless: {
        multiplier: 30,
        name: "Serverless",
      },
      dedicated: {
        multiplier: 57,
        name: "M10 Dedicated",
      },
      enterprise: {
        multiplier: 400,
        name: "M40 Dedicated",
      },
    },
  },
  {
    id: "upstash",
    name: "Upstash Redis",
    baseCost: 0,
    scalingFactor: 0.00005,
    tiers: {
      free: {
        multiplier: 0,
        name: "Free",
      },
      payg: {
        multiplier: 1,
        name: "Pay as you go",
      },
      pro250: {
        multiplier: 25,
        name: "Pro 250MB",
      },
      pro500: {
        multiplier: 45,
        name: "Pro 500MB",
      },
      enterprise: {
        multiplier: 100,
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
      free: {
        multiplier: 0,
        name: "Free",
      },
      pro: {
        multiplier: 25,
        name: "Pro",
      },
      team: {
        multiplier: 599,
        name: "Team",
      },
      enterprise: {
        multiplier: 999,
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
      free: {
        multiplier: 0,
        name: "Free",
      },
      hobby: {
        multiplier: 29,
        name: "Hobby",
      },
      scaler: {
        multiplier: 99,
        name: "Scaler",
      },
      enterprise: {
        multiplier: 399,
        name: "Enterprise",
      },
    },
  },
  {
    id: "aws-rds",
    name: "AWS RDS (PostgreSQL)",
    baseCost: 0,
    scalingFactor: 0.00004,
    tiers: {
      t3micro: {
        multiplier: 13,
        name: "db.t3.micro",
      },
      t3small: {
        multiplier: 26,
        name: "db.t3.small",
      },
      t3medium: {
        multiplier: 52,
        name: "db.t3.medium",
      },
      t3large: {
        multiplier: 104,
        name: "db.t3.large",
      },
      m5large: {
        multiplier: 180,
        name: "db.m5.large",
      },
    },
  },
  {
    id: "firebase",
    name: "Firebase Firestore",
    baseCost: 0,
    scalingFactor: 0.00001,
    tiers: {
      spark: {
        multiplier: 0,
        name: "Spark (Free)",
      },
      blaze: {
        multiplier: 1,
        name: "Blaze (Pay as you go)",
      },
      enterprise: {
        multiplier: 100,
        name: "Enterprise",
      },
    },
  },
  {
    id: "neon",
    name: "Neon (PostgreSQL)",
    baseCost: 0,
    scalingFactor: 0.00002,
    tiers: {
      free: {
        multiplier: 0,
        name: "Free",
      },
      standard: {
        multiplier: 10,
        name: "Standard",
      },
      pro: {
        multiplier: 50,
        name: "Pro",
      },
      enterprise: {
        multiplier: 200,
        name: "Enterprise",
      },
    },
  },
  {
    id: "fauna",
    name: "Fauna",
    baseCost: 0,
    scalingFactor: 0.00001,
    tiers: {
      free: {
        multiplier: 0,
        name: "Free",
      },
      boost: {
        multiplier: 25,
        name: "Boost",
      },
      grow: {
        multiplier: 100,
        name: "Grow",
      },
      enterprise: {
        multiplier: 500,
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

