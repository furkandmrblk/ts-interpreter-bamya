import { Token, TokenType } from '../../token/token';
import { Lexer } from '../lexer';

test('test getNextToken()', function () {
  const input = `=+(){},;`;

  const tokens = [
    TokenType.Assign,
    TokenType.Plus,
    TokenType.LParen,
    TokenType.RParen,
    TokenType.LSquirly,
    TokenType.RSquirly,
    TokenType.Comma,
    TokenType.Semicolon,
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    expect(lexer.getNextToken().type).toBe(token);
  }
});

test('test getNextToken() 2.0', function () {
  const input = `let five = 5;
  let ten = 10;`;

  const tokens: Token[] = [
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'five' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '5' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Let, literal: 'let' },
    { type: TokenType.Ident, literal: 'ten' },
    { type: TokenType.Assign, literal: '=' },
    { type: TokenType.Int, literal: '10' },
    { type: TokenType.Semicolon, literal: ';' },
    { type: TokenType.Eof, literal: 'eof' },
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    const x = lexer.getNextToken();

    expect(x).toEqual(token);
  }
});
