const tileMap = {
  'w': 't-w',
  'b': 't-b',
  '-': 't-n'
}

export default {
  name: 'clover',
  functional: true,
  render (createElement, ctx) {
    const { board } = ctx.props
    let rows = []
    for (let row of board) {
      let tiles = []
      for (let tile of row) {
        tiles.push(createElement('span', {'class': tileMap[tile]}))
      }
      rows.push(createElement('div', {'class': 'row'}, tiles))
    }
    return createElement('div', {
      'class': 'clover nowrap'
    }, rows)
  }
}
