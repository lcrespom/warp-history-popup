import { exec } from 'child_process'
import keypress from 'keypress'
import chalk from 'chalk'
import { hideCursor, showCursor, tableMenu } from 'node-terminal-menu'

const LIST_HEIGHT = 40
const LIST_WIDTH = 80

function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

function menuDone(selection, items) {
    process.stdout.clearScreenDown()
    showCursor()
    console.log('Selection: ' + selection + ' - ' + items[selection])
    process.exit(0)
}

function removeStrangePrefixes(line) {
    if (!line.startsWith(':')) return line
    return line.split(';')[1] || ''
}

function parseHistory(stdout) {
    return stdout
        .split('\n') // Slit lines
        .map(removeStrangePrefixes) // Command starts after ";"
        .filter(l => l.trim().length > 0) // Discard empty lines
}

async function initItems(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        exec('tail -200 ~/.zsh_history', (err, stdout) => {
            if (err) reject(err)
            else resolve(parseHistory(stdout))
        })
    })
}

export async function showHistoryMenu() {
    console.log()
    let items = await initItems()
    hideCursor()
    let menu = tableMenu({
        items,
        height: LIST_HEIGHT,
        columns: 1,
        columnWidth: LIST_WIDTH,
        scrollBarCol: LIST_WIDTH + 1,
        done: sel => menuDone(sel, items),
        colors: {
            item: chalk.bgBlue,
            scrollArea: chalk.bgBlue,
            scrollBar: chalk.yellowBright.bgBlue,
            desc: chalk.white.bgMagenta
        }
    })
    listenKeyboard((ch, key) => {
        if (ch == 'd') {
            // Example: delete selected item
            items.splice(menu.selection, 1)
            menu.update({ items })
        } else menu.keyHandler(ch, key)
    })
}
