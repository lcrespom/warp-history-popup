import { exec } from 'child_process'
import keypress from 'keypress'
import chalk from 'chalk'

import { hideCursor, showCursor, tableMenu } from 'node-terminal-menu'

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
    console.log('Selection: ' + selection + ' - ' + items[selection])
    showCursor()
    process.exit(0)
}

function parseHistory(stdout) {
    return stdout.split('\n').filter(l => l.trim().length > 0)
}

async function initItems(): Promise<string[]> {
    let items = []
    return new Promise((resolve, reject) => {
        exec(
            'tail -50 ~/.zsh_history',
            { shell: '/bin/zsh' },
            (err, stdout) => {
                if (err) reject(err)
                else resolve(parseHistory(stdout))
            }
        )
    })
}

async function main() {
    let items = await initItems()
    hideCursor()
    let menu = tableMenu({
        items,
        height: 20,
        columns: 1,
        columnWidth: 40,
        scrollBarCol: 41,
        done: sel => menuDone(sel, items),
        colors: {
            item: chalk.bgBlue,
            scrollArea: chalk.bgBlue,
            scrollBar: chalk.yellowBright.bgBlue,
            desc: chalk.white.bgMagenta
        }
    })
    listenKeyboard((ch, key) => {
        if (ch == 'u') {
            // Convert items to uppercase
            items = items.map(i => i.toUpperCase())
            menu.update({ items })
        } else if (ch == 'd') {
            // Delete selected item
            items.splice(menu.selection, 1)
            menu.update({ items })
        } else menu.keyHandler(ch, key)
    })
}

main()
