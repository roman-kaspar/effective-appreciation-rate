import {Err, fatal} from './error';
import {ParsedPair} from './parser';

type FormulaPair = {
  change: number;
  duration: number;
}

export class Search {
  // input
  private history: ParsedPair[];
  private endDate: Date;
  private endValue: number;
  // processed history
  private data: FormulaPair[];

  constructor(history: ParsedPair[], endDate: Date, endValue: number) {
    this.history = history;
    this.endDate = endDate;
    this.endValue = endValue;
    this.data = [];
  }

  public run(): void {
    this.data = this.processHistory();
    console.log(this.data);
    // TODO
  }

  private processHistory(): FormulaPair[] {
    // sort
    const sorted: ParsedPair[] = this.history.sort((a, b) => {
      const aTime = a.date.getTime();
      const bTime = b.date.getTime();
      if (aTime < bTime) {
        return -1;
      }
      if (aTime > bTime) {
        return 1;
      }
      return 0;
    });
    // reduce (same date + remove zero-value entries)
    const reduced: ParsedPair[] = [];
    let lastDate = sorted[0].date;
    let lastValue = 0;
    sorted.forEach((item) => {
      if (item.date.getTime() === lastDate.getTime()) {
        lastValue += item.value;
      } else {
        if (lastValue !== 0) {
          reduced.push({date: lastDate, value: lastValue});
        }
        lastDate = item.date;
        lastValue = item.value;
      }
    });
    if (lastValue !== 0) {
      reduced.push({date: lastDate, value: lastValue});
    }
    // filter (only consider items with dates <= endDate)
    const filtered = reduced.filter((item) => (item.date.getTime() <= this.endDate.getTime()));
    if (!filtered.length) {
      fatal(Err.NO_RELEVANT_HISTORY);
    }
    // convert to formula shape
    const result: FormulaPair[] = [];
    for (let i = 0; i < filtered.length - 1; i += 1) {
      const current = filtered[i];
      const next = filtered[i + 1];
      result.push({
        change: current.value,
        duration: (next.date.getTime() - current.date.getTime()) / 86400000,
      });
    }
    const last = filtered[filtered.length - 1];
    result.push({
      change: last.value,
      duration: (this.endDate.getTime() - last.date.getTime()) / 86400000,
    });
    return result;
  }
}
