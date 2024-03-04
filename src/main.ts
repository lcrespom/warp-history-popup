import { registerHotkey } from './hotkey'
import { showHistoryMenu } from './history'

function registerHotKeys() {
    registerHotkey({
        key: 'PAGE UP',
        modifiers: ['LEFT CTRL'],
        callback: () => console.log('ctrl page up')
    })
    registerHotkey({
        key: 'PAGE DOWN',
        modifiers: ['LEFT CTRL'],
        callback: () => console.log('ctrl page down')
    })
}

async function main() {
    if (process.argv[process.argv.length - 1] == 'history') {
        showHistoryMenu()
    } else {
        registerHotKeys()
    }
}

main()
