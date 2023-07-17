import { Token } from '../token/token';

export interface AstNode {
  TokenLiteral(): string;
  String(): string;
}

export interface Statement extends AstNode {
  statementNode(): void;
}

export interface Expression extends AstNode {
  expressionNode(): void;
}

type ExpressionTypeWithValue<T> = {
  token: Token;
  value: T;
} & Expression;

type StatementType = {
  token: Token;
} & Statement;

type ProgramType = {
  statements: Statement[];
} & AstNode;

export class Program implements ProgramType {
  constructor(public statements: Statement[]) {
    this.statements = statements;
  }

  public TokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].TokenLiteral();
    } else {
      return '';
    }
  }

  public String(): string {
    let out: string = '';

    for (const statement of this.statements) {
      out += statement.String();
    }

    return out;
  }
}

type LetStatementType = {
  name: Identifier;
  value: Expression;
} & StatementType;

export class LetStatement implements LetStatementType {
  public name!: Identifier;
  public value!: Expression;

  constructor(public token: Token, name?: Identifier, value?: Expression) {
    this.token = token;

    if (name) {
      this.name = name;
    }

    if (value) {
      this.value = value;
    }
  }

  public statementNode(): void {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let out = this.TokenLiteral() + ' ';
    out += this.name.String();
    out += ' = ';

    if (this.value != null) {
      out += this.value.String();
    }

    out += ';';

    return out;
  }
}

type ReturnStatementType = {
  returnValue: Expression;
} & StatementType;

export class ReturnStatement implements ReturnStatementType {
  public returnValue!: Expression;

  constructor(public token: Token) {
    this.token = token;
  }

  public statementNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    str += this.TokenLiteral() + ' ';

    if (this.returnValue !== null) {
      str += this.returnValue.String();
    }

    str += ';';

    return str;
  }
}

type ExpressionStatementType = {
  expression: Expression;
} & StatementType;

export class ExpressionStatement implements ExpressionStatementType {
  public expression!: Expression;

  constructor(public token: Token) {
    this.token = token;
  }

  public statementNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    if (this.expression !== null) {
      return this.expression.String();
    }

    return '';
  }
}

type BlockStatementType = {
  statements: Statement[];
} & StatementType;

export class BlockStatement implements BlockStatementType {
  constructor(public token: Token, public statements: Statement[] = []) {
    this.token = token;
    this.statements = statements;
  }

  public statementNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    for (const s of this.statements) {
      str += s.String();
    }

    return str;
  }
}

export class Identifier implements ExpressionTypeWithValue<string> {
  public value!: string;

  constructor(public token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    return this.value;
  }
}

export class Boolean implements ExpressionTypeWithValue<boolean> {
  public value: boolean;

  constructor(public token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    return this.token.literal;
  }
}

export class IntegerLiteral implements ExpressionTypeWithValue<number> {
  public value!: number;

  constructor(public token: Token, value?: number) {
    this.token = token;

    if (value) {
      this.value = value;
    }
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    return this.token.literal;
  }
}

export class StringLiteral implements ExpressionTypeWithValue<string> {
  constructor(public token: Token, public value: string) {
    this.token = token;
    this.value = value;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    return this.token.literal;
  }
}

type PrefixExpressionType = {
  token: Token;
  right: Expression;
  operator: string;
} & Expression;

export class PrefixExpression implements PrefixExpressionType {
  public right!: Expression;

  constructor(public token: Token, public operator: string) {
    (this.token = token), (this.operator = operator);
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    str += '(';
    str += this.operator;
    str += this.right.String();
    str += ')';

    return str;
  }
}

type InfixExpressionType = {
  token: Token;
  left: Expression;
  right: Expression;
  operator: string;
} & Expression;

export class InfixExpression implements InfixExpressionType {
  public left!: Expression;
  public right!: Expression;

  constructor(public token: Token, public operator: string, left: Expression) {
    this.token = token;
    this.operator = operator;
    this.left = left;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    str += '(';
    str += this.left.String();
    str += ' ' + this.operator + ' ';
    str += this.right.String();
    str += ')';

    return str;
  }
}

type IfExpressionType = {
  token: Token;
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement;
} & Expression;

export class IfExpression implements IfExpressionType {
  condition!: Expression;
  consequence!: BlockStatement;
  alternative!: BlockStatement;

  constructor(public token: Token) {
    this.token = token;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    str += 'if';
    str += this.condition.String();
    str += ' ';
    str += this.consequence.String();

    if (this.alternative !== null) {
      str += 'else ';
      str += this.alternative.String();
    }

    return str;
  }
}

type FunctionLiteralType = {
  token: Token;
  parameters: Identifier[];
  body: BlockStatement;
} & Expression;

export class FunctionLiteral implements FunctionLiteralType {
  public parameters: Identifier[] = [];
  public body!: BlockStatement;

  constructor(public token: Token) {
    this.token = token;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    let params: string[] = [];

    for (const p of this.parameters) {
      params.push(p.String());
    }

    str += this.TokenLiteral();
    str += '(';
    str += params.join(', ');
    str += ') ';
    str += this.body.String();

    return str;
  }
}

type CallExpressionType = {
  token: Token;
  fn: Expression;
  arguments: Expression[];
} & Expression;

export class CallExpression implements CallExpressionType {
  public arguments: Expression[] = [];

  constructor(public token: Token, public fn: Expression) {
    this.token = token;
    this.fn = fn;
  }

  public expressionNode() {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    let args: string[] = [];

    for (const a of this.arguments) {
      args.push(a.String());
    }

    str += this.fn.String();
    str += '(';
    str += args.join(', ');
    str += ')';

    return str;
  }
}

type ArrayType = {
  token: Token;
  elements: Expression[];
} & Expression;

export class ArrayLiteral implements ArrayType {
  public elements!: Expression[];

  constructor(public token: Token, elements?: Expression[]) {
    this.token = token;
    this.elements = elements ?? [];
  }

  public expressionNode(): void {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    const elements: string[] = [];

    for (const el of this.elements) {
      elements.push(el.String());
    }

    str += '[';
    str += elements.join(', ');
    str += ']';

    return str;
  }
}

type IndexExpressionType = {
  token: Token;
  left: Expression;
  index: Expression;
} & Expression;

export class IndexExpression implements IndexExpressionType {
  public index!: Expression;

  constructor(public token: Token, public left: Expression) {
    this.token = token;
    this.left = left;
  }

  public expressionNode(): void {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';
    str += '(';
    str += this.left.String();
    str += '[';
    str += this.index.String();
    str += '])';

    return str;
  }
}

type HashLiteralType = {
  token: Token;
  pairs: Map<Expression, Expression>;
} & Expression;

export class HashLiteral implements HashLiteralType {
  public pairs!: Map<Expression, Expression>;

  constructor(public token: Token) {
    this.token = token;
  }

  public expressionNode(): void {}

  public TokenLiteral(): string {
    return this.token.literal;
  }

  public String(): string {
    let str: string = '';

    const pairs: string[] = [];
    for (const [key, value] of Object.entries(this.pairs)) {
      pairs.push(key.toString() + ':' + value.toString());
    }

    str += '{';
    str += pairs.join(', ');
    str += '}';

    return str;
  }
}
