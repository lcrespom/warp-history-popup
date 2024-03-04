import robot from 'robotjs'
import { registerHotkey } from './hotkey'
import { showHistoryMenu } from './history'

function registerHotKeys(command: string) {
    registerHotkey({
        key: 'PAGE UP',
        modifiers: ['LEFT CTRL'],
        callback: () => robot.typeString('ToDo history')
    })
    registerHotkey({
        key: 'PAGE DOWN',
        modifiers: ['LEFT CTRL'],
        callback: () => robot.typeString('ToDo dirHistory')
    })
}

async function main() {
    switch (process.argv[process.argv.length - 1]) {
        case 'history':
            showHistoryMenu()
            break
        case 'dirHistory':
            console.log('ToDo: dir history')
            break
        default:
            registerHotKeys(process.argv.join(' '))
    }
}

main()
