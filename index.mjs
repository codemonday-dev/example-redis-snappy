import dotenv from 'dotenv'
import redis from 'redis'
import { compressSync, uncompressSync } from 'snappy'
dotenv.config()
const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_KEY,
})
await client.connect()

// Simulate data for test
// by querying big key in the existing Redis
const testKey = "filterable-data-synapse-ONETRUST_PURPOSE[]-limit-10000"
const jsonData = JSON.parse(await client.get(testKey))

// Start here
const data = JSON.stringify(jsonData)
console.log('==== Print sample data')
console.log(jsonData.slice(0, 2))
const compressed = compressSync(data)

// Make comparison
console.log('==== Length Before', Buffer.from(data).length)
console.log('==== Length After', compressed.length)

// This is done at the Redis level
await client.set('compressed', compressed.toString('base64'))

// Checking Step
// here is the step to check back the data
const compressedBack = await client.get('compressed')
const compressedBackBuffer = Buffer.from(compressedBack, 'base64')
const dataBack = uncompressSync(compressedBackBuffer)
const jsonDataBack = JSON.parse(dataBack)

console.log('==== Data back must be the same')
console.log(jsonDataBack.slice(0, 2))
await client.disconnect()
console.log('==== Done')
