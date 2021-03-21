import {Err, fatal} from './error';
import {ParsedPair} from './parser';

type FormulaPair = {
  change: number;
  duration: number;
}

const MAX_ITERATIONS = 100;
const RESULT_EPSILON = 0.001;

type LookupTable = {
  exponent: number;
  maxExp: number;
  [key: number]: number;
}

export class Search {
  // input
  private history: ParsedPair[];
  private endDate: Date;
  private endValue: number;

  constructor(history: ParsedPair[], endDate: Date, endValue: number) {
    this.history = history;
    this.endDate = endDate;
    this.endValue = endValue;
  }

  public run(): void {
    const formulaData = this.processHistory();
    const maxExponent = this.getMaxExponent(formulaData);
    let left = 0;
    let right = 2;
    let iteration = 0;
    let found = false;
    let lookupTable;
    while (true) {
      lookupTable = this.prepareLookupTable(left, right, maxExponent);
      const result = this.evaluate(formulaData, lookupTable);
      if (Math.abs(this.endValue - result) < RESULT_EPSILON) {
        found = true;
        break;
      }
      if (result > this.endValue) {
        right = lookupTable.exponent;
      } else {
        left = lookupTable.exponent;
      }
      iteration += 1;
      if (iteration === MAX_ITERATIONS) {
        break;
      }
    }
    if (found) {
      const perAnnum = this.getExponent(lookupTable, 365) - 1;
      if (perAnnum >= 0) {
        console.log(`
appreciation rate: \x1b[32m${(perAnnum * 100).toFixed(2)}% p.a.\x1b[0m
`);
      } else {
        console.log(`
depreciation rate: \x1b[31m${(perAnnum * 100).toFixed(2)}% p.a.\x1b[0m
`);
      }
    } else {
      console.log(`
\x1b[31merror:\x1b[0m could not figure out the rate
please check if the input data (history, end date, and end value) is correct
`);
    }
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

  private getMaxExponent(formulaData: FormulaPair[]): number {
    let max = 365; // eventually, we need to calculate per annum exponent
    formulaData.forEach(({duration}) => {
      max = Math.max(max, duration);
    });
    return max;
  }

  private prepareLookupTable(left: number, right: number, maxExponent: number): LookupTable {
    const exponent = (left + right) / 2;
    const result: LookupTable = {
      exponent,
      maxExp: 1,
      0: 1.0,
      1: exponent,
    };
    let exp = 2;
    let previous = exponent;
    while (exp <= maxExponent) {
      result[exp] = previous * previous;
      previous = result[exp];
      result.maxExp = exp;
      exp *= 2;
    }
    return result;
  }

  private getExponent(lookupTable: LookupTable, exp: number): number {
    let result = 1;
    let remainder = exp;
    let index = lookupTable.maxExp;
    while (remainder) {
      if (index <= remainder) {
        result *= lookupTable[index];
        remainder -= index;
      }
      index /= 2;
    }
    return result;
  }

  private evaluate(formulaData: FormulaPair[], lookupTable: LookupTable): number {
    let result = 0;
    formulaData.forEach(({change, duration}) => {
      result += change;
      const exp = this.getExponent(lookupTable, duration);
      result *= exp;
    });
    return result;
  }
}
