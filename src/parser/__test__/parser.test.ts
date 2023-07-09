import {
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
} from '../../ast/ast';
import { Lexer } from '../../lexer/lexer';
import { Parser } from '../parser';

test('Let-Statements', () => {
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

    const statement = program.statements[0] as LetStatement;

    if (!testLetStatement(statement, test.expectedIdentifier)) {
      return;
    }

    const val = statement.value;

    if (!testLiteralExpression(val, test.expectedValue)) {
      return;
    }
  }
});

test('Return-Statements', () => {
  const tests: {
    input: string;
    expectedValue: unknown;
  }[] = [
    {
      input: 'return 5;',
      expectedValue: 5,
    },
    {
      input: 'return true;',
      expectedValue: true,
    },
    {
      input: 'return foobar;',
      expectedValue: 'foobar',
    },
  ];

  for (const test of tests) {
    const lexer = new Lexer(test.input);
    const p = new Parser(lexer);
    const program = p.ParseProgram();

    checkParserErrors(p);

    if (program.statements.length !== 1) {
      throw new Error(
        `program.Statements does not contain 1 statements. got= ${program.statements.length}`
      );
    }

    const statement = program.statements[0];

    const returnStatement = statement as ReturnStatement;

    if (!returnStatement) {
      throw new Error(`statement not *ast.returnStatement. got=${statement}`);
    }

    if (returnStatement.TokenLiteral() !== 'return') {
      throw new Error(
        `returnStatement.TokenLiteral not 'return', got=${returnStatement.TokenLiteral()}`
      );
    }

    if (
      testLiteralExpression(returnStatement.returnValue, test.expectedValue)
    ) {
      return;
    }
  }
});

test('Identifier-Expressions', () => {
  const input = 'foobar;';

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program has not enough statements. got=${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const ident = statement.expression as Identifier;

  if (!ident) {
    throw new Error(`exp not *ast.Identifier. got=${statement.expression}`);
  }

  if (ident.value !== 'foobar') {
    throw new Error(`ident.value not "foobar". got=${ident.value}`);
  }

  if (ident.TokenLiteral() !== 'foobar') {
    throw new Error(
      `ident.TokenLiteral not "foobar". got=${ident.TokenLiteral()}`
    );
  }
});

test('IntegerLiteral-Expressions', () => {
  const input = '5;';

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program.Statements does not contain 1 statements. Got= ${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const literal = statement.expression as IntegerLiteral;

  if (!literal) {
    throw new Error(`exp not *ast.IntegerLiteral. got=${statement.expression}`);
  }

  if (literal.value !== 5) {
    throw new Error(`literal.value not 5. got=${literal.value}`);
  }

  if (literal.TokenLiteral() !== '5') {
    throw new Error(
      `literal.TokenLiteral not "5". got=${literal.TokenLiteral()}`
    );
  }
});

test('ParsingPrefix-Expressions', () => {
  const prefixTests: {
    input: string;
    operator: string;
    value: unknown;
  }[] = [
    {
      input: '!5;',
      operator: '!',
      value: 5,
    },
    {
      input: '-15;',
      operator: '-',
      value: 15,
    },
    {
      input: '!foobar;',
      operator: '!',
      value: 'foobar',
    },
    {
      input: '-foobar;',
      operator: '-',
      value: 'foobar',
    },
    {
      input: '!true;',
      operator: '!',
      value: true,
    },
    {
      input: '!false;',
      operator: '!',
      value: false,
    },
  ];

  for (const test of prefixTests) {
    const lexer = new Lexer(test.input);
    const p = new Parser(lexer);
    const program = p.ParseProgram();

    checkParserErrors(p);

    if (program.statements.length !== 1) {
      throw new Error(
        `program.Statements does not contain 1 statements. Got= ${program.statements.length}`
      );
    }

    const statement = program.statements[0] as ExpressionStatement;

    if (!statement) {
      throw new Error(
        `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
      );
    }

    const exp = statement.expression as PrefixExpression;

    if (!exp) {
      throw new Error(
        `statement is not *ast.PrefixExpression. got=${statement.expression}`
      );
    }

    if (exp.operator !== test.operator) {
      throw new Error(
        `exp.Operator is not ${test.operator}. got=${exp.operator}`
      );
    }

    if (!testLiteralExpression(exp.right, test.value)) {
      return;
    }
  }
});

test('ParsingInfix-Expressions', () => {
  const infixTests: {
    input: string;
    leftValue: unknown;
    operator: string;
    rightValue: unknown;
  }[] = [
    {
      input: '5 + 5;',
      leftValue: 5,
      operator: '+',
      rightValue: 5,
    },
    {
      input: '5 - 5;',
      leftValue: 5,
      operator: '-',
      rightValue: '5',
    },
    {
      input: '5 * 5;',
      leftValue: 5,
      operator: '*',
      rightValue: '5',
    },
    {
      input: '5 / 5;',
      leftValue: 5,
      operator: '/',
      rightValue: '5',
    },
    {
      input: '5 > 5;',
      leftValue: 5,
      operator: '>',
      rightValue: 5,
    },
    {
      input: '5 < 5;',
      leftValue: 5,
      operator: '<',
      rightValue: 5,
    },
    {
      input: '5 == 5;',
      leftValue: 5,
      operator: '==',
      rightValue: 5,
    },
    {
      input: '5 != 5;',
      leftValue: 5,
      operator: '!=',
      rightValue: 5,
    },
    {
      input: 'foobar + barfoo;',
      leftValue: 'foobar',
      operator: '+',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar - barfoo;',
      leftValue: 'foobar',
      operator: '-',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar * barfoo;',
      leftValue: 'foobar',
      operator: '*',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar / barfoo;',
      leftValue: 'foobar',
      operator: '/',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar > barfoo;',
      leftValue: 'foobar',
      operator: '>',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar < barfoo;',
      leftValue: 'foobar',
      operator: '<',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar == barfoo;',
      leftValue: 'foobar',
      operator: '==',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar != barfoo;',
      leftValue: 'foobar',
      operator: '!=',
      rightValue: 'barfoo',
    },
    {
      input: 'true == true',
      leftValue: true,
      operator: '==',
      rightValue: true,
    },
    {
      input: 'true != false',
      leftValue: true,
      operator: '!=',
      rightValue: false,
    },
    {
      input: 'false == false',
      leftValue: false,
      operator: '==',
      rightValue: false,
    },
  ];

  for (const test of infixTests) {
    const lexer = new Lexer(test.input);
    const p = new Parser(lexer);
    const program = p.ParseProgram();

    checkParserErrors(p);

    if (program.statements.length !== 1) {
      throw new Error(
        `program.Statements does not contain 1 statements. got=${program.statements.length}`
      );
    }

    const statement = program.statements[0] as ExpressionStatement;

    if (!statement) {
      throw new Error(
        `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
      );
    }

    if (
      !testInfixExpression(
        statement.expression,
        test.leftValue,
        test.operator,
        test.rightValue
      )
    ) {
      return;
    }
  }
});

test('OperatorPrecedence-Parsing', () => {
  const tests: {
    input: string;
    expected: string;
  }[] = [
    {
      input: '-1 + 2 + 3',
      expected: '(((-1) + 2) + 3)',
    },
    {
      input: '-a * b',
      expected: '((-a) * b)',
    },
    {
      input: '!-a',
      expected: '(!(-a))',
    },
    {
      input: 'a + b + c',
      expected: '((a + b) + c)',
    },
    {
      input: 'a + b - c',
      expected: '((a + b) - c)',
    },
    {
      input: 'a * b * c',
      expected: '((a * b) * c)',
    },
    {
      input: 'a * b / c',
      expected: '((a * b) / c)',
    },
    {
      input: 'a + b / c',
      expected: '(a + (b / c))',
    },
    {
      input: 'a + b * c + d / e - f',
      expected: '(((a + (b * c)) + (d / e)) - f)',
    },
    {
      input: '3 + 4; -5 * 5',
      expected: '(3 + 4)((-5) * 5)',
    },
    {
      input: '5 > 4 == 3 < 4',
      expected: '((5 > 4) == (3 < 4))',
    },
    {
      input: '5 < 4 != 3 > 4',
      expected: '((5 < 4) != (3 > 4))',
    },
    {
      input: '3 + 4 * 5 == 3 * 1 + 4 * 5',
      expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
    },
    {
      input: 'true',
      expected: 'true',
    },
    {
      input: 'false',
      expected: 'false',
    },
    {
      input: '3 > 5 == false',
      expected: '((3 > 5) == false)',
    },
    {
      input: '3 < 5 == true',
      expected: '((3 < 5) == true)',
    },
    {
      input: '1 + (2 + 3) + 4',
      expected: '((1 + (2 + 3)) + 4)',
    },
    {
      input: '(5 + 5) * 2',
      expected: '((5 + 5) * 2)',
    },
    {
      input: '2 / (5 + 5)',
      expected: '(2 / (5 + 5))',
    },
    {
      input: '(5 + 5) * 2 * (5 + 5)',
      expected: '(((5 + 5) * 2) * (5 + 5))',
    },
    {
      input: '-(5 + 5)',
      expected: '(-(5 + 5))',
    },
    {
      input: '!(true == true)',
      expected: '(!(true == true))',
    },
    {
      input: 'a + add(b * c) + d',
      expected: '((a + add((b * c))) + d)',
    },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    },
    {
      input: 'add(a + b + c * d / f + g)',
      expected: 'add((((a + b) + ((c * d) / f)) + g))',
    },
  ];

  for (const test of tests) {
    const lexer = new Lexer(test.input);
    const p = new Parser(lexer);
    const program = p.ParseProgram();

    checkParserErrors(p);

    const actual = program.String();

    if (actual !== test.expected) {
      throw new Error(`expected=${test.expected}, got=${actual}`);
    }
  }
});

test('IfExpressions', () => {
  const input = `if (x < y) { x }`;

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program.Statements does not contain 1 statements. got=${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const exp = statement.expression as IfExpression;

  if (!exp) {
    throw new Error(
      `statement.expression is not *ast.IfExpression. got=${statement.expression}`
    );
  }

  if (!testInfixExpression(exp.condition, 'x', '<', 'y')) return;

  if (exp.consequence.statements.length !== 1) {
    throw new Error(
      `consequence is not 1 statement. got=${exp.consequence.statements.length} statements.`
    );
  }

  const consequence = exp.consequence.statements[0] as ExpressionStatement;

  if (!consequence) {
    throw new Error(
      `statements[0] is not *ast.ExpressionStatement. got=${exp.consequence.statements[0]}`
    );
  }

  if (!testIdentifier(consequence.expression, 'x')) return;

  if (exp.alternative) {
    throw new Error(
      `exp.alternative.statements was not null. got=${exp.alternative}`
    );
  }
});

test('IfElseExpressions', () => {
  const input = 'if (x < y) { x } else { y }';

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program.Statements does not contain 1 statements. got=${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const exp = statement.expression as IfExpression;

  if (!exp) {
    throw new Error(
      `statement.expression is not *ast.IfExpression. got=${statement.expression}`
    );
  }

  if (!testInfixExpression(exp.condition, 'x', '<', 'y')) return;

  if (exp.consequence.statements.length !== 1) {
    throw new Error(
      `consequence is not 1 statement. got=${exp.consequence.statements.length} statements.`
    );
  }

  const consequence = exp.consequence.statements[0] as ExpressionStatement;

  if (!consequence) {
    throw new Error(
      `statements[0] is not *ast.ExpressionStatement. got=${exp.consequence.statements[0]}`
    );
  }

  if (!testIdentifier(consequence.expression, 'x')) return;

  if (exp.alternative.statements.length !== 1) {
    throw new Error(
      `exp.alternative.statements does not contain 1 statement. got=${exp.alternative.statements.length}`
    );
  }

  const alternative = exp.alternative.statements[0] as ExpressionStatement;

  if (!alternative) {
    throw new Error(
      `statements[0] is not *ast.ExpressionStatement. got=${exp.alternative.statements[0]}`
    );
  }

  if (!testIdentifier(alternative.expression, 'y')) return;
});

test('FunctionLiteral-Parsing', () => {
  const input = 'fn(x, y) { x + y }';

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program.Statements does not contain 1 statements. got=${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const fn = statement.expression as FunctionLiteral;

  if (!fn) {
    throw new Error(
      `statement.expression is not *ast.FunctionLiteral. got=${statement.expression}`
    );
  }

  if (fn.parameters.length !== 2) {
    throw new Error(
      `function literal parameters wrong. wanted 2, got=${fn.parameters.length}.`
    );
  }

  testLiteralExpression(fn.parameters[0], 'x');
  testLiteralExpression(fn.parameters[1], 'y');

  if (fn.body.statements.length !== 1) {
    throw new Error(
      `fn.body.statements has not 1 statement. got=${fn.body.statements.length}.`
    );
  }

  const bodyStatement = fn.body.statements[0] as ExpressionStatement;

  if (!bodyStatement) {
    throw new Error(
      `fn body statement is not *ast.ExpressionStatement. got=${fn.body.statements[0]}.`
    );
  }

  testInfixExpression(bodyStatement.expression, 'x', '+', 'y');
});

test('FunctionParameter-Parsing', () => {
  const tests: {
    input: string;
    expectedParams: string[];
  }[] = [
    {
      input: 'fn() {};',
      expectedParams: [],
    },
    { input: 'fn(x) {};', expectedParams: ['x'] },
    { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
  ];

  for (const test of tests) {
    const lexer = new Lexer(test.input);
    const p = new Parser(lexer);
    const program = p.ParseProgram();

    checkParserErrors(p);

    const statement = program.statements[0] as ExpressionStatement;

    const fn = statement.expression as FunctionLiteral;

    if (fn.parameters.length !== test.expectedParams.length) {
      throw new Error(
        `length of parameters wrong. wanted ${test.expectedParams.length}, got=${fn.parameters.length}.`
      );
    }

    for (let i = 0; i < test.expectedParams.length; i++) {
      testLiteralExpression(fn.parameters[i], test.expectedParams[i]);
    }
  }
});

test('CallExpression-Parsing', () => {
  const input = 'add(1, 2 * 3, 4 + 5);';

  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  checkParserErrors(p);

  if (program.statements.length !== 1) {
    throw new Error(
      `program.Statements does not contain 1 statements. got=${program.statements.length}`
    );
  }

  const statement = program.statements[0] as ExpressionStatement;

  if (!statement) {
    throw new Error(
      `program.statements[0] is not *ast.ExpressionStatement. got=${program.statements[0]}`
    );
  }

  const exp = statement.expression as CallExpression;

  if (!exp) {
    throw new Error(
      `statement.expression is not *ast.CallExpression. got=${statement.expression}.`
    );
  }

  if (!testIdentifier(exp.fn, 'add')) return;

  if (exp.arguments.length !== 3) {
    throw new Error(`wrong length of arguments. got=${exp.arguments.length}.`);
  }

  testLiteralExpression(exp.arguments[0], 1);
  testInfixExpression(exp.arguments[1], 2, '*', 3);
  testInfixExpression(exp.arguments[2], 4, '+', 5);
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

const testInfixExpression = (
  exp: Expression,
  left: unknown,
  operator: string,
  right: unknown
): boolean => {
  const opExp = exp as InfixExpression;

  if (!opExp) {
    console.error(`exp is not ast.OperatorExpression. got=${exp}`);
    return false;
  }

  if (!testLiteralExpression(opExp.left, left)) return false;

  if (opExp.operator !== operator) {
    console.error(`exp.Operator is not ${operator}. got=${opExp.operator}`);
    return false;
  }

  if (!testLiteralExpression(opExp.right, right)) return false;

  return true;
};

const testLiteralExpression = (exp: Expression, expected: unknown): boolean => {
  switch (typeof expected) {
    case 'number':
      return testIntegerLiteral(exp, Number(expected));
    case 'string':
      return testIdentifier(exp, expected);
    case 'boolean':
      return testBooleanLiteral(exp, expected);
  }

  console.error(`type of exp not handled. got=${exp}`);
  return false;
};

const testIntegerLiteral = (il: Expression, value: number): boolean => {
  const integ = il as IntegerLiteral;

  if (!integ) {
    console.error(`il not *ast.IntegerLiteral. got=${il}`);
    return false;
  }

  if (integ.value !== value) {
    console.error(`integ.value not ${value}. got=${integ.value}`);
    return false;
  }

  if (integ.TokenLiteral() !== String(value)) {
    console.error(
      `integ.TokenLiteral not ${value}. got=${integ.TokenLiteral()}`
    );
    return false;
  }

  return true;
};

const testIdentifier = (exp: Expression, value: string): boolean => {
  const ident = exp as Identifier;

  if (!ident) {
    console.error(`exp not *ast.Identifier. got=${exp}`);
    return false;
  }

  if (String(ident.value) !== String(value)) {
    console.error(`ident.value not ${value}. got=${ident.value}`);
    return false;
  }

  if (ident.TokenLiteral() !== value) {
    console.error(
      `ident.TokenLiteral not ${value}. got=${ident.TokenLiteral()}`
    );
    return false;
  }

  return true;
};

const testBooleanLiteral = (exp: Expression, value: boolean): boolean => {
  const bo = exp as Boolean;

  if (!bo) {
    console.error(`exp not *ast.Boolean. got=${exp}`);
    return false;
  }

  if (bo.value !== value) {
    console.error(`bo.value not ${value}.got=${bo.value}`);
    return false;
  }

  if (bo.TokenLiteral() !== String(value)) {
    console.error(`bo.Tokenliteral not ${value}. got=${bo.TokenLiteral()}`);
    return false;
  }

  return true;
};

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
