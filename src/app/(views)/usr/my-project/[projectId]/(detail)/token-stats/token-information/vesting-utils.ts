import moment, { Moment } from "moment";

export type VestingData = {
  name: string;
  total: number;
  vestingMonths: number; // number of monthly unlocks; 0 means unlock all at startDate
  startDate: string; // accepts YYYY-MM-DD or YYYY-MM
  color?: string;
};

export type UnlockEvent = {
  dateIso: string; // YYYY-MM-DD
  totalUnlocked: number; // sum of increments for this exact day
  contributors: { name: string; amount: number }[]; // per-allocation breakdown
};

/**
 * Parse flexible start date strings (YYYY-MM-DD or YYYY-MM).
 * Returns an invalid moment if parsing fails, so callers can skip invalid items.
 */
export function parseStartDateFlexible(input: string): Moment {
  let m = moment(input, ["YYYY-MM-DD", "YYYY-MM"], true);
  if (!m.isValid()) m = moment(input);
  return m;
}

/**
 * For a single allocation, compute the map of event increments keyed by day (YYYY-MM-DD).
 * - For vestingMonths === 0, there is a single event with the full total at startDate.
 * - Otherwise, the amount unlocked each month is even: total / vestingMonths.
 */
export function buildItemIncrementsByDay(
  item: VestingData
): Map<string, number> {
  const increments = new Map<string, number>();
  const start = parseStartDateFlexible(item.startDate);
  if (!start.isValid()) return increments;

  if (item.vestingMonths === 0) {
    const key = start.format("YYYY-MM-DD");
    increments.set(key, (increments.get(key) || 0) + item.total);
  } else {
    const monthlyUnlock = item.total / item.vestingMonths;
    for (let i = 0; i < item.vestingMonths; i++) {
      const key = start.clone().add(i, "months").format("YYYY-MM-DD");
      increments.set(key, (increments.get(key) || 0) + monthlyUnlock);
    }
  }
  return increments;
}

/**
 * From a list of allocations, generate per-allocation increments and the global
 * set of event dates (unique) along with min/max dates.
 */
export function buildAllIncrements(data: VestingData[]): {
  perItemIncrements: Map<number, Map<string, number>>;
  allEventDates: string[]; // sorted ascending YYYY-MM-DD
  minDateIso: string | null;
  maxDateIso: string | null;
} {
  const perItemIncrements = new Map<number, Map<string, number>>();
  const datesSet = new Set<string>();

  data.forEach((item, idx) => {
    const inc = buildItemIncrementsByDay(item);
    perItemIncrements.set(idx, inc);
    // Avoid iterating MapIterator with for-of to support lower TS targets
    inc.forEach((_, d) => {
      datesSet.add(d);
    });
  });

  const allEventDates = Array.from(datesSet).sort();
  const minDateIso = allEventDates.length > 0 ? allEventDates[0] : null;
  const maxDateIso =
    allEventDates.length > 0 ? allEventDates[allEventDates.length - 1] : null;

  return { perItemIncrements, allEventDates, minDateIso, maxDateIso };
}

/**
 * Build bucket dates every N days from minDate to maxDate inclusive.
 * The first bucket starts exactly at minDate (00:00), subsequent buckets are +N days.
 */
export function buildDayBuckets(
  minDateIso: string,
  maxDateIso: string,
  stepDays: number
): string[] {
  if (stepDays <= 0) throw new Error("stepDays must be > 0");
  const start = moment(minDateIso);
  const end = moment(maxDateIso);
  const buckets: string[] = [];
  let cursor = start.clone();
  while (cursor.isSameOrBefore(end, "day")) {
    buckets.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(stepDays, "days");
  }
  return buckets;
}

/**
 * Given per-item event increments and a categories timeline, produce stacked cumulative series.
 * - If stepDays > 0, events are binned into [bucket_k, bucket_{k+1}) day ranges.
 * - Otherwise, categories are exact event days, increments align 1:1 by date.
 */
export function buildSeriesForTimeline(
  data: VestingData[],
  perItemIncrements: Map<number, Map<string, number>>,
  categories: string[], // array of ISO dates (YYYY-MM-DD)
  options?: { stepDays?: number }
): { name: string; data: number[]; color?: string }[] {
  const stepDays = options?.stepDays ?? 0;
  const minCategoryIso = categories[0];

  const series = data.map((item, idx) => {
    const inc = perItemIncrements.get(idx) || new Map<string, number>();
    const incrementsArray = new Array<number>(categories.length).fill(0);

    if (stepDays > 0 && minCategoryIso) {
      const minMoment = moment(minCategoryIso);
      // Bin each event date into target bucket
      inc.forEach((amount, dateIso) => {
        const diff = moment(dateIso).diff(minMoment, "days");
        let bucket = Math.floor(diff / stepDays);
        if (bucket < 0) bucket = 0;
        if (bucket >= incrementsArray.length)
          bucket = incrementsArray.length - 1;
        incrementsArray[bucket] += amount;
      });
    } else {
      // Direct alignment by date
      categories.forEach((d, i) => {
        const amount = inc.get(d) || 0;
        incrementsArray[i] = amount;
      });
    }

    // Make cumulative for area chart
    const cumulative: number[] = [];
    let sum = 0;
    for (let i = 0; i < incrementsArray.length; i++) {
      sum += incrementsArray[i];
      cumulative.push(sum);
    }

    return { name: item.name, data: cumulative, color: item.color };
  });

  return series;
}

/** Build combined unlock events for table view (exact per-day events). */
export function buildTableEvents(
  data: VestingData[],
  totalSupply: number
): Array<UnlockEvent & { percent: number }> {
  const eventsMap = new Map<string, UnlockEvent>();
  data.forEach((item) => {
    const inc = buildItemIncrementsByDay(item);
    inc.forEach((amount, dateIso) => {
      const ev = eventsMap.get(dateIso) || {
        dateIso,
        totalUnlocked: 0,
        contributors: [],
      };
      ev.totalUnlocked += amount;
      ev.contributors.push({ name: item.name, amount });
      eventsMap.set(dateIso, ev);
    });
  });

  const events = Array.from(eventsMap.values())
    .sort((a, b) => (a.dateIso < b.dateIso ? -1 : 1))
    .map((e) => ({ ...e, percent: (e.totalUnlocked / totalSupply) * 100 }));

  return events;
}
