import { Lexer } from '../../lexer/lexer';
import {
  Boolean,
  Error,
  Integer,
  Object,
  ObjectTypes,
} from '../../object/object';
import { Parser } from '../../parser/parser';
import { Eval } from '../evaluator';

test('Evaluate Integer-Expressions', () => {
  const tests: { input: string; expected: number }[] = [
    {
      input: '5',
      expected: 5,
    },
    {
      input: '10',
      expected: 10,
    },
    {
      input: '-5',
      expected: -5,
    },
    {
      input: '-10',
      expected: -10,
    },
    {
      input: '5 + 5 + 5 + 5 - 10',
      expected: 10,
    },
    {
      input: '2 * 2 * 2 * 2 * 2',
      expected: 32,
    },
    {
      input: '-50 + 100 + -50',
      expected: 0,
    },
    {
      input: '5 * 2 + 10',
      expected: 20,
    },
    {
      input: '5 + 2 * 10',
      expected: 25,
    },
    {
      input: '20 + 2 * -10',
      expected: 0,
    },
    {
      input: '50 / 2 * 2 + 10',
      expected: 60,
    },
    {
      input: '2 * (5 + 10)',
      expected: 30,
    },
    {
      input: '3 * 3 * 3 + 10',
      expected: 37,
    },
    {
      input: '3 * (3 * 3) + 10',
      expected: 37,
    },
    {
      input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
      expected: 50,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    testIntegerObject(evaluated, test.expected);
  }
});

test('Evaluate Boolean-Expressions', () => {
  const tests: {
    input: string;
    expected: boolean;
  }[] = [
    {
      input: 'true',
      expected: true,
    },
    {
      input: 'false',
      expected: false,
    },
    {
      input: '1 < 2',
      expected: true,
    },
    {
      input: '1 > 2',
      expected: false,
    },
    {
      input: '1 < 1',
      expected: false,
    },
    {
      input: '1 > 1',
      expected: false,
    },
    {
      input: '1 == 1',
      expected: true,
    },
    {
      input: '1 != 1',
      expected: false,
    },
    {
      input: '1 == 2',
      expected: false,
    },
    {
      input: '1 != 2',
      expected: true,
    },
    {
      input: 'true == true',
      expected: true,
    },
    {
      input: 'false == false',
      expected: true,
    },
    {
      input: 'true == false',
      expected: false,
    },
    {
      input: 'true != false',
      expected: true,
    },
    {
      input: 'false != true',
      expected: true,
    },
    {
      input: '(1 < 2) == true',
      expected: true,
    },
    {
      input: '(1 < 2) == false',
      expected: false,
    },
    {
      input: '(1 > 2) == true',
      expected: false,
    },
    {
      input: '(1 > 2) == false',
      expected: true,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    testBooleanObject(evaluated, test.expected);
  }
});

test('Evaluate BangOperator', () => {
  const tests: {
    input: string;
    expected: boolean;
  }[] = [
    {
      input: '!true',
      expected: false,
    },
    {
      input: '!false',
      expected: true,
    },
    {
      input: '!5',
      expected: false,
    },
    {
      input: '!!true',
      expected: true,
    },
    {
      input: '!!false',
      expected: false,
    },
    {
      input: '!!5',
      expected: true,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    testBooleanObject(evaluated, test.expected);
  }
});

test('Evaluate If-Else-Expressions', () => {
  const tests: {
    input: string;
    expected: unknown;
  }[] = [
    {
      input: 'if (true) { 10 }',
      expected: 10,
    },
    {
      input: 'if (false) { 10 }',
      expected: null,
    },
    {
      input: 'if (1) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 < 2) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 > 2) { 10 }',
      expected: null,
    },
    {
      input: 'if (1 > 2) { 10 } else { 20 }',
      expected: 20,
    },
    {
      input: 'if (1 < 2) { 10 } else { 20 }',
      expected: 10,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    const expected = test.expected;

    if (evaluated && typeof expected === 'number') {
      testIntegerObject(evaluated, expected);
    } else testNullObject(evaluated);
  }
});

test('Evaluate Return-Statements', () => {
  const tests: {
    input: string;
    expected: number;
  }[] = [
    {
      input: 'return 10;',
      expected: 10,
    },
    {
      input: 'return 10; 9;',
      expected: 10,
    },
    {
      input: 'return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: '9; return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: 'if (10 > 1) { if (10 > 1) { return 10; } return 1; }',
      expected: 10,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);

    if (evaluated instanceof Integer) {
      testIntegerObject(evaluated, test.expected);
    }
  }
});

test('Error Handling', () => {
  const tests: {
    input: string;
    expectedMessage: string;
  }[] = [
    {
      input: '5 + true;',
      expectedMessage: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '5 + true; 5;',
      expectedMessage: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '-true',
      expectedMessage: 'unknown operator: -BOOLEAN',
    },
    {
      input: 'true + false',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { true + false; }',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: '5; true + false; 5',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { if (10 > 1) { return true + false; } return 1; }',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);

    if (
      !evaluated ||
      (evaluated && evaluated.type() !== ObjectTypes.ERROR_OBJ)
    ) {
      console.log(test);
      throw new Error(`no error object returned. got=${evaluated}.`);
    }

    const error = evaluated as Error;

    if (error.message !== test.expectedMessage)
      throw new Error(
        `wrong error message. expected=${test.expectedMessage}, got=${error.message}.`
      );
  }
});

const testEval = (input: string) => {
  const lexer = new Lexer(input);
  const p = new Parser(lexer);
  const program = p.ParseProgram();

  return Eval(program);
};

const testIntegerObject = (obj: unknown, expected: number): boolean => {
  if (!(obj instanceof Integer)) {
    throw new Error(`object is not Integer. got=${obj}.`);
  }

  if (obj.value !== expected) {
    throw new Error(
      `object has wrong value. got=${obj.value}, wanted=${expected}.`
    );
  }

  return true;
};

const testBooleanObject = (obj: unknown, expected: boolean): boolean => {
  if (!(obj instanceof Boolean))
    throw new Error(`object is not Boolean. got=${obj}.`);

  if (obj.value !== expected)
    throw new Error(
      `object has wrong value. got=${obj.value}, wanted=${expected}.`
    );

  return true;
};

const testNullObject = (obj: Object | null): boolean => {
  if (obj !== null) throw new Error(`object is not NULL. got=${obj}.`);

  return true;
};
