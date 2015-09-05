import joi from 'joi'
import winston from 'winston'
winston.emitErrs = true

const _ALLOWED_TYPES = joi.string()
  .allow('Console', 'File', 'DailyRotateFile', 'MongoDB')
  .required()

const _ALLOWED_LEVEL = joi.string()
  .allow('debug', 'info', 'warn', 'error')
  .required()

const _SETUP = {
  'Console': {
    'defaults': {
      handleExceptions: true,
      prettyPrint: true,
      json: false,
      colorize: true
    },
    'schema': joi.object().keys({
      type: _ALLOWED_TYPES,
      level: _ALLOWED_LEVEL
    })
  },
  'File': {
    'defaults': {
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false
    },
    'schema': joi.object().keys({
      type: _ALLOWED_TYPES,
      level: _ALLOWED_LEVEL,
      filename: joi.string().required()
    })
  },
  'DailyRotateFile': {
    'defaults': {
      handleExceptions: true,
      json: true,
      colorize: false,
      datePattern: '.yyyy-MM-dd'
    },
    'schema': joi.object().keys({
      type: _ALLOWED_TYPES,
      level: _ALLOWED_LEVEL,
      filename: joi.string().required(),
      'datePattern': joi.string().required()
    })
  },
  'MongoDB': {
    'defaults': {
      host: 'localhost',
      port: 27017
    },
    'schema': joi.object().keys({
      type: _ALLOWED_TYPES,
      level: _ALLOWED_LEVEL,
      db: joi.string().required(),
      host: joi.string().hostname(),
      port: joi.number().integer()
    })
  }
}


function _withDefault(type, opts) {
  const obj = {}
  Object.assign(obj, _SETUP[type].defaults, opts)
  return obj
}

function _getTransport(info) {
  const {type, ...rest} = info
  const {err} = joi.validate(info, _SETUP[type].schema)

  if (err) {
    throw err
  }

  const opts = _withDefault(type, rest)
  switch (type) {
  case 'Console': return new winston.transports.Console(opts)
  case 'File': return new winston.transports.File(opts)
  case 'DailyRotateFile': return new winston.transports.DailyRotateFile(opts)
  case 'MongoDB': return new winston.transports.MongoDB(opts)
  default:
    throw new Error(`Unrecognized type: ${type}`)
  }
}

export default function getLogger(config) {
  return new winston.Logger({
    transports: config.map(item => _getTransport(item)),
    exitOnError: false
  })
}
