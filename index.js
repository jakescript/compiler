/*
  BNF ---
    <digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 
    <integer> ::= <digit> | <digit><integer> 
    <operator> ::= + | - | / | *
    <expression> ::= <integer> | <integer> <operator> <expression>
*/

const 
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENTIFIER = 'IDENTIFIER',
  INT = 'INT',
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  FUNCTION = 'FUNCTION',
  LET = 'LET'

const createToken = (type, value) => ({ type, value: String(value)})

const isLetter = (c) => {
  return c.toLowerCase() != c.toUpperCase();
}

const isNumeric = (value) => {
  return /^-?\d+$/.test(value);
}

const isValidInput = (value) => {
  return !(
    !value ||
    value === ' ' ||
    value === '\n' ||
    value === '\t' ||
    value === '\r'
  )
}

const tokenizer = (input) => {
  const tokens = []
  const inputLength = input.length
  let currentIdx = 0

  const nextToken = () => {
    const char = input[currentIdx]
    if (!isValidInput(char)) {
      currentIdx++
      return
    }

    if (!char) {
      tokens.push(createToken(EOF, 0))
      return
    }

    if(isNumeric(char)) {
      let i = currentIdx
      let identifier = ''
      while(isValidInput(input[i]) && isNumeric(input[i])) {
        identifier += input[i]
        i++
      }

      tokens.push(createToken(INT, identifier))
      currentIdx = i
      return
    }

    if(isLetter(char)) {
      let i = currentIdx
      let identifier = ''
      while(isValidInput(input[i]) && isLetter(input[i])) {
        identifier += input[i]
        i++
      }

      if (identifier === 'fn') {
        tokens.push(createToken(FUNCTION, identifier))
      } else if (identifier === 'let') {
        tokens.push(createToken(LET, identifier))
      } else {
        tokens.push(createToken(IDENTIFIER, identifier))
      }

      currentIdx = i
      return
    }

    if ( char === ',') {
      tokens.push(createToken(COMMA, char))
    }

    if ( char === ';') {
      tokens.push(createToken(SEMICOLON, char))
    }

    if ( char === '{') {
      tokens.push(createToken(LBRACE, char))
    }

    if ( char === '}') {
      tokens.push(createToken(RBRACE, char))
    }

    if ( char === '(') {
      tokens.push(createToken(LPAREN, char))
    }

    if ( char === '}') {
      tokens.push(createToken(RPAREN, char))
    }

    if ( char === '=') {
      tokens.push(createToken(ASSIGN, char))
    }

    if ( char === '+') {
      tokens.push(createToken(PLUS, char))
    }

    currentIdx++
  }

  while (currentIdx < inputLength) {
    nextToken()
  }

  tokens.push(createToken(EOF, 0))
  return tokens
}


const buildAST = (tokens) => {
  let currentIdx = 0

  const _tokens = tokens.slice()
  const rootAst = {
    type: 'ProgramStart',
    data: []
  }

  const peek = () => {
    const next = _tokens[currentIdx + 1]

    if (next.type !== EOF) {
      return next
    }

    return false
  }

  // <expression> ::= <integer> | <integer> <operator> <expression>
  const parseExp = () => {
    console.log({ current: _tokens[currentIdx]})
    const node = {
      type: 'Expression',
      op: null,
      data: []
    }

    const next = peek()
    // single int
    if (!next) {
      node.data.push(_tokens[currentIdx])

      currentIdx++
      return node
    }


    if (next.type === PLUS) {
      node.op = PLUS
      const left = {
        type: 'Expression',
        op: null,
        data: [ _tokens[currentIdx]]
      }
      node.data.push(left)

      // skip operator token
      currentIdx += 2

      const right = parseExp()
      node.data.push(right)

      currentIdx++
      return node
    }

  }

  while(currentIdx <= _tokens.length - 1) {
    const token = _tokens[currentIdx]

    if (token.type === INT) {
      const node = parseExp()
      rootAst.data.push(node)
    }
    
  }

  return rootAst
}

const logNode = (node) => console.log(JSON.stringify(node, null ,2))

const init = () => {
  const input = `let five = 5;
  let ten = 10;

  let add = fn(x, y) {
  x + y;
  };

  let result = add(five, ten);`

  const tokens = tokenizer('15 + 2 + 1 + 3')
  const ast = buildAST(tokens)

  logNode({ ast })

}

init()

