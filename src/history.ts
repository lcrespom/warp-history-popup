import { exec } from 'node:child_process'
import net from 'node:net'

import chalk from 'chalk'
import keypress from 'keypress'
import { hideCursor, showCursor, tableMenu } from 'node-terminal-menu'

const LIST_HEIGHT = 40
const LIST_WIDTH = 80
const SOCKET_PATH = '/tmp/history-server-socket'

function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

async function sendMessageToDaemon(text: string) {
    let json = JSON.stringify({ command: 'type', text })
    return new Promise<void>(resolve => {
        const client = net.connect({ path: SOCKET_PATH }, () => {
            client.write(json)
            client.end()
            resolve()
        })
    })
}

async function menuDone(selection, items) {
    process.stdout.clearScreenDown()
    showCursor()
    if (selection >= 0) await sendMessageToDaemon(items[selection])
    process.exit(0)
}

function removeStrangePrefixes(line: string) {
    if (!line.startsWith(':')) return line
    return line.split(';')[1] || ''
}

function removeDuplicatesFromStart(arr: string[]) {
    return [...new Set(arr.reverse())].reverse()
}

function parseHistory(stdout: string) {
    return removeDuplicatesFromStart(
        stdout
            .split('\n') // Split lines
            .map(removeStrangePrefixes) // Command starts after ";"
            .filter(l => l.trim().length > 0) // Discard empty lines
    )
}

async function initItems(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        exec('tail -500 ~/.zsh_history', (err, stdout) => {
            if (err) reject(err)
            else resolve(parseHistory(stdout))
        })
    })
}

function cursorUp(n: number) {
    process.stdout.write(`\x1B[${n}A`)
}

function writeLine(line: string) {
    process.stdout.write('\x1B[0G\x1B[K' + line)
}

async function showHistoryMenu() {
    let line = ''
    process.stdout.write('\n\n')
    let items = await initItems()
    //hideCursor()
    let menu = tableMenu({
        items,
        height: LIST_HEIGHT,
        columns: 1,
        columnWidth: LIST_WIDTH,
        scrollBarCol: LIST_WIDTH + 1,
        selection: items.length - 1,
        done: sel => menuDone(sel, items),
        colors: {
            item: chalk.bgBlue,
            scrollArea: chalk.bgBlue,
            scrollBar: chalk.yellowBright.bgBlue,
            desc: chalk.white.bgMagenta
        }
    })
    cursorUp(2)
    listenKeyboard((ch, key) => {
        if (ch && ch >= ' ') {
            if (key.name == 'backspace') line = line.slice(0, -1)
            else line += ch
            writeLine(line)
        } else {
            process.stdout.write('\n\n')
            menu.keyHandler(ch, key)
            cursorUp(2)
            writeLine(line)
        }
    })
}

showHistoryMenu()
