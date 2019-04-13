const RippleAPI = require('ripple-lib').RippleAPI;
const api       = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' });
const request   = require('request');

console.log('Creating new account.');

request.post('https://faucet.altnet.rippletest.net/accounts', function(error, response, body) {
  if (error) {
    console.error(error);
    process.exit(-1);
  }

  const dest         = { address: process.argv[2] };
  const src          = JSON.parse(body).account;
  const amount       = process.argv[3];
  const instructions = { maxLedgerVersionOffset: 5 };

  const payment = {
    source: {
      address: src.address,
      maxAmount: { value: amount, currency: 'XRP' }
    },
    destination: {
      address: dest.address,
      amount: { value: amount, currency: 'XRP' }
    }
  };

  if (process.argv[4]) { payment.destination.tag = +process.argv[4]; }

  console.log('Sending ' + amount + ' XRP from ' + src.address + ' to ' + dest.address + (process.argv[4] ? '?dt=' + process.argv[4] : '') +  '.');

  setTimeout(function() {
    function quit(data) {
      console.log('Transaction sent (TXID: ' + data.tx_json.hash + ').');
      process.exit(0);
    }

    function fail(data) {
      console.error(data);
      process.exit(-1);
    }

    api.connect().then(() => {
      return api.preparePayment(src.address, payment, instructions).then(prepared => {
        console.log('Transaction prepared.');
        const { signedTransaction } = api.sign(prepared.txJSON, src.secret)
        console.log('Transaction signed.');
        api.submit(signedTransaction).then(quit, fail)
      })
    }).catch(fail)
  }, 3000);
});
