import net from 'node:net'
import fs from 'node:fs'
import robot from 'robotjs'
import { Hotkey, registerHotkey } from './lib/hotkey'
import { windowManager } from 'node-window-manager'

const TYPE_INITIAL_WAIT = 100
const SELF_COMMAND = ' ./node_modules/.bin/esno src/history.ts'
const SOCKET_PATH = '/tmp/history-server-socket'

function makeWarpHotkey(keyName: string, command: string): Hotkey {
    return {
        key: keyName,
        modifiers: ['LEFT CTRL', 'LEFT ALT'],
        triggerOnKeyUp: true,
        callback: () => {
            let winTitle = windowManager.getActiveWindow().getTitle()
            if (winTitle != 'Warp') return
            setTimeout(() => {
                // Ensure no keys are being pressed
                console.log({ command })
                robot.typeString(command)
                robot.keyTap('enter')
            }, TYPE_INITIAL_WAIT)
        }
    }
}

function registerHotkeys(command: string) {
    // registerHotkey(makeWarpHotkey('PAGE UP', command + ' history'))
    // registerHotkey(makeWarpHotkey('PAGE DOWN', command + ' dirHistory'))
    registerHotkey(makeWarpHotkey('UP ARROW', command + ' history'))
    registerHotkey(makeWarpHotkey('DOWN ARROW', command + ' dirHistory'))
}

function processSocketRequest(data: string) {
    console.log('Message from client: ', data)
}

function openServerSocket() {
    // Remove the socket if it already exists.
    fs.unlink(SOCKET_PATH, err => {
        const server = net.createServer(connection => {
            let buffer = ''
            connection.on('end', () => processSocketRequest(buffer))
            connection.on('data', data => (buffer += data))
        })
        server.listen(SOCKET_PATH, () => {
            console.log('Server listening on', SOCKET_PATH)
        })
    })
}

async function main() {
    robot.setKeyboardDelay(10)
    registerHotkeys(SELF_COMMAND)
    openServerSocket()
}

main()
