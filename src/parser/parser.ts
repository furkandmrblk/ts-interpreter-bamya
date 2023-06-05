import {
  Expression,
  Identifier,
  LetStatement,
  Program,
  Statement,
} from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Token, TokenItem, TokenType } from '../token/token';

enum Precedence {
  LOWEST = 0,
  EQUALS = 1,
  LESSGREATER = 2,
  SUM = 3,
  PRODUCT = 4,
  PREFIX = 5,
  CALL = 6,
}

const precedences: { [key in Token['type']]: number } = {
  [TokenType.Equal]: Precedence.EQUALS,
  [TokenType.NotEqual]: Precedence.EQUALS,
  [TokenType.LessThan]: Precedence.LESSGREATER,
  [TokenType.GreaterThan]: Precedence.LESSGREATER,
  [TokenType.Plus]: Precedence.SUM,
  [TokenType.Minus]: Precedence.SUM,
  [TokenType.Slash]: Precedence.PRODUCT,
  [TokenType.Asterisk]: Precedence.PRODUCT,
  [TokenType.LParen]: Precedence.CALL,
};

export class Parser {
  private errors: string[] = [];
  private currentToken!: Token;
  private peekToken!: Token;

  private prefixParseFns!: Record<Token['type'], any>;
  private infixParseFns!: Record<Token['type'], any>;

  constructor(private l: Lexer) {
    this.getNextToken();
    this.getNextToken();
  }

  public getNextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.l.getNextToken();
  }

  private currentTokenIs(t: Token['type']): boolean {
    return this.currentToken.type === t;
  }

  private peekTokenIs(t: Token['type']): boolean {
    return this.peekToken.type === t;
  }

  private expectPeek(t: Token['type']): boolean {
    if (this.peekTokenIs(t)) {
      this.getNextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  public Errors(): string[] {
    return this.errors;
  }

  private peekError(t: Token['type']) {
    const message = `Expected next token to be ${t}, got ${this.peekToken.type} instead.`;

    this.errors = [...this.errors, message];
  }

  public ParseProgram() {
    const program = new Program([]);

    while (!this.currentTokenIs('EOF')) {
      const stmt = this.parseStatement();

      if (stmt !== null) {
        program.statements = [...program.statements, stmt];
      }

      this.getNextToken();
    }

    return program;
  }

  private parseStatement(): LetStatement | null {
    switch (this.currentToken.type) {
      case 'LET':
        return this.parseLetStatement();
      default:
        return null;
    }
  }

  private parseLetStatement(): LetStatement | null {
    const statement = new LetStatement(this.currentToken);

    if (!this.expectPeek('IDENT')) {
      return null;
    }

    statement.name = new Identifier(this.currentToken);

    if (!this.expectPeek('=')) {
      return null;
    }

    this.getNextToken();

    statement.value = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(';')) {
      this.getNextToken();
    }

    return statement;
  }

  private noPrefixParseFnError(t: Token['type']): void {
    const message = `No prefix parse function for ${t} found.`;

    this.errors = [...this.errors, message];
  }

  private parseExpression(precedence: number) {
    const prefix = this.prefixParseFns[this.currentToken.type];

    if (!prefix) {
      this.noPrefixParseFnError(this.currentToken.type);
      return null;
    }

    // ???? no clue what prefix() is rn.
    let leftExp = prefix();

    while (!this.peekTokenIs(';') && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns[this.peekToken.type];

      if (!infix) {
        return leftExp;
      }

      this.getNextToken();

      // ? Same here. Lookup what Go does here.
      leftExp = infix(leftExp);
    }

    return leftExp;
  }

  private peekPrecedence(): number {
    const p = precedences[this.peekToken.type];

    if (p) {
      return p;
    }

    return Precedence.LOWEST;
  }
}
