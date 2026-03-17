import Fastify from 'fastify'
import sharp, { type Sharp } from 'sharp'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { colors } from './colors.js'
import { env } from './env.js'

const fastify = Fastify({ logger: true })

const MAX_WIDTH = 2000
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp', 'avif']

function getPreferredFormat(acceptHeader: string | undefined) {
  if (!acceptHeader) return 'jpeg'
  if (acceptHeader.includes('image/avif')) return 'avif'
  if (acceptHeader.includes('image/webp')) return 'webp'
  return 'jpeg'
}

fastify.get('/', function (request, reply) {
  return {
    message: 'hello world'
  }

})

fastify.get('/img', {
  handler: async (request, reply) => {
    try {
      // @ts-ignore
      const { u, o } = request.query
      console.log({ u, o })
      const parts = o?.split('_')

      const tokens = parts
      const ops = parseTokens(tokens)

      const parsed = new URL(u)
      if (!env.ALLOWED_UPSTREAM_ORIGINS.includes(parsed.hostname)) {
        reply.code(403)
        return { error: 'Host not allowed' }
      }

      const controller = new AbortController()

      setTimeout(() => controller.abort(), 5000)

      const upstream = await fetch(u, { signal: controller.signal })

      if (!upstream.ok || !upstream.body) {
        reply.code(502)
        return { error: 'Failed to fetch upstream image' }
      }

      // @ts-ignore
      const nodeStream = Readable.fromWeb(upstream.body)

      if (!ops.format) {
        const format = getPreferredFormat(request.headers.accept)
        ops.format = format
      }

      if (!ALLOWED_FORMATS.includes(ops.format)) {
        reply.code(403)
        return { error: 'Format not accepted' }
      }
      const transformer = applySharpOps(sharp(), ops)

      reply.header('Content-Type', `image/${ops.format}`)
      reply.header('Cache-Control', 'public, max-age=31536000, immutable')

      await pipeline(nodeStream, transformer, reply.raw)

      return reply
    } catch (err) {
      request.log.error(err)
      reply.code(500)
      return { error: 'Image processing failed' }
    }

  },
  schema: {
    querystring: {
      type: 'object',
      required: ['u'],
      properties: {
        u: { type: 'string' },
        o: { type: 'string' }
      }
    }
  }
})

try {
  const port = parseInt(process.env.PORT || '3000')
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

type Ops = {
  resize: { width: number; height: number, fit: 'cover' | 'contain' };
  blur: number;
  rotate: number;
  quality: number;
  trim: any
  extend: any
  extract: any
  tint: any
  grayscale: boolean
  flip: boolean
  flop: boolean
  dilate: boolean
  erode: boolean
  flatten: boolean
  unflatten: boolean
  negate: boolean
  normalize: boolean
  clahe: number
  threshold: number
  format: 'jpeg' | 'png' | 'avif' | 'webp';
}

function parseTokens(tokens: string) {
  // @ts-ignore
  const ops: Ops = {
    format: 'jpeg',
  }

  for (const token of tokens) {

    const [selector, value, restValues] = parseToken(token)

    if (selector === 'size' && value) {
      ops.resize.width = parseSize(value)
      ops.resize.height = parseSize(value)
    }
    else if (selector === 'w' && value) {
      ops.resize.width = parseSize(value)
    }
    else if (selector === 'h' && value) {
      ops.resize.height = parseSize(value)
    }

    else if (selector === 'fit' && value) {
      // @ts-ignore
      ops.resize.fit = value
    }

    else if (selector === 'blur') {
      ops.blur = Number(value)
    }

    else if (selector === 'rotate') {
      ops.rotate = Number(value)
    }

    else if (selector === 'quality') {
      ops.quality = Number(value)
    }
    else if (selector === 'trim') {
      ops.trim = value ? { background: value } : true
    }

    else if (selector === 'extend' && value) {
      ops.extend = {
        ...ops.extend,
        top: parseSize(value),
        bottom: parseSize(value),
        left: parseSize(value),
        right: parseSize(value),
      }
    }
    else if (selector === 'extract' && value) {
      const values = value?.replace(/[^0-9.,]/g, '')?.split(',')
      ops.extract = {
        left: Number(values[0]),
        top: Number(values[1]),
        width: Number(values[2]),
        height: Number(values[3]),
      }
    }
    else if (selector === 'tint' && value) {
      // @ts-ignore
      const color = ['white', 'black'].includes(value) ? colors[value] : colors[value][restValues]
      ops.tint = {
        r: color[0],
        g: color[1],
        b: color[2]
      }
    }
    else if (selector === 'bg' && value) {
      // @ts-ignore
      const color = ['white', 'black'].includes(value) ? colors[value] : colors[value][restValues]
      ops.extend = {
        ...ops.extend,
        background: {
          r: color[0],
          g: color[1],
          b: color[2],
          alpha: 1
        }
      }
    }

    else if (selector === 'grayscale') ops.grayscale = true
    else if (selector === 'greyscale') ops.grayscale = true

    else if (selector === 'flip') ops.flip = true
    else if (selector === 'flop') ops.flop = true
    else if (selector === 'dilate') ops.dilate = true
    else if (selector === 'erode') ops.erode = true
    else if (selector === 'flatten') ops.flatten = true
    else if (selector === 'unflatten') ops.unflatten = true
    else if (selector === 'negate') ops.negate = true
    else if (selector === 'normalize') ops.normalize = true
    else if (selector === 'normalise') ops.normalize = true
    else if (selector === 'clahe') ops.clahe = Number(value)
    else if (selector === 'threshold') ops.threshold = Number(value)

    // @ts-ignore
    else if (['webp', 'jpeg', 'png', 'avif'].includes(selector)) {
      // @ts-ignore
      ops.format = selector
    }
  }

  return ops
}

function parseToken(token: string) {
  return token?.split('-')
}

function applySharpOps(sharpInstance: Sharp, ops: Ops) {
  sharpInstance.autoOrient()
  if (ops.resize.width || ops.resize.height) {
    sharpInstance.resize(ops.resize)
  }

  if (ops.blur) {
    sharpInstance.blur(ops.blur)
  }

  if (ops.rotate) {
    sharpInstance.rotate(ops.rotate)
  }

  if (ops.extend) {
    sharpInstance.extend(ops.extend)
  }
  if (ops.extract) {
    sharpInstance.extract(ops.extract)
  }
  if (ops.trim) {
    if (typeof ops.trim === 'boolean') {
      sharpInstance.trim()
    } else {
      sharpInstance.trim(ops.trim)
    }
  }

  if (ops.flip) {
    sharpInstance.flip()
  }
  if (ops.flop) {
    sharpInstance.flop()
  }
  if (ops.dilate) {
    sharpInstance.dilate()
  }
  if (ops.erode) {
    sharpInstance.erode()
  }
  if (ops.flatten) {
    sharpInstance.flatten()
  }
  if (ops.unflatten) {
    sharpInstance.unflatten()
  }
  if (ops.negate) {
    sharpInstance.negate()
  }
  if (ops.normalize) {
    sharpInstance.normalize()
  }
  if (ops.clahe) {
    sharpInstance.clahe({
      width: ops.clahe,
      height: ops.clahe
    })
  }
  if (ops.threshold) {
    sharpInstance.threshold(ops.threshold)
  }
  if (ops.tint) {
    sharpInstance.tint(ops.tint)
  }
  if (ops.grayscale) {
    sharpInstance.grayscale()
  }

  if (ops.format) {
    sharpInstance.toFormat(ops.format, {
      quality: ops.quality || 80
    })
  }

  return sharpInstance
}

function parseSize(value: string) {
  if (value === '3xs') return 256
  else if (value === '2xs') return 288
  else if (value === 'xs') return 320
  else if (value === 'sm') return 384
  else if (value === 'md') return 448
  else if (value === 'lg') return 512
  else if (value === 'xl') return 576
  else if (value === '2xl') return 627
  else if (value === '3xl') return 768
  else if (value === '4xl') return 896
  else if (value === '5xl') return 1024
  else if (value === '6xl') return 1152
  else if (value === '7xl') return 1280
  else if (value === 'px') return 1
  return Number((value || "").replace(/[^0-9]/g, ''))
}