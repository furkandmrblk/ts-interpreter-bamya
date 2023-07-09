import { Lexer } from '../../lexer/lexer';
import { Boolean, Integer } from '../../object/object';
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
