export interface AIModel {
  id: string
  name: string
  costPer1000Tokens: number
  provider: string
}

export interface InfrastructureProvider {
  id: string
  name: string
  baseCost: number
  scalingFactor: number
  tiers: {
    [key: string]: {
      multiplier: number
      name: string
    }
  }
}

export interface DatabaseProvider {
  id: string
  name: string
  baseCost: number
  scalingFactor: number
  tiers: {
    [key: string]: {
      multiplier: number
      name: string
    }
  }
}

export interface TechnologySelection {
  id: string
  modelId: string
  customCost: number | null
}

export interface InfrastructureSelection {
  id: string
  providerId: string
  tier: string
  customCost: number | null
}

export interface DatabaseSelection {
  id: string
  providerId: string
  tier: string
  customCost: number | null
}

export interface Project {
  name: string
  userCount: number
  aiTechnologies: TechnologySelection[]
  infrastructure: InfrastructureSelection[]
  databases: DatabaseSelection[]
  apiCallsPerUserPerMonth: number
  subscriptionPricePerUser: number
}

export interface CostBreakdown {
  aiCosts: number
  infrastructureCosts: number
  databaseCosts: number
  totalMonthlyCost: number
  totalYearlyCost: number
}

