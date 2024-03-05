import { GlobalKeyboardListener } from 'node-global-key-listener'
import { IGlobalKeyEvent, IGlobalKeyDownMap } from 'node-global-key-listener'

export type Modifier =
    | 'LEFT META'
    | 'RIGHT META'
    | 'LEFT CTRL'
    | 'RIGHT CTRL'
    | 'LEFT ALT'
    | 'RIGHT ALT'
    | 'LEFT SHIFT'
    | 'RIGHT SHIFT'
    | 'CAPS LOCK'
    | 'NUM LOCK'
    | 'SCROLL LOCK'
    | 'FN'

export type Hotkey = {
    key: string
    modifiers: Modifier[]
    callback?: () => void
    repeatOK?: boolean
    triggerOnKeyUp?: boolean
    alreadyPressed?: boolean // Used in runtime
}

type HotkeyCallback = () => void

let hotkeys: Hotkey[] = []
let pendingCallbacks: HotkeyCallback[] = []

function isHotkey(hotkey: Hotkey, key: IGlobalKeyEvent, down: IGlobalKeyDownMap) {
    if (key.name != hotkey.key) return false
    for (let modifier of hotkey.modifiers) {
        if (!down[modifier]) return false
    }
    if (key.state == 'UP') {
        if (hotkey.triggerOnKeyUp) {
            pendingCallbacks.push(hotkey.callback)
            return false
        }
        hotkey.alreadyPressed = false
        return false
    }
    if (hotkey.triggerOnKeyUp) return false
    if (!hotkey.repeatOK && hotkey.alreadyPressed) return false
    hotkey.alreadyPressed = true
    return true
}

function allKeysUp(key: IGlobalKeyEvent, down: IGlobalKeyDownMap): boolean {
    if (key.state != 'UP') return false
    let keys = Object.keys(down).filter(k => k != 'RETURN' && k != 'ESCAPE')
    for (let k of keys) if (down[k]) return false
    return true
}

function checkHotkeys(key: IGlobalKeyEvent, down: IGlobalKeyDownMap) {
    if (allKeysUp(key, down)) {
        for (let cb of pendingCallbacks) cb()
        pendingCallbacks = []
        return
    }
    for (let hotkey of hotkeys) {
        if (isHotkey(hotkey, key, down)) hotkey.callback()
    }
}

export function registerHotkey(hotkey: Hotkey) {
    if (!Array.isArray(hotkey.modifiers)) hotkey.modifiers = [hotkey.modifiers]
    hotkeys.push(hotkey)
}

export function traceAllKeyEvents() {
    globalListener.addListener(function (e, down) {
        console.log(`${e.name} ${e.state == 'DOWN' ? 'DOWN' : 'UP  '} [${e.rawKey._nameRaw}]`)
    })
}

let globalListener = new GlobalKeyboardListener()
globalListener.addListener(checkHotkeys)
