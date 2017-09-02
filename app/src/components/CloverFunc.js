const tiles = {
  'w': ' ⬜️ ',
  'b': ' ⬛️ ',
  '-': ' ❎ '
}

export default {
  name: 'clover',
  functional: true,
  render (createElement, ctx) {
    const { board } = ctx.props
    let rows = ''
    for (let row of board) {
      for (let tile of row) {
        rows += tiles[tile]
      }
      rows += '\n'
    }
    return createElement('li', {
      'class': 'pre px1 mb2'
    }, rows)
  }
}
