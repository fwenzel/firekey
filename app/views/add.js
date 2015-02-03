import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  },
  afterRenderEvent: function() {
  	// Listen to errors from the controller.
  	this.get('controller').on('formError', this, this.showError);

    // Focus first input field.
    $('input[autofocus]').focus();
  },
  willClearRender: function() {
  	// Unsubscribe from listening to the controller.
  	this.get('controller').off('formError', this, this.showError);
  },

  // Flash an error alert if the controller finds a problem.
  showError: function(msg) {
  	window.alert(msg);
  }
});
