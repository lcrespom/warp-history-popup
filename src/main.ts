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

function menuDone(selection) {
    process.stdout.clearScreenDown()
    console.log('Selection: ' + selection + ' - ' + items[selection])
    showCursor()
    process.exit(0)
}

let items = []

function initItems(rows) {
    let result = []
    for (let row = 1; row <= rows; row++) result.push(`Item ${row}`)
    return result
}

function main() {
    items = initItems(100)
    hideCursor()
    let menu = tableMenu({
        items,
        height: 20,
        columns: 1,
        columnWidth: 40,
        scrollBarCol: 41,
        done: menuDone,
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
