## ToDo

-   [ ] Support a domain socket to accept external robot typing requests
-   [ ] Split the daemon and the history popup into two independent scripts
-   [ ] Read hotkeys and associated scripts from a config.json file
-   [ ] Usage documentation

## Using domain sockets (Unix-like systems)

### Server

```javascript
const net = require('net')
const fs = require('fs')
const socketPath = '/tmp/node-server-socket'

// Remove the socket if it already exists.
fs.unlink(socketPath, err => {
    const server = net.createServer(connection => {
        console.log('Client connected.')

        connection.on('end', () => {
            console.log('Client disconnected.')
        })

        connection.on('data', data => {
            console.log('Message from client:', data.toString())
        })

        connection.write('Hello from server!')
    })

    server.listen(socketPath, () => {
        console.log('Server listening on', socketPath)
    })
})
```

> Notice: server should remove (unlink) the socket when finished

### Client

```javascript
const net = require('net')
const socketPath = '/tmp/node-server-socket'

const client = net.connect({ path: socketPath }, () => {
    console.log('Connected to server!')
    client.write('Hello from client!')
})

client.on('data', data => {
    console.log('Message from server:', data.toString())
    client.end() // close the connection
})

client.on('end', () => {
    console.log('Disconnected from server')
})
```
