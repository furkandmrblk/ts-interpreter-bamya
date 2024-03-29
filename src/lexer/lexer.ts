import { Token, createToken, lookupIdentity } from '../token/token';

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
        if (this.peekCharacter() === '=') {
          this.readCharacter();
          token = createToken('Equal', '==');
        } else {
          token = createToken('Assign', this.ch);
        }
        break;
      case '!':
        if (this.peekCharacter() === '=') {
          this.readCharacter();
          token = createToken('NotEqual', '!=');
        } else {
          token = createToken('Bang', this.ch);
        }
        break;
      case '+':
        token = createToken('Plus', this.ch);
        break;
      case '-':
        token = createToken('Minus', this.ch);
        break;
      case '*':
        token = createToken('Asterisk', this.ch);
        break;
      case '/':
        token = createToken('Slash', this.ch);
        break;
      case '>':
        token = createToken('GreaterThan', this.ch);
        break;
      case '<':
        token = createToken('LessThan', this.ch);
        break;
      case '(':
        token = createToken('LParen', this.ch);
        break;
      case ')':
        token = createToken('RParen', this.ch);
        break;
      case '{':
        token = createToken('LSquirly', this.ch);
        break;
      case '}':
        token = createToken('RSquirly', this.ch);
        break;

      case '[':
        token = createToken('LBracket', this.ch);
        break;
      case ']':
        token = createToken('RBracket', this.ch);
        break;
      case '"':
        token = createToken('String', this.readString());
        break;
      case ',':
        token = createToken('Comma', this.ch);
        break;
      case ';':
        token = createToken('Semicolon', this.ch);
        break;
      case ':':
        token = createToken('Colon', this.ch);
        break;
      case '\0':
        token = createToken('Eof', 'eof');
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentity();
          return createToken(lookupIdentity(literal), literal);
        } else if (isDigit(this.ch)) {
          return createToken('Int', this.readNumber());
        } else if (!token) {
          return createToken('Illegal', this.ch);
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

  private peekCharacter(): string {
    if (this.readPosition >= this.input.length) {
      return '\0';
    } else return this.input[this.readPosition];
  }

  private readIdentity(): string {
    const position = this.position;

    while (isLetter(this.ch) || isDigit(this.ch)) {
      this.readCharacter();
    }

    return this.input.slice(position, this.position);
  }

  private readString(): string {
    const position = this.position + 1;

    while (true) {
      this.readCharacter();

      if (this.ch === '"' || this.ch === '\0') {
        break;
      }
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
