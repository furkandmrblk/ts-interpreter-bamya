import { Token, TokenType, createToken, lookupIdentity } from '../token/token';

const _a = 'a'.charCodeAt(0);
const _A = 'A'.charCodeAt(0);

const _z = 'z'.charCodeAt(0);
const _Z = 'Z'.charCodeAt(0);

const _0 = '0'.charCodeAt(0);
const _9 = '9'.charCodeAt(0);

const _ = '_'.charCodeAt(0);

const isLetter = (ch: string): boolean => {
  const charCode = ch.charCodeAt(0);

  return (
    (_a <= charCode && charCode <= _z) ||
    (_A <= charCode && charCode <= _Z) ||
    _ === charCode
  );
};

const isDigit = (ch: string): boolean => {
  const charCode = ch.charCodeAt(0);

  return _0 <= charCode && _9 >= charCode;
};

export class Lexer {
  private position: number = 0;
  private readPosition: number = 0;
  private ch!: string;

  constructor(private input: string) {
    this.readCharacter();
  }

  public getNextToken(): Token {
    this.eatWhitespace();

    let token: Token | undefined;

    switch (this.ch) {
      case '=':
        // TODO: Support for == && ===
        token = createToken(TokenType.Assign, this.ch);
        break;
      case '!':
        // TODO: peakCharacter
        token = createToken(TokenType.Bang, this.ch);
        break;
      case '+':
        token = createToken(TokenType.Plus, this.ch);
        break;
      case '-':
        token = createToken(TokenType.Minus, this.ch);
        break;
      case '(':
        token = createToken(TokenType.LParen, this.ch);
        break;
      case ')':
        token = createToken(TokenType.RParen, this.ch);
        break;
      case '{':
        token = createToken(TokenType.LSquirly, this.ch);
        break;
      case '}':
        token = createToken(TokenType.RSquirly, this.ch);
        break;
      case ',':
        token = createToken(TokenType.Comma, this.ch);
        break;
      case ';':
        token = createToken(TokenType.Semicolon, this.ch);
        break;
      case '\0':
        token = createToken(TokenType.Eof, 'eof');
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentity();
          return createToken(lookupIdentity(literal), literal);
        } else if (isDigit(this.ch)) {
          return createToken(TokenType.Int, this.readNumber());
        } else if (!token) {
          return createToken(TokenType.Illegal, this.ch);
        }
        break;
    }

    this.readCharacter();
    return token;
  }

  private eatWhitespace(): void {
    while (
      this.ch === ' ' ||
      this.ch === '\t' ||
      this.ch === '\n' ||
      this.ch === '\r'
    ) {
      this.readCharacter();
    }
  }

  private readIdentity(): string {
    const position = this.position;

    while (isLetter(this.ch)) {
      this.readCharacter();
    }

    return this.input.slice(position, this.position);
  }

  private readNumber(): string {
    const position = this.position;

    while (isDigit(this.ch)) {
      this.readCharacter();
    }

    return this.input.slice(position, this.position);
  }

  private readCharacter(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = '\0';
    } else {
      this.ch = this.input[this.readPosition];
    }

    this.position = this.readPosition;
    this.readPosition += 1;
  }
}
