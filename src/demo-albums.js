// demo albums before API setup, can delete when live data

const clvrs = [
  '0x555555a56565556a55aa66aa596a6aaa',
  '0x55555555aa95a6a5aaa5a6659aa5aaa5',
  '0x555655555aa565996659595955555555',
  '0x55565555595555955655556555559555',
  '0x555555559999a5599955a555a955abaa',
  '0x55555aa9656965aa665a6a666a9a56aa',
  '0x555569a6669a5a6a699a666a5aaa6aaa',
  '0x55555566599a566a59aa669a5aaa6aaa',
  '0x55555aa9656965aa665a6a666a9a56aa'
]

function shuffle (array) {
  array = JSON.parse(JSON.stringify(array))
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
