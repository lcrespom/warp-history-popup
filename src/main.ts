import robot from 'robotjs'
import { Hotkey, registerHotkey } from './hotkey'
import { showHistoryMenu } from './history'
import { windowManager } from 'node-window-manager'

const TYPE_INITIAL_WAIT = 100

function makeWarpHotkey(keyName: string, command: string): Hotkey {
    return {
        key: keyName,
        modifiers: ['LEFT CTRL'],
        triggerOnKeyUp: true,
        callback: () => {
            let winTitle = windowManager.getActiveWindow().getTitle()
            if (winTitle != 'Warp') return
            setTimeout(() => {
                console.log({ command })
                robot.typeString(command)
                robot.keyTap('enter')
            }, TYPE_INITIAL_WAIT)
        }
    }
}

function registerHotkeys(command: string) {
    registerHotkey(makeWarpHotkey('PAGE UP', 'ToDo history'))
    registerHotkey(makeWarpHotkey('PAGE DOWN', 'ToDo dirHistory'))
}

async function main() {
    robot.setKeyboardDelay(10)
    switch (process.argv[process.argv.length - 1]) {
        case 'history':
            showHistoryMenu()
            break
        case 'dirHistory':
            console.log('ToDo: dir history')
            break
        default:
            registerHotkeys(process.argv.join(' '))
    }
}

main()
