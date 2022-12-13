export const NOTES_EXCHANGE_ADDRESS = 'FILL_ME';

import * as fs from 'fs';
const truffleFile = JSON.parse(fs.readFileSync('build/contracts/NotesExchange.json', 'utf8'));

export const NOTES_EXCHANGE_ABI = truffleFile.abi;
export const NOTES_EXCHANGE_BYTECODE = truffleFile.bytecode;