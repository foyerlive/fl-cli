// We have a loop that checks to see if everything has been setup...
let bootInterval;

// We offer a timeout just incase...
let timeout;

/**
 * A little helper function which returns when the FoyerLive API has been installed.
 *
 * Resolves to the FoyerLive Device options.
 *
 * @returns {Promise}
 */
const waitForFLDMC = () => {
  return new Promise((resolve, reject) => {

    // Error handler... (30 seconds)
    timeout = setTimeout(() => {
      clearTimeout(timeout);
      clearInterval(bootInterval);
      return reject('Never got there...')
    }, 30000);

    // Boot checker... (Runs every 100ms)
    bootInterval = setInterval(() => {
      if (window.hasOwnProperty('FoyerLiveDataManagerClientReady') && window.FoyerLiveDataManagerClientReady === true) {
        clearTimeout(timeout);
        clearInterval(bootInterval);
        return resolve(window.foyerDeviceOptions);
      }
    }, 100);

  });
};

export default waitForFLDMC;