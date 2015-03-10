import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    deleteKey: function() {
      var key = this.get('model');
      key.deleteRecord();
      key.save();

      this.transitionToRoute('index');
    },
    renameKey: function(newName) {
      var key = this.get('model');
      key.set('name', newName);
      key.save();
    }
  }
});
