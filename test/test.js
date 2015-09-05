import getLogger from '../index'

import test from 'tape'

test('improper logger', t => {
  const config = [{
    type: 'Console',
    level: 'debug'
  }, {
    type: 'File',
    level: 'info',
    filename: './test.log'
  }]

  const logger = getLogger(config)
  t.deepLooseEqual(Object.keys(logger.transports), ['console', 'file'])

  t.end()
})
