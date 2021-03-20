import {Parser} from './parser';
import {Search} from './search';

export class Client {
  public run(cmdLineArgs: string[]): void {
    const parser = new Parser();
    const {date: endDate, filename, value: endValue} = parser.parseCmd(cmdLineArgs);
    const history = parser.parseHistoryFile(filename);
    const search = new Search(history, endDate, endValue);
    search.run();
  }
}
