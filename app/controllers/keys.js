import Ember from 'ember';

export default Ember.Controller.extend({
  slotsize: 30,  // TOTP operates on 30-second time windows.
  timeslot: null,  // Current time window.
  inTimeslot: null,  // Position inside current timeslot.

  updateTimeslot: function() {
    var now = Date.now() / 1000 | 0;
    this.set('timeslot', now / this.slotsize | 0);
    this.set('inTimeslot', now % this.slotsize | 0);

    // Do this every second from now on.
    Ember.run.later(this, this.updateTimeslot, 1000);
  }.observes('model'),  // Trigger when model data arrives.

  /* Calculate updated OTP tokens for all our keys. */
  updateTokens: function() {
    var ctrl = this;
    this.model.forEach(function(key) {
      key.set('token', ctrl.createOTP(key));
    });
  }.observes('timeslot'),

  /* Given a key (model), calculate its current OTP token. */
  createOTP: function(model) {
    var timestampHex = this.timeslot.toString(16);
    while (timestampHex.length < 16) {  // Pad to 16-digit hex number.
      timestampHex = '0' + timestampHex;
    }

    /* jshint -W055 */  // Known lowercase constructor name.
    var shaObj = new jsSHA(timestampHex, 'HEX');
    /* jshint +W055 */
    var hmac = shaObj.getHMAC(model.get('key'), 'HEX', 'SHA-1', 'HEX');

    // Dynamic truncation
    var chopIdx = parseInt(hmac[39], 16) * 2;  // Byte index to trucate at.
    var chopped = hmac.substr(chopIdx, 8);

    // Mask most significant bit.
    var hotp = parseInt(chopped, 16) & 0x7fffffff;

    return hotp.toString().slice(-6);  // Cut off last 6 digits, that's our code.
  }

});
