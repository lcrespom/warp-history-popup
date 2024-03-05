import robot from 'robotjs'
import { Hotkey, registerHotkey } from './hotkey'
import { showHistoryMenu } from './history'
import { windowManager } from 'node-window-manager'

const TYPE_INITIAL_WAIT = 100

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

async function main() {
    switch (process.argv[process.argv.length - 1]) {
        case 'history':
            showHistoryMenu()
            break
        case 'dirHistory':
            console.log('ToDo: dir history')
            process.exit(1)
            break
        default:
            robot.setKeyboardDelay(10)
            registerHotkeys('./node_modules/.bin/esno src/main.ts')
    }
}

main()
