import Ember from 'ember';

export default Ember.Controller.extend(Ember.Evented, {
  slotsize: 30,  // TOTP operates on 30-second time windows.
  timeslot: null,  // Current time window.
  inTimeslot: null,  // Position inside current timeslot.

  nextUpdate: null,  // Timer for next timeslot update.


  updateTimeslot: function() {
    var now = Date.now() / 1000 | 0;
    this.set('timeslot', now / this.slotsize | 0);
    this.set('inTimeslot', now % this.slotsize | 0);

    // Do this every second from now on.
    this.set('nextUpdate', Ember.run.later(this, this.updateTimeslot, 1000));
  }.observes('model'),  // Trigger when model data arrives.

  /**
   * Keep update loop from running.
   * To reschedule, trigger updateTimeslot again.
   */
  stopUpdating: function() {
    if (!this.nextUpdate) {
      return;
    }

    Ember.run.cancel(this.nextUpdate);
    this.set('nextUpdate', null);
  },

  /** Calculate updated OTP tokens for all our keys. */
  updateTokens: function() {
    // Without data, we're out of luck.
    // (Can happen when forcing an update without data.)
    if (!this.get('model')) {
      return;
    }

    var ctrl = this;
    this.model.forEach(function(key) {
      key.set('token', ctrl.createOTP(key));
    });
  }.observes('timeslot')  // Run on every time slot change.
   .on('refreshKeys'),  // Can be triggered by refreshKeys event.

  /** Given a key (model), calculate its current OTP token. */
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
