(function() {
  /* Data */
  var accounts;

  /* Shortcuts */
  var $ = document.querySelector.bind(document);
  var deck = $('x-deck');


  /** Beefy TOTP magic. */
  /* Convert binary key string to HEX. */
  function prepKey(key) {
    var hexed = Array.prototype.map.call(
      key, function(x) { return x.charCodeAt(0).toString(16); })
    hexed = hexed.join('');
    if (hexed.length % 2) {  // Byte-wise padding for HMAC
      hexed = '0' + hexed;
    }
    return hexed;
  }

  /* Given binary string `key`, create an OTP for the current time. */
  function createOTP(key) {
    var timestampHex = (Date.now()/30000 | 0).toString(16);
    if (timestampHex.length % 2) {  // Byte-wise padding for HMAC
      timestampHex = '0' + timestampHex;
    }

    //XXX
    timestampHex = '0' + (1111111109 / 30 | 0).toString(16);
    key = '3132333435363738393031323334353637383930';

    var shaObj = new jsSHA(timestampHex, 'HEX');
    var hmac = shaObj.getHMAC(key, 'HEX', 'SHA-1', 'HEX');
    console.log(hmac);

    var timecode = 1111111109 / 30 | 0;
    var timebin = '';
    while (timecode) {
      var c = String.fromCharCode(timecode & 0xff); console.log(c);
      timebin = c + timebin;
      timecode >>= 1;
    }
    console.log(timebin);

    key = '12345678901234567890';
    hmac = CryptoJS.HmacSHA1(timebin, key).toString();
    console.log(hmac.toString());

    // Dynamic truncation
    var chopIdx = parseInt(hmac[39], 16) * 2;  // Byte index to trucate at.
    var chopped = hmac.substr(chopIdx, 8);
    // Mask most significant bit.
    var hotp = parseInt(chopped, 16) & 0x7fffffff;

    return hotp.toString().slice(-8);
  }


  /* Adjust title text as needed. */
  deck.addEventListener('show', function(e) {
    var card = e.target;
    var title = $('h1');
    if (card.hasAttribute('data-title')) {
      title.textContent = card.getAttribute('data-title');
    } else {
      title.textContent = 'FireKey';
    }
  });


  /* Main screen */
  function refreshAccounts() {
    for (var i=0; i<accounts.length; i++) {
      var acc = accounts[i];
      var p = document.createElement('p');
      p.textContent = acc['name'] + ': ' + createOTP(acc['key']);
      $('#main').appendChild(p);
    }
  }

  $('#main').addEventListener('show', function() {
    refreshAccounts();
  });


  /* Welcome screen */
  $('#welcome button').addEventListener('click', function() {
    deck.selectedCard = $('#add');
    $('#add input').focus();
  });


  /* Add screen */
  $('#add .cancel').addEventListener('click', function() {
    deck.selectedCard = $('#main');
  });
  $('#add .add').addEventListener('click', function() {
    var name = $('#addname').value;
    var key = $('#addkey').value;
    if (!name || !key) {
      alert('Please enter both name and shared secret!');
      return;
    }

    key = prepKey(base32.decode(key));
    if (!key) {
      alert('Invalid key. Did you misspell it?');
      return;
    }

    accounts.push({name: name, key: key});
    localforage.setItem('accounts', accounts).then(function() {
      deck.selectedCard = $('#main');
    });
  });


  // Party time
  document.addEventListener('DOMComponentsLoaded', function() {
    localforage.getItem('accounts').then(function(data) {
      accounts = data;

      if (accounts) {
        deck.selectedCard = $('#main');
      } else {
        accounts = [];
        deck.selectedCard = $('#welcome');
      }
    })
  });

})();
