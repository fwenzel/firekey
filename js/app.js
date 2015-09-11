(function() {
  /* Data */
  var accounts;
  var lis = [];  // list items for accounts.
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
      title.textContent = 'Firekey';
    }
    // XXX this will plaster over other classes if present.
    $('#main-header').className = 'card-' + card.id;

    deck.focus();
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
    var curTimeslot = parseInt($('#accounts').getAttribute('data-timeslot'));
    if (curTimeslot === timeslot) {
      return;
    } else {
      $('#accounts').setAttribute('data-timeslot', timeslot);
    }

    for (var i=0; i<accounts.length; i++) {
      var acc = accounts[i];
      var li;
      if (lis[i]) {
        li = lis[i];
      } else {
        li = document.createElement('li');
        lis.push(li);
        $('#accounts').appendChild(li);

        var span = document.createElement('span');
        span.setAttribute('class', 'num');
        li.appendChild(span);

        var span = document.createElement('span');
        span.setAttribute('class', 'name');
        li.appendChild(span);
      }

      // Show account name and latest code.
      li.querySelector('.name').textContent = acc['name'];
      li.querySelector('.num').textContent = createOTP(acc['key'], timeslot);
    }
  }

  function stopUpdating() {
    window.clearInterval(refreshInterval);
    refreshInterval = null;
  }

  // Long click for delete.
  $('#main .delete').addEventListener('click', function() {
    var delButton = this;
    var li = this.parentNode;
    var i = Array.prototype.indexOf.call(li.parentNode.childNodes, li);

    accounts.splice(i, 1);
    localforage.setItem('accounts', accounts).then(function() {
      lis.splice(i, 1);
      $('#main').appendChild(delButton);
      li.parentNode.removeChild(li);

      if (accounts.length === 0) {
        stopUpdating();
      } else {
        refreshAccounts();
      }
    })
  });

  var pressTimer;
  $('#accounts').addEventListener('pointerup', function() {
    window.clearTimeout(pressTimer);
    return false;
  });
  $('#accounts').addEventListener('pointerdown', function(e) {
    pressTimer = window.setTimeout(function() {
      var li;

      if (['li', 'span'].indexOf(e.target.tagName.toLowerCase()) === -1) {
        return;
      } else if (e.target.matches('li>span')) {
        li = e.target.parentNode;
      } else {
        li = e.target;
      }


      stopUpdating();

      var delButton = $('#main .delete');
      li.appendChild(delButton);

      // Catch delete button un-click in a second or so.
      window.setTimeout(function() {
        function reset() {
          $('#main').appendChild($('#main .delete'));
          document.body.removeEventListener('click', reset);
          refreshAccounts();
        }
        document.body.addEventListener('click', reset);
      }, 1500);

    }, 1000);
    return false;
  });

  // Main add button.
  $('#main-header .add').addEventListener('click', function() {
    stopUpdating();
    deck.selectedCard = $('#add');
  });

  $('#main').addEventListener('show', function() {
    refreshAccounts();
  });


  /* Welcome screen */
  $('#welcome button').addEventListener('click', function() {
    deck.selectedCard = $('#add');
    $('#add input').focus();
  });


  /* Add screen */
  function addAccount() {
    var name = $('#addname').value;
    var key = $('#addkey').value;
    if (!name || !key) {
      alert('Please enter both name and shared secret!');
      return;
    }

    if ($('#keytype input[value=b32]').checked) {  // Base32 key?
      key = prepKey(key);
    } else {
      // Enforce an actual hex number.
      if (!(/^[0-9a-f]+$/i).test(key)) {
        alert('Invalid hex number!');
        return;
      }
    }

    accounts.push({name: name, key: key});
    localforage.setItem('accounts', accounts).then(function() {
      $('#addname').value = '';
      $('#addkey').value = '';
      $('#accounts').removeAttribute('data-timeslot');  // Force refresh.
      deck.selectedCard = $('#main');
    });
  }

  $('#add').addEventListener('show', function() {
    $('#keytype input[value=b32]').checked = true;
    $('#addname').focus();
  })

  // Keyboard events.
  $('#addname').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      $('#addkey').focus();
    }
  });
  $('#addkey').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      addAccount();
    }
  });

  // Buttons
  $('#add .add').addEventListener('click', addAccount);
  $('#add .cancel').addEventListener('click', function() {
    if (accounts.length > 0) {
      deck.selectedCard = $('#main');
    } else {
      deck.selectedCard = $('#welcome');
    }
  });


  // Party time
  document.addEventListener('DOMComponentsLoaded', function() {
    localforage.getItem('accounts').then(function(data) {
      accounts = data;

      if (accounts && accounts.length > 0) {
        deck.selectedCard = $('#main');
        refreshAccounts();
      } else {
        accounts = [];
        deck.selectedCard = $('#welcome');
      }
    })
  });

})();
