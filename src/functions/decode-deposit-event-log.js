module.exports = async function decodeDepositEventLog(web3, log) {
    const DEPOSIT_INPUTS = {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "reserve",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "onBehalfOf",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint16",
            "name": "referral",
            "type": "uint16"
          }
        ],
        "name": "Deposit",
        "type": "event"
      }
    return web3.eth.abi.decodeLog(DEPOSIT_INPUTS.inputs, log.data, log.topics.slice(1))
}