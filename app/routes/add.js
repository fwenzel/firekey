import Ember from 'ember';

export default Ember.Route.extend({
	model: function() {
		return this.store.createRecord('key');
	},
	setupController: function(controller, model) {
		controller.set('model', model);
		controller.set('keytype', 'b32');  // Default to base 32 keys.
	}
});
