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
