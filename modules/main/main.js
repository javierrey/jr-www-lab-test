// /modules/main/main.js
// require /import/aa/scripts/aa-util.js
/**
 * Main application controller module. Handles languages, style themes and a general layout.
 */
(function () { "use strict";

  /**
   * Cloned from aa.dat.merge in aa-core.js.
   */
  const merge = function () {
    var m = arguments[0]; if (!m || m.constructor != Object) {m = {};}
    for (var i = 1; i < arguments.length; i++) {
      var o = arguments[i]; if (!o || o.constructor != Object) {o = {};}
      for (var k in o) {
        m[k] = (m[k] && o[k] && m[k].constructor == Object && o[k].constructor == Object) ? merge(m[k], o[k]) : o[k];
      }
    }
    return m;
  };

  window.aa = window.aa||{};
  if (aa.Main && aa.Main.destroy) {aa.Main.destroy();}
  var mod = aa.Main = {};

  mod.ini = {
    "meta": {
      "description": [
        "Main module.",
        "To be loaded in the boot.",
        "Some characters MmqgjiIl10Oo Åñô for testing.",
        "Log mode: 'none', 'browser', 'hidden', 'document', 'debug'."
      ]
    },
    "instantiate": false,
    "singleton": true,
    "langs": ["en", "es"],
    "themes": ["dark", "light"],
    "log": {
      "mode": "hidden",
      "remote": "/store/logs/"
    },
    "mm": {
    },
    "nn": {
      "theme": ""
    },
    "resources": [
      [
        {"url-register": "./import/aa/aa.js", "tag": "js"},
        {"url-ignore": "./import/aa/comps/aa-log.js", "tag": "js"},
        {"url": "./import/aa/scripts/aa-core.js", "tag": "js"},
        {"url-ignore": "./import/babel.min.js", "tag": "js"},
        {"url-ignore": "./import/jquery/jquery.js", "tag": "js"},
        {"url-ignore": "./import/bootstrap/bootstrap.css", "tag": "css"}
      ], [
        {"url-ignore": "./import/vue.min.js", "tag": "js"},
        {"url-ignore": "./import/react/react.production.min.js", "tag": "js"},
        {"url-ignore": "./import/react/react-dom.production.min.js", "tag": "js"},
        {"url-ignore": "./import/angular/angular.1.7.8.min.js", "tag": "js"}
      ], [
        {"url-ignore": "./import/threejs/three.min.js", "tag": "js"},
        {"url-ignore": "./import/d3/d3.min.js", "tag": "js"},
        {"url-ignore": "./import/tween.js", "tag": "js"}
      ], [
        {"url": "./import/aa/styles/aa-base.css", "tag": "css"},
        {"url": "./import/aa/styles/aa-comps.css", "tag": "css"},
        {"url": "./import/aa/scripts/aa-flow.js", "tag": "js"},
        {"url": "./import/aa/scripts/aa-layout.js", "tag": "js"},
        {"url": "./import/aa/scripts/aa-util.js", "tag": "js"},
        {"url": "./import/aa/comps/aa-lay.htm", "tag": "xhr"},
        {"url": "./import/aa/comps/aa-mm.js", "tag": "js"}
      ], [
        {"url": "./modules/main/media/main-ico.png", "tag": "link", "parent": "head", "selector": "[rel*='icon']", "rel": "icon", "sizes": "16x16"},
        {"url": "./modules/main/media/main-logo.svg", "tag": "svg"},
        {"url": "./modules/main/comps/main-menu.htm", "tag": "xhr"}
      ]
    ]
  };
  merge(mod.ini, self.input);

  mod.vars = {};

  mod.destroy = function () { // console.log(mod.moduleName+".destroy ");
  };
  mod.newInstance = function (ins) {
    var val; ins = ins||{};

    if (!mod.instances) {mod.firstInstance(ins);}

    // console.log(mod.moduleName+".newInstance "+ins.id, ins);
    return ins;
  };
  mod.dropInstance = function (ins) { // console.log(mod.moduleName+".dropInstance "+ins.id, ins);
    // aa.lay.removeNode(ins.content); // Show/Hide.
  };
  mod.onexit = function (ev) { // (console._log||console.log)(mod.moduleName+".onexit "+ev.type);
    var inss = aa.app.getInstances(mod);
    return null;
  };
  mod.onfocus = function (ev) { // console.log(mod.moduleName+".onfocus "+(aa.lay.getSelector(aa.evt.focus)||aa.evt.focus)+" "+(aa.lay.getSelector(aa.evt.blur)||aa.evt.blur));
  };
  mod.onresize = function (ev) { // console.log(mod.moduleName+".onresize "+window.innerWidth+"x"+window.innerHeight);
  };
  mod.ontimeframe = function () { // if (!(aa.evt.timeframes%100)) {console.log(mod.moduleName+".ontimeframe "+aa.evt.timeframes);}
  };
  mod.onsplitsecond = function () { // if (!(aa.evt.splitseconds%10)) {console.log(mod.moduleName+".onsplitsecond "+aa.evt.splitseconds);}
    // if (mod.i0.content&&mod.i0.content.qso(".lay-head").offsetHeight) {if (!mod.vars.lh_to) {mod.vars.lh_to = setTimeout(function () {mod.vars.lh_to = 0; location.href = location.href;}, aa.vars.ms.WAIT/2);}}
  };
  mod.onsplitminute = function () { // console.log(mod.moduleName+".onsplitminute "+aa.evt.splitminutes);
  };
  mod.onkeydown = function (ev) { // console.log(mod.moduleName+".onkeydown ["+aa.evt.keys+"] "+aa.lay.getSelector(ev.target));
  };
  mod.onkeyup = function (ev) { // console.log(mod.moduleName+".onkeyup "+(ev.which||ev.keyCode)+" ["+aa.evt.keys+"] "+(aa.lay.getSelector(ev.target)||ev.target));
  };
  mod.onpointerdown = function (ev) { // console.log(mod.moduleName+".onpointerdown "+" "+aa.lay.getSelector(aa.evt.pointer.down.target)+" "+aa.evt.pointer.x+", "+ aa.evt.pointer.y);
  };
  mod.onpointerup = function (ev) { // console.log(mod.moduleName+".onpointerup "+" "+aa.lay.getSelector(aa.evt.pointer.up.target)+" "+aa.evt.pointer.x+", "+ aa.evt.pointer.y);
  };
  mod.oncustom = function (ev) { // console.log(mod.moduleName+".oncustom ", ev);
  };
  mod.onerror = function (er) { // console.log(mod.moduleName+".onerror "+er.stack);
  };
  //
  mod.firstInstance = function (ins) {
    var val; self.input = self.input||{};
    if (!mod.ini.langs || !mod.ini.langs.length) {mod.ini.langs = ["en"];}
    mod.ini.lang = aa.app.query.lang && aa.app.query.lang.toLowerCase();
    if (mod.ini.langs.indexOf(mod.ini.lang) == -1) {mod.ini.lang = mod.ini.langs[0];}

    if (!mod.ini.themes || !mod.ini.themes.length) {mod.ini.themes = ["dark"];}
    mod.ini.theme = aa.app.query.theme && aa.app.query.theme.toLowerCase();
    if (mod.ini.themes.indexOf(mod.ini.theme) == -1) {mod.ini.theme = mod.ini.themes[0];}

    val = [
      {"url": "./modules/main/data/"+mod.pathName+"-texts-"+mod.ini.langs[0]+".json", "tag": "xhr"},
      {"url": "./modules/main/styles/"+mod.pathName+"-theme-"+mod.ini.theme+".css", "tag": "css"}
    ];
    if (mod.ini.lang != mod.ini.langs[0]) {
      val.push({"url": "./modules/main/data/"+mod.pathName+"-texts-"+mod.ini.lang+".json", "tag": "xhr"});
    }
    if (Number(aa.app.query.log) && mod.ini.log && mod.ini.log.mode) {
      aa.dat.merge(self.input, mod.ini.log);
      val.push({"url": "./import/aa/comps/aa-log.js", "tag": "js"});
    }

    aa.app.loadResources(val, function () {
      val = aa.app.getResourceResult(mod.pathName+"-texts-"+mod.ini.langs[0]+".json")||{};
      aa.dat.merge(aa.texts, val);
      if (mod.ini.lang != mod.ini.langs[0]) {
        val = aa.app.getResourceResult(mod.pathName+"-texts-"+mod.ini.lang+".json")||{};
        aa.dat.merge(aa.texts, val);
      }
      ins.container = ins.container||document.body;
      aa.lay.insertNode(document.body,
        '<div style="position: fixed; top: 0; right: 0; z-index: 1; width: 2.5em; height: 2.5em; cursor: pointer;"'
        +' onclick="aa.lay.visHFLR(aa.Main.i0.content, -1, 1);" title="'+aa.texts.main_menu.hide_show_menu+'"'
        +'><svg x-id="mainLogo0" style="width: 100%; height: 100%;"><use xlink:href="#mainLogo"></use></svg></div>',
        -1
      );
      ins.content = aa.lay.createHFB({container: ins.container, show: 0, classes: [mod.pathName, ins.id]});
      aa.lay.inHL(ins.content, '');
      aa.lay.inHR(ins.content, '<div style="width: 2.5em; height: 2.5em;"></div>');
      aa.lay.inHM(ins.content, aa.dat.renderTemplate(aa.app.getResourceResult("main-menu.htm"), aa.texts));
      aa.lay.inFL(ins.content, '');
      aa.lay.inFR(ins.content, '');
      aa.lay.inFM(ins.content, '<div align="center" style="padding: 0.25em"><a href="mailto:'+aa.texts.siteEmail
        +'?subject=Contact @'+aa.vars.basePath+'" target="jr-contact">&copy; '+aa.texts.siteName+'</a></div>');
      aa.lay.inBL(ins.content, ''); // '<div style="width: 16em; height: 100%; background-color: #0088ff;">Hello left</div>'
      aa.lay.inBR(ins.content, ''); // '<div style="width: 6em; height: 100%; background-color: #0088ff;">Hello right</div>'

      aa.lay.menu.update();
      mod.loadNND(); // mod.loadHome();
    });
  };
  mod.homeLoaded = function (layout) {
    if (aa.vars.homeLoaded) return;
    aa.vars.homeLoaded = 1;
    setTimeout(function () {
      if (1||!layout.qso(".lay-head").offsetHeight) {aa.lay.visHFLR(layout, 0, 0); aa.lay.visHFLR(layout, 1, 1);}
    }, aa.vars.ms.REFRESH);
  };
  //
  mod.loadHome = function () {
    var layout = aa.Main.i0.content; !aa.vars.homeLoaded && aa.lay.visHFLR(layout, 0, 0);
    self.input = mod.ini.home; if (self.input && !self.input.theme) {self.input.theme = mod.ini.theme;}
    aa.app.loadResource({url: "./modules/home/home.htm", tag: "xhr",
      loaded: function (rsc) {
        aa.lay.inBM(layout, aa.app.getResult(rsc), null, function (ctr, scripts) {
          mod.homeLoaded(layout);
        });
      }
    });
  };
  mod.loadNND = function () {
    var layout = aa.Main.i0.content; !aa.vars.homeLoaded && aa.lay.visHFLR(layout, 0, 0);
    self.input = mod.ini.nn; if (self.input && !self.input.theme) {self.input.theme = mod.ini.theme;} // Hide/Show theme inheritance.
    aa.nn?.destroy?.();
    aa.app.loadResource({url: "./modules/nnd/nnd.htm", tag: "xhr",
      loaded: function (rsc) {
        aa.lay.inBM(layout, aa.app.getResult(rsc), null, function (ctr, scripts) {
          mod.homeLoaded(layout);
          // setTimeout(function () {aa.lay.drag.draggable(window.qso("[x-id=nn_form_content]"), 1, null, null, null, "Draggable");}, aa.vars.ms.WATCH); // Hide/Show
        });
      }
    });
  };
  mod.loadTestForm = function () {
    var layout = aa.Main.i0.content; !aa.vars.homeLoaded && aa.lay.visHFLR(layout, 0, 0);
    self.input = mod.ini.testform; // if (self.input && !self.input.theme) {self.input.theme = mod.ini.theme;} // Hide/Show theme inheritance.
    aa.app.loadResource({url: "./modules/testform/testform.htm", tag: "xhr",
      loaded: function (rsc) {
        aa.lay.inBM(layout, aa.app.getResult(rsc), null, function (ctr, scripts) {
          mod.homeLoaded(layout);
          var form = ctr.querySelector("form");
          form.method = "POST";
          form.enctype = "multipart/form-data";
          form.action = '/servicetest?p={"pn":4}&n=3';
          if (!form.submitListener) {
            form.submitListener = function (ev) {
              if (ev.preventDefault) {ev.preventDefault();}
              var i, v, e, f = [], tgt = ev.target||ev; tgt.enctype = tgt.enctype||"application/x-www-form-urlencoded";
              var multipart = (tgt.enctype == "multipart/form-data"), post = {};
              for (i = 0; i < tgt.elements.length; i++) {
                e = tgt.elements[i]; v = e.value; if (!e.name || e.disabled) {continue;}
                if (e.files) {e.disabled = (!multipart || !e.files.length); f.push(e);
                } else if (v && v.trim && !e.multiple) {tgt.elements[i].value = v = v.trim();}
                if (!multipart && !e.disabled) {
                  if (e.name in post) {
                    if ((post[e.name]||{}).constructor != Array) {post[e.name] = [post[e.name]];}
                    post[e.name].push(v);
                  } else {post[e.name] = v;}
                }
              }
              if (multipart) {post = new FormData(tgt);}
              aa.app.loadXHR({url: tgt.action, post: post, loaded: function (xhr) {
                console.log("servicetest loaded "+(tgt.id||tgt.name||tgt.tagName||tgt), xhr.response);
              }});
              for (i = 0; i < f.length; i++) {f[i].disabled = false;}
            };
            form.addEventListener("submit", form.submitListener);
          }
        });
      }
    });
  };
  mod.loadFormJson = function () {
    var layout = aa.Main.i0.content; !aa.vars.homeLoaded && aa.lay.visHFLR(layout, 0, 0);
    self.input = mod.ini.formjson;
    aa.app.loadResource({url: "./modules/formjson/formjson.htm", tag: "xhr",
      loaded: function (rsc) {
        aa.lay.inBM(layout, aa.app.getResult(rsc), null, function (ctr, scripts) {
          mod.homeLoaded(layout);
        });
      }
    });
  };

  //
})();
