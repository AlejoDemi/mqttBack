import { PrismaClient } from '@prisma/client'
import express from 'express'
// import {mqtt} from 'mqtt'
// var mqtt = require('mqtt')
import * as mqtt from "mqtt" 

const prisma = new PrismaClient()
const app = express()

app.use(express.json())


app.get('/table', async (req, res) => {
    const table = await prisma.table.findMany()
    res.json(table)
  })

app.get('/latest', async (req, res) => {
    const table = await prisma.table.findMany({
        take:1,
        orderBy:[
            {
                id:"desc"
            }
        ]
    })
    res.json(table)
  })

app.listen(3000, () =>
  console.log('REST API server ready at: http://localhost:3000'),
)


// mqtt------------------------------------------------------


// require('dotenv').config()

var options = {
    host: process.env.HOST,
    port: process.env.PORT,
    protocol: process.env.PROTOCOL,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

var lastMessage = "";

client.on('message', async function (topic, message) {
    // called each time a message is received
    lastMessage = message.toString();
    console.log('Received message:', topic, message.toString());
    try {
        let data = JSON.parse(lastMessage);
        console.log(data)
        const result = await prisma.table.create({
            data: {
                    "temperature": data.temperaturaCelsius,
                    "humidity": data.humedad,
                  },
          })

          if(+data.humedad > 90){
            client.publish('environment-data-micro', 'something')
          }

    } catch (e) {
        console.log(e.message)
    }
    //publish message to microcontroller
    
});

// subscribe to topic 'my/test/topic'
client.subscribe('environment-data-server');

// publish message 'Hello' to topic 'my/test/topic'
// client.publish('environment-data', 'Hello');
  
  app.listen(4000, () => {
    console.log(`App listening on port ${4000}`)
  })
