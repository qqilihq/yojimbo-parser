import * as fs from 'fs';
import * as path from 'path';
import * as json2csv from 'json2csv';
import { camelCase } from 'lodash';

export interface ParseResult {
  [key: string]: string;
}

interface MapFunction {
  (entry: ParseResult): ParseResult;
}

const mappings: { [entityType: string]: MapFunction } = {
  password: entry => {
    // title,website,username,password,notes,custom field 1,custom field 2
    return {
      title: entry['name'],
      website: entry['location'],
      username: entry['account'],
      password: entry['password'],
      notes: entry['comments']
    };
  },
  serial: entry => {
    // title,version,license key,your name,your email,company,download link,software publisher,publisher's website,retail price,support email,purchase date,order number,notes
    return {
      title: entry['productName'],
      version: '',
      license_key: entry['serialNumber'],
      your_name: entry['ownerName'],
      your_email: entry['emailAddress'],
      company: entry['organization'],
      download_link: '',
      software_publisher: '',
      publishers_website: '',
      retail_price: '',
      support_email: '',
      purchase_date: '',
      order_number: '',
      notes: entry['comments']
    };
  }
};

// CLI only when module is not require'd
if (require.main === module) {

  // (0) input: path to directory with text files
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  const entityType = args[2];
  if (!inputPath || !outputPath || !entityType) {
    console.error('Expected input path as first paramter');
    console.error('Expected CSV output path as second parameter');
    console.error('Expected entity type `password` or `serial` as third parameter');
    process.exit(1);
  }

  const mapping = mappings[entityType];
  if (!mapping) {
    console.error(`No mapping for type '${entityType}'`);
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
  }).filter(v => !!v) as ParseResult[];

  // (2) map to the expected CSV structure
  // https://support.1password.com/create-csv-files/
  const mappedEntries = entries.map(mapping);

  // (3) write out the CSV file
  const csv = json2csv.parse(mappedEntries, { header: false });
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
