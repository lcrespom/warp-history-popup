import { showHistoryMenu } from './history'

async function main() {
    if (process.argv[process.argv.length - 1] == 'history') {
        showHistoryMenu()
    } else {
        console.log('ToDo: implement kb listen')
    }
}

main()
