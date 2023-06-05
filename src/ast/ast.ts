import { Token } from '../token/token';

interface AstNode {
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
    const out: string[] = [];

    for (const statement of this.statements) {
      out.push(statement.String());
    }

    return out.join('');
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

export class Identifier {
  public value!: string;

  constructor(private token: Token, value?: string) {
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
    return this.value;
  }
}
