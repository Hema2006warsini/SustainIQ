import { ESGRecord, ESGScores } from '../types';

export function calculateRecordScores(record: Partial<ESGRecord>): {
  environmental_score: number;
  social_score: number;
  governance_score_calculated: number;
  overall_esg_score: number;
} {
  const energy = Number(record.energy_consumption ?? 0);
  const water = Number(record.water_consumption ?? 0);
  const wasteGen = Number(record.waste_generated ?? 0);
  const wasteRec = Number(record.waste_recycled ?? 0);
  const carbon = Number(record.carbon_emissions ?? 0);
  const renewablePct = Math.min(100, Math.max(0, Number(record.renewable_energy_percentage ?? 0)));

  const employees = Math.max(1, Number(record.employees ?? 1));
  const trainingHours = Number(record.training_hours ?? 0);
  const safetyIncidents = Math.max(0, Number(record.safety_incidents ?? 0));
  const communityInitiatives = Math.max(0, Number(record.community_initiatives ?? 0));

  const compliancePct = Math.min(100, Math.max(0, Number(record.compliance_percentage ?? 0)));
  const ethicsIncidents = Math.max(0, Number(record.ethics_incidents ?? 0));
  const rawGovScore = Math.min(100, Math.max(0, Number(record.governance_score ?? 0)));

  // 1. Environmental Score (0-100)
  // - Renewable Energy: 30%
  const renewableFactor = renewablePct;
  // - Recycling Rate: 30%
  let recyclingFactor = 100;
  if (wasteGen > 0) {
    recyclingFactor = Math.min(100, (wasteRec / wasteGen) * 100);
  }
  // - Carbon Efficiency: 20% (benchmark: 50 kg CO2e / employee / month)
  const carbonPerEmp = carbon / employees;
  const carbonFactor = Math.max(0, Math.min(100, 100 - (carbonPerEmp / 100) * 100));
  // - Energy Efficiency: 20% (benchmark: 250 kWh / employee / month)
  const energyPerEmp = energy / employees;
  const energyFactor = Math.max(0, Math.min(100, 100 - (energyPerEmp / 500) * 100));

  const envScore = (renewableFactor * 0.30) + (recyclingFactor * 0.30) + (carbonFactor * 0.20) + (energyFactor * 0.20);

  // 2. Social Score (0-100)
  // - Training Hours per Employee: 40% (benchmark: 3.5 hrs/employee/month = 42 hrs/year)
  const trainingPerEmp = trainingHours / employees;
  const trainingFactor = Math.min(100, (trainingPerEmp / 3.5) * 100);
  // - Safety Record: 40% (Each incident penalizes by 20 points)
  const safetyFactor = Math.max(0, 100 - safetyIncidents * 20);
  // - Community Initiatives: 20% (5+ initiatives = 100%)
  const communityFactor = Math.min(100, communityInitiatives * 20);

  const socScore = (trainingFactor * 0.40) + (safetyFactor * 0.40) + (communityFactor * 0.20);

  // 3. Governance Score (0-100)
  // - Compliance Percentage: 50%
  const complianceFactor = compliancePct;
  // - Ethics Incidents Penalty: 25% (Each incident deducts 25 points)
  const ethicsFactor = Math.max(0, 100 - ethicsIncidents * 25);
  // - Internal Governance Assessment: 25%
  const govAssessmentFactor = rawGovScore;

  const govScore = (complianceFactor * 0.50) + (ethicsFactor * 0.25) + (govAssessmentFactor * 0.25);

  // 4. Overall ESG Score (0-100)
  // Weighted: 40% Environmental, 30% Social, 30% Governance
  const overall = (envScore * 0.40) + (socScore * 0.30) + (govScore * 0.30);

  return {
    environmental_score: Number(envScore.toFixed(1)),
    social_score: Number(socScore.toFixed(1)),
    governance_score_calculated: Number(govScore.toFixed(1)),
    overall_esg_score: Number(overall.toFixed(1)),
  };
}

export function aggregateScores(records: ESGRecord[]): ESGScores {
  if (!records || records.length === 0) {
    return {
      environmentalScore: null,
      socialScore: null,
      governanceScore: null,
      overallScore: null,
      status: 'insufficient',
    };
  }

  let totalEnv = 0;
  let totalSoc = 0;
  let totalGov = 0;
  let totalOverall = 0;
  let validRecordsCount = 0;

  for (const rec of records) {
    const calculated = calculateRecordScores(rec);
    totalEnv += calculated.environmental_score;
    totalSoc += calculated.social_score;
    totalGov += calculated.governance_score_calculated;
    totalOverall += calculated.overall_esg_score;
    validRecordsCount++;
  }

  if (validRecordsCount === 0) {
    return {
      environmentalScore: null,
      socialScore: null,
      governanceScore: null,
      overallScore: null,
      status: 'insufficient',
    };
  }

  const envAvg = Number((totalEnv / validRecordsCount).toFixed(1));
  const socAvg = Number((totalSoc / validRecordsCount).toFixed(1));
  const govAvg = Number((totalGov / validRecordsCount).toFixed(1));
  const overallAvg = Number((totalOverall / validRecordsCount).toFixed(1));

  return {
    environmentalScore: envAvg,
    socialScore: socAvg,
    governanceScore: govAvg,
    overallScore: overallAvg,
    status: 'sufficient',
  };
}
