import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    // TODO: show main screen if there's anything to show.
    this.transitionTo('welcome');
  }
});
