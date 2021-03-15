import {Parser} from './parser';

export class Client {
  public run(cmdLineArgs: string[]): void {
    const parser = new Parser();
    const cmdArgs = parser.parseCmd(cmdLineArgs);
    console.log(cmdArgs);
  }
}
