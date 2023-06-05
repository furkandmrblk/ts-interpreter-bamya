import { Expression, LetStatement, Program, Statement } from '../../ast/ast';
import { Lexer } from '../../lexer/lexer';
import { Parser } from '../parser';

test('Parser Let-Statements', () => {
  const tests: {
    input: string;
    expectedIdentifier: string;
    expectedValue: unknown;
  }[] = [
    {
      input: 'let x = 5;',
      expectedIdentifier: 'x',
      expectedValue: 5,
    },
    {
      input: 'let y = true;',
      expectedIdentifier: 'y',
      expectedValue: true,
    },
    {
      input: 'let foobar = y;',
      expectedIdentifier: 'foobar',
      expectedValue: 'y',
    },
  ];

  for (const test of tests) {
    const lexer = new Lexer(test.input);

    const p = new Parser(lexer);
    const program = p.ParseProgram();
    checkParserErrors(p);

    if (program.statements.length !== 1) {
      throw new Error(
        `program.Statements does not contain 1 statements. Got= ${program.statements.length}`
      );
    }

    const statement = program.statements[0];

    if (!testLetStatement(statement, test.expectedIdentifier)) {
      return;
    }
  }
});

const testLetStatement = (
  s: Statement | LetStatement,
  name: string
): boolean => {
  if (s.TokenLiteral() !== 'let') {
    console.error(`Statement was not an ast.LetStatement. Got= ${s}`);
    return false;
  }

  const letStatement = s;

  if (!(letStatement instanceof LetStatement)) {
    throw new Error(`s is not ast.LetStatement. Got= ${s}`);
  }

  if (letStatement.name.value !== name) {
    console.error(
      `letStatement.name.value is not ${name}. Got= ${letStatement.name.value}`
    );
    return false;
  }

  if (letStatement.name.TokenLiteral() !== name) {
    console.error(`s.Name is not ${name}. Got= ${letStatement.name}`);
    return false;
  }

  return true;
};

// const testBooleanLiteral = (exp: Expression, value: boolean): boolean => {};

const checkParserErrors = (p: Parser): void => {
  const errors = p.Errors();

  if (errors.length === 0) {
    return;
  }

  console.error(`Parser has ${errors.length} errors.`);

  for (const error of errors) {
    console.error('Parser Error: ', error);
  }

  const t = () => {
    throw new TypeError();
  };

  expect(t).toThrow(TypeError);
};
