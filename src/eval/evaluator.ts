import {
  AstNode,
  ExpressionStatement,
  IntegerLiteral,
  Boolean as AstBoolean,
  Program,
  Statement,
  PrefixExpression,
  InfixExpression,
} from '../ast/ast';
import { Integer, Boolean, Null, Object, ObjectTypes } from '../object/object';

type EvalTypes = Integer | Boolean | Object;

const references = {
  NULL: new Null(),
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
} as const;

export const Eval = (node: AstNode): EvalTypes | null => {
  if (node instanceof Program) {
    return evalStatements(node.statements);
  }

  if (node instanceof ExpressionStatement) {
    return Eval(node.expression);
  }

  if (node instanceof PrefixExpression) {
    const right = Eval(node.right);
    if (right) return evaluatePrefixExpression(node.operator, right);
  }

  if (node instanceof InfixExpression) {
    const left = Eval(node.left);
    const right = Eval(node.right);

    if (left && right) {
      return evaluateInfixExpression(node.operator, left, right);
    }
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof AstBoolean) {
    return nativeBoolToBooleanObject(node.value);
  }

  return null;
};

const evalStatements = (statements: Statement[]): EvalTypes | null => {
  let result: EvalTypes | null = null;

  for (const statement of statements) {
    result = Eval(statement);
  }

  return result;
};

const nativeBoolToBooleanObject = (input: boolean): Boolean => {
  if (input) {
    return references.TRUE;
  } else return references.FALSE;
};

const evaluateBangOperatorExpression = (right: Object): Object => {
  switch (right) {
    case references.TRUE:
      return references.FALSE;
    case references.FALSE:
      return references.TRUE;
    case references.NULL:
      return references.TRUE;
    default:
      return references.FALSE;
  }
};

const evaluateMinusPrefixOperatorExpression = (right: Object): Object => {
  if (right.type() !== ObjectTypes.INTEGER_OBJ) return references.NULL;

  const value = (right as Integer).value;

  return new Integer(-value);
};

const evaluatePrefixExpression = (operator: string, right: Object): Object => {
  switch (operator) {
    case '!':
      return evaluateBangOperatorExpression(right);
    case '-':
      return evaluateMinusPrefixOperatorExpression(right);
    default:
      return references.NULL;
  }
};

const evaluateIntegerInfixExpression = (
  operator: string,
  left: Object,
  right: Object
): Object => {
  const leftValue = (left as Integer).value;
  const rightValue = (right as Integer).value;

  switch (operator) {
    case '+':
      return new Integer(leftValue + rightValue);
    case '-':
      return new Integer(leftValue - rightValue);
    case '*':
      return new Integer(leftValue * rightValue);
    case '/':
      return new Integer(leftValue / rightValue);
    case '<':
      return nativeBoolToBooleanObject(leftValue < rightValue);
    case '>':
      return nativeBoolToBooleanObject(leftValue > rightValue);
    case '==':
      return nativeBoolToBooleanObject(leftValue == rightValue);
    case '!=':
      return nativeBoolToBooleanObject(leftValue != rightValue);
    default:
      return references.NULL;
  }
};

const evaluateInfixExpression = (
  operator: string,
  left: Object,
  right: Object
): Object => {
  if (
    left.type() == ObjectTypes.INTEGER_OBJ &&
    right.type() == ObjectTypes.INTEGER_OBJ
  ) {
    return evaluateIntegerInfixExpression(operator, left, right);
  }

  if (operator === '==') {
    return nativeBoolToBooleanObject(left == right);
  }

  if (operator == '!=') {
    return nativeBoolToBooleanObject(left != right);
  }

  return references.NULL;
};
