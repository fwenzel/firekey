import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  },
  afterRenderEvent: function() {
    // Set default form state upon load.
    $('input[autofocus]').focus();
    $('input[value=b32]').attr('checked', true);
  }
});
