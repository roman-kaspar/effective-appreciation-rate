# effective-appreciation-rate

Effective appreciation / depreciation rate calculator for investors.

## Motivation

It is quite easy to make a one-time investment and then after some time (knowing
the current value of the asset) calculate the effective appreciation /
depreciation (per annum) rate for it.

But in real life, small investors add and withdraw money to and from their
portfolio in time. The broker shows the current value of the portfolio to the
investor, but since each part of the portfolio has been working for the investor
different amount of time, it is not obvious what the corresponding effective
appreciation / depreciation rate of the portfolio is.

This tool is calculating the rate given two inputs:
* the (money) history of the portfolio (dates and +/- amounts)
* the portfolio value on a given date

## Usage

```
$ ./bin/ear --history <FILENAME> --value <NUMBER> [--date <DATE>]
```

The tool is written in TypeScript for recent version of
[node.js](www.nodejs.org), the `node` binary must be in system PATH. To install
the dependencies and compile it, run
```
$ yarn && yarn build
```

If the `date` command line argument is not provided, current date (= today) is
used.

## Data formats

The dates (both in the portfolio history file and for command line `date`
argument) must be provided in `YYYY/MM/DD` format.

The money amounts must be provided in format which is accepted by JavaScript
`parseFloat()` function, i.e. with no thousands separator and with `.` as the
decimal separator. *The command line arguments are prefixed with (double)
dashes, therefore the command line parser cannot parse negative value provided
on command line correctly (as it starts with minus sign, which is a dash as
well.  To enter negative value on command line, please replace the minus sign
with "neg" string.  E.g. use "neg100" to input negative 100, i.e. -100.*

The portfolio history file is a CSV file (comma separated values file) with each
line of `YYYY/MM/DD,amount[,comment]` format. The first part is the date of the
transaction, the `amount` is the money amount that was added (possitive
value) to or withdrawn (negative value) from the portfolio. Anything that
follows the amount on the line is ignored (and thus can be used for anything,
e.g. for line comments).

All portfolio history file lines with dates that are in the future (compared to
the `date` command line argument, or today if `date` is not provided) are
ignored.

Empty lines and lines starting with a hash sign (#) are ignored.

## Examples

Content of `history.csv` file:
```
2020/01/15,1000
2020/05/15,10000
2020/09/15,100000
```

Calculations:
```
$ ear --history history.csv --date 2021/01/15 --value 111000

appreciation rate: 0.00% p.a.


$ ear --history history.csv --date 2021/01/15 --value 114999

appreciation rate: 10.00% p.a.


$ ear --history history.csv --date 2021/01/15 --value 106758

depreciation rate: -10.00% p.a.
```

## Licence

MIT License

Copyright (c) 2021 Roman Kaspar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
