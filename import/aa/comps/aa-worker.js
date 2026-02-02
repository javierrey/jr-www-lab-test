// /import/aa/comps/aa-worker.js
// require none
/**
 * Generic reusable worker script.
 * Accepts javascript code messages to be evaluated.
 * Managed by function aa.app.loadWorker in main thread.
 */
(function () { "use strict";
  if (typeof WorkerGlobalScope == 'undefined') {return;}

  /**
   * Worker message listener and responder.
   * Processes incoming messages as JS code.
   */
  self.onmessage = function (ev) {
    var msg = ev.data; if (msg == null || msg == "" || msg == "?") {msg = "?result";} else {msg = ""+msg;}
    if (msg.charAt(0) == "?") {
      msg = self[msg.substring(1)];
      if (typeof msg == 'object' && msg != null) {msg = JSON.stringify(msg);}
      self.postMessage(""+msg);
    } else {eval(""+msg);}
  };

})();