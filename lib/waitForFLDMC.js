"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
// We have a loop that checks to see if everything has been setup...
var bootInterval; // We offer a timeout just incase...

var timeout;
/**
 * A little helper function which returns when the FoyerLive API has been installed.
 *
 * Resolves to the FoyerLive Device options.
 *
 * @returns {Promise}
 */

var waitForFLDMC = function waitForFLDMC() {
  return new Promise(function (resolve, reject) {
    // Error handler... (30 seconds)
    timeout = setTimeout(function () {
      clearTimeout(timeout);
      clearInterval(bootInterval);
      return reject('Never got there...');
    }, 30000); // Boot checker... (Runs every 100ms)

    bootInterval = setInterval(function () {
      if (window.hasOwnProperty('FoyerLiveDataManagerClientReady') && window.FoyerLiveDataManagerClientReady === true) {
        clearTimeout(timeout);
        clearInterval(bootInterval);
        return resolve(window.foyerDeviceOptions);
      }
    }, 100);
  });
};

var _default = waitForFLDMC;
exports["default"] = _default;