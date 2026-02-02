// /import/aa/aa.js // v0.0 // javier.rey.eu@gmail.com // copyright 2017
// require none
/**
 * JAZ boot script.
 * Initializes the global aa namespace object.
 * Only required element embedded in the hosting SPA document.
 */
(function () { "use strict";

  /**
   * Initialize JAZ Framework global namespace object.
   */
  self.aa = self.aa||{};

  self.loading = self.loading||0; // General asynchronous loading counter.
  self.input = self.input||undefined; // Global temporary input placeholder.
  self.output = self.output||undefined; // Global temporary output placeholder.
  self.cluster = self.cluster||undefined; // Cluster reference, if previously defined with require in NodeJS.
  aa.vars = aa.vars||{}; // General properties container for persistent values.

  /**
   * JAZ Variables and values.
   */

  aa.vars.ms = {FRAME: 16, PLAY: 33, LISTEN: 66, WATCH: 300, REFRESH: 600, UPDATE: 2e3, WAIT: 9e3, TIMEOUT: 3e4, FORGET: 4e5};

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Application Module.
   */
  aa.app = aa.app||{};

  /**
   * Duplicate of aa.app.urlCore in aa-core.js.
   */
  aa.app.urlCore = function (url, enclose) {
    var i; url = (url == null) ? "" : ""+url; enclose = enclose||0;
    i = url.indexOf("#"); if (i != -1) {url = url.substring(0, i);}
    i = url.indexOf("?"); if (i != -1) {url = url.substring(0, i);}
    url = url.replace(/\\/g, "/"); i = url.indexOf(":")+1; if (i > 0 && i <= url.indexOf("/")) {url = url.substring(i);}
    url = url.replace(/^(\/{2,}[^\/]+\/?)/, "/").replace(/^\.+\//, "/");
    if (enclose == -1 || enclose == 2 || (!enclose && url.length && url.lastIndexOf(".") <= url.lastIndexOf("/"))) {url += "/";}
    if (enclose > 0 || (!enclose && url.length)) {url = "/"+url;}
    i = /\/\.*\/+/g; while (i.test(url)) {url = url.replace(i, "/");}
    i = url.length-1; if ((enclose == 1 || enclose == -2) && url.charAt(i) == "/") {url = url.substring(0, i);}
    if (enclose < 0 && url.charAt(0) == "/") {url = url.substring(1);}
    return url;
  };

  /**
   * aa.app.loadCSS("./style.css", function (tgt) {console.log("loadCSS callback "+tgt.href, tgt);});
   */
  aa.app.loadCSS = function (url, fun) {
    var uri = aa.app.urlCore(url), link = document.querySelector("link[href*='"+uri+"']");
    if (link && link.parentNode) {link.parentNode.removeChild(link);}
    link = document.createElement('link'); link.time = new Date().getTime();
    link.type = "text/css"; link.rel = "stylesheet"; link.href = url;
    link.onload = link.onerror = function (ev) {self.loading--; this.eventType = ev.type; if (fun) {fun(this);}};
    self.loading = (self.loading||0)+1; document.head.appendChild(link);
    if (!('onload' in link.constructor.prototype)) {setTimeout(function () {link.onload({type: ""});}, aa.vars.ms.LISTEN);}
    return link;
  };

  /**
   * Loads a script and returns the loaded script element.
   * aa.app.loadJS("./script.js", function (tgt) {console.log("loadJS callback "+tgt.src, tgt);});
   */
  aa.app.loadJS = function (url, fun, typ) {
    var script = document.createElement('script'); script.time = new Date().getTime();
    script.type = typ||"text/javascript"; script.src = url; self.output = undefined;
    script.onload = script.onerror = function (ev) {
      this.output = self.output; this.input = self.input; self.output = undefined;
      this.eventType = ev.type; this.onload = this.onerror = null;
      self.loading--; if (fun) {fun(this);}
      if (this.parentNode) {this.parentNode.removeChild(this);}
    };
    self.loading = (self.loading||0)+1; document.head.appendChild(script);
    return script;
  };

  /**
   * aa.app.loadXHR({url: "./doc.html", loaded: function (req) {console.log("loadXHR callback "+req.url, req);}, post: {"p1": {"p11": "v11"}}, nocache: true});
   */
  aa.app.loadXHR = function (props) {
    var i, p, xhr = new XMLHttpRequest(); xhr.time = new Date().getTime();
    props = props||{}; if (props.constructor == String) {props = {url: props};}
    if (!props.loaded && typeof arguments[1] == "function") {props.loaded = arguments[1];}
    props.timeout = props.timeout||3e4; props.method = props.method||(props.post == null ? 'GET' : 'POST');
    props.headers = props.headers||{}; // xhr.props = props; // Hide/Show xhr.props registration.
    xhr.open(props.method, props.url, true, props.user, props.password);
    xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = function (ev) {
      this.url = this.responseURL||props.url||"";
      this.success = (this.status >= 200 && this.status < 300) || this.status == 304 || (!this.status && this.url.substring(0, 5) == "file:");
      this.eventType = ev.type; this.onload = this.onerror = this.onabort = this.ontimeout = this.onreadystatechange = null;
      self.loading--; if (props.loaded) {props.loaded(this);}
    };
    if (props.post != null) {
      if (props.post.constructor == Object) {
        p = props.post; props.post = "";
        for (i in p) {
          if (typeof p[i] != "number") {
            if (p[i] == null) {p[i] = "";} else if (p[i].constructor != String) {p[i] = JSON.stringify(p[i]);}
            p[i] = encodeURIComponent(p[i].trim());
          }
          props.post += "&"+i+"="+p[i];
        }
      } else {i = props.post.constructor.name; if (i.substring(i.length-5) == "Array") {props.post = "["+props.post+"]";}}
      if (props.post.constructor == String) {
        props.post = props.post.trim(); i = props.post.charAt(0);
        if (i == "{" || i == "[" || props.post.indexOf("=") == -1) {props.post = "data="+props.post;}
        if (props.nocache) {props.post += "&nocache="+xhr.time+("-"+Math.random()).substring(3);}
        i = props.post.charAt(0); if (i == "&" || i == "?") {props.post = props.post.substring(1);}
      }
      i = "Content-Type"; p = i.toLowerCase();
      if (props.post.constructor != FormData && !props.headers[p] && !props.headers[i]) {
        props.headers[p] = "application/x-www-form-urlencoded";
      }
    }
    for (i in props.headers) {xhr.setRequestHeader(i, props.headers[i]);}
    for (i in props) {if (i in xhr.constructor.prototype) {xhr[i] = props[i];}}
    self.loading = (self.loading||0)+1; xhr.send(props.post);
    return xhr;
  };

  /**
   * aa.app.loadElement({url: "./template.htm", tag: "script", parent: "head", id: "scriptOne", type: "html",
   *   loaded: function (tgt) {console.log("loadElement callback "+tgt.tagName+" "+tgt.url, tgt);}
   * });
   * aa.app.loadElement({url: "./template.js", tag: "script", parent: "head", id: "javascriptOne",
   *   loaded: function (tgt) {console.log("loadElement callback "+tgt.tagName+" "+tgt.url, tgt);}
   * });
   * aa.app.loadElement({url: "./template.css", tag: "style", parent: "head", id: "styleOne", type: "text/css", rel: "stylesheet",
   *   loaded: function (tgt) {console.log("loadElement callback "+tgt.tagName+" "+tgt.url, tgt);}
   * });
   * aa.app.loadElement({url: "./icon.png", tag: "link", parent: "head", selector: "[rel*='icon']", rel: "icon", sizes: "16x16",
   *   loaded: function (tgt) {console.log("loadElement callback "+tgt.tagName+" "+tgt.url, tgt);}
   * });
   * aa.app.loadElement({url: "./logo.svg", tag: "svg", id: "repoElem", position: "beforeend",
   *   loaded: function (tgt) {console.log("loadElement callback "+tgt.tagName+" "+tgt.url, tgt);}
   * });
   */
  aa.app.loadElement = function (props) {
    if (!props || !props.tag) {return null;}
    var atts = function (el, pr) {
      for (var p in pr) {if (["tag", "parent", "selector", "position"].indexOf(p) == -1) {el.setAttribute(p, ""+pr[p]);}}
    };
    var val, elem, REPO = "repoElem", parentNode = props.parent, tagName = props.tag.toLowerCase();
    if (parentNode && parentNode.constructor == String) {
      try {parentNode = document.querySelector(parentNode)||document.querySelector("#"+parentNode);} catch (er) {parentNode = null;}
    }
    parentNode = parentNode||document.body;
    if (["svg"].indexOf(tagName) != -1) {props.id = props.id||REPO;}
    if (props.id == REPO) {tagName = "div"; props.position = props.position||"beforeend"; props.style = props.style||"display: none;";}
    if (!props.selector && props.id) {props.selector = "#"+props.id;}
    if (props.selector) {try {elem = parentNode.querySelector(props.selector);} catch (er) {}}
    if (elem && !props.position) {elem.parentNode.removeChild(elem); elem = null;}
    if (!elem) {
      elem = document.createElement(tagName);
      if (""+props.src == "true" && "src" in elem.constructor.prototype) {props.src = props.url;
      } else {delete props.src; if (tagName == "link") {props.href = props.url;}}
      atts(elem, props);
    }
    elem.time = new Date().getTime(); if (props.position) {elem.url = elem.url||[]; elem.url.push(props.url);} else {elem.url = props.url;}
    if (tagName != "link" && !elem.src) {
      aa.app.loadXHR({url: props.url, loaded: function (res) {
        val = (res.success) ? ""+(res.response||"") : ""; elem.eventType = res.eventType;
        if (props.position) {elem.insertAdjacentHTML(props.position, val);} else {elem.innerHTML = val;}
        if (props.loaded) {props.loaded(elem);}
      }});
    } else {
      setTimeout(function () {self.loading--; if (props.loaded) {props.loaded(elem);}}, aa.vars.ms.LISTEN);
      self.loading = (self.loading||0)+1;
    }
    if (elem.parentNode != parentNode) {parentNode.appendChild(elem);}
    return elem;
  };

  /**
   * Loads a resource, ensuring it is not downloaded more than once, but reused if it already exists.
   * @param props. Example: {"url": "./import/jquery.js", "tag": "js", loaded: function (rsc) {}}
   * For script and style resources, props.tag must be set to "js" and "css" respectively. For document elements, like
   * template scripts or inline stylesheets, props.tag must be the tagName of the element to be loaded.
   * For all other requests, the default props.tag will be "xhr".
   * A resource is not downloaded if its URI has already been used. Instead, the existing resource is returned.
   * Example: aa.app.loadResource({url: "./script.js", tag: "js", loaded: function (rsc) {}})
   * New resources are stored in the object map aa.app.resources, where the key is the trimmed URI path and the value is
   * a reference to the loaded resource. Example:
   * aa.app.resources['/main/data/main-data.json'] = {response: ..., ...}
   * aa.app.resources['/main/scripts/main-controller.js'] = <script> + (attached properties: {result: ..., ...})
   */
  aa.app.loadResource = function (props) {
    aa.app.resources = aa.app.resources||{}; props = props||{}; if (props.constructor == String) {props = {url: props};}
    var uri = aa.app.urlCore(props.url); props.tag = props.tag||"xhr";
    var find = function (u) {var i, r; while (u && !r) {r = aa.app.resources[u]; i = u.indexOf("/", 1); u = (i < 0) ? "" : u.substring(i);} return r;};
    if (find(uri) && !props.nocache) {if (props.loaded) {setTimeout(function () {props.loaded(aa.app.resources[uri]);}, 1);}
    } else if (props.tag == "css") {aa.app.resources[uri] = aa.app.loadCSS(props.url, props.loaded);
    } else if (props.tag == "js") {aa.app.resources[uri] = aa.app.loadJS(props.url, props.loaded, props.type);
    } else if (props.tag == "xhr") {aa.app.resources[uri] = aa.app.loadXHR(props);
    } else if (props.tag) {aa.app.resources[uri] = aa.app.loadElement(props);}
    return aa.app.resources[uri];
  };

  /**
   * Loads an array of arrays of resources, ensuring each sub-array block waits for the previous block to be completed.
   * Uses aa.app.loadResource for loading each resource.
   * @param blocks, Array/Array. Example:
   *   [
   *     [
   *       {"url": "./import/bootstrap/css/bootstrap.css", "tag": "css"},
   *       {"url": "./import/jquery.js", "tag": "js"}
   *     ],
   *     [
   *       {"url": "./modules/main/styles/main-styles.css", "tag": "css"},
   *       {"url": "./modules/main/data/main-texts.json", "tag": "xhr"}
   *     ]
   *   ]
   * If the block entry contains the property "url-register" instead of "url", the resource is registered but not
   * actually loaded, preventing any further load. For development and testing, a resource can be fully ignored by
   * renaming the "url" property to something else, like "url-ignore".
   * @param fun, Function, Optional: Function parameter to be called after all blocks are loaded, taking an object
   * argument with all downloaded resources.
   *
   */
  aa.app.loadResources = function (blocks, fun) {
    var resources = (arguments.length > 2) ? arguments[2] : {}, queue = function () {aa.app.loadResources(blocks, fun, resources);};
    if (self.loading > 0) {return setTimeout(queue, aa.vars.ms.LISTEN);}
    if (blocks && blocks.length) {
      if (blocks.constructor != Array) {blocks = [blocks];}
      var blk = blocks.shift()||[]; if (blk.constructor != Array) {blk = [blk];}
      for (var i = 0; i < blk.length; i++) {
        if (!blk[i] || blk[i].constructor == String) {blk[i] = {url: blk[i]};}
        var url = blk[i].url = ""+(blk[i].url||""), uri = aa.app.urlCore(url);
        if (!url) { // "url-register", "url-ignore"
          url = blk[i].url = ""+(blk[i]["url-register"]||""); uri = aa.app.urlCore(url);
          if (url) {aa.app.resources[uri] = resources[uri] = {time: new Date().getTime(), url: url, eventType: "register"};}
        } else {resources[uri] = aa.app.loadResource(blk[i]);}
      }
      setTimeout(queue, 1);
    } else if (fun) {setTimeout(fun, 1, resources);}
  };

  /**
   * Loads a module.
   * @param name, String: Module's name. The resource sub-folder where the module is located in the lower-cased name.
   * @param fun, Function, Optional: Callback invoked when all the resources are loaded and the module is created,
   * taking the module's reference as a parameter. This function is a convenient placeholder where to create the first
   * module instance, invoking function aa.app.newInstance.
   * Invoking aa.app.loadModule('ModuleName') will create the module aa.ModuleName, which is a controller object
   * containing, the module's ini object and the instance constructor: function (inst) {return inst;}
   * Further calls to aa.app.loadModule using the same name will have no effect.
   * If the module ini object contains the property instantiate set to true, the function aa.app.newInstance is
   * invoked after the loading action, creating the first instance of the module, aa.ModuleName.i0.
   * Assumes the existence of the controller resource script: "./modules/modulename/modulename.js"
   */
  aa.app.loadModule = function (name, fun) {
    var i = name.lastIndexOf("/")+1, path = name.substring(0, i), pathname = name.substring(i).toLowerCase(); name = name.substring(i); if (aa[name]) {return;}
    if (path.charAt(0) != ".") {if (path.charAt(0) != "/") {path = "/"+path;} if (path.indexOf("/modules/") == -1) {path = "/modules"+path;} path = "."+path;}
    aa.app.loadResource({url: path+pathname+"/"+pathname+".js", tag: "js", type: "module", loaded: function (resource) {
      aa.app.modules = aa.app.modules||{};
      var mod = aa.app.modules[name] = aa[name] = aa[name]||{};
      mod.moduleName = name; mod.pathName = pathname; mod.instances = 0; mod.ini = mod.ini||{}; mod.loading = 1;
      mod.newInstance = mod.newInstance || function (ins) {return ins;};
      for (var i in aa.evt.on) {if (typeof mod["on"+i] == 'function') {aa.evt.on[i][mod.moduleName] = mod["on"+i];}}
      aa.app.loadResources(mod.ini.resources, function () {mod.loading = 0; fun && fun(mod); mod.ini.instantiate && aa.app.newInstance(mod);});
    }});
  };

  /**
   * Creates a module's instance.
   * @param mod, Object: Existing module object.
   * @param ins, Object, Optional: A new instance's initial data object. If not defined, a default object is created.
   * @return Object: The new instance processed by the module's controller function.
   * The module must have been previously loaded with function aa.app.loadModule, which creates the module's controller,
   * aa.ModuleName, after all its configured resources have been loaded.
   * Example: First call to aa.app.newInstance(aa.ModuleName, {}) will create and return aa.ModuleName.i0.
   * Further calls to newInstance for the same module will return new instances, aa.ModuleName.i1, aa.ModuleName.i2 and
   * so on, unless the module has the ini object property singleton set to true, in which case the instance constructor
   * will always return the existing aa.ModuleName.i0 instance.
   */
  aa.app.newInstance = function (mod, ins) {
    if (mod && typeof mod.newInstance == 'function') {
      mod.ini = mod.ini||{}; mod.instances = mod.instances||0;
      var name = "i"+(!mod.ini.singleton ? mod.instances : 0);
      ins = ins||{}; ins.id = name; ins.module = mod;
      ins = mod[name] = mod.newInstance(ins)||ins; ins.id = name; ins.module = mod; // Force id and module properties.
      if (mod.ini.singleton && !mod.instances) {mod._newInstance = mod.newInstance; mod.newInstance = function () {return mod.i0;};}
      if (!mod.ini.singleton || !mod.instances) {mod.instances++;}
    } else {ins = null;}
    return ins;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Event Module.
   */
  aa.evt = aa.evt||{};

  /**
   * Defines the event type registry objects.
   * @param evs is an optional list of event types. If not defined, the default list of event types is created.
   * Called from the immediately-invoked function "load" to initialize the default event types.
   * Each event workflow is defined in three instructions:
   * 1. Creation of a container object for the event registered methods, aa.evt.on, defined in function aa.evt.define.
   * 2. Definition of a listener function for the event, like aa.evt.onresize.
   * 3. Assignment of the event listener, defined in function aa.evt.assign.
   * Example, register and unregister a resize listener:
   * aa.evt.on.resize.updateLayout = function (ev) {}; delete aa.evt.on.resize.updateLayout;
   */
  aa.evt.define = function (evs) {
    evs = evs||"custom,error,exit,focus,resize,timeframe,splitsecond,splitminute,keydown,keyup,pointerwheel,pointermove,pointerdown,pointerup";
    evs = evs.split(","); aa.evt.on = aa.evt.on||{};
    var i, e; for (i in evs) {e = evs[i].trim(); if (e) {aa.evt.on[e] = aa.evt.on[e]||{};}}
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Layout Module.
   */
  aa.lay = aa.lay||{};

  /**
   * Busy progress animation for a given DOM container whose content is about to be replaced asynchronously.
   * If function until is not defined, the self.loading value is checked to finish the animation.
   * The animation is always removed after a timeout of 30s.
   * If the process takes less than half a second, no animation is triggered.
   * Uses only a system text font for animation, so nothing needs to be preloaded.
   */
  aa.lay.busy = function (container, until) {
    container = container||document.body; if (!until) {until = function () {return !self.loading;};}
    var time = new Date().getTime(), busy = container.querySelector("[x-id='busyElem']"); if (busy) {busy.parentNode.removeChild(busy);}
    busy = document.createElement('div'); busy.setAttribute("d-id", "busyElem");
    busy.setAttribute("style", "position: absolute; z-index: 10000000; width: 100%; height: 100%; left: 0; top: 0; overflow: hidden;");
    container.appendChild(busy);
    setTimeout(function () {
      if (!container || until()) {busy && busy.parentNode && busy.parentNode.removeChild(busy); return;}
      var width = container.offsetWidth; if (!width || width > window.innerWidth) {width = window.innerWidth;}
      var height = container.offsetHeight; if (!height || height > window.innerHeight) {height = window.innerHeight;}
      var overflowY = container.style.overflowY; container.style.overflowY = "hidden"; busy.style.top = container.scrollTop+"px";
      busy.className = "busy"; busy.setAttribute("align", "center");
      busy.style.backgroundColor = "rgba(99, 99, 99, 0.5)"; busy.style.textAlign = "center"; busy.style.paddingTop = Math.floor(height/4)+"px";
      busy.innerHTML = '<'+'div style="overflow: visible; font-family: monospace; font-weight: bold; color: #cccccc;'
        +' font-size: '+Math.floor(width/8)+'px;">&nbsp;<'+'/div><'+'/div>';
      var val = 0, chr = '.', arr = []; while (arr.length < 6) {arr.push(chr);} // DEF 6-12 .|*&middot;&bullet;
      (function animate() {
        if (!busy || until() || new Date().getTime()-time > aa.vars.ms.TIMEOUT) { // DEF forget timeout.
          busy && busy.parentNode && busy.parentNode.removeChild(busy); container.style.overflowY = overflowY; return;
        }
        var str = [].concat(arr); str[val++] = '&nbsp;';
        busy.firstChild.innerHTML = ''+str.join('')+''; if (val > arr.length-1) {val = 0;}
        setTimeout(animate, aa.vars.ms.LISTEN);
      })();
    }, aa.vars.ms.REFRESH);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Loads the AA web application, defined in the main module controller.
   */
  (function ready() {
    if (!document.body) {return setTimeout(ready, aa.vars.ms.LISTEN);}
    aa.lay.busy(document.body, function () {return aa.Main && !aa.Main.loading;});
    aa.evt.define();
    aa.app.loadModule("Main");
  })();

})();
