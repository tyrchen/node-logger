import getLogger from './../index'

const config = [{
  type: 'Console',
  level: 'debug'
}, {
  type: 'File',
  level: 'info',
  filename: './test.log'
}]

const logger = getLogger(config)

console.log(Object.keys(logger.transports))