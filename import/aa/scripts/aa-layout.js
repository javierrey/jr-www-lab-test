// /import/aa/scripts/aa-layout.js
// require aa-core.js, aa-flow.js
/**
 * JAZ library script.
 */
(function () { "use strict";

  /**
   * JAZ Polyfills.
   */

  if (!('head' in document)) {document['head'] = document.getElementsByTagName('head')[0];}

  if (!NodeList.prototype.forEach) {NodeList.prototype.forEach = Array.prototype.forEach;}

  if (!Element.prototype.matches) {
    Element.prototype.matches = function (s) {
      var matches = document.querySelectorAll(s), i = matches.length;
      while (--i >= 0 && matches.item(i) != this) {}
      return i > -1;
    };
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this; if (!document.documentElement.contains(el)) {return null;}
      do {
        if (el.matches(s)) {return el;}
        el = el.parentElement || el.parentNode;
      } while (el != null && el.nodeType == 1);
      return null;
    };
  }

  if (!DOMTokenList.prototype.replace) {
    DOMTokenList.prototype.replace = function (oldName, newName) {
      this.remove(oldName); this.add(newName);
    };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Application Module.
   */
  aa.app = aa.app||{};

  /**
   * JAZ Application Texts submodule object. Holds all localized texts. Defined as a root module for ease of access.
   */
  aa.texts = aa.texts||{};

  /**
   * Gets a resource result or response. If it's a JSON string, it is converted to an object.
   */
  aa.app.getResult = function (resource) {
    if (!resource) {resource = {};}
    return aa.dat.parse(resource.output||resource.result||resource.response||resource.returnValue);
  };

  /**
   * Instrumental function to filter either an array or a map of resources by their request URI or timestamp.
   * Resources in array should contain the url/src/href or time properties, defined by loader functions.
   * Either uri or time are optional, if not provided, any resource will match.
   * Parameter resources can be undefined, if not provided, the map aa.app.resources will be used.
   * The given URI can be contained in the resource URL: '/folder/file.json' in 'http://host/folder/file.json'.
   * The optional timestamp parameter is useful for identifying multiple resources with the same URL.
   */
  aa.app.findResources = function (resources, uri, time) {
    uri = aa.app.urlCore(uri, 2); if (!resources) {resources = aa.app.resources||{};}
    var i, j, k = Object.keys(resources), ua, match = [];
    for (i = 0; i < k.length; i++) {
      j = k[i]; ua = resources[j].url; if (ua && ua.constructor == String) {}
      if (resources[j]
        && (!uri || aa.app.urlCore(resources[j].url||resources[j].src||resources[j].href, 2).indexOf(uri) != -1)
        && (!time || resources[j].time == time)
      ) {match.push(resources[j]);}
    }
    return match;
  };

  /**
   * Finds a resource in map aa.app.resources by its URI, which is handled by function aa.app.loadResources.
   * The given URI can be contained in the resource URI: '/file.json' in '/folder/file.json'.
   * This function returns the first match, for multiple resources with a common URI use function aa.app.findResources.
   */
  aa.app.findResource = function (uri) {
    uri = aa.app.urlCore(uri, 2); aa.app.resources = aa.app.resources||{};
    for (var u in aa.app.resources) {if (aa.app.urlCore(u, 2).indexOf(uri) != -1) {return aa.app.resources[u];}}
    return null;
  };

  /**
   * Finds a resource result in map aa.app.resources by its URI, using function aa.app.findResource.
   */
  aa.app.getResourceResult = function (uri) {return aa.app.getResult(aa.app.findResource(uri));};

  /**
   * Removes a resource from map aa.app.resources, and its related document element if exists.
   * If the element is not present in map aa.app.resources but exists in the document, is is removed anyway.
   */
  aa.app.removeResource = function (uri) {
    uri = aa.app.urlCore(uri);
    var elem = document.querySelector("link[href*='"+uri+"']");
    if (!elem || !elem.parentNode) {elem = document.querySelector("[src*='"+uri+"']");}
    if (elem && elem.parentNode) {elem.parentNode.removeChild(elem);}
    delete aa.app.resources[uri];
  };

  /**
   * Returns a module's active instances array.
   */
  aa.app.getInstances = function (mod) {
    if (!mod || !mod.newInstance) {return null;}
    var i, ins, arr = [];
    for (i = 0; i < mod.instances; i++) {ins = mod["i"+i]; if (ins && ins.module == mod) {arr.push(ins);}}
    return arr;
  };

  /**
   * Removes a module's instance.
   * @param ins, Object/String: An existing module's instance.
   * @return String: The removed instance name, or null if nothing was removed.
   * The instance module must have been previously loaded with function aa.app.loadModule, and the instance must have
   * been previously created with function aa.app.newInstance.
   * If the module contains a method named dropInstance, it is invoked being passed the instance as parameter.
   * The dropInstance method is a convenient place to remove the instance's events and document content:
   * aa.lay.removeNode(ins.content);
   */
  aa.app.dropInstance = function (ins) {
    ins = ins||{}; var mod = ins.module||{}, name = ins.id;
    if (mod[name]) {mod.dropInstance && mod.dropInstance(ins); delete mod[name];} else {name = null;}
    return name;
  };

  /**
   * Unloads a module, destroying the module object, its instances and its event listeners.
   * Note: Module Main is not meant to be removed, and cannot be re-loaded afterwards.
   */
  aa.app.unloadModule = function (mod) {
    if (!mod || !mod.newInstance) {return;}
    var i, name = mod.moduleName;
    for (i = 0; i < mod.instances; i++) {aa.app.dropInstance(mod["i"+i]);}
    for (i in aa.evt.on) {delete aa.evt.on[i][name];}
    if (mod.destroy) {mod.destroy(); delete mod.destroy;}
    aa.app.modules[name] = aa[name] = undefined; delete aa.app.modules[name]; delete aa[name];
  };

  /**
   * Gets a cookie value.
   */
  aa.app.getCookie = function (name) {
    var ca = document.cookie.split(';'); name += "=";
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i]; while (c.charAt(0) == ' ') {c = c.substring(1);}
      if (c.indexOf(name) == 0) {return c.substring(name.length, c.length);}
    }
    return "";
  };

  /**
   * Sets a cookie value.
   */
  aa.app.setCookie = function (name, value, days, path) {
    var expires = "";
    if (!isNaN(days)) {
      var date = new Date(); date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toUTCString();
    }
    document.cookie = name+"="+value+expires+"; path="+(path||"/");
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * JAZ Layout Module.
   */
  aa.lay = aa.lay||{};

  /**
   * Instrumental utility to generate a unique selector for a given DOM element.
   * Generated selector example: "html>body>*:nth-child(2)>*:nth-child(1)>*:nth-child(3)>*:nth-child(1)"
   * @return String. A selector string is non-live, i.e. valid as long as the related document structure is not altered.
   */
  aa.lay.getSelector = function (elem) {
    var i, ele_nth, sib_nth, siblings, name, sel = "";
    while (elem && elem.parentNode && elem.localName) {
      if (!elem.id) {
        name = elem.localName.toLowerCase(); if (["html", "head", "body"].indexOf(name) == -1) {name = "*";}
      } else {name = "#"+elem.id;}
      ele_nth = 0; sib_nth = 0; siblings = elem.parentNode.children||[];
      for (i = 0; i < siblings.length; i++) {
        if (siblings[i] == elem) {
          ele_nth = i+1; if (sib_nth) {break;}
        } else if (name == "*" || "#"+(siblings[i].id||"") == name || (siblings[i].localName||"").toLowerCase() == name) {
          sib_nth = i+1; if (ele_nth) {break;}
        }
      }
      if (sib_nth) {name += ":nth-child("+ele_nth+")";}
      sel = name+(sel ? ">"+sel : "");
      elem = elem.parentNode;
    } // console.log("getSelector: "+sel);
    return sel;
  };

  /**
   * Short alias for function element.querySelector.
   * Accepts extended syntax for scoped selectors, ">...".
   * If the query is illegal, returns false, rather than null.
   * Uses function aa.lay.getSelector for scoped selectors.
   */
  Element.prototype['qso'] = function (sel) {
    try {return (sel.charAt(0) == ">") ? document.querySelector(aa.lay.getSelector(this)+sel) : this.querySelector(sel);} catch (er) {return false;}
  };

  /**
   * Short alias for function element.querySelectorAll.
   * Accepts extended syntax for scoped selectors, ">...".
   * If the query is illegal, returns an empty Array, rather than an empty NodeList.
   * Uses function aa.lay.getSelector for scoped selectors.
   */
  Element.prototype['qsa'] = function (sel) {
    try {return (sel.charAt(0) == ">") ? document.querySelectorAll(aa.lay.getSelector(this)+sel) : this.querySelectorAll(sel);} catch (er) {return [];}
  };

  /**
   * Short alias for function document.querySelector.
   * Uses function element.qso for scoped selectors.
   */
  window.qso = function (sel) {try {return (sel.charAt(0) == ">") ? document.documentElement.qso(sel) : document.querySelector(sel);} catch (er) {return false;}};

  /**
   * Short alias for function document.querySelectorAll.
   * Uses function element.qsa for scoped selectors.
   */
  window.qsa = function (sel) {try {return (sel.charAt(0) == ">") ? document.documentElement.qsa(sel) : document.querySelectorAll(sel);} catch (er) {return [];}};

  /**
   * Short alias for function document.getElementById.
   * Accepts hash prefixed ids.
   */
  window.qid = function (id) {return document.getElementById((""+id).replace("#", ""));};

  /**
   * Creates HTML elements or nodes from an HTML string and returns a node list of the created content.
   */
  aa.lay.createNode = function (html) {
    var div = document.createElement('div'); div.innerHTML = (html||"");
    return div.childNodes;
  };

  /**
   * Finds an element's position among its sibling nodes.
   * Optionally, use @param st = true to strictly count elements and skip non-element nodes.
   */
  aa.lay.siblingPosition = function (elem, st) {
    var i = -1; if (elem && elem.parentNode) {i = 0; while((elem = elem.previousSibling)) {if (!st || elem.tagName) {i++;}}}
    return i;
  };

  /**
   * Calculates the actual node position in a document container, from a given element position.
   * If position is negative, counts from the end, being -1 the position after the last element.
   */
  aa.lay.calculateNodePosition = function (parent, epos) {
    if (epos < 0) {epos += parent.children.length+1;} if (epos < 0) {epos = 0;} if (epos > parent.children.length) {epos = parent.children.length;}
    for (var i = 0; i <= epos && i < parent.childNodes.length; i++) {if (!parent.childNodes[i].tagName) {epos++;}}
    return epos;
  };

  /**
   * Calculates the element position in a document container, from a given node position.
   * If position is negative, counts from the end, being -1 the position after the last node.
   * Counts the elements up to but not including the given node position. If the given position is not occupied by an
   * element, the next element position is returned, or the length of child elements, if no element is found behind.
   */
  aa.lay.calculateElementPosition = function (parent, npos) {
    var epos = 0, len = parent.childNodes.length;
    if (npos < 0) {npos += len+1;} if (npos < 0) {npos = 0;} if (npos > len) {npos = len;}
    for (var i = 0; i < npos; i++) {if (parent.childNodes[i].tagName) {epos++;}}
    return epos;
  };

  /**
   * Inserts an element or node in a document container at a given position among its child elements.
   * The element parameter can also be an HTML string or an Array or NodeList of elements to be inserted at once.
   * If position is null, the parent element is cleared and the element replaces the previous content.
   * If position is negative, counts from the end. Position 0 prepends the element, position -1 appends the element.
   * If optional @param anp = true and the given position is not null, the position is interpreted as a node position,
   * rather than an element position.
   * If optional @param fun is defined, as a function or as a boolean true, the in-line javascripts are executed and
   * then removed. If it is a function, it will be invoked, being passed the array of loaded resources.
   * If the element is already in the document chain, it is moved to the new location.
   * When the element is a list that contains multiple existing children to be moved inside the container, the insertion
   * order can be unpredictable.
   * Returns an array of the inserted nodes.
   */
  aa.lay.insertNode = function (parent, elem, pos, anp, fun) {
    var elems = []; if (!parent || parent == document) {parent = document.body;}
    if (!elem) {elem = [];
    } else if (elem.constructor == String) {elem = aa.lay.createNode(elem);
    } else if (!('length' in elem.constructor.prototype)) {elem = [elem];}
    if (pos == null) {pos = -1; parent.innerHTML = "";
    } else if (!anp) {pos = aa.lay.calculateNodePosition(parent, pos);}
    var insertNode = function (par, el, po) {
      var len = par.childNodes.length; if (po < 0) {po += len+1;} if (po < 0) {po = 0;}
      if (po >= len) {par.appendChild(el);} else {par.insertBefore(el, par.childNodes[po]);}
      return el;
    };
    for (var i = elem.length-1; i > -1; i--) {elems.unshift(insertNode(parent, elem[i], pos));}
    if (fun) {
      aa.app.registerLoadedResources(parent);
      aa.app.runInlineJavascripts(parent);
      aa.app.loadInlineJavascripts(parent, (typeof fun == 'function') ? fun : null);
    }
    return elems;
  };

  /**
   * Removes an element or node in a document container.
   * The element parameter can also be an Array or NodeList of elements to be removed at once.
   */
  aa.lay.removeNode = function (elem) {
    if (!elem || !('length' in elem.constructor.prototype)) {elem = [elem];}
    for (var i = elem.length-1; i > -1; i--) {var el = elem[i]; if (el && el.parentNode) {el.parentNode.removeChild(el);}}
  };

  /**
   * Finds an element's ancestor matching a query selector.
   */
  aa.lay.getAncestor = function (elem, selector) {
    while (elem) {elem = elem.parentElement; if (!selector || (elem && elem.matches(selector))) {return elem;}}
    return null;
  };

  /**
   * Check if an element is descendant of another element.
   */
  aa.lay.isDescendant = function (elem, ancestor) {
     while (elem) {elem = elem.parentElement; if (elem == ancestor) {return true;}}
     return false;
  };

  /**
   * Gets the absolute scroll position of an element in the DOM chain.
   */
  aa.lay.getAbsoluteScroll = function (elem, fromelem) {
    var pos = {x: 0, y: 0}; elem = elem&&elem.parentElement;
    while (elem) {pos.x += elem.scrollLeft; pos.y += elem.scrollTop; elem = elem.parentElement;}
    if (fromelem) {var fpos = aa.lay.getAbsoluteScroll(fromelem); pos.x -= fpos.x; pos.y -= fpos.y;}
    return pos;
  };

  /**
   * Gets the absolute position of an element in the DOM chain.
   * @param elem. The element whose absolute position is calculated.
   * @param style. Optional element's getComputedStyle to subtract the margin from the position.
   * @param scroll. Optional boolean to subtract getAbsoluteScroll.
   * @param fromelem. Optional. Another document's element to subtract its absolute position.
   */
  aa.lay.getAbsolutePosition = function (elem, style, scroll, fromelem) {
    var fpos, pos = {x: 0, y: 0};
    while (elem) {pos.x += elem.offsetLeft; pos.y += elem.offsetTop; elem = elem.offsetParent;}
    if (style) {pos.x -= parseInt(style.marginLeft); pos.y -= parseInt(style.marginTop);}
    if (scroll) {fpos = aa.lay.getAbsoluteScroll(elem, fromelem); pos.x -= fpos.x; pos.y -= fpos.y;}
    if (fromelem) {fpos = aa.lay.getAbsolutePosition(fromelem, style, scroll); pos.x -= fpos.x; pos.y -= fpos.y;}
    return pos;
  };

  /**
   * Clones and replaces an element without events attached.
   */
  aa.lay.resetElement = function (elem) {
    if (!elem || !elem.parentNode) {return null;}
    var clone = elem.cloneNode(true);
    elem.parentNode.replaceChild(clone, elem);
    return clone;
  };

  /**
   * Detects the default scroll bars width in the document.
   */
  aa.lay.detectScrollBarsWidth = function () {
    var ctr = document.createElement("div"), ctt = document.createElement("div");
    ctr.style.overflowY = "auto"; ctr.style.width = ctr.style.height = "100px"; ctt.style.width = "100%"; ctt.style.height = "10px";
    document.body.appendChild(ctr); ctr.appendChild(ctt);
    var width = ctt.offsetWidth; ctt.style.height = "200px"; width -= ctt.offsetWidth;
    ctr.parentNode && ctr.parentNode.removeChild(ctr);
    return width;
  };

  /**
   * Select text in an element.
   */
  aa.lay.selectText = function (elem, start, end, noFocus) {
    if (!elem) {return;} else if (!noFocus) {elem.focus();}
    start = aa.dat.resolveIndex(elem.value||elem.innerText, start||0);
    end = aa.dat.resolveIndex(elem.value||elem.innerText, (end == null) ? -1 : end);
    if (elem.setSelectionRange) {elem.setSelectionRange(start, end);
    } else if (document.createRange && self.getSelection) {
      var getTextNodes = function (node) {
        var textNodes = [];
        if (node.nodeType != 3) {
          var children = node.childNodes;
          for (var i = 0, len = children.length; i < len; i++) {
            textNodes.push.apply(textNodes, getTextNodes(children[i]));
          }
        } else {textNodes.push(node);}
        return textNodes;
      };
      var range = document.createRange(), textNodes = getTextNodes(elem);
      var foundStart = false, charCount = 0, endCharCount;
      range.selectNodeContents(elem);
      for (var i = 0, textNode; (textNode = textNodes[i++]);) {
        endCharCount = charCount + textNode.length;
        if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i <= textNodes.length))) {
          range.setStart(textNode, start-charCount); foundStart = true;
        }
        if (foundStart && end <= endCharCount) {range.setEnd(textNode, end-charCount); break;}
        charCount = endCharCount;
      }
      var sel = self.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(elem);
      textRange.collapse(true);
      textRange.moveEnd('character', end);
      textRange.moveStart('character', start);
      textRange.select();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * AA Event Module.
   */
  aa.evt = aa.evt||{};

  /**
   * Trigger an event on an element. Examples:
   * aa.evt.dispatch(domElement, 'mouseup', 'MouseEvent');
   * aa.evt.dispatch(window, 'resize', 'UIEvent');
   * Event types: Event, UIEvent, MouseEvent, KeyboardEvent, TouchEvent, MutationEvent, HTMLEvent, ErrorEvent.
   *
   */
  aa.evt.dispatch = function (elem, evt, type, props) {
    var i, evObj; if (!elem || !(type || evt in elem.constructor.prototype || 'on'+evt in elem.constructor.prototype)) {return;}
    if (elem == window && !type) {elem.dispatchEvent(new Event(evt));
    } else if (document.dispatchEvent) { // Event, UIEvent, MouseEvent, KeyboardEvent, TouchEvent, MutationEvent, HTMLEvent, ErrorEvent
      evObj = document.createEvent(type||'Event');
      if (props) {for (i in props) {try {evObj[i] = props[i];} catch (er) {}}} // console.log("evt.dispatch prop ", er.message);
      evObj.initEvent(evt, true, false);
      elem.dispatchEvent(evObj);
    } else if (document.fireEvent) {
      evObj = document.createEventObject();
      if (props) {for (i in props) {try {evObj[i] = props[i];} catch (er) {}}}
      elem.fireEvent('on'+evt, evObj);
    }
  };

  /**
   * Listens for a value returned by function 'when' and calls function 'then' when the value is modified.
   * Listener can optionally be limited to one occurrence by param 'once', default false.
   * Optional param time determines the listener frequency, default 300 ms.
   * Function 'when' must return the value of a variable, property or function.
   * Funtion 'then' is passed the new and old values as parameters.
   * The listener can be cancelled invoking clearInterval on the returned intervalId value.
   */
  aa.evt.change = function (when, then, once, time) {
    var listener = function () {
      var val = when();
      if (val != old) {
        then(val, old); old = val; if (once) {clearInterval(intervalId);}
      }
    };
    var old = when(), intervalId = setInterval(listener, time||aa.vars.ms.WATCH);
    return intervalId;
  };

  /**
   * Ensures a function is invoked when the document or any custom defined condition is ready.
   * @param when, Function/null: Function to extend the ready condition.
   * @param then, Function: The function to be executed when the document is ready.
   * If only one parameter is defined, it becomes the function 'then', and the function 'when' becomes null.
   * Example of when: function () {return window.$ && document.querySelector('#domElementId');}
   */
  aa.evt.ready = function (when, then) {
    if (!then) {then = when; when = null;}
    var now = new Date().getTime(), time = (arguments.length > 2) ? arguments[2] : now;
    if (now-time < aa.vars.ms.TIMEOUT) {
      if (!document.body || (when && !when())) {setTimeout(function () {aa.evt.ready(when, then, time);}, aa.vars.ms.LISTEN);
      } else {then();}
    } // else {console.log("ready timeout: ", when, then);} // Hide/Show
  };

  /**
   * Gives focus to an element. Use optional @param force true for immediate wheel scrolling in some cases.
   */
  aa.evt.setFocus = function (elem, force) {
    setTimeout(function () {
      if (!elem || !elem.parentNode) {return;}
      if (elem.tabIndex == null) {elem.tabIndex = -1;}
      elem.focus();
      if (force) {
        var child = document.createElement("div");
        child.setAttribute("style", "position: fixed; oveflow: hidden; width: 1px; height: 1px; left: -1px;");
        elem.appendChild(child);
        setTimeout(function () {
          child&&child.parentNode&&child.parentNode.removeChild(child);
          if (force > 1) {aa.evt.setFocus(elem, force);} // Show/Hide. Use force 2 for repetitive updates.
        }, aa.vars.ms.UPDATE);
      }
    }, 0);
  };

  /**
   * Disables right click context menu.
   */
  aa.evt.disableContextMenu = function (reenable) {
    if (!aa.evt.preventDefault) {aa.evt.preventDefault = function (ev) {ev.preventDefault();};}
    aa.evt.setEventListener(document, 'contextmenu', aa.evt.preventDefault, false, reenable ? -1 : 0);
  };

  /**
   * Selects files from a file dialogue and reads their contents using aa.dat.readFile.
   */
  aa.evt.selectFileContent = function (ev, format, fun) { // console.log("selectFileContent '"+format+"'", ev); // file to content
    if (!ev.target.files.length && fun) {fun(null);}
    for (var i = 0; i < ev.target.files.length; i++) {aa.dat.readFile(ev.target.files[i], format, fun);}
  };

  /**
   * Selects files from a file dialogue.
   * If @param urlPrefix is defined, selects a list of URLs with the path names of the selected files. Example:
   * <input type="file" multiple="multiple" onchange="
   *   aa.evt.selectFileName(event, "./store/", function (res) {aa.mm.loadMedia(videoElem, res);});
   * "/>
   * Otherwise, the list of files is used.
   */
  aa.evt.selectFileName = function (ev, urlPrefix, fun) { // console.log("selectFileName '"+urlPrefix+"'", ev);
    var resources = [];
    if (urlPrefix) { // files to urls
      for (var i = 0; i < ev.target.files.length; i++) {resources.push(urlPrefix+ev.target.files[i].name);}
    } else {resources =  ev.target.files;}
    if (fun) {fun(resources);}
  };

  /**
   * Selects files from a file dialogue.
   */
  aa.evt.selectFile = function (ev, fun) {if (fun) {fun(ev.target.files);}};

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Runs layout related functions on document ready.
   */
  (function ready() {
    if (!document.body) {return setTimeout(ready, aa.vars.ms.LISTEN);}
    aa.vars.scrollBarsWidth = aa.lay.detectScrollBarsWidth(); // console.log("scrollBarsWidth "+aa.vars.scrollBarsWidth);
  })();

})();
