// Copyright 2024 MetaScript Foundation, a subsidary of MetaTable Games. All Rights reserved.
// Copyright 2024 MetaTable Games. All Rights reserved.

import * as fs from 'fs';
import * as readline from 'readline-sync';
import axios from 'axios';

const geoip = require('geoip-lite');
const currencies = JSON.parse(fs.readFileSync('./src/utils/currencies.json', 'utf-8'));

// fuck off typescript
declare global {
    interface String {
        replace_fr(target: string, replacement: string): string;
    }
}

interface Currency {
    code: string;
    currency: {
        symbol: string,
    };
    language: {
        code: string,
    };
}

String.prototype.replace_fr = function (target: string, replacement: string): string {
    const pattern = new RegExp('(?<![\'"`])\\b' + target + '\\b(?!["\'`])', 'g');
    
    return this.replace(pattern, replacement);
}

async function get_currency() {
    const { country } = await get_country();
    const currency = currencies.find((el: Currency) => el.code === country)

    return currency.currency.symbol;
}

async function get_country() {
    const response = await axios.get('https://api64.ipify.org?format=json');
    const ip = response.data.ip;
    const geo = await geoip.lookup(ip);

    return geo;
}

async function convert(inputCode: string) {
    const currency = await get_currency();

    return inputCode
        .replace_fr(";", '!')
        .replace_fr("be", '=')
        .replace_fr("this", 'let')
        .replace_fr("mf", 'const')
        .replace_fr("print", 'println')
        .replace_fr("fake", 'null')
        .replace_fr("nah", '!=')
        .replace_fr("fr", '==')
        .replace_fr("and", '&&')
        .replace_fr("or", '|')
        .replace_fr("function", 'fn')
        .replace_fr("nerd", 'math')
        .replace_fr("nocap", 'true')
        .replace_fr("cap", 'false')
        .replace_fr("fuck_around", 'try')
        .replace_fr("find_out", 'catch')
        .replace_fr("exec", 'exec')
        .replace_fr("yap", 'input')
        .replace(/\: number/g, '')
        .replace(/\: string/g, '')
        .replace(/\: object/g, '')
        .replace(/\: boolean/g, '')
        .replace(new RegExp(`${get_currency()}{}`), '${}')
}

function convertFileToLuau(inputFilePath: string, outputFilePath: string): void {
    try {
        const inputCode = fs.readFileSync(inputFilePath, 'utf-8');
        const converted = convert(inputCode);
        console.log(converted);

        //fs.writeFileSync(outputFilePath, converted);
        console.log('Conversion successful. Output saved to:', outputFilePath);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function getUserInput(): Promise<{ inputFilePath: string, outputFilePath: string }> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const inputFilePath = await new Promise<string>(resolve => {
        rl.question('Enter the input file path, e.g., C:/Admin/Script.msx: ', resolve);
    });

    const outputFilePath = await new Promise<string>(resolve => {
        rl.question('Enter the output file path, e.g., C:/Admin/Script.lua: ', resolve);
    });

    rl.close();

    return { inputFilePath, outputFilePath };
}

(async () => {
    const { inputFilePath, outputFilePath } = await getUserInput();
    const i_validExtensions = ['.msx', '.metascript', '.cum'];
    
    if (!i_validExtensions.some(ext => inputFilePath.endsWith(ext))) {
        console.error('Invalid input file extension. Supported extensions are:', i_validExtensions.join(', '));
        process.exit(1);
    }

    const o_validExtensions = ['.msraw', '.rawdog'];
    
    if (!o_validExtensions.some(ext => outputFilePath.endsWith(ext))) {
        console.error('Invalid output file extension. Supported extensions are:', o_validExtensions.join(', '));
        process.exit(1);
    }

    convertFileToLuau(inputFilePath, outputFilePath);
})();