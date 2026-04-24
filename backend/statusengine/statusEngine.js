/**
 * STATUS ENGINE
 *
 * Status is computed from two signals:
 *   1. stage     — where the field is in its lifecycle
 *   2. staleness — how long since the last update (updated_at)
 *
 * Rules:
 *   - completed  → stage is 'harvested'
 *   - at_risk    → stage is NOT harvested AND no update in 7+ days
 *                  OR stage is 'planted' but planting_date is 14+ days ago
 *                  (crop should have progressed by now)
 *   - active     → everything else
 */

const STALE_DAYS = 7;
const OVERDUE_PLANTED_DAYS = 14;

const daysDiff = (date) => {
  const now = new Date();
  const then = new Date(date);
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
};

const computeStatus = (field) => {
  const { stage, updated_at, planting_date } = field;

  if (stage === 'harvested') return 'completed';

  const daysSinceUpdate = daysDiff(updated_at);
  if (daysSinceUpdate >= STALE_DAYS) return 'at_risk';

  if (stage === 'planted') {
    const daysSincePlanting = daysDiff(planting_date);
    if (daysSincePlanting >= OVERDUE_PLANTED_DAYS) return 'at_risk';
  }

  return 'active';
};

module.exports = { computeStatus };