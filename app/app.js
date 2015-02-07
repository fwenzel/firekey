import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  ApplicationController: Ember.Controller.extend({
    updateCurrentPath: function() {
      this.set('routeName', this.get('currentRouteName').replace(/\./g, '-'));
    }.observes('currentRouteName')
  }),

  routeName: ''  // Export current route to template, with dashes.
});

loadInitializers(App, config.modulePrefix);

export default App;
