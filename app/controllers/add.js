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
    	if (!this.model.get('name')) {
    		this.trigger('formError', 'Your key needs a name!');
    		return;
    	} else if (!this.model.get('key')) {
    		this.trigger('formError', 'Cannot store an empty key!');
    		return;
    	}

    	if (this.keytype === 'b32') {
    		this.model.set('key', this.b32ToHex(this.model.get('key')));
    	}

    	// TODO Error handling would be good, I suppose.
    	this.model.save().then(function() {
    		this.transitionToRoute('main');
    	});
    },

    /* Cancel and go back to front page */
    cancel: function() {
    	this.transitionToRoute('index');
    }
  }
});
