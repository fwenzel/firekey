(function() {
  /* Data */
  var accounts;
  var refreshInterval;

  /* Shortcuts */
  var $ = document.querySelector.bind(document);
  var deck = $('x-deck');


  /** Beefy TOTP magic. */
  /* Convert base32 key string to HEX. */
  function prepKey(key) {
    var decoded = base32.decode(key);

    // Turn every binary character into HEX encoding (zero-padded).
    var hexed = Array.prototype.map.call(decoded, function(x) {
      return ('0' + x.charCodeAt(0).toString(16)).slice(-2)
    });

    return hexed.join('');
  }

  /* Given binary string `key` and timeslot, create an OTP. */
  function createOTP(key, timeslot) {
    var timestampHex = timeslot.toString(16);
    while (timestampHex.length < 16) {  // Pad to 16-digit hex number.
      timestampHex = '0' + timestampHex;
    }

    var shaObj = new jsSHA(timestampHex, 'HEX');
    var hmac = shaObj.getHMAC(key, 'HEX', 'SHA-1', 'HEX');

    // Dynamic truncation
    var chopIdx = parseInt(hmac[39], 16) * 2;  // Byte index to trucate at.
    var chopped = hmac.substr(chopIdx, 8);

    // Mask most significant bit.
    var hotp = parseInt(chopped, 16) & 0x7fffffff;

    return hotp.toString().slice(-6);  // Cut off last 6 digits, that's our code.
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
    // Let's do this again sometime.
    if (accounts && !refreshInterval) {
      refreshInterval = window.setInterval(refreshAccounts, 1000);
    }

    var now = Date.now() / 1000 | 0;
    var timeslot = now / 30 | 0;
    var inSlot = now % 30 | 0;

    $('#main meter').value = inSlot;

    // Don't update tokens unless timeslot changed.
    var curTimeslot = $('#accounts').getAttribute('data-timeslot');
    if (curTimeslot === timeslot) {
      return;
    } else {
      $('#accounts').setAttribute('data-timeslot', timeslot);
    }

    for (var i=0; i<accounts.length; i++) {
      var acc = accounts[i];
      if (!acc.li) {
        acc.li = document.createElement('li');
        $('#accounts').appendChild(acc.li);
      }
      acc.li.textContent = acc['name'] + ': ' + createOTP(acc['key'], timeslot);
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

    key = prepKey(key);
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
