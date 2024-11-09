'use strict'

const tape = require('tape')
const BufferList = require('../')
const { Buffer } = require('buffer')

tape('indexOf single byte needle', (t) => {
  const bl = new BufferList(['abcdefg', 'abcdefg', '12345'])

  t.equal(bl.indexOf('e'), 4)
  t.equal(bl.indexOf('e', 5), 11)
  t.equal(bl.indexOf('e', 12), -1)
  t.equal(bl.indexOf('5'), 18)

  t.end()
})

tape('indexOf multiple byte needle', (t) => {
  const bl = new BufferList(['abcdefg', 'abcdefg'])

  t.equal(bl.indexOf('ef'), 4)
  t.equal(bl.indexOf('ef', 5), 11)

  t.end()
})

tape('indexOf multiple byte needles across buffer boundaries', (t) => {
  const bl = new BufferList(['abcdefg', 'abcdefg'])

  t.equal(bl.indexOf('fgabc'), 5)

  t.end()
})

tape('indexOf takes a Uint8Array search', (t) => {
  const bl = new BufferList(['abcdefg', 'abcdefg'])
  const search = new Uint8Array([102, 103, 97, 98, 99]) // fgabc

  t.equal(bl.indexOf(search), 5)

  t.end()
})

tape('indexOf takes a buffer list search', (t) => {
  const bl = new BufferList(['abcdefg', 'abcdefg'])
  const search = new BufferList('fgabc')

  t.equal(bl.indexOf(search), 5)

  t.end()
})
