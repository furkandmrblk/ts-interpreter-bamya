import { Token } from '../token/token';

export interface AstNode {
  TokenLiteral: () => string;
  String: () => string;
}

export interface Statement extends AstNode {
  statementNode: () => void;
}

export interface Expression extends AstNode {
  expressionNode: () => void;
}

export class Program {
  constructor(public statements: (Statement | LetStatement)[]) {
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

export class LetStatement {
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

export class ReturnStatement {
  public returnValue!: Expression;

  constructor(private token: Token) {
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

export class ExpressionStatement {
  public expression!: Expression;

  constructor(private token: Token) {
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

export class BlockStatement {
  constructor(private token: Token, public statements: Statement[] = []) {
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

export class Identifier {
  public value!: string;

  constructor(private token: Token, value: string) {
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

export class Boolean {
  public value: boolean;

  constructor(private token: Token, value: boolean) {
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

export class IntegerLiteral {
  public value!: number;

  constructor(private token: Token, value?: number) {
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

export class PrefixExpression {
  public right!: Expression;

  constructor(private token: Token, public operator: string) {
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

export class InfixExpression {
  public left!: Expression;
  public right!: Expression;

  constructor(private token: Token, public operator: string, left: Expression) {
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

export class IfExpression {
  condition!: Expression;
  consequence!: BlockStatement;
  alternative!: BlockStatement;

  constructor(private token: Token) {
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

export class FunctionLiteral {
  public parameters: Identifier[] = [];
  public body!: BlockStatement;

  constructor(private token: Token) {
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

export class CallExpression {
  public arguments: Expression[] = [];

  constructor(private token: Token, public fn: Expression) {
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
