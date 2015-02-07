import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    var route = this;

    this.store.find('key').then(function(keys) {
    	if (keys.content.length) {
	    	// Main page since there are keys to show.
	    	route.transitionTo('keys');
	    } else {
	    	// nothing to show.
	    	route.transitionTo('welcome');
	    }
    });
  }
});
