export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  reporting_year: number;
  custom_metrics_schema?: Record<string, any> | null;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}


export interface ESGRecord {
  id: string;
  organization_id: string;
  record_date: string;
  // Environmental
  energy_consumption: number;
  water_consumption: number;
  waste_generated: number;
  waste_recycled: number;
  carbon_emissions: number;
  renewable_energy_percentage: number;
  // Social
  employees: number;
  training_hours: number;
  safety_incidents: number;
  community_initiatives: number;
  // Governance
  compliance_percentage: number;
  ethics_incidents: number;
  governance_score: number;
  // Computed Scores
  environmental_score?: number;
  social_score?: number;
  governance_score_calculated?: number;
  overall_esg_score?: number;
  custom_metrics?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: any;
}

export interface DashboardStats {
  organization: Organization;
  hasData: boolean;
  totalRecords: number;
  kpis: {
    totalEnergyConsumption: number | null;
    totalWaterConsumption: number | null;
    totalWasteGenerated: number | null;
    totalWasteRecycled: number | null;
    totalCarbonEmissions: number | null;
    renewableEnergyPercentage: number | null;
    wasteRecyclingPercentage: number | null;
    overallEsgScore: number | null;
    environmentalScore: number | null;
    socialScore: number | null;
    governanceScore: number | null;
  };
  trends: {
    energyChangePct: number | null;
    waterChangePct: number | null;
    wasteChangePct: number | null;
    carbonChangePct: number | null;
  };
  charts: {
    energyOverTime: ChartDataPoint[];
    waterOverTime: ChartDataPoint[];
    wasteComparison: ChartDataPoint[];
    carbonOverTime: ChartDataPoint[];
    renewablePercentageOverTime: ChartDataPoint[];
    scoreTrend: ChartDataPoint[];
  };
  recentRecords: ESGRecord[];
  cacheStatus: 'HIT' | 'MISS';
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    type: string;
    connected: boolean;
    policy: string;
  };
  redis: {
    connected: boolean;
    engine: string;
    stats: {
      hits: number;
      misses: number;
      invalidations: number;
    };
  };
}
