import {readFileSync} from 'fs';
import minimist from 'minimist';

import {Err, fatal} from './error';

const tzOffsetMs = (new Date().getTimezoneOffset()) * 60000;

type ParsedArgs = {
  date: Date;
  filename: string;
  value: number;
}

export type ParsedPair = {
  date: Date;
  value: number;
}

export class Parser {
  public parseCmd(cmdLineArgs: string[]): ParsedArgs {
    const parsed = minimist(cmdLineArgs, {string: ['history', 'value', 'date']});
    if (!parsed.history) {
      fatal(Err.CMD_ARG_MISSING, 'history');
    }
    if (!parsed.value) {
      fatal(Err.CMD_ARG_MISSING, 'value');
    }
    const value = this.parseFloat(parsed.value);
    if (value === null) {
      fatal(Err.CANNOT_PARSE_CMD_NUM, parsed.value);
    }
    const date = parsed.date
     ? this.parseDate(parsed.date)
     : new Date(Math.floor((Date.now() - tzOffsetMs) / 86400000) * 86400000);
    if (date === null) {
      fatal(Err.CANNOT_PARSE_CMD_DATE, parsed.date);
    }
    return {date, filename: parsed.history, value};
  }

  public parseHistoryFile(filename: string): ParsedPair[] {
    let lines;
    try {
      lines = readFileSync(filename).toString().split('\n');
    } catch(e) {
      fatal(Err.CANNOT_READ_FILE, filename);
    }

    const result: ParsedPair[] = [];
    lines.forEach((lineRaw, index) => {
      const line = lineRaw.trim();
      if (!line.length || line.startsWith('#')) { // empty lines and comments are ignored
        return;
      }
      const [dateStr, valueStr] = line.split(',');
      if (!valueStr) {
        fatal(Err.MALFORMED_LINE, index + 1, filename);
      }
      const date = this.parseDate(dateStr);
      if (date === null) {
        fatal(Err.CANNOT_PARSE_FILE_DATE, dateStr, filename, index + 1);
      }
      const value = this.parseFloat(valueStr);
      if (value === null) {
        fatal(Err.CANNOT_PARSE_FILE_NUM, valueStr, filename, index + 1);
      }
      result.push({date, value});
    });
    if (!result.length) {
      fatal(Err.EMPTY_HISTORY, filename);
    }
    return result;
  }

  private parseFloat(str: string): number | null {
    // command line argument can start with 'neg' that needs translating to '-'
    const strValue = str.startsWith('neg')
      ? `-${str.slice(3)}`
      : str;
    //
    const result = parseFloat(strValue);
    return Number.isNaN(result)
      ? null
      : result;
  }

  private parseDate(str: string): Date | null {
    // expected format of "str": "YYYY/MM/DD"
    const strArr = str.split('/');
    if (strArr.length !== 3) {
      return null;
    }
    const parsed = strArr.map((item) => { return parseInt(item, 10); });
    const [year, month, day] = parsed;
    return ((1900 < year) && (year < 3000) && (0 < month) && (month < 13) && (0 < day) && (day < 32))
      ? new Date(Date.UTC(year, month - 1, day))
      : null;
  }
}
