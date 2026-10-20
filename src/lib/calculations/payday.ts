import { SalarySettings, PaydayPeriod } from "@/types";
import { roundMoney } from "../utils";

/**
 * Returns the effective day of the month, clamping to the month's last valid day
 * (e.g. day 30 or 31 becomes 28 or 29 in February).
 */
export function getEffectivePayday(year: number, monthIndex: number, targetDay: number): Date {
  // Day 0 of the next month gives the last day of the current month
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const effectiveDay = Math.min(targetDay, lastDayOfMonth);
  return new Date(year, monthIndex, effectiveDay);
}

export interface NextPaydayInfo {
  date: Date;
  isoDate: string; // YYYY-MM-DD
  daysRemaining: number;
  period: PaydayPeriod;
  label: string;
  expectedAmount: number;
}

/**
 * Calculates the next upcoming payday based on salary settings and a reference date (defaulting to today).
 */
export function calculateNextPayday(
  settings: SalarySettings,
  refDate: Date = new Date()
): NextPaydayInfo {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const todayStart = new Date(year, month, refDate.getDate());

  const p1Day = settings.payday_1_day || 15;
  const p2Day = settings.payday_2_day || 30;

  // Potential paydays
  const thisMonthP1 = getEffectivePayday(year, month, p1Day);
  const thisMonthP2 = getEffectivePayday(year, month, p2Day);

  let targetDate: Date;
  let period: PaydayPeriod;
  let label: string;
  let expectedAmount: number;

  if (todayStart.getTime() <= thisMonthP1.getTime()) {
    targetDate = thisMonthP1;
    period = "payday_1";
    label = `1st Payday (${thisMonthP1.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    expectedAmount = settings.payday_1_expected || roundMoney(settings.monthly_net / 2);
  } else if (todayStart.getTime() <= thisMonthP2.getTime()) {
    targetDate = thisMonthP2;
    period = "payday_2";
    label = `2nd Payday (${thisMonthP2.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    expectedAmount = settings.payday_2_expected || roundMoney(settings.monthly_net / 2);
  } else {
    // Both paydays passed this month -> Next is 1st Payday of NEXT month
    const nextMonthP1 = getEffectivePayday(year, month + 1, p1Day);
    targetDate = nextMonthP1;
    period = "payday_1";
    label = `1st Payday (${nextMonthP1.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    expectedAmount = settings.payday_1_expected || roundMoney(settings.monthly_net / 2);
  }

  const diffTime = targetDate.getTime() - todayStart.getTime();
  const daysRemaining = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");

  return {
    date: targetDate,
    isoDate: `${yyyy}-${mm}-${dd}`,
    daysRemaining,
    period,
    label,
    expectedAmount,
  };
}

/**
 * Returns date range (start & end) for the current active payday period.
 */
export function getCurrentPaydayDateRange(
  settings: SalarySettings,
  refDate: Date = new Date()
): { start: Date; end: Date; period: PaydayPeriod } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const todayStart = new Date(year, month, refDate.getDate());

  const p1Day = settings.payday_1_day || 15;
  const p2Day = settings.payday_2_day || 30;

  const thisMonthP1 = getEffectivePayday(year, month, p1Day);
  const thisMonthP2 = getEffectivePayday(year, month, p2Day);

  if (todayStart.getTime() <= thisMonthP1.getTime()) {
    // Current period is 1st half: 1st of month to P1
    return {
      start: new Date(year, month, 1),
      end: thisMonthP1,
      period: "payday_1",
    };
  } else if (todayStart.getTime() <= thisMonthP2.getTime()) {
    // Current period is 2nd half: day after P1 to P2
    const startP2 = new Date(thisMonthP1);
    startP2.setDate(startP2.getDate() + 1);
    return {
      start: startP2,
      end: thisMonthP2,
      period: "payday_2",
    };
  } else {
    // End of month after P2 up to end of month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startP2 = new Date(thisMonthP1);
    startP2.setDate(startP2.getDate() + 1);
    return {
      start: startP2,
      end: lastDayOfMonth,
      period: "payday_2",
    };
  }
}
