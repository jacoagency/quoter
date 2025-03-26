import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationCardProps {
  title: string;
  subtitle: string;
  reason: string;
  colorScheme: "green" | "blue" | "purple";
  onClick?: () => void;
}

const colorMap = {
  green: {
    card: "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900",
    icon: "text-green-700 dark:text-green-300",
    title: "text-green-800 dark:text-green-200",
    subtitle: "text-green-700 dark:text-green-300",
    reason: "text-green-600 dark:text-green-400"
  },
  blue: {
    card: "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900",
    icon: "text-blue-700 dark:text-blue-300",
    title: "text-blue-800 dark:text-blue-200",
    subtitle: "text-blue-700 dark:text-blue-300",
    reason: "text-blue-600 dark:text-blue-400"
  },
  purple: {
    card: "border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900",
    icon: "text-purple-700 dark:text-purple-300",
    title: "text-purple-800 dark:text-purple-200",
    subtitle: "text-purple-700 dark:text-purple-300",
    reason: "text-purple-600 dark:text-purple-400"
  }
};

export function RecommendationCard({ 
  title, 
  subtitle, 
  reason, 
  colorScheme, 
  onClick 
}: RecommendationCardProps) {
  const colors = colorMap[colorScheme];
  
  return (
    <Card className={`${colors.card} cursor-pointer transition-transform hover:scale-[1.01]`} onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-2">
          <div className={`${colors.iconBg} p-2 rounded-full`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className={`text-sm font-medium ${colors.title}`}>Recomendación</h3>
            <p className={`text-sm ${colors.subtitle}`}>
              {subtitle}
            </p>
            <p className={`text-xs ${colors.reason} mt-1`}>{reason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 