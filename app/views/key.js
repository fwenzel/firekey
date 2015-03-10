import Ember from 'ember';

export default Ember.View.extend({
  actions: {
    confirmDeleteKey: function(key) {
      var keyName = key.get('name');
      if (window.confirm('Do you really want to delete the key "' + keyName + '"?')) {
        this.get('controller').send('deleteKey');
      }
    },

    editName: function(key) {
      var oldName = key.get('name');

      // Show edit dialog.
      var newName = window.prompt('Renaming ' + oldName, oldName);
      if (newName && oldName !== newName) {
        // If change confirmed, hand this to the controller.
        this.get('controller').send('renameKey', newName);
      }
    }
  }
});
