import Ember from "ember";
import config from "./config/environment";

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("welcome");
  this.route("add");
  this.resource("keys", function() {});

  this.resource("key", {
    path: "key/:key_id"
  }, function() {
    this.route("edit");
  });
});

export default Router;