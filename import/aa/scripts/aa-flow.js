// /import/aa/scripts/aa-flow.js
// require aa-boot.js, aa-core.js
/**
 * JAZ flow script.
 */
(function () { "use strict";

  /**
   * JAZ Polyfills.
   */

  if (!('requestAnimationFrame' in self)) {
    self.requestAnimationFrame = function (callback) {return setTimeout(callback, 16);}; // DEF int 1000ms/60fps
    self.cancelAnimationFrame = function (requestid) {clearTimeout(requestid||0);};
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Application Module.
   */
  aa.app = aa.app||{};

  /**
   * Saves an object in the local storage, stringified and compressed with function aa.dat.zip.
   */
  aa.app.saveStorageObject = function (key, obj) {
    try {localStorage.setItem(key, aa.dat.zip(JSON.stringify(obj)));} catch (er) {}
  };

  /**
   * Returns an object from the local storage, decompressed with function aa.dat.unzip and parsed from a JSON string.
   */
  aa.app.loadStorageObject = function (key) {
    var obj = null; try {obj = JSON.parse(aa.dat.unzip(localStorage.getItem(key)));} catch (er) {}
    return obj;
  };

  /**
   * Registers loaded resources in aa.app.resources object.
   */
  aa.app.registerLoadedResources = function (parent) {
    var resources = [], elems = (parent||document).querySelectorAll("[src],link[href]");
    for (var i = 0; i < elems.length; i++) {
      if (elems[i] && elems[i].parentNode) {
        var url = elems[i].getAttribute('src')||elems[i].getAttribute('href');
        if (url) {resources.push({"url-register": url, tag: elems[i].tagName.toLowerCase()});}
      }
    }
    if (resources.length) {aa.app.loadResources(resources);}
  };

  /**
   * Loads in-line imported javascript sources in a DOM container (the document by default).
   * If optional @param fun is defined as a function, it will be invoked after the scripts are loaded.
   */
  aa.app.loadInlineJavascripts = function (parent, fun) {
    var scripts = (parent||document).querySelectorAll("script[src]"), loadedScripts = [];
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i] && scripts[i].parentNode) {
        var url = scripts[i].getAttribute('src');
        scripts[i].parentNode.removeChild(scripts[i]);
        loadedScripts.push(aa.app.loadJS(url, null));
      }
    }
    if (fun) {
      setTimeout(function ready() {
        if (self.loading) {return setTimeout(ready, aa.vars.ms.LISTEN);}
        fun(parent, loadedScripts);
      }, 1);
    }
  };

  /**
   * Runs in-line embedded javascripts in a DOM container (the document by default).
   * If global self.input is defined, the executed scripts may take it as an input object.
   * The scripts may also store a result in global self.output, which will be attached to each returned script element.
   * After being executed, the script elements are removed.
   */
  aa.app.runInlineJavascripts = function (parent) {
    var scripts = (parent||document).querySelectorAll("script:not([src]):not([type])"
      +",script:not([src])[type='text/javascript']"
      +",script:not([src])[type='application/javascript']"
      +",script:not([src])[type='text/jsx']"
      +",script:not([src])[type='module']"
    );
    self.output = undefined;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i] && scripts[i].parentNode) {
        try {var o = eval(scripts[i].innerHTML); scripts[i].output = (typeof o == "undefined") ? self.output : o;} catch (er) {}
        scripts[i].input = self.input; self.output = undefined;
        scripts[i].parentNode.removeChild(scripts[i]);
      }
    }
    return scripts;
  };

  /**
   * Removes embedded javascripts in a DOM container, the document by default.
   */
  aa.app.removeEmbeddedJavascripts = function (parent) {
    var scripts = (parent||document).querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i] && scripts[i].parentNode) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
    }
  };

  /**
   * Stores the application state.
   * The @param update, object, is merged into object app.save and then saved to the browser's local storage.
   */
  aa.app.store = function (update) {
    aa.app.save = aa.app.save||{};
    if (update) {aa.dat.merge(aa.app.save, update);}
    var saveName = aa.app.name+'-'+aa.app.user;
    aa.app.save.saveName = saveName; aa.app.save.saveTime = new Date().getTime();
    aa.app.saveStorageObject(saveName, aa.app.save);
  };

  /**
   * Open application handler.
   * Sets application properties after the main module is loaded and before the main instance is invoked.
   * Called from the immediately-invoked function "loaded".
   */
  aa.app.open = function () {
    aa.app.href = aa.app.href||location.href;
    aa.app.query = aa.app.parseUrlQuery(aa.app.href||("?"+location.search));
    aa.app.context = aa.app.sliceUrlCore(aa.app.href||location.pathname, 1);
    aa.app.name = aa.app.context.replace(/\//g, "")||"root";
    aa.app.user = aa.app.user||"default";
    var saveName = aa.app.name+'-'+aa.app.user;
    aa.app.save = aa.app.loadStorageObject(saveName)||{};
    aa.app.save.saveName = aa.app.save.saveName||saveName; aa.app.save.saveTime = aa.app.save.saveTime||0;
    aa.evt.close = aa.app.close; aa.evt.listen(); // console.log("app.open "+saveName, aa.app.save);
  };

  /**
   * Close application handler.
   * Assigned to property aa.evt.close in aa.app.open, in order to be called from aa.evt.onexit event listener when the
   * application is closed.
   */
  aa.app.close = function () {
    aa.app.store(); // (console._log||console.log)("app.close "+aa.app.save.saveName, aa.app.save);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Event Module.
   */
  aa.evt = aa.evt||{};

  aa.evt.on = aa.evt.on||{};

  /**
   * Adds an event listener, replacing it if it is already defined.
   * @param target: The target element to which add, remove or replace the event listener.
   * @param type: String. The type name of the event.
   * @param listener: Function. The event listener function.
   * @param options: Listen options. If not defined, its default value is false for the capture property.
   * @param addremove: Optional Number. If it is 0 or not defined, the listener is replaced (removed and then added),
   * if it is 1, the event is only added, if it is -1, the event is only removed.
   */
  aa.evt.setEventListener = function (target, type, listener, options, addremove) {
    if (!addremove || addremove < 0) {
      target.removeEventListener(type, listener, false);
      target.removeEventListener(type, listener, true);
    }
    if (!addremove || addremove > 0) {target.addEventListener(type, listener, options||false);}
  };

  /**
   * Sets a listener for the global error event.
   */
  aa.evt.setErrorListener = function (fun) {
    if (typeof fun != 'function') {return;}
    var pre = self.onerror;
    self.onerror = function (msg, url, row, col, err) {
      if (pre) {pre(msg, url, row, col, err);}
      fun(aa.evt.normalizeError(msg, url, row, col, err));
    };
  };

  ////////

  /**
   * Custom event.
   */
  aa.evt.oncustom = function (ev) {
    if (!aa.evt.enabled) {return;}
    ev = ev||{type: 'custom', target: window, timeStamp: performance.now()};
    var i, funs = aa.evt.on.custom||{};
    for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Error event.
   */
  aa.evt.onerror = function (err) {
    if (!aa.evt.enabled) {return;}
    var i, funs = aa.evt.on.error||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](err);}}
  };

  /**
   * Exit application event.
   */
  aa.evt.onexit = function (ev) {
    if (!aa.evt.enabled) {return;}
    var i, r, ret = undefined, funs = aa.evt.on.exit||{}; ev = ev||{type: 'beforeunload', timeStamp: performance.now()};
    aa.evt.onfocus('blur'); for (i in funs) {if (typeof funs[i] == 'function') {r = funs[i](ev); if (r != null) {ret = r;}}}
    aa.evt.enabled = false; if (typeof aa.evt.close == 'function') {aa.evt.close();}
    if (ret != null) {
      setTimeout(function () {aa.evt.enabled = true;}, aa.vars.ms.LISTEN); // Restore if exit is aborted.
      ev.returnValue = ret; // Close: ret undefined, Confirm: ret ""...
    }
  };

  /**
   * Window blur and focus events. Invoked from aa.evt.onfocus and aa.evt.onexit to handle both blur and focus events.
   */
  aa.evt.onfocus = function (ev) {
    if (!aa.evt.enabled) {return;}
    ev = ev||'focus'; if (ev.constructor == String) {ev = {type: ev, target: window, timeStamp: performance.now()};}
    if (ev.type == 'blur') {aa.evt.blur = ev.target; aa.evt.focus = (ev.target == window) ? null : window;
    } else {aa.evt.blur = aa.evt.focus; aa.evt.focus = ev.target;}
    if (!aa.evt.focus) {
      aa.evt.keys = []; // aa.evt.pointer = {}; aa.evt.pointers = [aa.evt.pointer];
    }
    var i, funs = aa.evt.on.focus||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Debounced window blur and focus events. Handles both blur and focus events sequentially.
   */
  aa.evt.ondebouncedfocus = aa.evt.debounce(aa.evt.onfocus);

  /**
   * Resize window event. This listener is debounced till the last dispatch.
   */
  aa.evt.onresize = function (ev) {
    if (!aa.evt.enabled) {return;}
    ev = ev||{type: 'resize', target: window, timeStamp: performance.now()};
    var i, funs = aa.evt.on.resize||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Debounced resize window event till the last dispatch.
   */
  aa.evt.ondebouncedresize = aa.evt.debounce(aa.evt.onresize);

  /**
   * Timeframe event.
   */
  aa.evt.ontimeframe = function () {
    requestAnimationFrame(aa.evt.ontimeframe); if (!aa.evt.enabled) {return;}
    if (++aa.evt.timeframes > aa.vars.TOP_INT) {aa.evt.timeframes = 0;}
    var i, funs = aa.evt.on.timeframe||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i]();}}
  };

  /**
   * Splitsecond event.
   */
  aa.evt.onsplitsecond = function () {
    setTimeout(aa.evt.onsplitsecond, aa.vars.ms.WATCH); if (!aa.evt.enabled) {return;}
    if (++aa.evt.splitseconds > aa.vars.TOP_INT) {aa.evt.splitseconds = 0;}
    var i, funs = aa.evt.on.splitsecond||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i]();}}
  };

  /**
   * Splitminute event.
   */
  aa.evt.onsplitminute = function () {
    setTimeout(aa.evt.onsplitminute, aa.vars.ms.TIMEOUT); if (!aa.evt.enabled) {return;}
    if (++aa.evt.splitminutes > aa.vars.TOP_INT) {aa.evt.splitminutes = 0;}
    var i, funs = aa.evt.on.splitminute||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i]();}}
  };

  /**
   * Keydown event.
   */
  aa.evt.onkeydown = function (ev) {
    if (!aa.evt.enabled || aa.evt.keys.indexOf(ev.keyCode) != -1) {return;}
    ev = ev||window.event; aa.evt.keys.unshift(ev.keyCode);
    var i, funs = aa.evt.on.keydown||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Keyup event.
   */
  aa.evt.onkeyup = function (ev) {
    if (!aa.evt.enabled || (i = aa.evt.keys.indexOf(ev.keyCode)) == -1) {return;}
    ev = ev||window.event; aa.evt.keys.splice(i, 1);
    var i, funs = aa.evt.on.keyup||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Mouse and touch move event.
   */
  aa.evt.onpointermove = function (ev) {
    if (!aa.evt.enabled) {return;}
    var ev0 = (ev.touches && ev.touches.length) ? ev.touches[0] : ev;
    aa.evt.pointer.x = ev0.pageX||(ev0.clientX+document.documentElement.scrollLeft);
    aa.evt.pointer.y = ev0.pageY||(ev0.clientY+document.documentElement.scrollTop); // console.log("evt.onpointermove "+aa.evt.pointer.x+", "+aa.evt.pointer.y);
    var i, funs = aa.evt.on.pointermove||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Mouse wheel event.
   */
  aa.evt.onpointerwheel = function (ev) {
    if (!aa.evt.enabled) {return;}
    aa.evt.pointer.delta = {x: ev.deltaX, y: ev.deltaY, z: ev.deltaZ, mode: ev.deltaMode}; // console.log("evt.onpointerwheel "+aa.evt.pointer.delta.mode+": "+aa.evt.pointer.delta.y);
    var i, funs = aa.evt.on.pointerwheel||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Mouse and touch down event.
   */
  aa.evt.onpointerdown = function (ev) {
    if (!aa.evt.enabled || aa.evt.pointer.on || ev.button) {return;}
    aa.evt.pointer.on = 1; aa.evt.pointer.down = {x: aa.evt.pointer.x, y: aa.evt.pointer.y, target: ev.target, time: new Date().getTime()};
    var i, funs = aa.evt.on.pointerdown||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Mouse and touch down event.
   */
  aa.evt.onpointerup = function (ev) {
    if (!aa.evt.enabled || !aa.evt.pointer.on || ev.button) {return;}
    aa.evt.pointer.on = 0; aa.evt.pointer.up = {x: aa.evt.pointer.x, y: aa.evt.pointer.y, target: ev.target, time: new Date().getTime()};
    var i, funs = aa.evt.on.pointerup||{}; for (i in funs) {if (typeof funs[i] == 'function') {funs[i](ev);}}
  };

  /**
   * Enables all event listeners.
   * Called from function aa.app.open once the application is loaded.
   * To switch the listeners state, toggle the value of aa.evt.enabled to true/false.
   */
  aa.evt.listen = aa.evt.debounce(function () {
    if (aa.evt.enabled != null) {return;}
    aa.evt.enabled = true;
    aa.evt.blur = aa.evt.focus = null;
    aa.evt.keys = []; aa.evt.pointer = {}; aa.evt.pointers = [aa.evt.pointer];
    aa.evt.setErrorListener(aa.evt.onerror);
    aa.evt.onfocus(); aa.evt.onresize();
    if (aa.evt.timeframes == null) {
      aa.evt.timeframes = aa.evt.splitseconds = aa.evt.splitminutes = -1;
      aa.evt.ontimeframe(); aa.evt.onsplitsecond(); aa.evt.onsplitminute();
    } else {aa.evt.timeframes = aa.evt.splitseconds = aa.evt.splitminutes = -1;}
    aa.evt.setEventListener(window, 'beforeunload', aa.evt.onexit, false);
    aa.evt.setEventListener(window, 'pagehide', aa.evt.onexit, false);
    aa.evt.setEventListener(window, 'focus', aa.evt.ondebouncedfocus, true);
    aa.evt.setEventListener(window, 'blur', aa.evt.ondebouncedfocus, true);
    aa.evt.setEventListener(window, 'resize', aa.evt.ondebouncedresize, false);
    aa.evt.setEventListener(window, 'keydown', aa.evt.onkeydown, false);
    aa.evt.setEventListener(window, 'keyup', aa.evt.onkeyup, true);
    aa.evt.setEventListener(window, 'wheel', aa.evt.onpointerwheel, false);
    aa.evt.setEventListener(window, 'mousemove', aa.evt.onpointermove, false);
    aa.evt.setEventListener(window, 'touchmove', aa.evt.onpointermove, false);
    aa.evt.setEventListener(window, 'mousedown', aa.evt.onpointerdown, false);
    aa.evt.setEventListener(window, 'touchstart', aa.evt.onpointerdown, false);
    aa.evt.setEventListener(window, 'mouseup', aa.evt.onpointerup, false);
    aa.evt.setEventListener(window, 'touchend', aa.evt.onpointerup, false);
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Runs the AA web application, invoking the main module instance once it is fully loaded.
   */
  (function ready() {
    if (!document.body || !aa.Main || aa.Main.loading) {return setTimeout(ready, aa.vars.ms.LISTEN);}
    aa.app.removeEmbeddedJavascripts();
    aa.app.runInlineJavascripts();
    aa.app.open();
    aa.app.newInstance(aa.Main);
  })();

})();