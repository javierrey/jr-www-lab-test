// /import/aa/scripts/aa-util.js
// require all
/**
 * Utilities script.
 */
(function () { "use strict";

  /**
   * JAZ Polyfills.
   */

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Data Module.
   */
  aa.dat = aa.dat||{};

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Crypto Module.
   * Special subset of Data module.
   */
  aa.crypto = aa.crypto||{};

  /**
   * Crypto digest async method using SubtleCrypto API.
   * Use await to get the result, as the digest method returns a Promise.
   * Example: (function () {var txt = 'A text.', digested = await aa.crypto.digest(txt, type); console.log(digested);})();
   */
  aa.crypto.digest = async function (text, type) { // type: 'SHA-1', 'SHA-256' (default), 'SHA-384', 'SHA-512'
    text = new TextEncoder().encode(text);
    text = await crypto.subtle.digest(type||'SHA-256', text);
    text = Array.from(new Uint8Array(text));
    return text.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Event Module.
   */
  aa.evt = aa.evt||{};

  /**
   *
   */
  aa.evt.dispatchResize = function () {aa.evt.dispatch(window, "resize", "UIEvent");};

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Application Module.
   */
  aa.app = aa.app||{};

  /**
   * Same as aa.app.loadXHR but with legacy support.
   */
  aa.app.sendXHR = function (props) {
    var i, p, xhr = new XMLHttpRequest(); xhr.time = new Date().getTime();
    props = props||{}; if (props.constructor == String) {props = {url: props};}
    if (!props.loaded && typeof arguments[1] == "function") {props.loaded = arguments[1];}
    props.timeout = props.timeout||3e4; props.method = props.method||(props.post == null ? 'GET' : 'POST');
    props.headers = props.headers||{}; // xhr.props = props; // Hide/Show xhr.props registration.
    xhr.open(props.post == null ? 'GET' : 'POST', props.url, true, props.user, props.password);
    xhr.onreadystatechange = xhr.ontimeout = xhr.onabort = function () {
      if (this.readyState != 4) {return;} // this.responseHeaders = aa.app.parseHeaders(this.getAllResponseHeaders());
      this.url = this.responseURL||props.url||"";
      this.success = (this.status >= 200 && this.status < 300) || this.status == 304 || (!this.status && this.url.substring(0, 5) == "file:");
      this.onabort = this.ontimeout = this.onreadystatechange = null; self.loading--; if (props.loaded) {props.loaded(this);}
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
    if (!('ontimeout' in xhr.constructor.prototype)) {setTimeout(function () {xhr && xhr.ontimeout && xhr.ontimeout();}, xhr.timeout);}
    self.loading = (self.loading||0)+1; xhr.send(props.post);
    return xhr;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Layout Module.
   */
  aa.lay = aa.lay||{};

  /**
   * Toggle full screen mode.
   */
  aa.lay.toggleFullScreen = function (elem) {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {document.msExitFullscreen();}
    } else {
      elem = elem||document.documentElement;
      if (elem.requestFullscreen) {elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullScreen) {elem.webkitRequestFullScreen();
      } else if (elem.msRequestFullscreen) {elem.msRequestFullscreen();}
    }
  };

  //

  /**
   * Stores an element's display properties.
   * Gets the actual property values even if the element is not displayed.
   * The properties can be later applied to the element individually or using function aa.lay.restoreDisplay.
   */
  aa.lay.storeDisplay = function (elem) {
    elem.vars = elem.vars||{};
    var ds = elem.vars.displayStore = elem.vars.displayStore||{}; ds.hidden = !(elem.offsetWidth && elem.offsetHeight);
    var style = getComputedStyle(elem), styleDisplay = style.display, elemDisplay = elem.style.display;
    if (styleDisplay == "none") {elem.style.display = "block";}
    var overflow = style.overflow.split(" "); if (overflow.length < 2) {overflow.push(overflow[0]);}
    ds.tagName = elem.tagName.toLowerCase(); ds.id = elem.getAttribute("id")||elem.getAttribute("x-id");
    ds.className = ds.hidden ? "" : elem.className||"";
    ds.offsetWidth = elem.offsetWidth; ds.offsetHeight = elem.offsetHeight;
    ds.width = !elem.offsetWidth ? "" : elem.style.width||style.width;
    ds.height = !elem.offsetHeight ? "" : elem.style.height||style.height;
    ds.oveflowX = !elem.offsetWidth ? "" : elem.style.overflowX||overflow[0];
    ds.oveflowY = !elem.offsetHeight ? "" : elem.style.overflowY||overflow[1];
    ds.opacity = (style.opacity == "1") ? elem.style.opacity : style.opacity;
    ds.zoom = (style.zoom == "1") ? elem.style.zoom : style.zoom;
    ds.visibility = (style.visibility == "visible") ? elem.style.visibility : style.visibility;
    ds.display = (styleDisplay == "none") ? style.display : elem.style.display;
    if (elem.style.display) {elem.style.display = elemDisplay;}
    return ds;
  };

  /**
   * Applies an element's stored display properties with function aa.lay.storeDisplay.
   */
  aa.lay.restoreDisplay = function (elem) {
    elem.vars = elem.vars||{};
    var ds = elem.vars.displayStore = elem.vars.displayStore||aa.lay.storeDisplay(elem);
    if (ds.className) {elem.className = ds.className;}
    if (ds.width && elem.style.width) {elem.style.width = ds.width;}
    if (ds.height && elem.style.height) {elem.style.height = ds.height;}
    if (ds.oveflowX && elem.style.oveflowX) {elem.style.oveflowX = ds.oveflowX;}
    if (ds.oveflowY && elem.style.oveflowY) {elem.style.oveflowY = ds.oveflowY;}
    if (elem.style.opacity) {elem.style.opacity = ds.opacity;}
    if (elem.style.zoom) {elem.style.zoom = ds.zoom;}
    if (elem.style.visibility) {elem.style.visibility = ds.visibility;}
    if (elem.style.display) {elem.style.display = ds.display;}
    return ds;
  };

  //

  /**
   * Creates an HFB-LRM layout (Head-Foot-Body-Left-Right-Main) in the document.
   * @param config. Object with properties to determine the layout behaviour.
   * Property container: The HTML parent element where the layout will be inserted.
   * Property template: The HTML string template to be inserted in the container. If not defined, a previously loaded
   * template from resource aa-lay.htm is attempted to be used by default.
   * Property classes: Array of style classes to be added to the layout element.
   * Property show: Determines the delayed visibility transition of the layout cells, other than the body's main cell.
   * The usual values are null (no transition behaviour), 0 (only show the the body main cell, as the other cells can be
   * shown/hidden at any time using function aa.lay.visHFLR), 1 (show the cells immediately after all the layout content
   * is loaded), or any number of milliseconds, like aa.vars.ms.REFRESH (delay after all content is loaded).
   * @return a reference to the created layout element.
   * @require functions aa.app.getResourceResult, aa.lay.storeDisplay, aa.lay.restoreDisplay and property aa.vars.ms.
   */
  aa.lay.createHFB = function (config) {
    config = config||{}; if (!config.container || config.container == document) {config.container = document.body;}
    config.template = config.template||"aa-lay.htm"; if (config.template.indexOf("<") == -1) {config.template = aa.app.getResourceResult(config.template)||"";}
    aa.lay.insertNode(config.container, config.template, 0);
    var i, layout = config.container.querySelector(".lay"); if (!layout) {return layout;}
    config.classes = config.classes||[]; if (config.classes.constructor == String) {config.classes = config.classes.split(" ");}
    config.classes.push("user-select-none");
    for (i = 0; i < config.classes.length; i++) {var cl = (""+(config.classes[i]||"")).trim(); if (cl.length) {layout.classList.add(cl);}}
    if (config.show != null) {
      var hfb = layout.querySelectorAll(".lay-head,.lay-foot,.lay-body"), timeout = new Date().getTime()+aa.vars.ms.TIMEOUT;
      hfb.forEach(function (v, i, a) {aa.lay.storeDisplay(v); v.style.visibility = "hidden";});
      (function ready() {
        if (hfb[0] && !hfb[0].offsetHeight && new Date().getTime() < timeout) {return setTimeout(ready, aa.vars.ms.LISTEN);}
        hfb.forEach(function (v, i, a) {aa.lay.restoreDisplay(v);});
        aa.lay.visHFLR(layout, 0, 0);
        if (config.show > 0) {setTimeout(function () {if (hfb[0] && !hfb[0].offsetHeight) {aa.lay.visHFLR(layout, 1, 1);}}, config.show);}
      })();
    }
    return layout;
  };

  /**
   * Gets a cell in an HFB-LRM layout element (Head-Foot-Body-Left-Right-Main).
   */
  aa.lay.getHFB = function (layout, cell) {
    if (!layout || !cell) {return layout;}
    var cells = {
      "H": ".lay-head", "F": ".lay-foot", "B": ".lay-body",
      "HL": ".lay-head>.lay-left", "HR": ".lay-head>.lay-right", "HM": ".lay-head>.lay-main",
      "FL": ".lay-foot>.lay-left", "FR": ".lay-foot>.lay-right", "FM": ".lay-foot>.lay-main",
      "BL": ".lay-body>.lay-left", "BR": ".lay-body>.lay-right", "BM": ".lay-body>.lay-main"
    };
    return layout.querySelector(cells[cell]||cell);
  };
  aa.lay.getH = function (layout) {return aa.lay.getHFB(layout, "H");};
  aa.lay.getF = function (layout) {return aa.lay.getHFB(layout, "F");};
  aa.lay.getB = function (layout) {return aa.lay.getHFB(layout, "B");};
  aa.lay.getHL = function (layout) {return aa.lay.getHFB(layout, "HL");};
  aa.lay.getHR = function (layout) {return aa.lay.getHFB(layout, "HR");};
  aa.lay.getHM = function (layout) {return aa.lay.getHFB(layout, "HM");};
  aa.lay.getFL = function (layout) {return aa.lay.getHFB(layout, "FL");};
  aa.lay.getFR = function (layout) {return aa.lay.getHFB(layout, "FR");};
  aa.lay.getFM = function (layout) {return aa.lay.getHFB(layout, "FM");};
  aa.lay.getBL = function (layout) {return aa.lay.getHFB(layout, "BL");};
  aa.lay.getBR = function (layout) {return aa.lay.getHFB(layout, "BR");};
  aa.lay.getBM = function (layout) {return aa.lay.getHFB(layout, "BM");};

  /**
   * Inserts content in an HFB-LRM layout (Head-Foot-Body-Left-Right-Main). If no HFB-LRM cell is defined, the content is
   * inserted directly in the layout.
   * @param layout. Layout element, of type HFB-LRM, as defined in template aa-layout.htm (using aa-base.css).
   * @param cell. Selector of the cell in the layout element to be populated with the content.
   * @param content. Element nodes or HTML content to be inserted in the cell.
   * If cell is a layout flag, it will become the section in the layout element, HL, HR, HM, FL, FR, FM, BL, BR, BM.
   * If cell is null, the whole layout element will be populated with the content.
   * @param pos. Element's insert position. If null, the cell content will be replaced.
   * @param trans. If true, a transition is run on content update. if it is a function, it is called after the transition.
   * Functions inHL, inHR, inHM, inFL, inFR, inFM, inBL, inBR, inBM can be used for default HFB-LRM layout cells.
   */
  aa.lay.insertHFB = function (layout, cell, content, pos, trans) {
    var ontrans = arguments[5]; if (layout == null || content == null) {return;}
    if (aa.vars.inHFB_ontrans && !ontrans) {
      setTimeout(aa.lay.insertHFB, aa.vars.ms.LISTEN, layout, cell, content, pos, trans);
      return;
    }
    var cells = {
      "HL": ".lay-head>.lay-left", "HR": ".lay-head>.lay-right", "HM": ".lay-head>.lay-main",
      "FL": ".lay-foot>.lay-left", "FR": ".lay-foot>.lay-right", "FM": ".lay-foot>.lay-main",
      "BL": ".lay-body>.lay-left", "BR": ".lay-body>.lay-right", "BM": ".lay-body>.lay-main"
    };
    var child = !cell ? layout : layout.querySelector(cells[cell]||cell); aa.vars.inHFB_ontrans = 0; if (!child) {return;}
    if (trans && !ontrans && child.children.length) {
      if (child.children.length) {child.classList.remove('fade-in'); child.classList.add('fade-out');}
      aa.vars.inHFB_ontrans = 1; setTimeout(aa.lay.insertHFB, aa.vars.ms.WATCH, layout, cell, content, pos, !!content && trans, trans);
      return;
    }
    trans = ontrans||trans;
    aa.lay.insertNode(child, content, pos, 0, function (ctr, scripts) {
      if (trans) {
        if (typeof trans == 'function') {trans(ctr, scripts);}
        if (child.children.length) {child.classList.remove('fade-out'); child.classList.add('fade-in');}
      } else {aa.lay.requestUpdateHFB(null, "insertHFB");}
      aa.evt.setFocus(ctr, 1); // Optionally, use force 1 for Chrome immediate scroll.
    });
  };
  aa.lay.inHL = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "HL", content, pos, trans);};
  aa.lay.inHR = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "HR", content, pos, trans);};
  aa.lay.inHM = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "HM", content, pos, trans);};
  aa.lay.inFL = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "FL", content, pos, trans);};
  aa.lay.inFR = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "FR", content, pos, trans);};
  aa.lay.inFM = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "FM", content, pos, trans);};
  aa.lay.inBL = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "BL", content, pos, trans);};
  aa.lay.inBR = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "BR", content, pos, trans);};
  aa.lay.inBM = function (layout, content, pos, trans) {aa.lay.insertHFB(layout, "BM", content, pos, trans);};

  /**
   * Sets the display in an HFB-LRM layout (Head-Foot-Body-Left-Right-Main).
   * @param layout. Layout element, of type HFB-LRM, as defined in template aa-layout.htm (using aa-base.css).
   * @param cell. Selector of the cell in the layout element to be populated with the content.
   * @param vis. Visibility to be set on the target cell. Values 1, 0, -1. If -1, visibility is toggled.
   * @param trans. If true, a transition is run on content update. If it is a function, it is called after the transition.
   * Functions visH, visF, visHF, visL, visR, visLR can be used for default HFB-LRM layout cells.
   */
  aa.lay.visibleHFB = function (layout, cell, vis, trans) {
    if (layout == null) {return;}
    if (aa.vars.visHFB_ontrans) {
      setTimeout(aa.lay.visibleHFB, aa.vars.ms.LISTEN, layout, cell, vis, trans);
      return;
    }
    var cells = {
      "H": ".lay-head", "F": ".lay-foot", "HF": ".lay-head,.lay-foot",
      "L": ".lay-body>.lay-left", "R": ".lay-body>.lay-right", "LR": ".lay-body>.lay-left,.lay-body>.lay-right",
      "HFLR": ".lay-head,.lay-foot,.lay-body>.lay-left,.lay-body>.lay-right"
    };
    var head = layout.querySelector(".lay-head"), foot = layout.querySelector(".lay-foot"), body = layout.querySelector(".lay-body");
    var i, vs, el, eld, els = [], elems = !cell ? [layout] : layout.querySelectorAll(cells[cell]||cell);
    var steps = 10; aa.vars.visHFB_ontrans = 0;
    var setSize = function (es, st) {
      var fun = function (r) {
        for (var k = 0; k < es.length; k++) {
          var e = es[k].e, s = e.vars.displayStore||e.style, w = es[k].w, h = es[k].h;
          var w0 = !es[k].d ? w : w ? 0 : parseInt(s.width), h0 = !es[k].d ? h : h ? 0 : parseInt(s.height);
          if (w != null) {w = parseInt(w0+(w-w0)*r); e.style.width = w+"px"; e.style.overflowX = (r < 1) ? "hidden" : es[k].o;}
          if (h != null) {
            h = parseInt(h0+(h-h0)*r); e.style.height = h+"px"; e.style.overflowY = (r < 1) ? "hidden" : es[k].o;
            if (e == head) {body.style.paddingTop = e.offsetHeight+"px";}
            if (e == foot) {body.style.paddingBottom = e.offsetHeight+"px";}
          }
        }
        if (r == 1) {aa.vars.visHFB_ontrans = 0; if (typeof trans == 'function') {trans(layout);}}
      };
      if (st != null) {aa.vars.visHFB_ontrans = 1; st /= steps; setTimeout(fun, parseInt(aa.vars.ms.LISTEN*st), st);} else {fun(1);}
    };
    for (i = 0; i < elems.length; i++) {
      el = elems[i]; if (!(el instanceof Element)) {elems.splice(i--, 1); continue;}
      vs = (el.offsetWidth && el.offsetHeight); if (i == 0 && vis == -1) {vis = vs ? 0 : 1;}
      el.vars = el.vars||{}; els.push({e: el}); els[i].d = (!vis != !vs); eld = vs ? aa.lay.storeDisplay(el) : el.vars.displayStore||{};
      if (el == head || el == foot) {els[i].w = null; els[i].h = !vis ? 0 : parseInt(eld.height)||0; els[i].o = !vis ? "hidden" : eld.overflowY||"";
      } else {els[i].h = null; els[i].w = !vis ? 0 : parseInt(eld.width)||0; els[i].o = !vis ? "hidden" : eld.overflowX||"";}
    }
    if (els.length) {aa.lay.requestUpdateHFB(null, "visibleHFB"); if (trans) {for (i = 0; i <= steps; i++) {setSize(els, i);}} else {setSize(els);}}
  };
  aa.lay.visH = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "H", vis, trans);};
  aa.lay.visF = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "F", vis, trans);};
  aa.lay.visHF = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "HF", vis, trans);};
  aa.lay.visL = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "L", vis, trans);};
  aa.lay.visR = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "R", vis, trans);};
  aa.lay.visLR = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "LR", vis, trans);};
  aa.lay.visHFLR = function (layout, vis, trans) {aa.lay.visibleHFB(layout, "HFLR", vis, trans);};

  /**
   * Updates an HFB-LRM layout cells size.
   * Useful when content size is changed, for instance, by modifying style values.
   * If @param layouts is not specified, all HFB-LRM layouts in the document are updated.
   */
  aa.lay.updateHFB = function (layouts) {
    layouts = layouts||".lay"; if (layouts.constructor == String) {layouts = document.querySelectorAll(layouts);}
    if (!('length' in layouts.constructor.prototype)) {layouts = [layouts];}
    var i, p, c, layout, parent, child, content, head, foot, body, isB, isM, cell, cells = ["HL", "HR", "HM", "FL", "FR", "FM", "BL", "BR", "BM"];
    for (p = 0; p < layouts.length; p++) {
      layout = layouts[p]; head = layout.querySelector(".lay-head"); foot = layout.querySelector(".lay-foot"); body = layout.querySelector(".lay-body");
      for (c = 0; c < cells.length; c++) {
        cell = cells[c]; isB = (cell == "BL" || cell == "BR" || cell == "BM"); isM = (cell == "HM" || cell == "FM" || cell == "BM");
        if (!isB || !isM) {
          child = aa.lay.getHFB(layout, cell); parent = child.parentNode; content = child.children;
          child.style.width = child.style.height = parent.style.width = parent.style.height = "";
          for (i = 0; i < content.length; i++) {
            var elem = content[i], style = getComputedStyle(elem);
            if (!isM) {child.style.width = Math.max(child.offsetWidth, elem.offsetWidth)+"px";}
            if (!isB) {
              child.style.height = Math.max(child.offsetHeight, elem.offsetHeight)+"px";
              parent.style.height = Math.max(parent.offsetHeight, child.offsetHeight)+"px";
              body.style.paddingTop = head.offsetHeight+"px"; body.style.paddingBottom = foot.offsetHeight+"px";
            }
            if (style.position == "absolute" || style.position == "fixed") {
              if (elem.style.right) {elem.style.left = "auto"; elem.style.right = (parent.offsetWidth-child.offsetWidth-child.offsetLeft)+"px";
              } else {elem.style.right = "auto"; elem.style.left = child.offsetLeft+"px";}
              if (elem.style.bottom) {elem.style.top = "auto"; elem.style.bottom = (parent.offsetHeight-child.offsetHeight-child.offsetTop)+"px";
              } else {elem.style.bottom = "auto"; elem.style.top = child.offsetTop+"px";}
            }
          }
        }
      }
    }
  };

  /**
   * Delay a call to aa.lay.updateHFB using an inverse debounced callback.
   * @require function aa.evt.debounce.
   */
  (function ready() {
    if (!aa.evt || !aa.evt.debounce) {return setTimeout(ready, aa.vars.ms.LISTEN);}
    aa.lay.requestUpdateHFB = aa.evt.debounce(function (layouts) {aa.lay.updateHFB(layouts);}, -1);
  })();

  //

  /**
   * Menu implementation.
   */
  aa.lay.menu = (function () {
    var mod = {};
    var sel = function (selector, context) {return (context||document).querySelectorAll(selector);};
    var setEventListener = function (target, type, listener, options, addremove) {
      if (!addremove || addremove < 0) {
        target.removeEventListener(type, listener, false);
        target.removeEventListener(type, listener, true);
      }
      if (!addremove || addremove > 0) {target.addEventListener(type, listener, options||false);}
    };
    var getAncestor = function (elem, selector) {
      while (elem && (elem = elem.parentElement)) {
        if (!selector || [].slice.call(elem.parentNode.querySelectorAll(selector)).indexOf(elem) != -1) {return elem;}
      }
      return null;
    };
    var forEach = function (collection, iterator) {for (var key in Object.keys(collection)) {iterator(collection[key]);}};
    var showMenu = function (ev) {
      var ul = sel("ul", this)[0]; if (!ul || ul.classList.contains("-visible")) {return;}
      this.classList.add("-active"); ul.classList.add("-animating"); ul.classList.add("-visible");
      setTimeout(function () {ul.classList.remove("-animating");}, aa.vars.ms.FRAME);
    };
    var hideMenu = function (ev) {
      var ul = sel("ul", this)[0]; if (!ul || !ul.classList.contains("-visible")) {return;}
      this.classList.remove("-active"); ul.classList.add("-animating");
      setTimeout(function () {ul.classList.remove("-visible"); ul.classList.remove("-animating");}, aa.vars.ms.WATCH);
    };
    var toggleMenu = function (ev) {
      var ul = sel("ul", this)[0], pul = getAncestor(ev.target, "ul"); if (!ul || (pul && !pul.classList.contains("-menu"))) {return;}
      if (ul.classList.contains("-visible")) {this.hideMenu(ev);} else {this.showMenu(ev);}
    };
    var hideAllInactiveMenus = function (ev) {
      forEach(sel(".-menu li.-hasSubmenu.-active:not(:hover)"), function (el) {el.hideMenu && el.hideMenu();});
    };
    var hideAllMenus = function (ev) {
      forEach(sel(".-menu li.-hasSubmenu.-active"), function (el) {el.hideMenu && el.hideMenu();});
    };
    mod.update = function () {
      forEach(sel(".-menu li.-hasSubmenu"), function (el) {
        if (!el.showMenu) {el.showMenu = showMenu; el.hideMenu = hideMenu; el.toggleMenu = toggleMenu;}
      });
      forEach(sel(".-menu>li.-hasSubmenu"), function (el) {
        if (!el.toggleMenuListener) {el.toggleMenuListener = 1; setEventListener(el, "click", toggleMenu);}
      });
      forEach(sel(".-menu li:not(.-hasSubmenu)>a"), function (el) {
        if (!el.hideAllMenusListener) {el.hideAllMenusListener = 1; setEventListener(el, "click", hideAllMenus);}
      });
      forEach(sel(".-menu>li.-hasSubmenu li"), function (el) {
        if (!el.hideAllInactiveMenusListener) {el.hideAllInactiveMenusListener = 1; setEventListener(el, "mouseenter", hideAllInactiveMenus);}
      });
      forEach(sel(".-menu>li.-hasSubmenu li.-hasSubmenu"), function (el) {
        if (!el.showMenuListener) {el.showMenuListener = 1; setEventListener(el, "mouseenter", showMenu);}
      });
    };
    (function ready() {
      if (!document.body) {return setTimeout(ready, aa.vars.ms.LISTEN);}
      setEventListener(document, "mousedown", hideAllInactiveMenus);
      setEventListener(document, "touchstart", hideAllInactiveMenus, true);
      mod.update();
    })();
    return mod;
  })();

  //

  /**
   * Drag Sub-module.
   * Make an element draggable.
   * Requires aa.evt.setEventListener.
   * Parameter mode:
   * 0: none (no drag&drop)
   * 1: move (move source)
   * 2: copy (drop source)
   * 3: copy (drop target)
   * 4: clone (keep both, drop target mode)
   * 5: clone (keep both, drop target mode to "1")
   * 6: clone (keep both)
   * Example: aa.lay.drag.draggable(document.querySelector("[x-id='draggableDiv']"), 5);
   */
  aa.lay.drag = (function () {
    var mod = {};
    mod.pointer = {x: 0, y: 0, target: null};
    var getAbsoluteScroll = function (elem) {
      var pos = {x: 0, y: 0}; elem = elem&&elem.parentElement;
      while (elem) {pos.x += elem.scrollLeft; pos.y += elem.scrollTop; elem = elem.parentElement;}
      return pos;
    };
    var getElemPos = function (elem, style) {
      style = style||getComputedStyle(elem);
      return {x: elem.offsetLeft-parseInt(style.marginLeft), y: elem.offsetTop-parseInt(style.marginTop)};
    };
    var getPointerPos = function (ev) {
      var ev0 = (ev.touches && ev.touches.length) ? ev.touches[0] : ev;
      return {x: (ev0.pageX||(ev0.clientX+document.documentElement.scrollLeft)), y: (ev0.pageY||(ev0.clientY+document.documentElement.scrollTop))};
    };
    var onpointermove = function (ev) {if (mod.pointer.target) {var p = getPointerPos(ev); mod.pointer.x = p.x; mod.pointer.y = p.y; onDragMove(ev);}};
    var onDragMove = function (ev) {
      var elem = mod.pointer.target.element, eev = {type: ev.type, target: ev.target, currentTarget: mod.pointer.target, timeStamp: ev.timeStamp};
      elem.drag.out = mod.pointer.x < 0 || mod.pointer.x >= window.innerWidth || mod.pointer.y < 0 || mod.pointer.y >= window.innerHeight;
      if (elem.drag.out || !elem.drag.active) {onDragEnd(eev); return;}
      elem.style.left = (mod.pointer.x-elem.drag.x)+"px"; elem.style.top = (mod.pointer.y-elem.drag.y)+"px";
      if (elem.drag.ondragmove) {elem.drag.ondragmove(eev);}
    };
    var onDragStart = function (ev) {
      var elem = ev.currentTarget.element, clone = elem; ev.preventDefault(); if (mod.pointer.target || !elem.drag.mode || elem.drag.active || ev.button) {return;}
      if (elem.drag.mode != 1) {clone = elem.cloneNode(true); elem.parentNode.insertBefore(clone, elem);} elem.parentNode.appendChild(elem);
      var s, r, p = getPointerPos(ev), style = getComputedStyle(elem);
      if (style.position != "absolute") {
        r = getElemPos(elem, style); s = getAbsoluteScroll(elem);
        elem.style.left = (r.x-s.x)+"px"; elem.style.top = (r.y-s.y)+"px";
        elem.style.position = "absolute";
      }
      mod.pointer.x = p.x; mod.pointer.y = p.y; mod.pointer.target = ev.currentTarget;
      r = getElemPos(elem, style); elem.drag.x = p.x-r.x; elem.drag.y = p.y-r.y;
      elem.drag.source = clone; elem.drag.active = true; elem.drag.out = false; elem.style.right = elem.style.bottom = "";
      if (elem.drag.ondragstart) {elem.drag.ondragstart(ev);}
    };
    var onDragEnd = function (ev) {
      var elem = ev.currentTarget.element; if (!mod.pointer.target || !elem.drag.active) {return;}
      var center = {x: elem.offsetLeft+elem.offsetWidth/2, y: elem.offsetTop+elem.offsetHeight/2};
      elem.drag.out = elem.drag.out || center.x < 0 || center.x >= window.innerWidth || center.y < 0 || center.y >= window.innerHeight;
      if (elem.drag.mode < 4 || elem.drag.out) {
        if (elem.drag.mode == 3 || elem.drag.out) {
          elem.style.left = elem.drag.source.style.left; elem.style.top = elem.drag.source.style.top;
        }
        if (elem.drag.mode != 1) {elem.parentNode.removeChild(elem.drag.source);}
      } else {
        mod.draggable(elem.drag.source, elem.drag.mode, elem.drag.ondragstart, elem.drag.ondragmove, elem.drag.ondragend);
        if (elem.drag.mode < 6) {
          mod.draggable(elem, elem.drag.mode-4, elem.drag.ondragstart, elem.drag.ondragmove, elem.drag.ondragend);
        }
      }
      if (elem.drag.ondragend) {elem.drag.ondragend(ev);}
      elem.drag.active = false; mod.pointer.target = null;
    };
    mod.draggable = function (elem, mode, ondragstart, ondragmove, ondragend, title) {
      if (!(elem instanceof Element)) {return;}
      if (title != null && !elem.querySelector(".draggable")) {
        title = '<div class="draggable" style="margin: 0.2em; width: 100%; height: 2em; line-height: 2em; border-radius: 1em; background-color: rgba(128, 128, 128, 0.7);">'+title+'</div>';
        aa.lay.insertNode(elem, title, 0, 0, 1);
      }
      elem.drag = {mode: mode, ondragstart: ondragstart, ondragmove: ondragmove, ondragend: ondragend, draggable: elem.querySelector(".draggable")||elem};
      elem.drag.draggable.element = elem; elem.drag.draggable.style.cursor = !mode ? 'default' : 'pointer';
      elem.drag.draggable.onmousedown = elem.drag.draggable.ontouchstart = !mode ? null : onDragStart;
      elem.drag.draggable.onmouseup = elem.drag.draggable.ontouchend = !mode ? null : onDragEnd;
    };
    (function ready() {
      if (!aa.evt.setEventListener) {return setTimeout(ready, aa.vars.ms.LISTEN);}
      aa.evt.setEventListener(window, 'mousemove', onpointermove, false); aa.evt.setEventListener(window, 'touchmove', onpointermove, false);
    })();
    return mod;
  })();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ CSS Module.
   * Special subset of module Layout module.
   * To get an element's style object: getComputedStyle(elem, pseudo);
   * To get the value of an element's style property: getComputedStyle(elem, pseudo).getPropertyValue(prop);
   */
  aa.css = aa.css || {};
  aa.css.vars = aa.css.vars || {};

  /**
   * Inspects the document CSS styles and stores the retrieved data in the module container for later use.
   * Properties created in the css container: css.rules: [], css.variables: {}, css.themes: [].
   * rules: Array of all sheet rules.
   * variables: Object with of all variables names mapped to their highest parent rule index in the rules array.
   * themes: Array of all theme definitions found in variable names conforming to the pattern '-theme-themeReference-'.
   */
  aa.css.buildCssRegistry = function () {
    const THEME = 'theme', sheets = [].slice.call(document.styleSheets);
    aa.css.rules = []; aa.css.variables = {}; aa.css.themes = [];
    sheets.forEach((sheet, sheet_i, sheet_a) => {
      let rules = []; try {rules = [].slice.call(sheet.cssRules || []);} catch (er) {}
      rules.forEach((rule, rule_i, rule_a) => {
        aa.css.rules.push(rule);
        for (let i = 0; i < rule.style.length; i++) {
          if (rule.style[i].substring(0, 2) != '--') {continue;}
          aa.css.variables[rule.style[i]] = aa.css.rules.length-1;
          let v = rule.style[i].indexOf('-'+THEME+'-'); if (v == -1) {continue;}
          v = rule.style[i].substring(v+THEME.length+2); v = v.substring(0, v.indexOf('-'));
          if (v) {v = THEME+'-'+v; if (aa.css.themes.indexOf(v) == -1) {aa.css.themes.push(v);}}
        }
      });
    });
  };

  /**
   * Gets the value of a CSS variable, optionally for a given CSS style object.
   * Parameter style can be a rule, an element or a style property directly.
   * If style is undefined, it defaults to the top level document element.
   * If the optional parameter computed is true, and the style is from an element,
   * rather than from a CSS rule, the computed value is returned. If it is a string,
   * the specified pseudo element value is computed.
   */
  aa.css.getCssVariable = function (name, style, computed) {
    style = style || document.documentElement;
    if (computed && style.attributes) {style = getComputedStyle(style, !computed.trim ? null : computed);}
    return (style.style || style).getPropertyValue(name).trim();
  };

  /**
   * Sets the value of a CSS variable, optionally for a given CSS style object.
   * Parameter style can be a rule, an element or a style property directly.
   * If style is undefined, it defaults to the top level document element.
   * If the optional parameter priority is true, the property value is set as 'important'.
   */
  aa.css.setCssVariable = function (name, value, style, priority) {
    style = style || document.documentElement;
    (style.style || style).setProperty(name, (value == null) ? '' : (''+value).trim(), !priority ? '' : 'important');
  };

  /**
   * Replaces variable values containing themed variable references with a new theme definition,
   * changing the style without modifying CSS properties or reloading CSS resources.
   * Style rules, variables and themes are stored in objects by method buildCssRegistry.
   * The optional theme parameter can be the name of a theme or an index in the themes array.
   * If parameter theme is omitted, the style moves cycling through all theme definitions.
   */
  aa.css.changeStyleTheme = function (theme) {
    if (!aa.css.themes) {aa.css.buildCssRegistry();}
    aa.css.vars.themeIndex = aa.css.vars.themeIndex || 0;
    const baseTheme = aa.css.themes[aa.css.vars.themeIndex];
    if (typeof theme == 'string') {theme = aa.css.themes.indexOf(theme);
    } else if (theme == null) {theme = aa.css.vars.themeIndex+1;}
    theme = Number(theme); if (theme < 0) {theme += aa.css.themes.length;}
    aa.css.vars.themeIndex = (!theme || theme < 0 || theme >= aa.css.themes.length) ? 0 : theme;
    theme = aa.css.themes[aa.css.vars.themeIndex];
    const replacer = '-'+theme+'-', search = '-'+baseTheme+'-', searchRE = new RegExp(aa.dat.regexpEscape(search), 'g');
    for (const name in aa.css.variables) {
      if (!aa.css.variables.hasOwnProperty(name)) {continue;}
      const rule = aa.css.variables[name], value = aa.css.getCssVariable(name, aa.css.rules[rule]);
      if (value.includes(search)) {
        aa.css.setCssVariable(name, value.replace(searchRE, replacer).trim(), aa.css.rules[rule]);
      }
    }
  };

  /**
   * Adds, removes or replaces class names in an element's class attribute.
   */
  aa.css.setElementStyleClass = function (elem, addSC, remSC) {
    if (!addSC) {addSC = [];} else if (!addSC.push) {addSC = [addSC];}
    if (!remSC) {remSC = [];} else if (!remSC.push) {remSC = [remSC];}
    if (remSC.length) {elem.classList.remove.apply(elem.classList, remSC);}
    if (addSC.length) {elem.classList.add.apply(elem.classList, addSC);}
  };

  /**
   * Gets the value of a specific property in a multiple style property, like transform or filter.
   */
  aa.css.getMultipleStyle = function (elem, styleProp, prop) {
    styleProp = elem.style[styleProp];
    var value = '', i = styleProp.indexOf(prop+'(');
    if (i != -1) {i += prop.length+1; value = styleProp.substring(i, styleProp.indexOf(')', i));}
    return value;
  };

  /**
   * Sets the value of a specific property in a multiple style property, like transform or filter.
   */
  aa.css.setMultipleStyle = function (elem, styleProp, prop, value) {
    var str = prop+'('+value+')'; if (!elem.style[styleProp]) {elem.style[styleProp] = '';}
    if (elem.style[styleProp].indexOf(prop+'(') != -1) {
      elem.style[styleProp] = elem.style[styleProp].replace(new RegExp(prop+'\(.*\)'), str);
    } else {elem.style[styleProp] += ' '+str;}
  };

  /**
   * Update an element's CSS transform inner property using method css.setMultipleStyle.
   */
  aa.css.getTransform = function (elem, prop) {return aa.css.getMultipleStyle(elem, 'transform', prop);};
  aa.css.setTransform = function (elem, prop, value) {aa.css.setMultipleStyle(elem, 'transform', prop, value);};

  /**
   * Update an element's CSS filter inner property using method css.setMultipleStyle.
   */
  aa.css.getFilter = function (elem, prop) {return aa.css.getMultipleStyle(elem, 'filter', prop);};
  aa.css.setFilter = function (elem, prop, value) {aa.css.setMultipleStyle(elem, 'filter', prop, value);};

  /**
   * Toggles an element's style classes based on a given condition.
   * If the condition is undefined, it defaults to true.
   */
  aa.css.toggleElementStyleClass = function (elem, trueSC, falseSC, cond) {
    elem.classList.remove.apply(elem.classList, [].slice.call(arguments, 1, 3));
    if (!cond && typeof cond != 'undefined') {aa.css.setElementStyleClass(elem, falseSC, trueSC);
    } else {aa.css.setElementStyleClass(elem, trueSC, falseSC);}
  };

  /**
   * Sets an element's style text. If @param style starts with semicolon, the style is appended to the existing.
   */
  aa.css.setElementStyle = function (elem, style) {
    style = style||""; if (style.charAt(0) == ";") {style = (elem.style.cssText+style).replace(/;;/g, ";");}
    elem.style.cssText = style;
  };

  /**
   *
   */
  aa.css.setElementStyleRule = function (elem, rule, value) {
    elem.style[rule] = value;
  };

  /**
   *
   */
  aa.css.stringifyCSS = function (cssObject) {
    return "{"+Object.keys(cssObject).map(function (p) {return p+":"+cssObject[p]+";";}).join("")+"}";
  };

  /**
   *
   */
  aa.css.getCSSSheet = function (sheet) {
    var sheets = document.styleSheets||[]; if (sheet == null) {sheet = -1;} if (sheet < 0) {sheet += sheets.length;}
    if (sheet > -1 && sheet < sheets.length) {sheet = sheets[sheet];} else {sheet = null;}
    return sheet;
  };

  /**
   *
   */
  aa.css.getCSSSheetRules = function (sheet) {
    var rules = []; if (!isNaN(sheet)) {sheet = aa.css.getCSSSheet(sheet);}
    if (sheet) {rules = sheet.rules||sheet.cssRules||[];}
    return rules;
  };

  /**
   *
   */
  aa.css.getCSSSheetRule = function (selector, sheet) {
    var rule = null, rules = aa.css.getCSSSheetRules(sheet);
    for (var i = rules.length-1; i > -1; i--) {
      if (rules[i].selectorText == selector) {rule = rules[i]; break;}
    }
    return rule;
  };

  /**
   *
   */
  aa.css.getCSSSheetStyles = function (selector, sheet) {
    var i, j, rules, sheets = document.styleSheets||[], styles = [];
    if (!isNaN(sheet)) {sheet = aa.css.getCSSSheet(sheet); sheets = !sheet ? [] : [sheets[sheet]];}
    for (i = 0; i < sheets.length; i++) {
      rules = aa.css.getCSSSheetRules(sheets[i]);
      for (j = 0; j < rules.length; j++) {
        if (rules[j].selectorText == selector && rules[j].style) {styles.push(rules[j].style);}
      }
    }
    return styles;
  };

  /**
   *
   */
  aa.css.getCSSsheetValue = function (selector, prop, sheet) {
    var value = null, styles = aa.css.getCSSSheetStyles(selector, sheet);
    for (var i = styles.length-1; i > -1; i--) {if (styles[i][prop]) {value = styles[i][prop]; break;}}
    return value;
  };

  /**
   *
   */
  aa.css.addCSSSheetRule = function (selector, css, sheet) {
    if (!isNaN(sheet)) {sheet = aa.css.getCSSSheet(sheet);}
    if (css && css.constructor != String) {css = aa.css.stringifyCSS(css);}
    if (selector && css && sheet) {sheet.insertRule(selector+" "+css, aa.css.getCSSSheetRules(sheet).length);}
  };

  /**
   *
   */
  aa.css.getCSSVarString = function (name) {return aa.css.getCSSVar(name).replace(/\\/g, '').slice(1, -1).trim();};

  /**
   *
   */
  aa.css.getCSSConfigVar = function () {
    let config = {};
    try {config = eval('('+aa.css.getCSSVarString('--const-config')+')');} catch (er) {}
    return config;
  };

  /**
   *
   */
  aa.css.getZoom = function (elem) {
    var style = getComputedStyle(elem), zoom = style.zoom;
    if (zoom == undefined) {zoom = aa.css.getTransform(elem, "scale");}
    return parseFloat(zoom)||1;
  };

  /**
   *
   */
  aa.css.setZoom = function (elem, value) {
    if (getComputedStyle(elem).zoom == undefined) {aa.css.setTransform(elem, "scale", value);
    } else {elem.style.zoom = value;}
  };

  /**
   * Set the foreground color of a select element to the selected option color.
   * Invoke on value updates and change events.
   */
  aa.css.updateSelectColor = function (elem) {
    if (elem && elem.options) {elem.style.color = elem.options[elem.selectedIndex].style.color;}
  };

  /**
   * CSS var polyfill.
   * Used for IE mainly.
   */
  aa.css.polyVar = (function () {
    var mod = {
      supported: (window.CSS && window.CSS.supports && window.CSS.supports("(--varname: 0)")),
      replaceCSS: function (css, vars) {
        if (css && vars) {for (var n in vars) {css = css.replace(new RegExp("var\\(\\s*"+n+"\\s*(,[^\\)]+)*\\)", "g"), vars[n]);}}
        return css;
      }
    };
    if (!mod.supported) {
      var cssId = "replacedCSSVarsStyle", ignoreRule = ".-ignore-", cssLoading = 0, cssNodes = [], cssRules = [], cssVars = {};
      var setVars = function (css) {
        var matches = css.match(/--[A-Za-z_][A-Za-z0-9_-]*\s*:[^;}]+;?/g)||[]; // Name 0, value 1:
        matches.forEach(function (match) {match = match.split(/:\s*/); cssVars[match[0]] = match[1].replace(/;/, "");});
      };
      var setRules = function (css) {
        var i, j = 0;
        while ((i = css.indexOf("var(", j)) > 0
          && (css.charAt(i-1) == ":" || css.charCodeAt(i-1) == 160 || css.charCodeAt(i-1) < 48)
          && (j = css.indexOf("}", i)+1) && css.lastIndexOf("{", i) != -1
        ) {i = css.lastIndexOf("}", i)+1; cssRules.push(css.substring(i, j));}
      };
      var setCSS = function (css) {
        css = (css||"").replace(new RegExp(ignoreRule+"[^{]*{[^}]*}", "g"), ""); setVars(css); setRules(css);
      };
      var setLink = function (url) {
        var xhr = new XMLHttpRequest(); xhr.open('GET', url, true); if (xhr.overrideMimeType) {xhr.overrideMimeType("text/css");}
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = function () {
          cssLoading--; if (xhr.status >= 200 && xhr.status < 400) {setCSS(xhr.responseText);}
        };
        cssLoading++; xhr.send();
      };
      var replaceVars = function () {
        if (cssLoading) {return setTimeout(replaceVars, aa.vars.ms.LISTEN);}
        var css = "", style = document.getElementById(cssId);
        if (!style) {style = document.createElement('style'); style.type = "text/css"; style.id = cssId;}
        for (var i = 0; i < cssRules.length; i++) {css += "\n/*RR"+(i+1)+"*/ "+mod.replaceCSS(cssRules[i], cssVars);}
        style.innerHTML = css; document.head.appendChild(style);
      };
      var findVars = function (styles) {
        var find = 0;
        for (var i = 0; i < styles.length; i++) {
          if (cssNodes.indexOf(styles[i]) == -1) {
            find++; cssNodes.push(styles[i]);
            if (styles[i].nodeName.toUpperCase() == 'STYLE') {setCSS(styles[i].innerHTML);
            } else if (styles[i].nodeName.toUpperCase() == 'LINK') {setLink(styles[i].getAttribute('href'));}
          }
        }
        return find;
      };
      mod.updateCSS = function (find) {
        var styles = document.querySelectorAll("style:not(#"+cssId+"),link[type='text/css']");
        if (!find) {find = styles.length-cssNodes.length;}
        if (find) {find = findVars(styles); if (find) {replaceVars();}}
        return find;
      };
      mod.resetCSS = function () {cssNodes = []; cssRules = []; cssVars = {}; mod.updateCSS();};
      (function watchCSS() {
        setTimeout(watchCSS, (document.body && !self.loading && !cssLoading && !mod.updateCSS()) ? aa.vars.ms.UPDATE : aa.vars.ms.LISTEN);
      })();
    } else {mod.updateCSS = mod.resetCSS = function () {};}
    return mod;
  })();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Util Module.
   */
  aa.util = aa.util||{};

  /**
   * Returns a number found in a string, prefixed with a given pattern. Only one occurrence is checked.
   * Example: With prefix 'item-', if the text contains 'item-0' returns 0, if not found, returns -1.
   */
  aa.util.parseIndex = function (pre, txt) {
    txt = txt.match(new RegExp(aa.dat.regexpEscape(pre)+"\\d+", ""));
    if (txt && txt.length) {txt = Number(txt[0].match(/\d+/)[0]);} else {txt = -1;}
    return txt;
  };

})();
