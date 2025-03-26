import { aiModels, infrastructureOptions, databaseOptions } from "./cost-calculator";

// Función para obtener recomendación de modelo de IA
export function getBestAIModel(userCount: number, apiCallsPerUserPerMonth: number): { id: string, name: string, reason: string } {
  // Calculamos el costo total para cada modelo
  const modelCosts = aiModels.map(model => {
    const totalCost = model.costPer1000Tokens * userCount * apiCallsPerUserPerMonth;
    return { model, totalCost };
  });
  
  // Ordenar por costo total
  modelCosts.sort((a, b) => a.totalCost - b.totalCost);
  
  // Nivel de usuario basado en número de usuarios
  let userTier = "pequeño";
  if (userCount > 100000) userTier = "grande";
  else if (userCount > 10000) userTier = "mediano";
  
  // Nivel de uso basado en número de llamadas
  let usageTier = "bajo";
  if (apiCallsPerUserPerMonth > 500) usageTier = "alto";
  else if (apiCallsPerUserPerMonth > 100) usageTier = "medio";
  
  // Lógica para recomendar el mejor modelo según el caso de uso
  let recommended;
  
  if (userCount * apiCallsPerUserPerMonth > 5000000) {
    // Para uso intensivo, priorizar modelos más eficientes
    recommended = modelCosts.find(m => 
      ["gpt-3.5-turbo", "mistral-small", "gemini-flash", "cohere-command-light"].includes(m.model.id)
    ) || modelCosts[0];
    
    return {
      id: recommended.model.id,
      name: recommended.model.name,
      reason: `Recomendado para proyectos de uso intensivo con muchos usuarios y llamadas. Ofrece mejor rendimiento por costo.`
    };
  } else if (userCount * apiCallsPerUserPerMonth > 500000) {
    // Para uso moderado, equilibrio entre calidad y costo
    recommended = modelCosts.find(m => 
      ["claude-3-haiku", "mistral-medium", "gemini-pro"].includes(m.model.id)
    ) || modelCosts[1];
    
    return {
      id: recommended.model.id,
      name: recommended.model.name,
      reason: `Buen equilibrio entre capacidad y costo para proyectos de tamaño ${userTier} con uso ${usageTier}.`
    };
  } else {
    // Para uso bajo, se puede permitir un modelo más potente
    if (userTier === "pequeño" && usageTier === "bajo") {
      recommended = modelCosts.find(m => 
        ["claude-3-sonnet", "gpt-4-turbo", "mistral-large"].includes(m.model.id)
      ) || modelCosts[2];
      
      return {
        id: recommended.model.id,
        name: recommended.model.name,
        reason: `Con pocos usuarios y llamadas, puedes permitirte un modelo más potente sin costos excesivos.`
      };
    }
  }
  
  // Por defecto, el modelo más económico
  return {
    id: modelCosts[0].model.id,
    name: modelCosts[0].model.name,
    reason: `La opción más económica para tu escala de ${userCount.toLocaleString()} usuarios con ${apiCallsPerUserPerMonth} llamadas por usuario al mes.`
  };
}

// Función para obtener recomendación de infraestructura
export function getBestInfrastructure(userCount: number): { providerId: string, tier: string, reason: string } {
  // Para proyectos pequeños (menos de 5,000 usuarios)
  if (userCount < 5000) {
    return {
      providerId: "vercel",
      tier: "hobby",
      reason: "Para proyectos pequeños, Vercel Hobby ofrece un excelente balance entre rendimiento y costo (incluso gratis para proyectos personales)."
    };
  }
  
  // Para proyectos medianos (entre 5,000 y 50,000 usuarios)
  if (userCount < 50000) {
    return {
      providerId: "digitalocean",
      tier: "premium",
      reason: "DigitalOcean Premium Droplet ofrece buen rendimiento y escalabilidad a un precio competitivo para proyectos medianos."
    };
  }
  
  // Para proyectos grandes (entre 50,000 y 200,000 usuarios)
  if (userCount < 200000) {
    return {
      providerId: "aws-ec2",
      tier: "medium",
      reason: "AWS EC2 t4g.medium proporciona un rendimiento superior y mayor flexibilidad de escalado para aplicaciones con tráfico significativo."
    };
  }
  
  // Para proyectos muy grandes (más de 200,000 usuarios)
  return {
    providerId: "gcp",
    tier: "e2standard2",
    reason: "Para aplicaciones a gran escala, Google Cloud e2-standard-2 ofrece el mejor equilibrio entre rendimiento, confiabilidad y costo."
  };
}

// Función para obtener recomendación de base de datos
export function getBestDatabase(userCount: number): { providerId: string, tier: string, reason: string } {
  // Para proyectos pequeños (menos de 5,000 usuarios)
  if (userCount < 5000) {
    return {
      providerId: "supabase",
      tier: "free",
      reason: "Supabase Free es una excelente opción para proyectos pequeños, con funcionalidades completas sin costo."
    };
  }
  
  // Para proyectos medianos (entre 5,000 y 50,000 usuarios)
  if (userCount < 50000) {
    return {
      providerId: "planetscale",
      tier: "hobby",
      reason: "PlanetScale Hobby ofrece escalabilidad automática y alta disponibilidad a un precio razonable para aplicaciones en crecimiento."
    };
  }
  
  // Para proyectos grandes (entre 50,000 y 200,000 usuarios)
  if (userCount < 200000) {
    return {
      providerId: "mongodb-atlas",
      tier: "serverless",
      reason: "MongoDB Atlas Serverless escala automáticamente con tu tráfico y solo pagas por lo que usas, ideal para aplicaciones de gran tamaño."
    };
  }
  
  // Para proyectos muy grandes (más de 200,000 usuarios)
  return {
    providerId: "aws-rds",
    tier: "t3medium",
    reason: "Para aplicaciones a escala empresarial, AWS RDS ofrece el rendimiento, seguridad y confiabilidad necesarios para manejar grandes volúmenes de datos."
  };
}

// Funciones auxiliares para mostrar nombres en lugar de IDs
export function getProviderName(providerId: string, type: 'infrastructure' | 'database'): string {
  const options = type === 'infrastructure' ? infrastructureOptions : databaseOptions;
  return options.find(p => p.id === providerId)?.name || providerId;
}

export function getTierName(providerId: string, tierId: string, type: 'infrastructure' | 'database'): string {
  const options = type === 'infrastructure' ? infrastructureOptions : databaseOptions;
  const provider = options.find(p => p.id === providerId);
  return provider?.tiers[tierId]?.name || tierId;
} 