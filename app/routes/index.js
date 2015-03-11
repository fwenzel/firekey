import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    var route = this;

    this.store.find('key').then(function(keys) {
      if (keys.content.length) {
        // Main page since there are keys to show.
        route.transitionTo('keys');
      } else {
        /**
         * Firekey upgrade code from version 1.0.
         * If we find old keys in IndexedDB, let's fetch them and upgrade.
         */
        window.localforage.getItem('accounts').then(function(accounts) {
          if (accounts) {
            // Create models for each known key.
            for (var i=0; i<accounts.length; i++) {
              var newKey = route.store.createRecord('key');
              newKey.set('name', accounts[i]['name']);
              newKey.set('key', accounts[i]['key']);
              newKey.save();
            }

            // Remove the old data.
            window.localforage.removeItem('accounts');

            // Now we *do* have something to show.
            route.transitionTo('keys');
          } else {
            // nothing to show.
            route.transitionTo('welcome');
          }
        });
      }
    });
  }
});
