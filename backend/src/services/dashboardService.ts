import { query } from '../config/database';
import { DashboardStats, ESGRecord, Organization } from '../types';
import { aggregateScores, calculateRecordScores } from './scoringService';

export async function getDashboardStats(orgId: string): Promise<DashboardStats | null> {
  // 1. Fetch organization
  const orgResult = await query('SELECT * FROM organizations WHERE id = $1', [orgId]);
  if (orgResult.rows.length === 0) {
    return null;
  }
  const organization: Organization = orgResult.rows[0];

  // 2. Fetch ESG records for this organization (ordered chronologically ASC for charts)
  const recordsResult = await query(
    'SELECT * FROM esg_records WHERE organization_id = $1 ORDER BY record_date ASC',
    [orgId]
  );
  const records: ESGRecord[] = recordsResult.rows.map(row => ({
    ...row,
    energy_consumption: Number(row.energy_consumption),
    water_consumption: Number(row.water_consumption),
    waste_generated: Number(row.waste_generated),
    waste_recycled: Number(row.waste_recycled),
    carbon_emissions: Number(row.carbon_emissions),
    renewable_energy_percentage: Number(row.renewable_energy_percentage),
    employees: Number(row.employees),
    training_hours: Number(row.training_hours),
    safety_incidents: Number(row.safety_incidents),
    community_initiatives: Number(row.community_initiatives),
    compliance_percentage: Number(row.compliance_percentage),
    ethics_incidents: Number(row.ethics_incidents),
    governance_score: Number(row.governance_score),
    environmental_score: row.environmental_score ? Number(row.environmental_score) : undefined,
    social_score: row.social_score ? Number(row.social_score) : undefined,
    governance_score_calculated: row.governance_score_calculated ? Number(row.governance_score_calculated) : undefined,
    overall_esg_score: row.overall_esg_score ? Number(row.overall_esg_score) : undefined,
  }));

  const hasData = records.length > 0;

  if (!hasData) {
    return {
      organization,
      hasData: false,
      totalRecords: 0,
      kpis: {
        totalEnergyConsumption: null,
        totalWaterConsumption: null,
        totalWasteGenerated: null,
        totalWasteRecycled: null,
        totalCarbonEmissions: null,
        renewableEnergyPercentage: null,
        wasteRecyclingPercentage: null,
        overallEsgScore: null,
        environmentalScore: null,
        socialScore: null,
        governanceScore: null,
      },
      trends: {
        energyChangePct: null,
        waterChangePct: null,
        wasteChangePct: null,
        carbonChangePct: null,
      },
      charts: {
        energyOverTime: [],
        waterOverTime: [],
        wasteComparison: [],
        carbonOverTime: [],
        renewablePercentageOverTime: [],
        scoreTrend: [],
      },
      recentRecords: [],
      cacheStatus: 'MISS',
    };
  }

  // Calculate totals and averages
  let totalEnergy = 0;
  let totalWater = 0;
  let totalWasteGen = 0;
  let totalWasteRec = 0;
  let totalCarbon = 0;
  let sumRenewable = 0;

  records.forEach(r => {
    totalEnergy += r.energy_consumption;
    totalWater += r.water_consumption;
    totalWasteGen += r.waste_generated;
    totalWasteRec += r.waste_recycled;
    totalCarbon += r.carbon_emissions;
    sumRenewable += r.renewable_energy_percentage;
  });

  const avgRenewable = Number((sumRenewable / records.length).toFixed(1));
  const recyclingPct = totalWasteGen > 0 
    ? Number(((totalWasteRec / totalWasteGen) * 100).toFixed(1)) 
    : 0;

  // Calculate Scores
  const scores = aggregateScores(records);

  // Month-over-Month Trends (if at least 2 records exist)
  let energyChangePct: number | null = null;
  let waterChangePct: number | null = null;
  let wasteChangePct: number | null = null;
  let carbonChangePct: number | null = null;

  if (records.length >= 2) {
    const prev = records[records.length - 2];
    const curr = records[records.length - 1];

    energyChangePct = prev.energy_consumption > 0 
      ? Number((((curr.energy_consumption - prev.energy_consumption) / prev.energy_consumption) * 100).toFixed(1))
      : 0;
    waterChangePct = prev.water_consumption > 0 
      ? Number((((curr.water_consumption - prev.water_consumption) / prev.water_consumption) * 100).toFixed(1))
      : 0;
    wasteChangePct = prev.waste_generated > 0 
      ? Number((((curr.waste_generated - prev.waste_generated) / prev.waste_generated) * 100).toFixed(1))
      : 0;
    carbonChangePct = prev.carbon_emissions > 0 
      ? Number((((curr.carbon_emissions - prev.carbon_emissions) / prev.carbon_emissions) * 100).toFixed(1))
      : 0;
  }

  // Build Time-Series Datasets for Charts
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const energyOverTime = records.map(r => ({
    date: formatDateLabel(r.record_date),
    value: r.energy_consumption,
  }));

  const waterOverTime = records.map(r => ({
    date: formatDateLabel(r.record_date),
    value: r.water_consumption,
  }));

  const wasteComparison = records.map(r => ({
    date: formatDateLabel(r.record_date),
    generated: r.waste_generated,
    recycled: r.waste_recycled,
  }));

  const carbonOverTime = records.map(r => ({
    date: formatDateLabel(r.record_date),
    value: r.carbon_emissions,
  }));

  const renewablePercentageOverTime = records.map(r => ({
    date: formatDateLabel(r.record_date),
    value: r.renewable_energy_percentage,
  }));

  const scoreTrend = records.map(r => {
    const sc = calculateRecordScores(r);
    return {
      date: formatDateLabel(r.record_date),
      environmental: sc.environmental_score,
      social: sc.social_score,
      governance: sc.governance_score_calculated,
      overall: sc.overall_esg_score,
    };
  });

  // Recent 5 records (newest first)
  const recentRecords = [...records].reverse().slice(0, 5);

  return {
    organization,
    hasData: true,
    totalRecords: records.length,
    kpis: {
      totalEnergyConsumption: Number(totalEnergy.toFixed(1)),
      totalWaterConsumption: Number(totalWater.toFixed(1)),
      totalWasteGenerated: Number(totalWasteGen.toFixed(1)),
      totalWasteRecycled: Number(totalWasteRec.toFixed(1)),
      totalCarbonEmissions: Number(totalCarbon.toFixed(1)),
      renewableEnergyPercentage: avgRenewable,
      wasteRecyclingPercentage: recyclingPct,
      overallEsgScore: scores.overallScore,
      environmentalScore: scores.environmentalScore,
      socialScore: scores.socialScore,
      governanceScore: scores.governanceScore,
    },
    trends: {
      energyChangePct,
      waterChangePct,
      wasteChangePct,
      carbonChangePct,
    },
    charts: {
      energyOverTime,
      waterOverTime,
      wasteComparison,
      carbonOverTime,
      renewablePercentageOverTime,
      scoreTrend,
    },
    recentRecords,
    cacheStatus: 'MISS',
  };
}
