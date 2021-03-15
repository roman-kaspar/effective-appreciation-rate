import printf from 'printf';

export enum Err {
  CMD_ARG_MISSING = 'mandatory command line argument "%s" is missing.',
  CANNOT_PARSE_CMD_NUM = 'cannot parse command line argument "%s" as a number',
  CANNOT_PARSE_CMD_DATE = 'cannot parse command line argument "%s" as a "YYYY/MM/DD" date',

  CANNOT_READ_FILE = 'cannot read history file "%s"',
  CANNOT_PARSE_FILE_NUM = 'cannot parse value "%s" as a number in file "%s" on line "%d"',
  CANNOT_PARSE_FILE_DATE = 'cannot parse value "%s" as a "YYYY/MM/DD" date in file "%s" on line "%d"',
}

export function fatal(err: Err, ...rest): void {
  console.log(`
\x1b[31merror:\x1b[0m ${printf(err, ...rest)}

\x1b[36musage:\x1b[0m ./bin/ear --history <FILENAME> --value <NUMBER> [--date <DATE>]
for more details, please see \x1b[36mREADME.md\x1b[0m
`);
  process.exit(1);
};
