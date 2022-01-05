const fs = require('fs')
const path = require('path')
const decodeDepositEventLog = require('./decode-deposit-event-log');

module.exports = async function loadEvents(web3) {
    const LOG_DIRECTORY = path.join(__dirname, '..', '..', 'data', 'logs')
    const EVENT_DIRECTORY = path.join(__dirname, '..', '..', 'data', 'events')
    const files = fs.readdirSync(LOG_DIRECTORY)
    for (let file of files) {
        const logs = JSON.parse(fs.readFileSync(path.join(LOG_DIRECTORY, file)))
        const logsWithEvents = []
        for (let log of logs) {
            const event = await decodeDepositEventLog(web3, log)
            log.event = event
            logsWithEvents.push(log)
        }
        fs.writeFileSync(path.join(EVENT_DIRECTORY, file), JSON.stringify(logsWithEvents, null, 4))
        console.log('Processed log:', file)
    }
}