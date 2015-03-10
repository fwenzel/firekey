import Ember from 'ember';

export default Ember.Controller.extend(Ember.Evented, {
  // Non-model fields:
  keytype: null,

  /* Convert base32 key string to HEX. */
  b32ToHex: function(key) {
    var decoded = base32.decode(key);

    // Turn every binary character into HEX encoding (zero-padded).
    var hexed = Array.prototype.map.call(decoded, function(x) {
      return ('0' + x.charCodeAt(0).toString(16)).slice(-2);
    });

    return hexed.join('');
  },

  actions: {
    /* Save a new key */
    add: function() {
      if (!this.model.get('name') || !this.model.get('key')) {
        this.trigger('formError', 'Please enter both name and shared secret!');
        return;
      }

      if (this.keytype === 'b32') {
        try {
          this.model.set('key', this.b32ToHex(this.model.get('key')));
        } catch (e) {
          this.trigger('formError', e.message);
          return;
        }
        this.set('keytype', 'hex');
      } else {
        if (!(/^[0-9a-f]+$/i).test(this.model.get('key'))) {
          this.trigger('formError', 'Invalid hex number!');
          return;
        }
      }

      // TODO Error handling would be good, I suppose.
      var ctrl = this;
      this.model.save().then(function() {
        ctrl.transitionToRoute('keys');
      });
    },

    /* Cancel and go back to front page */
    cancel: function() {
      this.transitionToRoute('index');
    }
  }
});
