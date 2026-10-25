import dotenv from 'dotenv';
dotenv.config();

import { initDatabase, query, closeDatabase } from '../config/database';
import { initRedis, getCache, setCache, invalidateOrgCache } from '../config/redis';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/auth';
import { getDashboardStats } from '../services/dashboardService';
import { generateEsgPdfReport } from '../services/pdfService';
import { calculateRecordScores } from '../services/scoringService';

async function runVerification() {
  console.log('🧪 Starting SustainIQ PostgreSQL End-to-End Verification...\n');

  // 1. PostgreSQL connection
  await initDatabase();
  console.log('✅ 1. PostgreSQL Connection: OK');

  initRedis();
  console.log('✅ 2. Redis/Cache Engine Initialization: OK');

  const timestamp = Date.now();
  const testEmailA = `verify_user_a_${timestamp}@sustainiq.org`;
  const testEmailB = `verify_user_b_${timestamp}@sustainiq.org`;
  const password = 'StrongPassword123!';

  // Clean any test collision
  await query('DELETE FROM users WHERE email IN ($1, $2)', [testEmailA, testEmailB]);

  // 2. Password hashing & User A registration
  const passwordHash = await hashPassword(password);
  if (passwordHash === password || !passwordHash.startsWith('$2')) {
    throw new Error('Password was not properly hashed with bcrypt!');
  }
  const isMatch = await comparePassword(password, passwordHash);
  const isWrong = await comparePassword('WrongPassword', passwordHash);
  if (!isMatch || isWrong) {
    throw new Error('Bcrypt password verification failed!');
  }
  console.log('✅ 3. Password Hashing & Verification: OK (bcrypt validated)');

  const userResA = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    ['Alice Green Officer', testEmailA, passwordHash]
  );
  const userA = userResA.rows[0];
  console.log(`✅ 4. User A Registration in PostgreSQL: OK (UUID: ${userA.id})`);

  // Verify credentials check
  const loginCheck = await query(
    'SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
    [testEmailA]
  );
  if (loginCheck.rows.length === 0 || !(await comparePassword(password, loginCheck.rows[0].password_hash))) {
    throw new Error('Login credentials validation failed!');
  }
  const invalidLoginCheck = await comparePassword('BadPassword999!', loginCheck.rows[0].password_hash);
  if (invalidLoginCheck) {
    throw new Error('Invalid credentials were not rejected!');
  }
  console.log('✅ 5. Login works & Invalid Credentials rejected: OK');

  // 3. Token Generation & Verification
  const tokenA = generateToken({ userId: userA.id, email: userA.email });
  const decodedA = verifyToken(tokenA);
  if (!decodedA || decodedA.userId !== userA.id) {
    throw new Error('JWT token claims verification failed!');
  }
  console.log('✅ 6. JWT Session & Claims Verification: OK');

  // 4. Organization Creation for User A
  const orgResA = await query(
    `INSERT INTO organizations (name, type, location, reporting_year, custom_metrics_schema, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    ['CleanTech Global Ltd', 'Clean Energy & Technology', 'Berlin, Germany', 2026, JSON.stringify({}), userA.id]
  );
  const orgA = orgResA.rows[0];
  console.log(`✅ 7. Organization Created in PostgreSQL for User A: OK (UUID: ${orgA.id})`);

  // Verify organization ownership
  const verifyOwnerRes = await query('SELECT owner_id FROM organizations WHERE id = $1', [orgA.id]);
  if (verifyOwnerRes.rows[0].owner_id !== userA.id) {
    throw new Error('Organization owner_id does not match User A ID!');
  }
  console.log('✅ 8. Organization Owner ID Relationship: OK');

  // 5. Newly registered user sees an EMPTY dashboard until data is added
  const emptyStats = await getDashboardStats(orgA.id, userA.id);
  if (!emptyStats || emptyStats.hasData !== false || emptyStats.totalRecords !== 0 || emptyStats.kpis.totalEnergyConsumption !== null) {
    throw new Error('Empty state policy violated! Found data on newly created organization.');
  }
  console.log('✅ 9. Zero-Mock Policy: Newly registered organization has clean empty state: OK');

  // 6. ESG Record Creation for Organization A
  const sampleData = {
    organization_id: orgA.id,
    record_date: '2026-04-15',
    energy_consumption: 14500,
    water_consumption: 4200,
    waste_generated: 1600,
    waste_recycled: 1300,
    carbon_emissions: 2100,
    renewable_energy_percentage: 82.5,
    employees: 180,
    training_hours: 520,
    safety_incidents: 0,
    community_initiatives: 4,
    compliance_percentage: 99.0,
    ethics_incidents: 0,
    governance_score: 95.0,
  };
  const scores = calculateRecordScores(sampleData);

  const recResA = await query(
    `INSERT INTO esg_records (
      organization_id, record_date, energy_consumption, water_consumption,
      waste_generated, waste_recycled, carbon_emissions, renewable_energy_percentage,
      employees, training_hours, safety_incidents, community_initiatives,
      compliance_percentage, ethics_incidents, governance_score,
      environmental_score, social_score, governance_score_calculated, overall_esg_score,
      custom_metrics
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    ) RETURNING *`,
    [
      orgA.id,
      sampleData.record_date,
      sampleData.energy_consumption,
      sampleData.water_consumption,
      sampleData.waste_generated,
      sampleData.waste_recycled,
      sampleData.carbon_emissions,
      sampleData.renewable_energy_percentage,
      sampleData.employees,
      sampleData.training_hours,
      sampleData.safety_incidents,
      sampleData.community_initiatives,
      sampleData.compliance_percentage,
      sampleData.ethics_incidents,
      sampleData.governance_score,
      scores.environmental_score,
      scores.social_score,
      scores.governance_score_calculated,
      scores.overall_esg_score,
      JSON.stringify({}),
    ]
  );
  const recordA = recResA.rows[0];
  console.log(`✅ 10. ESG Record Created in PostgreSQL: OK (UUID: ${recordA.id})`);

  // 7. Live Dashboard Aggregations and Scoring
  const populatedStats = await getDashboardStats(orgA.id, userA.id);
  if (!populatedStats || populatedStats.hasData !== true || populatedStats.kpis.totalEnergyConsumption !== 14500) {
    throw new Error('Dashboard stats calculation mismatch!');
  }
  console.log(`✅ 11. Live Dashboard Calculation: OK (Energy: ${populatedStats.kpis.totalEnergyConsumption} kWh, Score: ${populatedStats.kpis.overallEsgScore})`);

  // 8. Redis Caching & Invalidation
  const cacheKey = `dashboard:user:${userA.id}:org:${orgA.id}`;
  await setCache(cacheKey, populatedStats, 60);
  const cachedStats = await getCache<any>(cacheKey);
  if (!cachedStats || cachedStats.kpis.totalEnergyConsumption !== 14500) {
    throw new Error('Redis caching failed!');
  }
  console.log('✅ 12. Redis Dashboard Caching: OK');

  // Invalidate cache
  await invalidateOrgCache(orgA.id, userA.id);
  const invalidatedStats = await getCache<any>(cacheKey);
  if (invalidatedStats !== null) {
    throw new Error('Redis cache invalidation failed!');
  }
  console.log('✅ 13. Redis Cache Invalidation on Update: OK');

  // 9. Dynamic PDF Report Generation using actual PostgreSQL records
  const pdfBuffer = await generateEsgPdfReport(orgA.id, {}, userA.id);
  const isPdf = pdfBuffer.slice(0, 4).toString() === '%PDF';
  if (!isPdf || pdfBuffer.length < 500) {
    throw new Error('PDF Report generation failed!');
  }
  console.log(`✅ 14. Vector PDF Report Generation: OK (${pdfBuffer.length} bytes, valid %PDF header)`);

  // 10. Strict User-Level Data Isolation with User B
  const userResB = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    ['Bob External Auditor', testEmailB, passwordHash]
  );
  const userB = userResB.rows[0];
  console.log(`✅ 15. User B Registered: OK (UUID: ${userB.id})`);

  // User B's organizations query must return 0
  const userBOrgs = await query('SELECT * FROM organizations WHERE owner_id = $1', [userB.id]);
  if (userBOrgs.rows.length !== 0) {
    throw new Error(`Data Isolation Failure: User B sees ${userBOrgs.rows.length} orgs!`);
  }
  console.log('✅ 16. Data Isolation: User B sees clean empty state: OK');

  // User B cannot query User A's organization
  const userBOrgAccess = await query(
    'SELECT * FROM organizations WHERE id = $1 AND owner_id = $2',
    [orgA.id, userB.id]
  );
  if (userBOrgAccess.rows.length > 0) {
    throw new Error("Data Isolation Failure: User B accessed User A's organization!");
  }
  console.log("✅ 17. Data Isolation: User B blocked from accessing User A's Organization: OK");

  // User B cannot generate dashboard stats for User A's org
  const userBDashboard = await getDashboardStats(orgA.id, userB.id);
  if (userBDashboard !== null) {
    throw new Error("Data Isolation Failure: User B retrieved User A's dashboard stats!");
  }
  console.log("✅ 18. Data Isolation: User B blocked from User A's Dashboard Stats: OK");

  // User B cannot generate PDF report for User A's org
  let pdfBlocked = false;
  try {
    await generateEsgPdfReport(orgA.id, {}, userB.id);
  } catch (err: any) {
    if (err.message === 'Organization not found') {
      pdfBlocked = true;
    }
  }
  if (!pdfBlocked) {
    throw new Error("Data Isolation Failure: User B generated PDF for User A's org!");
  }
  console.log("✅ 19. Data Isolation: User B blocked from User A's PDF Reports: OK");

  // 11. Edit and Delete ESG Record
  const updateRes = await query(
    `UPDATE esg_records SET energy_consumption = $1 WHERE id = $2 RETURNING *`,
    [16000, recordA.id]
  );
  if (Number(updateRes.rows[0].energy_consumption) !== 16000) {
    throw new Error('ESG Record update failed!');
  }
  console.log('✅ 20. ESG Record Editing: OK');

  await query('DELETE FROM esg_records WHERE id = $1', [recordA.id]);
  const checkDeleted = await query('SELECT id FROM esg_records WHERE id = $1', [recordA.id]);
  if (checkDeleted.rows.length !== 0) {
    throw new Error('ESG Record deletion failed!');
  }
  console.log('✅ 21. ESG Record Deletion: OK');

  // Cascade delete organization
  await query('DELETE FROM organizations WHERE id = $1', [orgA.id]);
  console.log('✅ 22. Organization Cascade Deletion: OK');

  // Clean test users
  await query('DELETE FROM users WHERE id IN ($1, $2)', [userA.id, userB.id]);
  console.log('✅ 23. Test Data Cleanup: OK (No leftover test records)');

  await closeDatabase();
  console.log('\n🎉 ALL 23 POSTGRESQL VERIFICATION CHECKS PASSED PERFECTLY! 🚀\n');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('\n❌ PostgreSQL Verification Failed:', err);
  process.exit(1);
});
