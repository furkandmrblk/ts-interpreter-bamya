import {
  ArrayLiteral,
  BlockStatement,
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  HashLiteral,
  Identifier,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  StringLiteral,
} from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Token, TokenType } from '../token/token';

enum Precedence {
  _ = 0,
  LOWEST = 1,
  EQUALS = 2,
  LESSGREATER = 3,
  SUM = 4,
  PRODUCT = 5,
  PREFIX = 6,
  CALL = 7,
  INDEX = 8,
}

const precedences: { [key: string]: number } = {
  [TokenType.Equal]: Precedence.EQUALS,
  [TokenType.NotEqual]: Precedence.EQUALS,
  [TokenType.LessThan]: Precedence.LESSGREATER,
  [TokenType.GreaterThan]: Precedence.LESSGREATER,
  [TokenType.Plus]: Precedence.SUM,
  [TokenType.Minus]: Precedence.SUM,
  [TokenType.Slash]: Precedence.PRODUCT,
  [TokenType.Asterisk]: Precedence.PRODUCT,
  [TokenType.LParen]: Precedence.CALL,
  [TokenType.LBracket]: Precedence.INDEX,
};

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (arg: Expression) => Expression;

export class Parser {
  private currentToken!: Token;
  private peekToken!: Token;

  public errors: string[] = [];

  private prefixParseFns!: Record<string, PrefixParseFn>;
  private infixParseFns!: Record<string, InfixParseFn>;

  constructor(private l: Lexer) {
    this.prefixParseFns = {};

    this.registerPrefix('IDENT', this.parseIdentifier);
    this.registerPrefix('INT', this.parseIntegerLiteral);
    this.registerPrefix('!', this.parsePrefixExpression);
    this.registerPrefix('-', this.parsePrefixExpression);
    this.registerPrefix('TRUE', this.parseBoolean);
    this.registerPrefix('FALSE', this.parseBoolean);
    this.registerPrefix('(', this.parseGroupedExpression);
    this.registerPrefix('IF', this.parseIfExpression);
    this.registerPrefix('FUNCTION', this.parseFunctionLiteral);
    this.registerPrefix('STRING', this.parseStringLiteral);
    this.registerPrefix('[', this.parseArrayLiteral);
    this.registerPrefix('{', this.parseHashLiteral);

    this.infixParseFns = {};

    this.registerInfix('+', this.parseInfixExpression);
    this.registerInfix('-', this.parseInfixExpression);
    this.registerInfix('/', this.parseInfixExpression);
    this.registerInfix('*', this.parseInfixExpression);
    this.registerInfix('==', this.parseInfixExpression);
    this.registerInfix('!=', this.parseInfixExpression);
    this.registerInfix('<', this.parseInfixExpression);
    this.registerInfix('>', this.parseInfixExpression);

    this.registerInfix('(', this.parseCallExpression);
    this.registerInfix('[', this.parseIndexExpression);

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

  private noPrefixParseFnError(t: Token['type']): void {
    const message = `No prefix parse function for ${t} found.`;

    this.errors = [...this.errors, message];
  }

  public ParseProgram() {
    const program = new Program([]);

    if (this.currentTokenIs('ILLEGAL')) {
      this.errors.push(
        `Provided token is not supported. got=${this.currentToken.literal}`
      );
    }

    while (!this.currentTokenIs('EOF') && !this.currentTokenIs('ILLEGAL')) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }

      this.getNextToken();
    }

    return program;
  }

  private parseStatement():
    | LetStatement
    | ReturnStatement
    | ExpressionStatement
    | null {
    switch (this.currentToken.type) {
      case 'LET':
        return this.parseLetStatement();
      case 'RETURN':
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement | null {
    const statement = new LetStatement(this.currentToken);

    if (!this.expectPeek('IDENT')) {
      return null;
    }

    statement.name = new Identifier(
      this.currentToken,
      this.currentToken.literal
    );

    if (!this.expectPeek('=')) {
      return null;
    }

    this.getNextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (exp) statement.value = exp;

    if (this.peekTokenIs(';')) {
      this.getNextToken();
    }

    return statement;
  }

  private parseReturnStatement(): ReturnStatement {
    const stmt = new ReturnStatement(this.currentToken);

    this.getNextToken();

    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp) stmt.returnValue = exp;

    if (this.peekTokenIs(';')) this.getNextToken();

    return stmt;
  }

  private parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement(this.currentToken);

    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp) stmt.expression = exp;

    if (this.peekTokenIs(';')) this.getNextToken();

    return stmt;
  }

  private parseExpression(precedence: number): Expression | null {
    const prefix = this.prefixParseFns[this.currentToken.type];

    if (!prefix) {
      this.noPrefixParseFnError(this.currentToken.type);
      return null;
    }

    let leftExp = prefix.bind(this)();

    while (!this.peekTokenIs(';') && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns[this.peekToken.type];

      if (!infix) {
        return leftExp;
      }

      this.getNextToken();

      if (leftExp) leftExp = infix.bind(this)(leftExp);
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

  private curPrecedence(): number {
    const precedence = precedences[this.currentToken.type];

    if (precedence) {
      return precedence;
    }

    return Precedence.LOWEST;
  }

  private parseIdentifier(): Expression {
    return new Identifier(this.currentToken, this.currentToken.literal);
  }

  private parseIntegerLiteral(): Expression | null {
    const lit = new IntegerLiteral(this.currentToken);

    const value = Number(this.currentToken.literal);

    if (isNaN(value)) {
      const msg = `Could not parse ${this.currentToken.literal} as integer.`;
      this.errors = [...this.errors, msg];
      return null;
    }

    lit.value = value;

    return lit;
  }

  private parseStringLiteral(): Expression | null {
    return new StringLiteral(this.currentToken, this.currentToken.literal);
  }

  private parsePrefixExpression(): Expression {
    const expression = new PrefixExpression(
      this.currentToken,
      this.currentToken.literal
    );

    this.getNextToken();

    const exp = this.parseExpression(Precedence.PREFIX);

    if (exp) {
      expression.right = exp;
    }

    return expression;
  }

  private parseInfixExpression(left: Expression): Expression {
    const expression = new InfixExpression(
      this.currentToken,
      this.currentToken.literal,
      left
    );

    const precedence = this.curPrecedence();
    this.getNextToken();

    const exp = this.parseExpression(precedence);
    if (exp) expression.right = exp;

    return expression;
  }

  private parseBoolean(): Expression {
    return new Boolean(this.currentToken, this.currentTokenIs('TRUE'));
  }

  private parseGroupedExpression(): Expression | null {
    this.getNextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(')')) return null;

    return exp;
  }

  private parseIfExpression(): Expression | null {
    const expression = new IfExpression(this.currentToken);

    if (!this.expectPeek('(')) return null;

    this.getNextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp) expression.condition = exp;

    if (!this.expectPeek(')')) return null;

    if (!this.expectPeek('{')) return null;

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs('ELSE')) {
      this.getNextToken();

      if (!this.expectPeek('{')) return null;

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  }

  private parseBlockStatement(): BlockStatement {
    let block = new BlockStatement(this.currentToken, []);

    this.getNextToken();

    while (!this.currentTokenIs('}') && !this.currentTokenIs('EOF')) {
      let stmt = this.parseStatement();

      if (stmt !== null) {
        block.statements.push(stmt);
      }

      this.getNextToken();
    }

    return block;
  }

  private parseFunctionLiteral(): Expression | null {
    const lit = new FunctionLiteral(this.currentToken);

    if (!this.expectPeek('(')) return null;

    const params = this.parseFunctionParameters();

    if (params) lit.parameters = params;

    if (!this.expectPeek('{')) return null;

    lit.body = this.parseBlockStatement();

    return lit;
  }

  private parseFunctionParameters(): Identifier[] | null {
    const identifiers: Identifier[] = [];

    if (this.peekTokenIs(')')) {
      this.getNextToken();
      return identifiers;
    }

    this.getNextToken();

    let ident = new Identifier(this.currentToken, this.currentToken.literal);
    identifiers.push(ident);

    while (this.peekTokenIs(',')) {
      this.getNextToken();
      this.getNextToken();

      ident = new Identifier(this.currentToken, this.currentToken.literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(')')) return null;

    return identifiers;
  }

  private parseCallExpression(fn: Expression): Expression {
    const exp = new CallExpression(this.currentToken, fn);
    const args = this.parseExpressionList(')');
    if (args) exp.arguments = args;
    return exp;
  }

  private parseArrayLiteral(): Expression {
    const array = new ArrayLiteral(this.currentToken);
    array.elements = this.parseExpressionList(']') ?? [];
    return array;
  }

  private parseIndexExpression(left: Expression): Expression {
    const exp = new IndexExpression(this.currentToken, left);

    this.getNextToken();

    const lowestExp = this.parseExpression(Precedence.LOWEST);
    if (lowestExp) exp.index = lowestExp;

    if (!this.expectPeek(']')) {
      throw new Error('Right bracket `]` not provided.');
    }

    return exp;
  }

  private parseExpressionList(end: Token['type']): Expression[] | null {
    const list: Expression[] = [];

    if (this.peekTokenIs(end)) {
      this.getNextToken();
      return list;
    }
    8;

    this.getNextToken();

    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp) list.push(exp);

    while (this.peekTokenIs(',')) {
      this.getNextToken();
      this.getNextToken();

      const exp = this.parseExpression(Precedence.LOWEST);
      if (exp) list.push(exp);
    }

    if (!this.expectPeek(end)) return null;

    return list;
  }

  private parseHashLiteral(): Expression | null {
    const hash = new HashLiteral(this.currentToken);
    hash.pairs = new Map();

    while (!this.peekTokenIs('}')) {
      this.getNextToken();
      const key = this.parseExpression(Precedence.LOWEST);

      if (!this.expectPeek(':')) {
        return null;
      }

      this.getNextToken();
      const value = this.parseExpression(Precedence.LOWEST);

      if (key && value) {
        hash.pairs.set(key, value);
      }

      if (!this.peekTokenIs('}') && !this.expectPeek(',')) return null;
    }

    if (!this.expectPeek('}')) return null;

    return hash;
  }

  private registerPrefix(tokenType: Token['type'], fn: PrefixParseFn): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: Token['type'], fn: InfixParseFn): void {
    this.infixParseFns[tokenType] = fn;
  }
}
