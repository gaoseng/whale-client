'use strict';

var default_1 = function () {
  function default_1() {}

  default_1.prototype.onMessage = function (s) {
    console.log("onMessage", s);
  };

  default_1.prototype.sendMessage = function () {};

  return default_1;
}();

function index () {
  var client = new default_1();
  console.log(client.onMessage("test"));
  console.log("sdf");
}

module.exports = index;
