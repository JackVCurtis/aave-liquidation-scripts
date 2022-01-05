const axios = require('axios')
const fs = require('fs')
const path = require('path')

module.exports = async function loadDeposits() {
    const FIRST_BLOCK = 11362579
    const LAST_BLOCK = 13894562
    const BLOCK_INCREMEMENT = 5000
    let block = FIRST_BLOCK 

    while (block < LAST_BLOCK) {
        const nextBlock = block + BLOCK_INCREMEMENT
        const url = 'https://api.etherscan.io/api'
        const params = {
            module: 'logs',
            action:'getLogs',
            fromBlock: block.toString(),
            toBlock: nextBlock.toString(),
            address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
            topic0: '0xde6857219544bb5b7746f48ed30be6386fefc61b2f864cacf559893bf50fd951',
            apikey: process.env.ETHERSCAN_API_KEY || ''
        }
        try {
            const res = await axios.get(url + '?' + new URLSearchParams(params).toString())
            console.log('Received Transactions: ', JSON.parse(res.data.result.length))
            fs.writeFileSync(path.join(__dirname, '..', '..', 'data', `${block}-${nextBlock}.json`), JSON.stringify(res.data.result, null, 4))
            block = nextBlock
        } catch (e) {
            console.log(e)
            break
        }
    }
}