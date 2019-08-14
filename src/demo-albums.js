// demo albums before API setup, can delete when live data

const clvrs = [
  '0x6aaaa95aa5a696969a56995aa56aaaaa',
  '0x9555a5959a55aa9965a559a5569955aa',
  '0xa955a955a955a996a956a956a9666955',
  '0x55566a666a566a5666aa59aa66aaaaaa',
  '0x55565aaa555a5a9a5aaaa956aa9a555a',
  '0x555555a5565559656565669555555555',
  '0xaaa9a9699a99aa59a969a55999a9aaa9',
  '0x555a555a55a955a55a955a55a955a555',
  '0xaaaaa5aa9a6a9a9aa5a6a9a6aa5aaaaa'
]

function shuffle (array) {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex
  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

export default [
  {
    name: 'cats',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'dogs',
    owner: '0x0932b1b3bf422f406753324f424af7103525625f', // ??
    clovers: shuffle(clvrs)
  },
  {
    name: 'abc',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'not-symm',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'smilies',
    owner: '0x0932b1b3bf422f406753324f424af7103525625f', // ??
    clovers: shuffle(clvrs)
  },
  {
    name: 'bldgs',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'sports',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'pets',
    owner: '0x0932b1b3bf422f406753324f424af7103525625f', // ??
    clovers: shuffle(clvrs)
  },
  {
    name: 'emojis',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  },
  {
    name: 'abstract',
    owner: '0x0932b1b3bf422f406753324f424af7103525625f', // ??
    clovers: shuffle(clvrs)
  },
  {
    name: 'pirates',
    owner: '0xa9b4e8c355e1122ed2d4222252c2e47e48162e40', // ev,
    clovers: shuffle(clvrs)
  }
]
