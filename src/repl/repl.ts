import * as readline from 'readline';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { Eval } from '../eval/evaluator';
import { createNewEnvironment } from '../object/environment/environment';

const PROMPT = '> ';

export const startRepl = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
  });

  rl.prompt();

  const env = createNewEnvironment();

  rl.on('line', (line: string) => {
    const l = new Lexer(line);
    const p = new Parser(l);
    const program = p.ParseProgram();

    while (true) {
      if (p.errors.length !== 0) {
        printParseErrors(p.errors);
        break;
      }

      const evaluated = Eval(program, env);

      if (evaluated) {
        console.log(evaluated.inspect());
        console.log('\n');
      }

      break;
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Exiting.');
    process.exit(0);
  });
};

const bamya = `
        ___----""""\-__
_,-""""---------------|\/\\-____  
´"-___----------------|/\//---/
      """---_________//"""`;

const printParseErrors = (errors: string[]) => {
  let str: string =
    '-----------------------------\nWe ran into some bamya here!\n';
  str += bamya;
  str += '\n\n';
  str += 'Parser errors:\n';

  errors.forEach((msg, i) => {
    str += `\t${msg}\n`;
  });

  console.error(str);
};
