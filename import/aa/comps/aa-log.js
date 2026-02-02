// /import/aa/comps/aa-log.js // javier.rey.eu@gmail.com // copyright 2017
// require none
/**
 * See the content of the string variable aa.log.help in the code below for documentation.
 */
(function module() { 'use strict';

  // Globals and polyfills:

  if (typeof self == 'undefined') {global.self = global;} // Allow self in Server JS.

  if (!('performance' in self)) {
    self.performance = {
      timing: {navigationStart: new Date().getTime()-1},
      now: function () {return new Date().getTime()-performance.timing.navigationStart;}
    };
  }

  if (!('name' in Function.prototype)) {
    Object.defineProperty(Function.prototype, 'name', {get: function() {
      var c = ''+this; return c.substring(c.indexOf(' ')+1, c.indexOf('(')).trim();
    }});
  }

  // Imports and cloned import members:

  /**
   * Cloned from aa.dat.update in aa-core.js.
   */
  const update = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i]; if (!o || o.constructor != Object) {o = {};}
      if (t) {for (var k in t) {
        if (k in o) {t[k] = (t[k] && o[k] && t[k].constructor == Object && o[k].constructor == Object) ? update(t[k], o[k]) : o[k];}
      }} else {var t = o;}
    }
    return t;
  };

  /**
   * Cloned from aa.dat.escapeString in aa-core.js.
   */
  const escapeString = function (str, s, h) {
    str = ''+str; while (str.indexOf('\\\\') != -1) {str = str.replace(/\\\\/g, '\\');}
    str = str.replace(/\\"/g, '"').replace(/\\'/g, '\'').replace(/\\`/g, '`').replace(/\\\//g, '/');
    if (s) {str = str.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');}
    if (h) {str = str.replace(/</g, '&lt;').replace(/\n/g, '<br/>\n');} // str.replace(/&lt;/g, '&amp;lt;')...
    return str.trim();
  };

  /**
   * Cloned from aa.evt.normalizeError in aa-core.js.
   */
  const normalizeError = function (msg, url, row, col, err) {
    if (!err) {if (msg instanceof Error) {err = msg; msg = '';} else {err = new Error();}}
    err.name = err.name||err.constructor.name||'Error'; msg = err.message = err.message||msg||'';
    err.fileName = err.fileName||url||''; err.rowNumber = err.rowNumber||row||0; err.columnNumber = err.columnNumber||col||0;
    err.stack = err.stack || (err.message+'\n'+err.fileName+':'+err.rowNumber+':'+err.columnNumber);
    if (msg.indexOf(err.name+':') == -1) {msg = err.name+': '+msg;}
    if (err.stack.indexOf(msg.substring(msg.indexOf(' ')+1)) == -1) {err.stack = msg+'\n'+err.stack;}
    err.stack = err.stack.replace(/\\/g, '/');
    return err;
  };

  /**
   * Cloned from aa.app.getBasePath in aa-core.js.
   */
  const getBasePath = function () {
    return (self.location && location.host) ? '//'+location.host+location.pathname :
      process.mainModule.filename.substring(0, (process.mainModule.filename.lastIndexOf('/')+1)||(process.mainModule.filename.lastIndexOf('\\')+1))
        .replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/');
  };

  // Module object and properties:

  self.aa = self.aa||{};
  if (aa.log) {return;} // Single module.
  aa.log = {};

  aa.log.ini = { // Edit ini:
    mode: 'document', // DEF log mode: 'none', 'browser', 'hidden', 'document', 'debug'.
    remote: '/store/logs/', // DEF log remote URL (in /var/www).
    depth: 0, // Output object nesting depth. Zero for no limit.
    cic: 1, // Enable (default) or disable (-1) console input commands.
    theme: 'dark', // DEF light, dark
    left: 0, top: -1 // DEF deploy icon position in document.
  };
  update(aa.log.ini, self.input);

  aa.log.vars = {};
  aa.log.vars.depth = aa.log.ini.depth; // Set value 2, 3... before calling console.log. Reverts to ini value after the call.

  // Help contents.

  aa.log.help = 'In-document console log script. Especially useful in mobile devices without a real-time log display.'
  +'\nScript integrated in the JAZ framework, but without dependencies, so it can be embedded in any web application.'
  +'\nIn the default configuration, a floating '+' icon is shown initially, allowing the console to be deployed when pressed.'
  +'\nThe default ini properties can be overridden if the application has a self.input object defined before this script is loaded.'
  +'\nConfiguration ini properties:'
  +'\n mode (string):'
  +'\n  "none": Browser console log is deactivated.'
  +'\n  "browser": Default browser console behavior.'
  +'\n  "document": Overrides browser console with the in-document console.'
  +'\n  "hidden": Same as "document" but not visible initially. Expects a link in the document to show the console: "aa.log.toggleConsole(1);".'
  +'\n  "debug": Keeps both "document" and "browser" console behaviors for development testing.'
  +'\n remote (string): A remote server URL to enable remote logging.'
  +'\nOther optional ini properties:'
  +'\n depth (number): The initial recursion depth level.'
  +'\n cic (number): Enable (default) or disable (-1) console input commands.'
  +'\n theme (string): The docuemnt console color scheme, "dark", "light" or any other custom defined theme.'
  +'\n position (string): Layout CSS position "fixed" places the console on top of the window, "relative" appends it to the document.'
  +'\n left: (number): Left position, in pixels, when the console is undeployed. If negative, the position is aligned to the right.'
  +'\n top: (number): Top position, in pixels, when the console is undeployed. If negative, the position is aligned to the bottom.'
  +'\nFunction console.log(args...) behaves as configured by this script across the application.'
  +'\nFunction aa.log.save(args...) redirects the console.log output to a local file. The system\'s File dialog halts the application execution temporarily.'
  +'\nFunction aa.log.send(args...) redirects the console.log output to a remote service URL, defined in the ini object.'
  +'\nErrors are captured by the logger, including the stacktrace.'
  +'\nIf the console.log function is defined anywhere in the code, having the string "@" as the first parameter, the full stacktrace is logged.'
  +'\nObject inspection shows a static deployed tree in the output, including property names, types, sizes and values.'
  +'\nCyclic redundancy is prevented, replacing duplicate values with the path reference to the existing property in the output tree.'
  +'\nHidden custom properties in element and function objects are logged appended to the principal value.'
  +'\nParameters of type Object or Array passed to the console.log function show children of type String, HTML or Function trimmed to 250 characters.'
  +'\nParameters of type String, HTML or Function passed directly to the console.log funtion are shown in their full length.'
  +'\nRecursion depth can be limited, setting the value of aa.log.vars.depth before calling console.log in the code. The value is unset after the call.'
  +'\nThe document console shows the log content in a textarea, appending the output to the existing content.'
  +'\nPrevious log entries may be missed if not read, copied or saved, as the textarea always tries to keep a maximum size of 32KB.'
  +'\nThe console input field executes its javascript content after typing "enter" or pressing icon ">", and logs the result to the output textarea.'
  +'\nThe input field also allows the following special commands:'
  +'\n "help": Prints this documentation text in the output textarea.'
  +'\n "clear": Clears the output textarea. Can be followed by ":" + further instructions.'
  +'\n "0-9": Limits the recursion depth of the output object tree. Must be followed by ":" + further instructions.'
  +'\n "result": Evaluates expressions that can only be part of an assignment. Must be followed by ":" + further instructions.'
  +'\n "inspect": Inspects the HTML document. Can be followed by ":" + a query selector, to inspect a specific HTML element.'
  +'\n "save": Saves a file with the content of the output textarea.'
  +'\n "send": Sends the content of the output textarea to a remote service URL, as defined in the ini object remote property.';

  // Object inspection functions:

  /**
   * Cloned from aa.dat.plain in aa-core.js, adjusted to produce a readable string and limit the recursion depth.
   * Creates a plain object from a native object, ready to be stringified.
   * Prevents cyclic redundancy in recursion, replacing duplicate values with a full path key pointer to the existing
   * property value, in the format 'CYCLIC:>key1>key2>...>key'.
   * Includes data properties added outside the prototype value.
   * @param obj: any type. Native source object.
   * @param rec: number, optional. Limits the recursion depth.
   */
  aa.log.plain = function (obj, rec) {
    var plain; rec = rec||0; if (rec == 1) {try {obj = String(obj);} catch (er) {obj = '[object *]';} return obj;} else {rec--;}
    if ((typeof obj == 'object' || typeof obj == 'function') && obj != null && obj.constructor) {
      var dot = '>', path = arguments[2]||'CYCLIC:', vals = arguments[3]||[], keys = arguments[4]||[];
      var i, j, k = vals.indexOf(obj); if (k == -1) {keys.push(path); vals.push(obj);} else {return keys[k];}
      k = Object.keys(obj); plain = {}; if (obj.constructor != Object) {plain._type = obj.constructor.name;}
      if (typeof (obj.constructor.prototype||{})[(self.Symbol&&Symbol.iterator)||'length'] == 'undefined' || obj instanceof String || obj instanceof Function) {
        if (obj instanceof Error) {
          ['name', 'message', 'fileName', 'rowNumber', 'columnNumber', 'stack'].forEach(function (v, i, a) {plain[v] = aa.log.plain(obj[v], rec, path+dot+v, vals, keys);});
        } else if (obj instanceof String || obj instanceof Date || obj instanceof Function || (self.Node && obj instanceof Node)) {
          plain._value = String((obj.documentElement||obj).outerHTML||obj.nodeValue||(obj.toISOString&&obj.toISOString())||obj);
        } else if (obj instanceof Number) {plain._value = Number(obj);} else if (obj instanceof Boolean) {plain._value = Boolean(obj);
        } else {k = []; for (i in obj) {plain[i] = aa.log.plain(obj[i], rec, path+dot+i, vals, keys);}}
      } else {
        k = k.filter(isNaN); if (!k.length && obj.constructor == Array) {j = plain = [];} else {j = plain._value = [];}
        for (i = 0; i < obj.length; i++) {j.push(aa.log.plain(obj[i], rec, path+dot+i, vals, keys));}
      }
      for (i = 0; i < k.length; i++) {j = k[i]; if (!plain._value || typeof plain._value[j] == 'undefined') {plain[j] = aa.log.plain(obj[j], rec, path+dot+j, vals, keys);}}
    } else if (typeof obj == 'symbol') {plain = String(obj);
    } else {plain = obj;}
    return plain;
  };

  /**
   * Stringifies an object for a readable output, using the log.plain recursive function.
   * @param o, any type. The value to be stringified.
   * @param r, optional number. Limits recursion levels, if defined.
   * @param s, optional boolean. Escapes to blank new lines and tabs.
   * @param h, optional boolean. Escapes to HTML source.
   * @param l, optional number/boolean. Truncate long strings and functions.
   * If l is negative, skips the truncation of the first value. If it is +/- 1, truncates strings to a default length.
   */
  aa.log.objectString = function (o, r, s, h, l) { // Define default truncate length, 512...:
    r = (r == null) ? 0 : r; s = (s == null) ? 0 : s; h = (h == null) ? 0 : h; l = (l == null) ? 0 : (l == 1 || l == -1) ? l*512 : l;
    return escapeString(JSON.stringify(aa.log.plain(o, r), function (k, v) {
      if (v != null && v.constructor == String && k != null && k != '' && k != '_type') { // No _type keys from log.plain.
        if (l > 0) {
          if (v.length > l) {v = v.substring(0, l)+'...';}
          v = v.replace(/^(function\s*(\s+[^(]+)*\([^(]*\)\s*\{)[\s\S]*/, '$1}').replace(/^(\([^(]*\)\s*=>)[\s\S]*/, '$1 {}');
        } else {l = -l;}
        if (s && (v.indexOf(':\\') == 1 || v.indexOf('\\') == 0)) {v = v.replace(/\\/g, '/');} // Win system paths and '\n', '\r', '\t'.
      }
      return v;
    }, 2), s, h);
  };

  /**
   * Sets a listener for the global error event.
   */
  aa.log.setErrorListener = function (fun) {
    if (typeof fun != 'function') {return;}
    var pre = self.onerror;
    self.onerror = function (msg, url, row, col, err) {
      if (pre) {pre(msg, url, row, col, err);}
      fun(normalizeError(msg, url, row, col, err));
    };
  };

  // Console functions:

  /**
   * Creates the in-document console container.
   */
  var createDocumentConsole = function () {
    var bg, fg; if (aa.log.ini.theme == 'dark') {bg = '#000000'; fg = '#ffffff';} else {bg = '#eeeeee'; fg = '#555555';}
    var cstyles = 'font-family: monospace; font-size: 12px; line-height: 20px; background-color: '+bg+'; color: '+fg+'; border: solid 1px #cccccc;'
      +' border-radius: 16px; padding: 0 8px; box-sizing: border-box; outline: 0;';
    var bstyles = 'color: #ffffff; background-color: #555555;', mv = document.querySelector('meta[name="viewport"]');
    if (!mv) {
      mv = document.createElement('meta'); mv.name = 'viewport'; mv.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(mv);
    }
    aa.log.docGo = document.createElement('div'); aa.log.docGo.id = 'consoleBG'; aa.log.docGo.innerHTML = '+';
    aa.log.docGo.setAttribute('style', cstyles+' float: left; width: 24px; height: 24px; text-align: center; cursor: pointer; font-weight: bold; '+bstyles);
    aa.log.docIn = document.createElement('input'); aa.log.docIn.type = 'text'; aa.log.docIn.id = 'consoleTF'; // aa.log.docIn.maxLength = 32768; // Hide/Show maxLength
    aa.log.docIn.setAttribute('autocorrect', 'off'); aa.log.docIn.setAttribute('autocapitalize', 'none'); aa.log.docIn.setAttribute('autocomplete', 'off');
    aa.log.docIn.setAttribute('spellcheck', 'false'); aa.log.docIn.setAttribute('style', cstyles+' float: left; width: 100%; height: 24px;');
    aa.log.docRun = document.createElement('div'); aa.log.docRun.id = 'consoleBR'; aa.log.docRun.innerHTML = '&gt;';
    aa.log.docRun.setAttribute('style', cstyles+' float: right; width: 24px; height: 24px; text-align: center; cursor: pointer; '+bstyles);
    aa.log.docOutDiv = document.createElement('div'); aa.log.docOut = document.createElement('textarea'); aa.log.docOut.id = 'consoleTA';
    aa.log.docOut.value = 'DOCUMENT CONSOLE LOG'; aa.log.docOutDiv.appendChild(aa.log.docOut);
    aa.log.docOutDiv.setAttribute('style', cstyles+' width: 100%; min-width: 280px; height: 100%; overflow: hidden; padding: 8px;');
    aa.log.docOut.setAttribute('spellcheck', 'false'); aa.log.docOut.setAttribute('wrap', 'off'); aa.log.docOut.setAttribute('readonly', 'readonly');
    aa.log.docOut.setAttribute('style','font-family: monospace; font-size: 12px; line-height: 20px; border: none; background-color: transparent; color: '+fg+';'
      +' width: 100%; height: 100%; resize: none; overflow-y: scroll; overflow-x: auto; white-space: pre;');
    var runIn = function () {
      var val = aa.log.docIn.value.trim(); if (!val) {return;}
      if (val == 'clear' || val.substring(0, 6) == 'clear:') {aa.log.clear(); val = val.substring(6).trim(); if (!val) {return;}}
      if (val == 'help') {val = 'aa.log.help'; setTimeout(function () {aa.log.docIn.value = '';}, 0);}
      if (/^\d:/.test(val)) {aa.log.vars.depth = parseInt(val.charAt(0))||0; val = val.substring(2).trim(); if (!val) {return;}} else {aa.log.vars.depth = aa.log.ini.depth;}
      if (val == 'send' || val.substring(0, 5) == 'send:') {aa.log.send('Send Console:\n'+aa.log.docOut.value); aa.log.docIn.value = val.substring(5).trim(); return;}
      if (val == 'save' || val.substring(0, 5) == 'save:') {aa.log.save('Save Console:\n'+aa.log.docOut.value); aa.log.docIn.value = val.substring(5).trim(); return;}
      if (val == 'result' || val.substring(0, 7) == 'result:') {val = 'self.output='+val.substring(7).trim();}
      if (val == 'inspect' || val.substring(0, 8) == 'inspect:') {val = 'aa.log.inspect(\''+val.substring(8).trim()+'\')';}
      try {console.log('Console Input: '+aa.log.docIn.value, eval(val)); self.output = undefined; self.input = undefined;
      } catch (er) {console.log('Console Error: '+aa.log.docIn.value, er&&(er.message+'\n'+er.stack));}
    };
    aa.log.docGo.onclick = function () {
      var deployed = !(''+aa.log.docCont.style.maxWidth).length; this.blur();
      if (aa.log.ini.mode == 'hidden') {aa.log.toggleConsole(!deployed);} else {aa.log.deploy(!deployed);}
    };
    aa.log.docRun.onclick = function () {this.blur(); runIn();};
    aa.log.docIn.onkeyup = function (ev) {
      ev.preventDefault(); ev.stopPropagation(); ev.cancelBubble = true;
      var val = ev.which||ev.keyCode; if (val != 13) {return;}
      this.blur(); runIn();
    };
    aa.log.docCont = document.createElement('div'); aa.log.docCont.id = 'consoleContent';
    aa.log.docCont.setAttribute('style', 'position: '+(aa.log.ini.position||'fixed')
      +'; z-index: 2147483647; box-sizing: border-box; float: left; left: 0; top: 0; overflow: hidden; width: 100%; height: 100%; margin: 0; padding: 0;'
    );
    aa.log.docCont.innerHTML = '<div class="h" style="position: absolute; box-sizing: border-box; overflow: hidden; top: 0; width: 100%; height: 40px;">'
      +'<div class="l" style="box-sizing: border-box; overflow: hidden; float: left; height: 100%; width: auto; padding: 8px;"></div>'
      +'<div class="r" style="box-sizing: border-box; overflow: hidden; float: right; height: 100%; width: auto; padding: 8px;"></div>'
      +'<div class="m" style="box-sizing: border-box; overflow: hidden; width: auto; height: 100%; padding-top: 8px;"></div>'
      +'</div><div class="b" style="box-sizing: border-box; overflow: hidden; width: 100%; height: 100%; padding-top: 40px; padding-bottom: 0;">'
      +'<div class="l" style="box-sizing: border-box; overflow: hidden; float: left; height: 100%; width: 0;"></div>'
      +'<div class="r" style="box-sizing: border-box; overflow: hidden; float: right; height: 100%; width: 0;"></div>'
      +'<div class="m" style="box-sizing: border-box; overflow: hidden; width: auto; height: 100%; padding-left: 8px; padding-right: 8px; padding-bottom: 8px;"></div>'
      +'</div><div class="f" style="position: absolute; box-sizing: border-box; overflow: hidden; bottom: 0; width: 100%; height: 0;">'
      +'<div class="l" style="box-sizing: border-box; overflow: hidden; float: left; height: 100%; width: auto;"></div>'
      +'<div class="r" style="box-sizing: border-box; overflow: hidden; float: right; height: 100%; width: auto;"></div>'
      +'<div class="m" style="box-sizing: border-box; overflow: hidden; width: auto; height: 100%;"></div>'
      +'</div>';
    aa.log.docCont.querySelector('.h>.l').appendChild(aa.log.docGo); aa.log.docCont.querySelector('.h>.m').appendChild(aa.log.docIn);
    aa.log.docCont.querySelector('.h>.r').appendChild(aa.log.docRun); aa.log.docCont.querySelector('.b>.m').appendChild(aa.log.docOutDiv);
    aa.log.docCont.container = document.body; aa.log.hideConsole(); if (aa.log.ini.mode != 'hidden') {setTimeout(aa.log.showConsole, 0);}
    aa.log.vars.docParentStyleOverflowY = aa.log.docCont.container.style.overflowY; aa.log.docCont.container.style.overflowY = 'auto';
    (function appendConsole() {
      if (aa.log.docCont && aa.log.docCont.style.display != 'none' && (!aa.log.docCont.parentNode || aa.log.docCont.nextSibling)) {
        aa.log.docCont.container.appendChild(aa.log.docCont);
      }
      setTimeout(appendConsole, ms.UPDATE); // Ensure console is the last appended child all the time.
    })();
  };

  /**
   * Creates and formats a log string from a list of objects.
   */
  aa.log.buildLog = function (args) {
    if (!args || args.constructor == String || args instanceof Function || typeof args[(self.Symbol&&Symbol.iterator)||'length'] == 'undefined') {args = [args];}
    var d = new Date(), s = d.getTime()+(performance.now()%1), i = s-(aa.log.vars.tracestamp||s); aa.log.vars.tracestamp = s;
    s = 1e3; if (i) {if (i < .5/s) {i = '0.0';} else {i = Math.round(i*s)/s;}} // DEF 1e3, 1e6...
    var out = '\n-- LOG '+(d.toISOString()+(-d.getTimezoneOffset())).replace(/Z(\d)/, 'Z+$1')+'W'+d.getDay()+' (+'+i+'ms) '+basePath+' ';
    if (args.length && args[0] && args[0].constructor == String && args[0].charAt(0) == '@') { // Force stacktrace.
      s = new Error().stack||''; if (!s) {try {throw new Error();} catch (er) {s = er.stack||'';}} // Throw for IE.
      s = s.substring(s.indexOf('\n')+1); s = s.substring(s.indexOf('\n')).replace(/\\/g, '/')
        .replace(/ at (Object|Function|Module|Class|Interface)\./g, ' at ').replace(/\n\s+at .*processLog[^\n]+/, '');
    } else {s = '';}
    out += '-- '+s; for (i in args) {out += '\n'+aa.log.objectString(args[i], aa.log.vars.depth, 1, 0, -1);}
    aa.log.vars.depth = aa.log.ini.depth;
    return out;
  };

  /**
   * Console log process function.
   * In-document console log and command line, if code is in client and the browser's console log is not available.
   * Accepts the same parameters as console.log.
   */
  aa.log.processLog = function () {
    var msg = aa.log.buildLog(arguments);
    if (self.document && self.document.body) {
      var len = Math.max(msg.length, 32768); aa.log.docOut.value += msg;
      if (aa.log.docOut.value.length > len) {aa.log.docOut.value = aa.log.docOut.value.substring(aa.log.docOut.value.length-len);}
      aa.log.docOut.scrollTop = aa.log.docOut.scrollHeight;
      if (aa.log.ini.mode == 'debug') {console._log.apply(this, arguments);}
    } else {console._log(msg);}
  };

  /**
   * Inspects an HTML document element.
   */
  aa.log.inspect = function (elem) {
    if (!elem) {elem = document.documentElement;}
    if (elem.constructor == String) {
      try {elem = document.querySelector(elem);} catch (er) {elem = 'ERROR: '+er.message;}
    }
    return ''+(elem.outerHTML||elem);
  };

  /**
   * Sends the log to a remote service URL if defined in the ini property remote. Accepts the same parameters as console.log.
   */
  aa.log.send = function () { // console.log('Console log send '+aa.log.ini.remote);
    if (aa.log.ini.remote == null) {return;}
    var xhr = new XMLHttpRequest(), url = aa.log.ini.remote; xhr.time = new Date().getTime();
    xhr.open('POST', xhr.url, true);
    xhr.onreadystatechange = xhr.ontimeout = xhr.onabort = function () {
      if (this.readyState != 4) {return;}
      this.url = this.responseURL||url||'';
      this.success = (this.status >= 200 && this.status < 300) || this.status == 304 || (!this.status && this.url.substring(0, 5) == 'file:');
      this.onabort = this.ontimeout = this.onreadystatechange = null; // console.log('Console log send response '+this.success);
    };
    xhr.timeout = ms.TIMEOUT; xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('data='+encodeURIComponent(aa.log.buildLog(arguments)));
  };

  /**
   * Saves the log to a local file. Accepts the same parameters as console.log.
   */
  aa.log.save = function () {
    var msg = aa.log.buildLog(arguments), filename = 'console.log'; msg = new Blob([msg], {type: 'text/plain;charset=utf-8;'});
    if (navigator.msSaveBlob) {navigator.msSaveBlob(msg, filename); return;} // IE 10+
    var link = document.createElement('a'), url = URL.createObjectURL(msg);
    link.setAttribute('href', url); link.setAttribute('download', filename); link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  /**
   * Clears the document console output field.
   */
  aa.log.clear = function () {aa.log.docOut.value = '';};

  /**
   * Shows the document console.
   */
  aa.log.showConsole = function (deploy) {
    if (!aa.log.docCont) {return;}
    if (aa.log.docCont.style.position != 'fixed') {aa.log.docCont.container.style.overflowY = 'auto';}
    aa.log.deploy(deploy); aa.log.docCont.style.display = 'block';
  };

  /**
   * Hides the document console.
   */
  aa.log.hideConsole = function () {
    if (!aa.log.docCont) {return;}
    aa.log.docCont.style.display = 'none'; aa.log.deploy(false);
    if (aa.log.docCont.style.position != 'fixed' && aa.log.vars.docParentStyleOverflowY) {
      aa.log.docCont.container.style.overflowY = aa.log.vars.docParentStyleOverflowY;
    }
  };

  /**
   * Toggles the document console visibility.
   */
  aa.log.toggleConsole = function (deploy) {
    if (!aa.log.docCont) {return;}
    if (aa.log.docCont.style.display == 'none') {aa.log.showConsole(deploy);} else {aa.log.hideConsole();}
  };

  /**
   * Deploys/undeploys the console.
   */
  aa.log.deploy = function (on) {
    if (!aa.log.docCont) {return;}
    aa.log.docCont.style.maxWidth = aa.log.docCont.style.maxHeight = !on ? '40px' : ''; aa.log.docGo.innerHTML = !on ? '+' : '-';
    aa.log.docRun.style.display = aa.log.docIn.style.display = aa.log.docOut.style.display = !on ? 'none' : 'block';
    aa.log.docCont.style.backgroundColor = !on ? '' : 'rgba(128,128,128,.5)';
    if (on) {
      aa.log.docCont.container.style.overflowY = (aa.log.docCont.style.position != 'fixed') ? 'auto' : 'visible';
      aa.log.docOut.scrollTop = aa.log.docOut.scrollHeight;
      if (aa.log.docIn.value == 'help') {setTimeout(function () {aa.log.docIn.focus();}, ms.UPDATE+ms.WATCH);}
    } else {aa.log.docCont.container.style.overflowY = aa.log.vars.docParentStyleOverflowY||'';}
    if (aa.log.ini.left < 0 && !on) {aa.log.docCont.style.left = ''; aa.log.docCont.style.right = (1-aa.log.ini.left)+'px';
    } else {aa.log.docCont.style.right = ''; aa.log.docCont.style.left = ((!on && aa.log.ini.left)||0)+'px';}
    if (aa.log.ini.top < 0 && !on) {aa.log.docCont.style.top = ''; aa.log.docCont.style.bottom = (1-aa.log.ini.top)+'px';
    } else {aa.log.docCont.style.bottom = ''; aa.log.docCont.style.top = ((!on && aa.log.ini.top)||0)+'px';}
  };

  // Variables and values:

  const basePath = getBasePath();

  const ms = {FRAME: 16, PLAY: 33, LISTEN: 66, WATCH: 300, REFRESH: 600, UPDATE: 2e3, WAIT: 9e3, TIMEOUT: 3e4, FORGET: 4e5};

  /**
   * Run/export module.
   */
  (function ready() {
    if (!document.body) {return setTimeout(ready, ms.LISTEN);} // Simple document ready listener.
    console._log = console.log = console._log||console.log;
    if (aa.log.ini.mode == 'hidden' || aa.log.ini.mode == 'document' || aa.log.ini.mode == 'debug') {
      createDocumentConsole(); aa.log.log = aa.log.processLog;
      aa.log.setErrorListener(function (er) {console.log('ERROR '+er.stack);});
    } else if (aa.log.ini.mode == 'none') {aa.log.log = function () {};
    } else {aa.log.ini.mode = 'browser'; aa.log.log = console.log;}
    console.log = aa.log.log;

    if (aa.log.ini.cic == -1 && aa.log.docIn) {
      aa.log.docIn.setAttribute('disabled', 'disabled');
      aa.log.docIn.style.backgroundColor = '#999999';
    }

    console.log('init log'); // Initiate log timestamp here.
    aa.log.docIn.value = 'help'; // Suggest help as first command.
  })();

})();
