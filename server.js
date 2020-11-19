'use strict'

const fastify = require('fastify')()

fastify.register(require('fastify-redis-channels'), {
  channels: {
    application: 'worker',
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
})
fastify.ready(error => {
  if (error) console.log(error)
})

fastify.get('/', async (request, reply) => {

  // Produces a statistic message for each request
  const tunnel = await fastify.channels.use('statistic')
  const message = {
    agent: request.headers['user-agent'],
    ip: request.ip
  }
  fastify.channels.produce(tunnel, JSON.stringify(message))

  reply.type('text/html').send('Hello World')
})

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) console.log(error)
  console.log('Listen on : ', address)
})
