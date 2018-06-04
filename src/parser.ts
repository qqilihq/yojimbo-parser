import * as fs from 'fs';
import * as path from 'path';
import * as json2csv from 'json2csv';
import { camelCase } from 'lodash';

export interface ParseResult {
  [key: string]: string;
}

// CLI only when module is not require'd
if (require.main === module) {

  // (0) input: path to directory with text files
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  if (!inputPath || !outputPath) {
    console.error('Expected input path as first paramter');
    console.error('Expected CSV output path as second parameter');
    process.exit(1);
  }

  // (1) loop through files and parse each, produce a JSON object which we can transform to CSV
  const entries = fs.readdirSync(inputPath).map(fileName => {
    if (!fileName.endsWith('.txt')) {
      console.log(`Skipping ${fileName}`);
      return undefined;
    }
    const filePath = path.resolve(inputPath, fileName);
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const parseResult = parse(fileContent);
    return parseResult;
  }).filter(v => !!v);

  // (2) write out the CSV file
  const csv = json2csv.parse(entries);
  fs.writeFileSync(outputPath, csv);

}

export function parse (fileContent: string): ParseResult {
  // https://regex101.com/r/T0f1Nw/1/
  const result: ParseResult = {};
  const lines = fileContent.split(/\n/);

  let index = 0;
  const comments = [];
  for (; index < lines.length; index++) {
    const line = lines[index];
    const matchResult = line.match(/([^:]+):\s(.*)/);
    if (matchResult) {
      if (matchResult[1] === 'Comments') {
        comments.push(matchResult[2]);
        break;
      } else {
        result[camelCase(matchResult[1])] = matchResult[2];
      }
    } else {
      throw new Error(`Couldn’t match '${line}'.`);
    }
  }
  for (index++; index < lines.length; index++) {
    comments.push(lines[index]);
  }
  result.comments = comments.join('\n').trim();
  return result;
}
