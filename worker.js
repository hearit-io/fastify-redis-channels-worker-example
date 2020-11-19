'use strict'

const {RedisChannels} = require('@hearit-io/redis-channels')

// The channels instance
const channles = new RedisChannels({
  channels: {
    application: 'worker',
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
})

// Handle Control-D, Control-C
async function handle(signal) {
  const channels = this
  await channels.cleanup()
}
process.on('SIGINT', handle.bind(channles))
process.on('SIGTERM', handle.bind(channles))
process.on('SIGHUP', handle.bind(channles))

// A consumer function
async function consume(tunnel, channels) {
  for await (const messages of channels.consume(tunnel)) {
    for (const i in messages) {
      // Process a message
      const data = JSON.parse(messages[i].data)
      console.log(data)
    }
  }
}

// The main loop
async function main () {
  try {

    // Creates tunnels to 'statistic' 
    const tunnelConsumerOne = await channles.use('statistic')
    const tunnelConsumerTwo = await channles.use('statistic')

    // Subscribe consumers in team
    await channles.subscribe(tunnelConsumerOne, 'team')
    await channles.subscribe(tunnelConsumerTwo, 'team')

    // Start all consumers
    consume(tunnelConsumerOne, channles).catch(() => { })
    consume(tunnelConsumerTwo, channles).catch(() => { })

  }
  catch (error) {
    console.log(error)
  }
}
main()
