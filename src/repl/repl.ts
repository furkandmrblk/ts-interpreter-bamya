import * as readline from 'readline';
import { Lexer } from '../lexer/lexer';
import { Token, TokenType } from '../token/token';

const PROMPT = '>> ';

export const startRepl = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
  });

  rl.prompt();

  rl.on('line', (line: string) => {
    const l = new Lexer(line);

    while (true) {
      const tok: Token = l.getNextToken();
      console.log(tok);

      if (tok.type === TokenType.Eof) {
        break;
      }
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Exiting.');
    process.exit(0);
  });
};
