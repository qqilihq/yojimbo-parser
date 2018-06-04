import expect = require('expect.js');
import 'mocha';
import * as path from 'path';
import * as fs from 'fs';
import * as parser from '../src/parser';

describe('parser', () => {

  it('parses password', () => {
    const testFile = fs.readFileSync(path.join(__dirname, 'password.txt'), { encoding: 'utf-8' });
    const parsed = parser.parse(testFile);
    expect(parsed).to.not.be(undefined);
    expect(parsed.name).to.eql('Amazon');
    expect(parsed.location).to.eql('https://amazon.com');
    expect(parsed.account).to.eql('john@example.com');
    expect(parsed.password).to.eql('asldqwiej1983e');
    expect(parsed.comments).to.match(/^Lorem ipsum/);
    expect(parsed.comments).to.match(/sit amet.$/);
  });

  it('parses serial number', () => {
    const testFile = fs.readFileSync(path.join(__dirname, 'serial_number.txt'), { encoding: 'utf-8' });
    const parsed = parser.parse(testFile);
    expect(parsed).to.not.be(undefined);
    expect(parsed.productName).to.eql('Panic Transmit 5');
    expect(parsed.ownerName).to.eql('John Doe');
    expect(parsed.emailAddress).to.eql('john@example.com');
    expect(parsed.organization).to.eql('ACME Enterprises');
    expect(parsed.serialNumber).eql('ABCD-DEFG-HIJK-LMNO-PQRS-T');
    expect(parsed.comments).to.eql('');
  });

});
