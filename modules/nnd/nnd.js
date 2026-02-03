// nnd/nnd.js // require none
// Copyright 2018 javier.rey.eu@gmail.com
// _@ts-check
(function module() { 'use strict';

  // Globals and polyfills:

  if (!Math.tanh) {
    Math.tanh = function (x) {
      var a = Math.exp(+x), b = Math.exp(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a-b)/(a+b);
    };
  }

  if (!('replace' in DOMTokenList.prototype)) {
    DOMTokenList.prototype.replace = function (oldName, newName) {
      this.remove(oldName); this.add(newName);
    };
  }

  if (!CanvasRenderingContext2D.prototype.ellipse) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, rx, ry, rot, a0, a1, ccw) {
      this.save(); this.translate(x, y); this.rotate(rot); this.scale(rx, ry); this.arc(0, 0, 1, a0, a1, ccw); this.restore();
    };
  }

  // Imports and cloned import members:

  /** Ported from core.js. */
  const merge = (tgt, ...srcs) => {
    const set = (o, k, v) => { v === undefined ? delete o[k] : (o[k] = v); };
    const isObj = (v) => !!v && [Object, undefined].includes(v.constructor);
    const travs = (o, k, v) => isObj(o[k]) && isObj(v) && v !== globalThis;
    const travel = (t, s) => s !== t && Object.entries(s)
      .forEach(([k, v]) => travs(t, k, v) ? travel(t[k], v) : set(t, k, v));
    tgt = Object.assign(tgt ?? {});
    srcs.forEach((src) => { src = Object.assign(src ?? {}); travel(tgt, src); });
    return tgt;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Initialize module:

  self.aa ??= {};
  aa.nn?.destroy?.();
  self.nn = aa.nn ??= {};
  nn.vars = {};
  nn.ini = merge({}, self.input);

  //

  nn.vars.basePath = (self.location && location.host) ? '//'+location.host+location.pathname :
    process.mainModule.filename.slice(0, (process.mainModule.filename.lastIndexOf('/')+1)||(process.mainModule.filename.lastIndexOf('\\')+1))
      .replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/')
  ;
  nn.vars.ms = {FRAME: 16, PLAY: 33, LISTEN: 66, WATCH: 300, REFRESH: 600, UPDATE: 2e3, WAIT: 9e3, TIMEOUT: 3e4, FORGET: 4e5};

  //

  nn.vars.beep = new Audio('data:audio/wav;base64,UklGRkkDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSUDAACaiGOgVm+pbYOahVSfbGmeeoeFj16ZaWqnbYGViliiZXGfaYiafl2pV3mdbYGefWGkUYeWb4abcmilU4mPc4acbnGdU5GLcoedZnyYUpiIcoueXoiMU6J/do+YV5OCWal2dpaPVaJxZqdufZaGWKZlc6Juf5h8X6ZfgJxsfpxzaaZYhZdtgZ1sb6RTj5NqhZdybqNSjZNoi5N4Z6RSiZdojJZvbaVIlo9njpdodp5Gnohsi5xgfZxHooBxjZlbiI9NqHdyjZdckYZRqHN2kJZZlX5YqG95k5BZnnBipm19lolZpmJwoml/m39grFOBmmmFnHlmpk6KlW6InGpwoU6Tj26KnmN6mU+ajG+Mml6ElFGignCNlmWBl0uig3GOlWp4nUuigm+RlWSElUeqeHOUlV2NiUytdHaSmFeUgVGtb3uVkVaccluua3+UjFeibGSpaIGViFqkYm6nZ4SXf1+oWXqgZoWbdmanT4qWZ4ida3OiR5mKbI2bY3ycSp6FbY2cXIiQTqWAbpCWWZOGU6Z7cZSSWJl/WKpyeJOSXZOCU69xe5CSX42JUrFvepOQW5l7VrZof5aMVqJxX7JpgJWMVKdoa61mhJeDWatcd6hmhZWBXqxXfqBliJd9Y6pRh5pniJp2a6ZLkJFrjJtrdp5Hnoduj5pfhpJIqXtzj5Zbj4hQqHZ2kpNXmXxZqHN4lY1XnnFhqnF4l4VZpGtpqWl/kolboW1krWWDj45cnXBhrmSElYlap2BqrV+Kl4JZqld2p2OHmn5brE+CoWSLmXVlq0qNmGaMmnFpp0mWkWeMmW5ypEaaimuQmWZ7mkijgm6PmV+KkEqpdnKUlliYe1OtbnqUkVWfcVyqbHuYiliiZWiobH6ZgFulXnGlaYGbeV6lV3yiZIaTfl6mWXekYYmOhVqnW3WmYIqTfF+tTIOeXo+XdmOsRoyWZYyacGioQ5eOZo6ZaHSiQZ+Ha4+YY3qdQ6SBbo2ZYoKTRql7cpGVXI2JTqxydZSVWJp3Vq9sfZeLVaZoZ6tngpiGWKpecqdngpp+X6pWfaFohZx1ZqdShpxoh5tu');

  nn.vars.AND = JSON.stringify({name:'AND',learningRate:0.4,learningMatch:0.004,activationMethod:'Sigmoid',minInputValue:0,maxInputValue:1,minOutputValue:0,maxOutputValue:1,minDomainValue:-1,maxDomainValue:1,bias:1,freezeBias:0,training:0,convergence:0,layers:[[{targets:[1,0,0,1]},{targets:[1,0,1,0]},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{targets:[1,0,0,0]}]]});
  nn.vars.OR = JSON.stringify({name:'OR',learningRate:0.4,learningMatch:0.004,activationMethod:'Sigmoid',minInputValue:0,maxInputValue:1,minOutputValue:0,maxOutputValue:1,minDomainValue:-1,maxDomainValue:1,bias:1,freezeBias:0,training:0,convergence:0,layers:[[{targets:[1,0,0,1]},{targets:[1,0,1,0]},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{targets:[1,0,1,1]}]]});
  nn.vars.XOR = JSON.stringify({name:'XOR',learningRate:0.4,learningMatch:0.004,activationMethod:'Sigmoid',minInputValue:0,maxInputValue:1,minOutputValue:0,maxOutputValue:1,minDomainValue:-1,maxDomainValue:1,bias:1,freezeBias:0,training:0,convergence:0,layers:[[{targets:[1,0,0,1]},{targets:[1,0,1,0]},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{targets:[0,0,1,1]}]]});
  nn.vars.AND_OR_XOR = JSON.stringify({name:'AND_OR_XOR',learningRate:0.4,learningMatch:0.004,activationMethod:'Sigmoid',minInputValue:0,maxInputValue:1,minOutputValue:0,maxOutputValue:1,minDomainValue:-1,maxDomainValue:1,bias:1,freezeBias:0,training:0,convergence:0,layers:[[{targets:[1,0,0,1]},{targets:[1,0,1,0]},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{},{},{},{},{targets:[0,0,0,0]}],[{targets:[1,0,0,0]},{targets:[1,0,1,1]},{targets:[0,0,1,1]}]]});
  nn.vars.BOXES_CONTAINER = JSON.stringify({name:'BOXES_CONTAINER',learningRate:0.4,learningMatch:0.004,activationMethod:'Sigmoid',minInputValue:0,maxInputValue:1,minOutputValue:0,maxOutputValue:1,minDomainValue:-1,maxDomainValue:1,bias:1,freezeBias:0,training:0,convergence:0,layers:[[{value:0.95,targets:[0.6,0.4,0.6,0.3,0.7,0.35,0.45,0.1,0.95]},{value:0.2,targets:[0.4,0.6,0.6,0.5,0.35,0.85,0.75,0.45,0.2]},{value:1,targets:[1,1,1,1,1,1,1,1,1]}],[{value:0.351,weights:[0.241,0.218,-0.888]},{value:0.493,weights:[-0.877,-0.502,0.905]},{value:0.71,weights:[0.377,0.522,0.434]},{value:0.497,weights:[0.982,-0.134,-0.917]},{value:0,targets:[0,0,0,0,0,0,0,0,0]}],[{value:0.696,weights:[0.636,0.955,0.453,-0.378,0.0317]},{value:0.69,weights:[0.96,0.778,-0.212,0.459,-0.665]},{value:0.473,weights:[0.794,0.0423,-0.657,0.116,0.646]},{value:0.368,weights:[-0.115,0.603,-0.829,-0.421,0.532]},{value:-1,targets:[-1,-1,-1,-1,-1,-1,-1,-1,-1]}],[{value:0.519,weights:[-0.661,0.838,-0.267,0.0561,-0.0655],targets:[1,1,0,1,1,0,0,1,0]}]]});

  nn.container = null;
  nn.content = null;
  nn.form = null;
  nn.canvas = null;
  nn.canvas2d = null;
  nn.worker = null;
  nn.net = null;
  nn.nets = {};
  nn.view = {};

  nn.view.pointer = {target: null, down: false, dragging: false, dblclick: false, out: false, downtime: 0, uptime: 0, x: 0, y: 0};

  nn.view.c_bcolor = '#000000'; // 000000, 000000
  nn.view.c_fcolor = '#ffffff'; // ffffff, ffffff
  nn.view.c_hcolor = '#888888'; // 888888, 888888
  nn.view.c_ecolor = '#ff7777'; // ff7777, ff7777
  nn.view.c_scolor = '#22ff22'; // 22ff22, 22ff22
  nn.view.c_p_fcolor = '#aaffdd'; // ffcc00, aaffdd
  nn.view.c_n_fcolor = '#99ddff'; // 00ccff, 99ddff
  nn.view.c_1_bcolor = '#666666'; // 666666, 666666

  nn.view.c_bcolor_i = '#dddddd'; // dddddd, dddddd
  nn.view.c_fcolor_i = '#555555'; // 555555, 555555
  nn.view.c_hcolor_i = '#888888'; // 888888, 888888
  nn.view.c_ecolor_i = '#ff0000'; // ff0000, ff0000
  nn.view.c_scolor_i = '#009900'; // 009900, 009900
  nn.view.c_p_fcolor_i = '#229966'; // ff4444, 229966
  nn.view.c_n_fcolor_i = '#5588bb'; // 0088ff, 5588bb
  nn.view.c_1_bcolor_i = '#ffffff'; // ffffff, ffffff

  nn.view.f_d_fcolor_sc = 'form-type-color-text'; // html-color-fg, 555555, ffffff
  nn.view.f_i_fcolor_sc = 'html-color-info'; // 0088ff, 00eeff
  nn.view.f_s_fcolor_sc = 'html-color-success'; // 009900, 22ff22
  nn.view.f_w_fcolor_sc = 'html-color-warning'; // ff8800, ffcc00
  nn.view.f_e_fcolor_sc = 'html-color-error'; // ff0000, ff7777

  nn.view.c_geom_width = 960; // 960
  nn.view.c_geom_aspect = .5625; // .5625
  nn.view.c_geom_aspect_1 = .333; // .333
  nn.view.c_geom_size = 16; // 16, 15-20

  nn.view.width = Math.min(nn.view.c_geom_width, Math.max(screen.width, screen.height));
  nn.view.height = Math.round(nn.view.c_geom_aspect*nn.view.width);
  nn.view.SU = nn.view.width/nn.view.c_geom_width; // Scale unit, around 1
  nn.view.unit = nn.view.c_geom_size*nn.view.SU;
  nn.view.padWidth = 10*nn.view.unit;
  nn.view.padHeight = 4.2*nn.view.unit;

  nn.view.topDown = -1; // -1, 1
  nn.view.maxCanvasCols = 9; // Excluding bias. 8, 9
  nn.view.maxCanvasRows = 5; // Excluding input and output. 4, 5
  nn.view.canvasOffsetCol = 0;
  nn.view.canvasOffsetRow = 0;
  nn.view.canvasLastOffsetCol = 0;
  nn.view.canvasLastOffsetRow = 0;
  nn.view.collapseLayers = 0;
  nn.view.canvasTheme = 0;
  nn.view.canvasRender = 0;

  nn.activationGraph = 0;
  nn.autoExport = 0;
  nn.enableBeep = 0;
  nn.extendStats = 0;
  nn.layersOnly = 0;
  nn.targetsOnly = 0;
  nn.longVals = 0;

  nn.vars.roundVal = 3;
  nn.vars.roundZero = .5/Math.pow(10, nn.vars.roundVal);

  nn.vars.FIXED = 'fixed';
  nn.vars.WEIGHTS_SEED = [.513, .984, -.271, -.596, -.142, .542, -.216, .027, -.799, .434, -.281];

  nn.vars.actVals = {ACT: "act", ACTIVATION: "Activation", PRIME: "Prime", SIGMOID: "Sigmoid", TANGENT: "Tangent", PARABOLIC: "Parabolic", LINEAR: "Linear"};
  const aG = nn.vars.actGeom = {f: .05, w: 1, h: .5, x: 0, y: .5};

  nn.actSigmoid = function (x) {return 1/(1+Math.exp(-x));};
  nn.actSigmoidPrime = function (x) {x = nn.actSigmoid(x); return x*(1-x);};
  nn.actTangent = function (x) {return Math.tanh(x);};
  nn.actTangentPrime = function (x) {x = Math.tanh(x); return 1-x*x;};
  nn.actParabolic = function (x) {var x0 = x-aG.w0, x1 = x-aG.w1; return x < aG.w0 ? aG.h0 : x > aG.w1 ? aG.h1 : x < aG.x ? aG.h0+aG.a*x0*x0 : aG.h1-aG.a*x1*x1;};
  nn.actParabolicPrime = function (x) {return (x < aG.w0p || x > aG.w1p) ? aG.f : x < aG.x ? 2*aG.a*(x-aG.w0)||aG.f : 2*aG.a*(aG.w1-x)||aG.f;};
  nn.actLinear = function (x) {return x < aG.w0 ? aG.h0 : x > aG.w1 ? aG.h1 : aG.h0+aG.d*(x-aG.w0);};
  nn.actLinearPrime = function (x) {return (x < aG.w0 || x > aG.w1) ? aG.f : aG.d;};

  var c2d = null; //  Shortcut nn.canvas2d
  var fE = null; // Shortcut nn.form.el

  nn.Neuron = function (nwk, row, col) {
    var nrn = nwk.layers[row][col] ??= {};
    nrn.parent = nwk; nrn.netName = nwk.name; nrn.row = row; nrn.col = col;
    nrn.isOutput = (nrn.row == nwk.layers.length-1);
    nrn.isBias = (nwk.bias && !nrn.isOutput && nrn.col == nwk.layers[nrn.row].length-1);
    nrn.parents = (!nrn.row || nrn.isBias) ? [] : nwk.layers[nrn.row-1];
    nn.neuron_setWeights(nrn, nrn.weights);
    if (nrn.isBias) {nrn.minValue = Math.min(nwk.minInputValue, -1); nrn.maxValue = Math.max(nwk.maxInputValue, 1);
    } else if (!nrn.row) {nrn.minValue = nwk.minInputValue; nrn.maxValue = nwk.maxInputValue;
    } else {nrn.minValue = nwk.minOutputValue; nrn.maxValue = nwk.maxOutputValue;}
    nrn.sum ||= 0; nrn.midValue = (nrn.minValue+nrn.maxValue)/2;
    nrn.valueRange = Math.abs(nrn.maxValue-nrn.minValue);
    if (nrn.value == null) {nrn.value = nrn.isBias ? 0 : nrn.midValue;}
    if (nrn.value > nrn.maxValue) {nrn.value = nrn.maxValue;
    } else if (nrn.value < nrn.minValue) {nrn.value = nrn.minValue;}
    nn.neuron_setTargets(nrn, null);
    nrn.x = 0; nrn.y = 0; nrn.isVisible = false; nrn.pinned = false; // Layout properties.
    return nrn;
  };

  nn.neuron_getNetwork = function (nrn) {
    return nrn&&nrn.parent||nn.nets[nrn.netName]||nn.net;
  };

  nn.neuron_getParents = function (nrn, nwk) {
    return nrn.parents || ((!nrn.row || nrn.isBias) ? [] : (nwk??nn.neuron_getNetwork(nrn)).layers[nrn.row-1]);
  };

  nn.neuron_getChildren = function (nrn, nwk) {
    nwk ??= nn.neuron_getNetwork(nrn);
    var children = [], last = nwk.layers.length-1;
    if (nrn.row < last) {
      children = nwk.layers[nrn.row+1];
      if (nwk.bias && nrn.row < last-1) {
        children = children.slice(0); children.pop();
      }
    }
    return children;
  };

  nn.neuron_getIndex = function (nrn) {
    var pos = nrn.col, row = nrn.row; while (row--) {pos += nrn.parent.layers[row].length;}
    return pos;
  };

  nn.neuron_setTargets = function (nrn, targets) {
    nrn.targets = targets??nrn.targets??[];
    for (var i = 0; i < nrn.targets.length; i++) {
      if (nrn.targets[i] < nrn.minValue) {nrn.targets[i] = nrn.minValue;
      } else if (nrn.targets[i] > nrn.maxValue) {nrn.targets[i] = nrn.maxValue;}
    }
    if (nrn.parent.targetsLength < nrn.targets.length) {nrn.parent.targetsLength = nrn.targets.length;}
  };

  nn.neuron_adjustTargets = function (nrn) {
    nrn.targets ??= [];
    while (nrn.parent.targetsLength > nrn.targets.length) {nrn.targets.push(nrn.midValue);}
    if (nrn.parent.targetsLength < nrn.targets.length) {nrn.targets.splice(nrn.parent.targetsLength, nrn.targets.length-nrn.parent.targetsLength);}
  };

  nn.neuron_setWeights = function (nrn, weights, scale) { // weights: null (neuron), [] (random), FIXED (seed).
    weights ||= nrn.weights||nn.vars.FIXED; scale ||= 1;
    var fixed = (weights == nn.vars.FIXED), length = nn.vars.WEIGHTS_SEED.length, index = nn.neuron_getIndex(nrn);
    weights = (fixed ? nn.vars.WEIGHTS_SEED : weights).slice(0);
    var pos = index%length; while (fixed && pos--) {weights.push(weights.shift());}
    for (var i = 0; i < nrn.parents.length; i++) {
      if (weights.length <= i) {weights.push(fixed ? weights[weights.length%length] : Math.random()*2-1);}
      weights[i] *= scale;
    }
    weights.length = nrn.parents.length;
    nrn.weights = weights;
  };

  nn.neuron_calculate = function (nrn) {
    if (!nrn.parents.length) {return;}
    nrn.sum = 0;
    for (var i = 0; i < nrn.parents.length; i++) {
      var par = nrn.parents[i]; nn.neuron_calculate(par);
      nrn.sum += nrn.weights[i]*par.value;
    }
    nrn.value = nrn.parent.activation(nrn.sum);
  };

  nn.neuron_pull = function (nrn, diff) {
    if (!nrn.parents.length || nrn.pinned) {return;}
    diff *= nrn.parent.activationPrime(nrn.sum);
    for (var i = 0; i < nrn.parents.length; i++) {
      var par = nrn.parents[i]; nn.neuron_pull(par, diff*nrn.weights[i]);
      nrn.weights[i] -= diff*par.value*nrn.parent.learningRate;
    }
  };

  nn.neuron_value = function (nrn, val) {
    if (val < nrn.minValue) {val = nrn.minValue;} else if (val > nrn.maxValue) {val = nrn.maxValue;}
    if (nrn.parents.length) {
      var diff = nrn.value-val, gap = Math.min(Math.abs(diff), nrn.parent.learningMatch)/2, time = Date.now();
      while (Math.abs(diff) > gap && Date.now()-time < nn.vars.ms.WAIT) {
        nn.neuron_pull(nrn, diff/2);
        nn.neuron_calculate(nrn);
        diff = nrn.value-val;
      }
    } else {nrn.value = val;}
  };

  nn.neuron_target = function (nrn, tgt, val) {
    if (tgt == -1 || !nrn.targets.length) {return;}
    if (val < nrn.minValue) {val = nrn.minValue;} else if (val > nrn.maxValue) {val = nrn.maxValue;}
    nrn.targets[tgt] = val;
  };

  nn.neuron_interact = function (nrn) {
    var dx = (nn.neuron_offsetX(nrn)-nn.view.pointer.x)/nn.view.unit;
    if (!nrn.parents.length) {
      nrn.value -= dx;
      if (nrn.value > nrn.maxValue) {nrn.value = nrn.maxValue;
      } else if (nrn.value < nrn.minValue) {nrn.value = nrn.minValue;}
    } else {nn.neuron_pull(nrn, dx);}
  };

  nn.neuron_offsetX = function (nrn, val) {
    if (val == null) {val = nrn.value;}
    return nrn.x+nn.view.unit*Math.tanh((val-nrn.midValue)/nrn.valueRange);
  };

  nn.neuron_offset_over = function (nrn) { // Use optionally instead of neuron_over, but may affect performance in network_onpointermove.
    return nrn.isVisible && Math.abs(nrn.y-nn.view.pointer.y) < nn.view.unit && Math.abs(nn.neuron_offsetX(nrn)-nn.view.pointer.x) < nn.view.unit;
  };

  nn.neuron_over = function (nrn) {
    return nrn.isVisible && Math.abs(nrn.y-nn.view.pointer.y) < nn.view.unit && Math.abs(nrn.x-nn.view.pointer.x)*.6 < nn.view.unit;
  };

  nn.neuron_nextRoundValue = function (nrn) {
    var p, a = [nrn.minValue, nrn.midValue, nrn.maxValue];
    var l = Math.abs(nrn.value-a[0]), m = Math.abs(nrn.value-a[1]), r = Math.abs(nrn.value-a[2]);
    var max = nrn.valueRange/(a.length-1)/2, min = nrn.parent.learningMatch/2;
    if (m > min && m < max) {p = 1;
    } else if (r > min && r < max) {p = 2;
    } else if (l > min && l < max) {p = 0;
    } else {p = (l < m) ? ((r < l) ? 0 : 1) : ((r < l) ? 0 : 2);}
    return a[p];
  };

  nn.neuron_onpointerup = function (nrn) {
    if (!nrn || nn.view.pointer.dragging) {return;}
    if (nn.view.pointer.dblclick) {
      nrn.pinned = false;
      nn.neuron_value(nrn, nn.neuron_nextRoundValue(nrn));
    } else if (nn.view.pointer.uptime-nn.view.pointer.downtime < nn.vars.ms.WATCH) {nrn.pinned = !nrn.pinned;} // @show/hide else.
  };

  nn.neuron_renderWeights = function (nrn, nox) {
    c2d.save();
    c2d.globalCompositeOperation = 'destination-over'; // Draw below.
    for (var i = 0; i < nrn.parents.length; i++) {
      var par = nrn.parents[i]; if (!par.isVisible) {continue;}
      var hilite = (nrn.parent.selectedNeuron == nrn), wt = nrn.weights[i], pox = nn.neuron_offsetX(par);
      if (!hilite && !nrn.parent.training && !nrn.parent.selectedNeuron && nn.view.pointer.down) {
        var d0 = nn.distance(nox, nrn.y, nn.view.pointer.x, nn.view.pointer.y), d1 = nn.distance(pox, par.y, nn.view.pointer.x, nn.view.pointer.y);
        hilite = (d0 > nn.view.unit && d1 > nn.view.unit && d0+d1 < nn.distance(nox, nrn.y, pox, par.y)+.1);
      }
      if (hilite) {
        c2d.textAlign = 'center';
        c2d.fillStyle = nn.view.c_fcolor;
        c2d.globalAlpha = 1;
        c2d.fillText(Math.round(wt*100)/100, pox, par.y+nn.view.unit*((nn.view.topDown < 0) ? -1.4 : 1.8));
      }
      var al = Math.abs(wt);
      if (al < .3) {al = .3;} else if (al > 1) {al = 1;}
      c2d.strokeStyle = c2d.fillStyle = wt < 0 ? nn.view.c_n_fcolor : nn.view.c_p_fcolor;
      c2d.lineWidth = hilite ? 1.5*nn.view.SU : .6*nn.view.SU;
      c2d.globalAlpha = al;
      c2d.beginPath();
      c2d.moveTo(pox, par.y);
      c2d.lineTo(nox, nrn.y);
      c2d.stroke();
    }
    c2d.restore();
  };

  nn.neuron_render = function (nrn) {
    var nox = nn.neuron_offsetX(nrn);
    nn.neuron_renderWeights(nrn, nox);
    var sCol = nrn.value < nrn.midValue ? nn.view.c_n_fcolor : nn.view.c_p_fcolor;
    c2d.save();
    c2d.beginPath();
    c2d.strokeStyle = sCol;
    c2d.lineWidth = nn.view.unit*2-10*nn.view.SU;
    c2d.lineCap = 'round';
    c2d.globalAlpha = (nrn == nrn.parent.selectedNeuron) ? .4 : .2;
    c2d.moveTo(nrn.x-nn.view.unit, nrn.y);
    c2d.lineTo(nrn.x+nn.view.unit, nrn.y);
    c2d.stroke();
    c2d.restore();
    c2d.save(); // if (nrn.targets.length) {console.log('targets '+nwk.selectedTarget, nrn.targets);}
    c2d.textAlign = 'center';
    if (nrn.parent.selectedTarget > -1 && nrn.targets.length) {
      c2d.beginPath();
      c2d.lineWidth = nn.view.unit*.06;
      c2d.strokeStyle = nn.view.c_hcolor;
      var t = nrn.targets[nrn.parent.selectedTarget], x = nn.neuron_offsetX(nrn, t);
      c2d.ellipse(x, nrn.y, 1.25*nn.view.unit, 1.25*nn.view.unit, 0, 0, Math.PI*2);
      c2d.stroke();
      c2d.fillStyle = nn.view.c_hcolor;
      t -= nrn.value; t = (t > nrn.parent.learningMatch) ? '>' : (t < -nrn.parent.learningMatch) ? '<' : '\xb7';
      c2d.fillText(t, x, nrn.y-1.4*nn.view.unit);
    }
    c2d.beginPath();
    c2d.fillStyle = nn.view.c_bcolor;
    c2d.lineWidth = nn.view.unit*.16;
    c2d.strokeStyle = nrn.pinned ? nn.view.c_hcolor : sCol;
    if (nrn.isBias) {nn.drawPolygon(c2d, 4, nox, nrn.y, 1.15*nn.view.unit, .5);
    } else if (nrn.isOutput) {nn.drawPolygon(c2d, 6, nox, nrn.y, 1.1*nn.view.unit, 0);
    } else if (!nrn.row) {nn.drawPolygon(c2d, 6, nox, nrn.y, 1.05*nn.view.unit, .5);
    } else {c2d.ellipse(nox, nrn.y, nn.view.unit, nn.view.unit, 0, 0, Math.PI*2);}
    c2d.fill();
    c2d.stroke();
    c2d.fillStyle = sCol;
    c2d.fillText(Math.round(nrn.value*100)/100, nox, nrn.y+.25*nn.view.unit);
    c2d.restore();
  };

  nn.Network = function (nwk) {
    nwk ??= {};
    if (nwk.constructor == String) {
      nwk = nwk.trim();
      if (nwk.charAt(0) == '{' || nwk.charAt(0) == '[') {
        try {nwk = JSON.parse(nwk);
        } catch (er) {nwk = {};}
      } else {nwk = {name: nwk};}
    }
    if ('length' in nwk) {nwk = {layers: nwk};}
    var i, j, lengths = []; nn.nets ??= {};
    nwk.name = nwk.name||'NN'; nn.nets[nwk.name] = nwk;
    nwk.freezeBias ||= 0;
    nwk.adaptNeurons ||= 0;
    nwk.adaptRate ||= 0;
    nwk.training ||= 0;
    nwk.trainingPeriod ||= 1e3;
    nwk.trainingCycles ||= 0;
    nwk.trainingTime ||= 0;
    nwk.trainingError ||= 0;
    nwk.trainingDelta ||= 0;
    nwk.trainingStart ||= 0;
    nwk.convergence ||= 0;
    nwk.lastSelectedNeuron = nwk.selectedNeuron = null;
    if (nwk.shuffleData == null) {nwk.shuffleData = 1;}
    if (nwk.selectedTarget == null) {nwk.selectedTarget = -1;}
    if (!nwk.layers?.length) {nwk.layers = [2+nwk.bias, 4+nwk.bias, 4+nwk.bias, 3];}
    for (i = 0; i < nwk.layers.length; i++) {
      if (nwk.layers[i].length == null) {
        j = nwk.layers[i]; nwk.layers[i] = [];
        while (nwk.layers[i].length < j) {nwk.layers[i].push({});}
      }
      lengths.push(nwk.layers[i].length);
    }
    if (nwk.bias == null) {
      nwk.bias = 0;
      if (nwk.layers.length > 2 && nwk.layers[1].length > 1) {
        i = nwk.layers[1][0]; j = nwk.layers[1].at(-1);
        if (j.targets?.length || (!j.weights?.length && i.weights?.length)) {nwk.bias = 1;}
      }
    }
    nwk.layersLengths = lengths;
    nwk.cols = Math.max.apply(Math, lengths);
    if (nwk.bias && lengths.at(-1) == nwk.cols) {nwk.cols++;}
    nwk.targetsLength = 0; nwk.neuronsLength = 0; nwk.valueDiff = 0;
    nn.network_setActivation(nwk);
    for (i = 0; i < nwk.layers.length; i++) {
      for (j = 0; j < nwk.layers[i].length; j++) {
        new nn.Neuron(nwk, i, j);
        nwk.neuronsLength++;
      }
    }
    nwk.dataDiff = nn.network_getDataDiff(nwk);
    if (nwk.learningMatch == null) {nwk.learningMatch = nwk.dataDiff/3;}
    if (nwk.learningRate == null) {nwk.learningRate = nwk.valueDiff/3;}
    return nwk;
  };

  nn.network_setActivation = function (nwk, method, iv, ov, rx) {
    iv ??= {}; ov ??= {}; rx ??= {};
    var aV = nn.vars.actVals; method ||= nwk.activationMethod; if (!nn[aV.ACT+method]) {method = aV.SIGMOID;}
    nwk.activationMethod = method; nwk.activation = nn[aV.ACT+method]; nwk.activationPrime = nn[aV.ACT+method+aV.PRIME]; // Centered/Positive:
    if (method == aV.TANGENT || method == aV.LINEAR) {aG.w = 1; aG.h = 1; aG.x = 0; aG.y = 0;} else {aG.w = 1; aG.h = .5; aG.x = 0; aG.y = .5;}
    aG.h0 = (ov.min != null) ? ov.min : (nwk.minOutputValue != null) ? nwk.minOutputValue : (ov.max != null) ? 2*aG.y-ov.max : aG.y-aG.h;
    aG.h1 = (ov.max != null) ? ov.max : (nwk.maxOutputValue != null) ? nwk.maxOutputValue : (ov.min != null) ? 2*aG.y-ov.min : aG.y+aG.h;
    aG.h = (aG.h1-aG.h0)/2; aG.y = aG.h0+aG.h;
    aG.w0 = (rx.min != null) ? rx.min : (nwk.minDomainValue != null) ? nwk.minDomainValue : (rx.max != null) ? 2*aG.x-rx.max : aG.x-aG.w;
    aG.w1 = (rx.max != null) ? rx.max : (nwk.maxDomainValue != null) ? nwk.maxDomainValue : (rx.min != null) ? 2*aG.x-rx.min : aG.x+aG.w;
    aG.w0p = aG.w0+aG.f; aG.w1p = aG.w1-aG.f;
    aG.w = (aG.w1-aG.w0)/2; aG.x = aG.w0+aG.w; aG.d = aG.h/aG.w; aG.a = aG.d/aG.w;
    nwk.minDomainValue = aG.w0; nwk.maxDomainValue = aG.w1;
    nwk.minOutputValue = aG.h0; nwk.maxOutputValue = aG.h1;
    nwk.minInputValue = (iv.min != null) ? iv.min : (nwk.minInputValue != null) ? nwk.minInputValue : nwk.minOutputValue;
    nwk.maxInputValue = (iv.max != null) ? iv.max : (nwk.maxInputValue != null) ? nwk.maxInputValue : nwk.maxOutputValue;
    nwk.valueDiff = nwk.maxOutputValue-nwk.minOutputValue;
  };

  nn.network_train = function (nwk) {
    var keyset = Object.keys(nwk.layers[0][0].targets); if (!keyset.length) {return;}
    var i, nrn, match, miss, keys, lay, cycle = -1, matches = 0, error = 0, delta = 0;
    var lastlayer = nwk.layers.length-1, input = nwk.layers[0], output = nwk.layers.at(-1);
    nwk.trainingCycles ||= 0; nwk.trainingStart ||= Date.now();
    while (++cycle < nwk.trainingPeriod) {
      match = 0; miss = 0; keys = keyset.slice(0);
      while (keys.length) {
        i = !nwk.shuffleData ? 0 : Math.floor(Math.random()*keys.length);
        nwk.selectedTarget = Number(keys.splice(i, 1)[0])||0;
        for (i = 0; i < input.length; i++) { // input neurons
          nrn = input[i]; nrn.value = nrn.targets[nwk.selectedTarget];
        }
        if (nwk.bias) {
          for (i = 1; i < lastlayer; i++) { // bias neurons, except input's
            lay = nwk.layers[i]; nrn = lay.at(-1);
            nrn.value = nrn.targets[nwk.selectedTarget];
          }
        }
        for (i = 0; i < output.length; i++) { // output neurons
          nrn = output[i];
          nn.neuron_calculate(nrn);
          nn.neuron_pull(nrn, nrn.value-nrn.targets[nwk.selectedTarget]);
          delta = Math.abs(nrn.value-nrn.targets[nwk.selectedTarget])/nrn.valueRange;
          if (delta > nwk.learningMatch) {
            if (delta > miss) {miss = delta;}
          } else {match++;}
        }
      }
      delta = miss-error; error += delta/(cycle+1); // average error
      if (match < output.length*keyset.length) {
        if (!matches) {
          if (cycle == nwk.trainingPeriod-1 && cycle) {
            miss = nn.network_convergence(nwk, error, delta);
            if (miss >= 0) {
              if (nwk.adaptRate) {i = .25; nwk.learningRate = error*5*i+nwk.learningRate*(1-i);}
              // if (nwk.adaptNeurons) {} // @todo adaptNeurons
            }
          }
        } else {matches = 0;}
      } else if (++matches > 1 || nwk.trainingPeriod == 1) {nwk.training = -1; cycle++; break;}
    }
    nwk.trainingCycles += cycle; nwk.trainingError = error; nwk.trainingDelta = delta;
    nwk.trainingTime = Date.now()-nwk.trainingStart;
  };

  nn.network_convergence = function (nwk, error, delta) {
    if (error == null) {error = nwk.trainingError;} if (delta == null) {delta = nwk.trainingDelta;}
    if (delta >= 0) {nwk.convergence = 1;
    } else if (Math.abs((error-nwk.learningMatch)*nwk.learningMatch/error/200)-Math.abs(delta) >= 0) {nwk.convergence = 0; // Def /200
    } else {nwk.convergence = -1;}
    return nwk.convergence; // Convergent -1, Low Convergence 0, Divergent: 1
  };

  nn.network_status = function (nwk) {
    var conv = nwk.convergence; if (!nwk.training && nwk.trainingError > nwk.learningMatch) {conv = (nwk.trainingError < -nwk.trainingDelta) ? -1 : 1;}
    return conv;
  };

  nn.network_setWeights = function (nwk, weightsmode, scale) {
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        nn.neuron_setWeights(nwk.layers[i][j], weightsmode, scale);
      }
    }
  };

  nn.network_gotoTarget = function (nwk, ind, out) {
    var i, nrn; if (ind == null) {ind = nwk.selectedTarget;} else {nwk.selectedTarget = ind;}
    for (i = 0; i < nwk.layers[0].length; i++) { // input neuron
      nrn = nwk.layers[0][i];
      nrn.value = (ind == -1) ? nrn.midValue : nrn.targets[ind];
    }
    if (nwk.bias) {
      for (i = 1; i < nwk.layers.length-1; i++) { // bias neuron, except input's
        nrn = nwk.layers[i].at(-1);
        nrn.value = (ind == -1) ? nrn.midValue : nrn.targets[ind];
      }
    }
    if (out) {
      for (i = 0; i < nwk.layers.at(-1).length; i++) { // output neuron
        nrn = nwk.layers.at(-1)[i];
        nn.neuron_value(nrn, (ind == -1) ? nrn.midValue : nrn.targets[ind]);
      }
    }
  };

  nn.network_adjustTargets = function (nwk) {
    var i, last = nwk.layers.length-1;
    nwk.targetsLength = Math.max(nwk.targetsLength, (nwk.layers[0][0].targets||[]).length, (nwk.layers.at(-1)[0].targets||[]).length)||0;
    for (i = 0; i < nwk.layers[0].length; i++) {nn.neuron_adjustTargets(nwk.layers[0][i]);}
    if (nwk.bias) {for (i = 1; i < last; i++) {nn.neuron_adjustTargets(nwk.layers[i].at(-1));}} // except input's
    for (i = 0; i < nwk.layers.at(-1).length; i++) {nn.neuron_adjustTargets(nwk.layers.at(-1)[i]);}
    nwk.dataDiff = Number(nn.network_getDataDiff(nwk).toPrecision(nn.vars.roundVal-1));
  };

  nn.network_saveData = function (nwk, pos) {
    if (pos == null) {pos = nwk.selectedTarget;}
    if (pos < 0) {pos += 1+nwk.targetsLength;}
    if (pos > nwk.targetsLength) {pos = nwk.targetsLength;} else if (pos < 0) {pos = 0;}
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        var nrn = nwk.layers[i][j];
        if (!nrn.row || nrn.isOutput || nrn.isBias) {
          nrn.isBias && nwk.freezeBias && nrn.targets.fill(nrn.value); // same target for all
          if (pos < nwk.targetsLength) {nrn.targets[pos] = nrn.value;
          } else {nrn.targets.push(nrn.value);}
        }
      }
    }
    nwk.targetsLength = nwk.layers[0][0].targets.length;
    nwk.selectedTarget = (pos >= nwk.targetsLength) ? -1 : pos;
  };

  nn.network_deleteData = function (nwk, pos) {
    if (pos == null) {pos = nwk.selectedTarget;}
    if (pos < 0) {pos += 1+nwk.targetsLength;}
    if (pos > nwk.targetsLength) {pos = nwk.targetsLength;} else if (pos < 0) {pos = 0;}
    if (pos < nwk.targetsLength) {
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        var nrn = nwk.layers[i][j];
        if (nrn.targets.length) {
          if (pos < nwk.targetsLength) {nrn.targets.splice(pos, 1);
          } else {nrn.targets.pop();}
        }
      }
    }}
    nwk.targetsLength = nwk.layers[0][0].targets.length;
    nwk.selectedTarget = (pos >= nwk.targetsLength) ? -1 : pos;
  };

  nn.network_clearData = function (nwk) {
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        var nrn = nwk.layers[i][j]; if (nrn.targets.length) {nrn.targets = [];}
      }
    }
    nwk.selectedNeuron = null; nwk.selectedTarget = -1; nwk.targetsLength = 0;
    nwk.trainingStart = nwk.trainingTime = nwk.trainingCycles = nwk.trainingError = nwk.training = 0;
  };

  nn.network_setLearning = function (nwk, match, rate, adaptR, adaptN) {
    var calc = function (prop, val) {
      var HI = .333, LO = .005, diff = !prop ? nwk.dataDiff : nwk.valueDiff;
      if (val == 0) {val = HI*diff;
      } else if (val == -1) {val = LO*diff;
      } else if (val < 0) {val *= -(!prop ? nwk.learningMatch : nwk.learningRate);}
      val = Number(val.toPrecision(nn.vars.roundVal))||LO;
      if (!prop) {nwk.learningMatch = val;} else {nwk.learningRate = val;}
    };
    if (match != null) {calc(0, match);}
    if (rate != null) {calc(1, rate);}
    if (adaptR != null) {nwk.adaptRate = adaptR;}
    if (adaptN != null) {nwk.adaptNeurons = adaptN;}
  };

  nn.network_setPositions = function (nwk) {
    var i, j, w2 = nn.view.width/2, h2 = nn.view.height/2, nw = nn.view.width-2*nn.view.padWidth, nh = nn.view.height-2*nn.view.padHeight;
    var maxrows = nn.view.collapseLayers ? 1 : nn.view.maxCanvasRows, maxcols = nn.view.maxCanvasCols+1-nwk.bias;
    var cols = Math.min(nwk.cols-1, maxcols), rows = Math.min(nwk.layers.length-1, maxrows+1);
    var maxcoloff = nwk.cols-1-nn.view.maxCanvasCols; if (maxcoloff < 0) {maxcoloff = 0;}
    var maxrowoff = nn.view.canvasOffsetRow+maxrows, bioffcols = (nwk.bias || !maxcoloff) ? cols : cols-1;
    var nrn, isOut, rowVisible, rowY, rowlen, maxrowcoloff, coloff, coloffright, cmco, cmcr;
    for (i = 0; i < nwk.layers.length; i++) {
      rowlen = nwk.layers[i].length; isOut = (i == nwk.layers.length-1);
      rowVisible = (!i || isOut || (i > nn.view.canvasOffsetRow && i <= maxrowoff));
      if (rowVisible) {
        rowY = h2+nn.view.topDown*nh*((!i ? 0 : isOut ? 1 : (i-nn.view.canvasOffsetRow)/rows)-.5);
        maxrowcoloff = rowlen-1-nn.view.maxCanvasCols; if (maxrowcoloff < 0) {maxrowcoloff = 0;}
        coloff = Math.min(nn.view.canvasOffsetCol, maxrowcoloff); coloffright = coloff+maxcols;
        cmco = coloff+(rowlen-1-maxrowcoloff)/2; cmcr = (isOut && nwk.bias && rowlen <= maxcols) ? .5 : 0;
      }
      for (j = 0; j < rowlen; j++) {
        nrn = nwk.layers[i][j]; nrn.isVisible = rowVisible && (nrn.isBias || (j >= coloff && j < coloffright));
        if (nrn.isVisible) {nrn.y = rowY; nrn.x = w2+nw*(nrn.isBias ? .5 : !cols ? 0 : (j-cmco-cmcr)/bioffcols);}
      }
    }
  };

  nn.network_getMaxColOffset = function (nwk, row) {
    return (row == null) ? nwk.cols-1-nn.view.maxCanvasCols : nwk.layers[row].length-1-nn.view.maxCanvasCols;
  };

  nn.network_getMaxRowOffset = function (nwk) {
    return nwk.layers.length-2-(nn.view.collapseLayers ? 1 : nn.view.maxCanvasRows);
  };

  nn.network_getDataDiff = function (nwk) {
    var diff = 0, output = nwk.layers.at(-1);
    if (output.length && output[0].targets.length > 1) {
      var zero = Math.max(nn.vars.roundZero, output[0].valueRange/200)||0; // diff = output[0].valueRange;
      for (var i = 0; i < output.length; i++) {
        var sts = [].slice.call(output[i].targets).sort(function (a, b) {return a-b;});
        for (var j = 1; j < sts.length; j++) {
          var df = sts[j]-sts[j-1];  if (!diff || df < diff && df >= zero) {diff = df;}
        }
      }
    }
    return diff;
  };

  nn.network_export = function (nwk, layersonly, targetsonly, roundval) {
    var i, j, k, exp = {}; if (roundval == null) {roundval = 3;}
    if (!layersonly) {
      exp.name = nwk.name;
      exp.training = nwk.training;
      exp.convergence = nwk.convergence;
      if (!targetsonly) {
        exp.trainingCycles = nwk.trainingCycles;
        exp.trainingStart = nwk.trainingStart;
        exp.trainingTime = nwk.trainingTime;
        exp.trainingError = nwk.trainingError;
        exp.trainingDelta = nwk.trainingDelta;
        exp.trainingPeriod = nwk.trainingPeriod;
        exp.shuffleData = nwk.shuffleData;
        exp.adaptNeurons = nwk.adaptNeurons;
        exp.adaptRate = nwk.adaptRate;
        exp.selectedTarget = nwk.selectedTarget;
        exp.system = {
          userAgent: navigator.userAgent, platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency, deviceMemory: navigator.deviceMemory
        };
      }
      exp.learningRate = nwk.learningRate;
      exp.learningMatch = nwk.learningMatch;
      exp.activationMethod = nwk.activationMethod;
      exp.minInputValue = nwk.minInputValue; exp.maxInputValue = nwk.maxInputValue;
      exp.minOutputValue = nwk.minOutputValue; exp.maxOutputValue = nwk.maxOutputValue;
      exp.minDomainValue = nwk.minDomainValue; exp.maxDomainValue = nwk.maxDomainValue;
      exp.bias = nwk.bias;
      exp.freezeBias = nwk.freezeBias;
    }
    exp.layers = [];
    for (i = 0; i < nwk.layers.length; i++) {
      exp.layers.push([]);
      for (j = 0; j < nwk.layers[i].length; j++) {
        var node = {}, nrn = nwk.layers[i][j];
        if (!targetsonly) { // Sum not exported: node.sum = roundval ? Number(nrn.sum.toPrecision(roundval)) : nrn.sum;
          node.value = roundval ? Number(nrn.value.toPrecision(roundval)) : nrn.value;
          if (nrn.weights.length) {
            node.weights = nrn.weights.slice(0);
            if (roundval) {for (k = 0; k < node.weights.length; k++) {node.weights[k] = Number(node.weights[k].toPrecision(roundval));}}
          }
        }
        if (nrn.targets.length) {
          node.targets = nrn.targets.slice(0);
          if (roundval) {for (k = 0; k < node.targets.length; k++) {node.targets[k] = Number(node.targets[k].toPrecision(roundval));}}
        }
        exp.layers[i].push(node);
      }
    }
    if (layersonly) {exp = exp.layers;} // console.log(' network_export ', nwk, exp);
    return exp;
  };

  nn.network_serialize = function (nwk, layersonly, targetsonly, roundval) {
    return JSON.stringify(nn.network_export(nwk, layersonly, targetsonly, roundval));
  };

  nn.network_onpointermove = function (nwk) {
    var cursor = '', brk = 0;
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        if (nn.neuron_over(nwk.layers[i][j])) {cursor = 'pointer'; brk = 1; break;}
      }
      if (brk) {break;}
    }
    nn.canvas.style.cursor = cursor;
  };

  nn.network_onpointerdown = function (nwk) {
    var brk = 0; nwk.selectedNeuron = null;
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        var nrn = nwk.layers[i][j];
        if (nn.neuron_over(nrn)) {nwk.lastSelectedNeuron = nwk.selectedNeuron = nrn; brk = 1; break;}
      }
      if (brk) {break;}
    }
  };

  nn.network_onpointerup = function (nwk) {
    nn.neuron_onpointerup(nwk.selectedNeuron);
    nwk.selectedNeuron = null;
  };

  nn.network_render = function (nwk) {
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {
        var nrn = nwk.layers[i][j]; if (!nrn.isVisible) {continue;}
        if (nrn.isOutput) {nn.neuron_calculate(nrn);}
        if (nrn == nwk.selectedNeuron && !nwk.training && nn.view.pointer.dragging) {nn.neuron_interact(nrn);}
        nn.neuron_render(nrn);
      }
    }
  };

  nn.canvas_link_over = function (returnfunction) {
    var over = function (c) {
      var i, b = {l: c.x-(c.w2||0), t: c.y-(c.h2||0), r: c.x+(c.w||c.w2||nn.view.unit), b: c.y+(c.h||c.h2||nn.view.unit)};
      if (b.l > b.r) {i = b.r; b.r = b.l; b.l = i;}
      if (b.t > b.b) {i = b.b; b.b = b.t; b.t = i;}
      return nn.view.pointer.x > b.l && nn.view.pointer.x < b.r && nn.view.pointer.y > b.t && nn.view.pointer.y < b.b;
    }; // Def:
    // TRAIN:
    if (over({x: nn.view.width-9*nn.view.unit, y: nn.view.unit, w: 8*nn.view.unit})) {
      return !returnfunction || function () {nn.changeTraining(null, null);};
    }
    if (nn.net.training) {return;}
    var h2 = nn.view.height/2-.25*nn.view.unit, lu = 4*nn.view.unit, ru = nn.view.width-lu, wu = 3*nn.view.unit, ht = -6.6;
    // MENU:
    if (over({x: nn.view.unit, y: nn.view.unit, w: 2*nn.view.unit})) {
      return !returnfunction || function () {nn.formDisplay(-1);};
    }
    // HEADER:
    if (over({x: nn.view.width/2, y: nn.view.unit, w2: 6*nn.view.unit})) {
      return !returnfunction || function () {nn.updateCanvas(-1);};
    }
    // FOOTER:
    if (over({x: nn.view.width/2, y: nn.view.height-2*nn.view.unit, w2: 6*nn.view.unit})) {
      return !returnfunction || function () {
        var win = open('mailto:javier.rey.eu@gmail.com?subject=Feedback INN @'+location.hostname+location.pathname, 'jr-feedback'); win.focus();
      };
    }
    // ACTIVATION:
    if (over({x: lu, y: h2-0.6*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.setActivation(null, -1);};
    } else if (over({x: lu, y: h2+0.4*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.net.selectedNeuron = {};};
    }
    // INPUT/OUTPUT:
    if (over({x: lu, y: 3.7*nn.view.unit, w2: wu}) || over({x: lu, y: nn.view.height-4.7*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.setCanvasTopDown(null);};
    }
    // NODES/OFFSET:
    /* if (over({x: ru, y: h2+ht*nn.view.unit, w2: wu})) { // , h: 1.8*nn.view.unit
      return !returnfunction || function () {};
    } else */
    if (over({x: ru, y: h2+(ht+1)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.offsetView(null, 0, 0);};
    } else if (over({x: ru, y: h2+(ht+2)*nn.view.unit, w: -wu})) {
      return !returnfunction || function () {nn.offsetView(null, nn.view.canvasOffsetCol-1, nn.view.canvasOffsetRow);};
    } else if (over({x: ru, y: h2+(ht+2)*nn.view.unit, w: wu})) {
      return !returnfunction || function () {nn.offsetView(null, nn.view.canvasOffsetCol+1, nn.view.canvasOffsetRow);};
    } else if (over({x: ru, y: h2+(ht+3)*nn.view.unit, w: -wu})) {
      return !returnfunction || function () {nn.offsetView(null, nn.view.canvasOffsetCol, nn.view.canvasOffsetRow-1);};
    } else if (over({x: ru, y: h2+(ht+3)*nn.view.unit, w: wu})) {
      return !returnfunction || function () {nn.offsetView(null, nn.view.canvasOffsetCol, nn.view.canvasOffsetRow+1);};
    }
    // DATASET:
    if (over({x: ru, y: h2+(ht+5)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.nextData(null, 0);};
    } else if (over({x: ru, y: h2+(ht+6)*nn.view.unit, w: -wu})) {
      return !returnfunction || function () {nn.nextData(null, -1);};
    } else if (over({x: ru, y: h2+(ht+6)*nn.view.unit, w: wu})) {
      return !returnfunction || function () {nn.nextData(null, 1);};
    } else if (over({x: ru, y: h2+(ht+7)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.saveData(null);};
    } else if (over({x: ru, y: h2+(ht+8)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.deleteData(null);};
    }
    // LEARNING:
    if (over({x: ru, y: h2+(ht+10)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.setLearning(null, 0, 0);};
    } else if (over({x: ru, y: h2+(ht+11)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.setLearning(null, -.333, null);};
    } else if (over({x: ru, y: h2+(ht+12)*nn.view.unit, w2: wu})) {
      return !returnfunction || function () {nn.setLearning(null, null, -1.33);};
    }
    return false;
  };

  nn.canvas_onpointermove = function (ev) { // ev.preventDefault(); // @hide prevent.
    var over = nn.canvas_link_over();
    if (over) {nn.canvas.style.cursor = 'pointer';} else if (!nn.view.pointer.down) {nn.canvas.style.cursor = '';}
    if (!over && !nn.net.training && !nn.view.pointer.down) {nn.network_onpointermove(nn.net);} // @show/hide pointermove.
  };

  nn.canvas_onpointerdown = function (ev) {
    nn.requestCanvasRender(-1);
    var fun = nn.canvas_link_over(true);
    if (typeof fun == 'function') {fun(); return;}
    if (!nn.net.training) {
      nn.network_onpointerdown(nn.net); // if (nn.net.selectedNeuron) {ev.preventDefault();} // @hide/show prevent.
      nn.requestCanvasRender(1);
    }
  };

  nn.canvas_onpointerup = function (ev) {
    ev.preventDefault(); // @show/hide prevent.
    if (!nn.net.training) {nn.network_onpointerup(nn.net);}
    nn.net.selectedNeuron = null; nn.requestCanvasRender(-1);
  };

  nn.canvas_render = function () {
    if (!nn.view.canvasRender || !nn.canvas.offsetHeight) {return;}
    c2d.clearRect(0, 0, nn.view.width, nn.view.height); if (!nn.net) {nn.view.canvasRender = 0; return;}
    var i, nwk = nn.net, w2 = nn.view.width/2, h2 = nn.view.height/2-.25*nn.view.unit, sLen = 14, fe = nn.form.el;
    var fcolor = nwk.training ? nn.view.c_ecolor : nn.view.c_fcolor, conv = nn.network_status(nwk);
    c2d.save();
    c2d.textAlign = 'right';
    c2d.fillStyle = (conv > 0) ? nn.view.c_ecolor : (conv < 0) ? nn.view.c_scolor : nn.view.c_fcolor;
    i = 'TRAIN'; if (nwk.trainingCycles) {i += ' ['+fe.data_stats.innerHTML+']'; if (nwk.training) {i += '['+fe.data_error.innerHTML+']';}}
    c2d.fillText(i, nn.view.width-nn.view.unit, 1.7*nn.view.unit);
    c2d.fillStyle = fcolor;
    c2d.textAlign = 'left';
    c2d.fillText('MENU', nn.view.unit, 1.7*nn.view.unit);
    c2d.textAlign = 'center';
    c2d.fillText('NEURAL NETWORK DESIGNER', w2, 1.7*nn.view.unit);
    c2d.fillText('\xa9 Javier Rey', w2, nn.view.height-1.3*nn.view.unit);
    var lCol = 4*nn.view.unit, rCol = nn.view.width-lCol;
    var lTop = 4.4*nn.view.unit, lBot = nn.view.height-4*nn.view.unit, rTop = 3.9*nn.view.unit, rBot = nn.view.height-4*nn.view.unit, hTop = -6;
    var bTop = 4.2*nn.view.unit, bBot = nn.view.height-4.3*nn.view.unit, biasText = '> BIAS';
    var bias = nwk.bias*(nwk.layers.length-1);
    var lays = (nwk.layers.length < 2) ? 0 : nwk.layers.length-2;
    var hid = !lays ? Number(fe.hidden_neurons.value)||0 : nwk.layers[1].length-nwk.bias, hiddenNeurons = nn.roundNumberFormat(hid, 4, 0);
    var inp = nwk.layers[0].length-nwk.bias, inputNeurons = nn.roundNumberFormat(inp, 4, 0);
    var out = nwk.layers.at(-1).length, outputNeurons = nn.roundNumberFormat(out, 4, 0);
    c2d.fillText(nwk.name.substring(0, sLen), rCol, h2+hTop*nn.view.unit); // I+O+HxL+B:
    c2d.fillText(inputNeurons+'+'+outputNeurons+'+'+hiddenNeurons+'x'+lays+'+'+bias, rCol, h2+(hTop+1)*nn.view.unit);
    c2d.fillText('H-Off '+nn.view.canvasOffsetCol+' / '+nn.view.canvasLastOffsetCol, rCol, h2+(hTop+2)*nn.view.unit);
    c2d.fillText('V-Off '+nn.view.canvasOffsetRow+' / '+nn.view.canvasLastOffsetRow, rCol, h2+(hTop+3)*nn.view.unit);
    c2d.fillStyle = fcolor;
    c2d.fillText('DATASET', rCol, h2+(hTop+5)*nn.view.unit);
    c2d.fillStyle = nwk.targetsLength >= 2 ? fcolor : nn.view.c_ecolor;
    c2d.fillText('Target '+fe.dataset_label.innerHTML+' / '+fe.datasets_label.innerHTML, rCol, h2+(hTop+6)*nn.view.unit);
    c2d.fillStyle = nwk.targetsLength < 2 || nwk.dataDiff ? fcolor : nn.view.c_ecolor;
    c2d.fillText('D-Diff '+fe.data_diff_label.innerHTML, rCol, h2+(hTop+7)*nn.view.unit);
    c2d.fillStyle = nwk.targetsLength < 2 || nwk.valueDiff ? fcolor : nn.view.c_ecolor;
    c2d.fillText('V-Diff '+fe.value_diff_label.innerHTML, rCol, h2+(hTop+8)*nn.view.unit);
    c2d.fillStyle = fcolor;
    c2d.fillText('LEARNING', rCol, h2+(hTop+10)*nn.view.unit);
    c2d.fillStyle = fcolor; // !nwk.dataDiff || nwk.learningMatch/nwk.dataDiff < .5 ? fcolor : nn.view.c_ecolor // @show/hide color
    c2d.fillText('Match '+fe.learning_match.value, rCol, h2+(hTop+11)*nn.view.unit);
    c2d.fillStyle = fcolor; // !nwk.valueDiff || nwk.learningRate/nwk.valueDiff < 1 ? fcolor : nn.view.c_ecolor // @show/hide color
    c2d.fillText('Rate '+fe.learning_rate.value, rCol, h2+(hTop+12)*nn.view.unit);
    c2d.fillStyle = fcolor;
    if (!nwk.selectedNeuron) {
      c2d.fillText('ACTIVATION', lCol, h2);
      c2d.fillText(nwk.activationMethod, lCol, h2+nn.view.unit);
    } else {nn.drawActivationGraph(nwk.selectedNeuron);}
    if (nn.view.topDown < 0) {i = lBot; lBot = lTop; lTop = i; i = rBot; rBot = rTop; rTop = i; i = bBot; bBot = bTop; bTop = i; biasText = 'BIAS <';}
    c2d.fillText('INPUT >', lCol, lTop);
    c2d.fillText('OUTPUT <', lCol, lBot);
    if (nwk.bias) {
      c2d.translate(nn.view.width-10.1*nn.view.unit, bBot);
      c2d.rotate(Math.PI/2);
      c2d.fillText(biasText, 0, 0);
    }
    c2d.restore();
    nn.network_render(nwk);
    if (nn.view.canvasRender < 0) {nn.view.canvasRender++;}
  };

  nn.drawActivationGraph = function (nrn) {
    var nwk = nn.neuron_getNetwork(nrn); if (!nwk) {return;}
    c2d.save();
    c2d.fillStyle = nn.view.c_fcolor;
    c2d.strokeStyle = nn.view.c_hcolor;
    var av = nn.vars.actVals, act = (nn.activationGraph == 1) ? nwk.activationPrime : nwk.activation;
    var xmin = -5, xmax = 5, left = 4*nn.view.unit, top = nn.view.height/2;
    var hscale = .6*nn.view.unit, vscale = 3*hscale/(nwk.maxOutputValue-nwk.minOutputValue);
    if (nwk.activationMethod == av.TANGENT || nwk.activationMethod == av.LINEAR) {xmin /= 2.5; xmax /= 2.5; hscale *= 2.5;
    } else if (nwk.activationMethod == av.PARABOLIC) {xmin /= 4; xmax /= 4; hscale *= 4;}
    if (nwk.activationMethod == av.SIGMOID && nn.activationGraph == 1) {vscale *= 4;}
    var gx = xmin, gy = act(gx), vmin = gy, vmax = xmax, step = (xmax-xmin)/100;
    c2d.beginPath();
    for (; gx <= xmax; gx += step) {
      gy = act(gx);
      if (gx == xmin) {c2d.moveTo(left+gx*hscale, top-gy*vscale);
      } else {c2d.lineTo(left+gx*hscale, top-gy*vscale);}
    }
    c2d.stroke();
    if (nrn && nrn.row && !nrn.isBias) {
      var sum = nrn.sum, val = (nn.activationGraph == 1) ? act(sum) : nrn.value;
      c2d.beginPath();
      if (sum < xmin) {sum = xmin;} else if (sum > xmax) {sum = xmax;}
      if (vmin < xmin) {vmin = xmin;} if (vmax > top-gy*vscale) {vmax = top-gy*vscale;}
      if (val < vmin) {val = vmin;} else if (val > vmax) {val = vmax;}
      c2d.ellipse(left+sum*hscale, top-val*vscale, 2*nn.view.SU, 2*nn.view.SU, 0, 0, Math.PI*2);
      c2d.fill();
    }
    c2d.beginPath();
    c2d.globalAlpha = .2;
    c2d.moveTo(left+xmin*hscale, top); c2d.lineTo(left+xmax*hscale, top);
    gy = vmax*hscale; gx = left+(xmax+xmin)/2*hscale;
    c2d.moveTo(gx, top+gy); c2d.lineTo(gx, top-gy);
    c2d.stroke();
    c2d.restore();
  };

  nn.renderStats = function (nwk, force) {
    nwk ??= nn.net; if (!nwk || !(nwk.trainingTime || force)) {return;}
    var data_stats = fE.data_stats, data_error = fE.data_error;
    data_stats.classList.remove(nn.view.f_d_fcolor_sc, nn.view.f_e_fcolor_sc, nn.view.f_s_fcolor_sc, nn.view.f_i_fcolor_sc, nn.view.f_w_fcolor_sc);
    if (!nwk.training) {data_stats.classList.add(nn.view.f_d_fcolor_sc);
    } else if (nwk.training == -2) {data_stats.classList.add(nn.view.f_e_fcolor_sc);
    } else if (nwk.training == -1) {data_stats.classList.add(nn.view.f_s_fcolor_sc);
    } else if (nn.worker) {data_stats.classList.add(nn.view.f_i_fcolor_sc);
    } else {data_stats.classList.add(nn.view.f_w_fcolor_sc);}
    data_stats.innerHTML = (!nwk.trainingCycles && !nwk.training) ? '-' : (nwk.trainingCycles/1e3)+'Kc / '+(Math.round(nwk.trainingTime/100)/10)+'s';
    data_error.classList.remove(nn.view.f_d_fcolor_sc, nn.view.f_s_fcolor_sc, nn.view.f_w_fcolor_sc, nn.view.f_e_fcolor_sc);
    if (!nwk.training || nwk.trainingError <= nwk.learningMatch) {data_error.classList.add(nn.view.f_d_fcolor_sc);
    } else if (nwk.convergence < 0) {data_error.classList.add(nn.view.f_s_fcolor_sc);
    } else if (nwk.convergence != 0) {data_error.classList.add(nn.view.f_e_fcolor_sc);}
    data_error.innerHTML = (!nwk.training || nwk.trainingError <= nwk.learningMatch) ? '-' : ''+Math.round(nwk.trainingError*1e4)/1e4;
    if (nwk.adaptRate) {fE.learning_rate.value = nwk.learningRate;}
    nn.updateDataset(nwk);
  };

  nn.trainNetwork = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    if (nn.worker) {
      nwk.training = 2; nn.worker.postMessage('self.run({action: "train"});');
    } else {nn.network_train(nwk);}
    nn.renderStats(nwk);
  };

  nn.stopTraining = function (nwk) {
    nwk ??= nn.net; if (nwk && nwk.training > 0) {nn.changeTraining(nwk, -2);}
  };

  nn.changeTraining = function (nwk, tr) {
    nwk ??= nn.net; if (!nwk || !nwk.targetsLength) {return;}
    if (tr == null || isNaN(tr)) {tr = nwk.training ? 0 : 1;}
    if (!tr && nwk.training > 0) {nwk.training = -2;}
    if (tr <= 0) {
      if (nn.autoExport) {nn.exportNetwork(nwk);} // && !fE.net_json.value.trim()
      if (nn.enableBeep && !tr) {nn.vars.beep.play();}
    } else {
      if (!nn.extendStats) {nwk.trainingTime = nwk.trainingCycles = nwk.trainingError = nwk.trainingDelta = 0;}
      nwk.trainingStart = Date.now()-nwk.trainingTime; nn.enableBeep = 0; clearTimeout(nn.vars.enableBeep_to||0);
      nn.vars.enableBeep_to = setTimeout(function () {nn.enableBeep = Number(fE.enable_beep.value);}, 5e3);
    }
    if (tr || nwk.training >= 0) {nwk.training = tr;}
    nn.renderStats(nwk, 1); nwk.training = tr;
    nn.toggleElementStyleClass(fE.train_data, nn.view.f_e_fcolor_sc, nn.view.f_d_fcolor_sc, nwk.training);
    if (nn.worker) {
      nn.worker.postMessage('nn.net = new nn.Network('+nn.network_serialize(nwk)+');');
    }
  };

  nn.setWeights = function (nwk, weightsmode, scale) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.network_setWeights(nwk, weightsmode, scale);
    nn.requestCanvasRender();
  };

  nn.setSelectedValue = function (nwk, val, tgt, pin) {
    nwk ??= nn.net; if (!nwk || !nwk.lastSelectedNeuron || nwk.training) {return;}
    if (tgt != null && !isNaN(tgt)) {nn.neuron_target(nwk.lastSelectedNeuron, nwk.selectedTarget, tgt);}
    if (val != null && !isNaN(val)) {nn.neuron_value(nwk.lastSelectedNeuron, val);}
    if (pin != null) {nwk.lastSelectedNeuron.pinned = (pin == -1) ? !nwk.lastSelectedNeuron.pinned : !!pin;}
    nn.updateSelected(nwk);
    nn.requestCanvasRender();
  };

  nn.nextData = function (nwk, up) { // up: 1, -1, 0
    nwk ??= nn.net; if (!nwk || !nwk.targetsLength || nwk.training) {return;}
    var last = nwk.targetsLength-1;
    if (nwk.selectedTarget == null) {nwk.selectedTarget = 0;
    } else if (!up || (up > 0 && nwk.selectedTarget == last)) {nwk.selectedTarget = -1;
    } else if (up < 0 && nwk.selectedTarget == -1) {nwk.selectedTarget = last;
    } else {nwk.selectedTarget += up;}
    nn.network_gotoTarget(nwk);
    nn.updateDataset(nwk);
    nn.requestCanvasRenderDelayed();
  };

  nn.saveData = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.stopTraining();
    var selectedTarget = nwk.selectedTarget;
    nn.network_saveData(nwk, null);
    nwk.selectedTarget = (selectedTarget == -1) ? nwk.targetsLength-1 : -1;
    nn.updateDataset(nwk);
    setTimeout(function () {nwk.selectedTarget = selectedTarget; nn.updateDataset(nwk);}, nn.vars.ms.WATCH);
  };

  nn.deleteData = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.stopTraining();
    nn.network_deleteData(nwk, null);
    nn.updateDataset(nwk);
  };

  nn.clearData = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.stopTraining();
    nn.network_clearData(nwk);
    fE.data_stats.innerHTML = fE.data_error.innerHTML = '-';
    nn.updateDataset(nwk);
  };

  nn.exportNetwork = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    var field = fE.net_json;
    field.value = nn.network_serialize(nwk, nn.layersOnly, nn.targetsOnly, !nn.longVals ? nn.vars.roundVal : 0);
    fE.layers_only.value = nn.layersOnly = 0;
    fE.targets_only.value = nn.targetsOnly = 0;
    fE.long_values.value = nn.longVals = 0;
    field.select(); field.setSelectionRange(0, field.value.length); field.blur();
  };

  nn.offsetView = function (nwk, col, row) {
    nwk ??= nn.net; if (!nwk) {return;}
    var elC = fE.col_offset, maxCO = nn.network_getMaxColOffset(nwk), mc = maxCO;
    var elR = fE.row_offset, maxRO = nn.network_getMaxRowOffset(nwk), mr = maxRO;
    if (mc < 1) {col = 0; mc = 1;} else if (col == null) {col = Math.round(Number(elC.value)*mc)||0;}
    if (mr < 1) {row = 0; mr = 1;} else if (row == null) {row = Math.round(Number(elR.value)*mr)||0;}
    if (col > mc) {col = 0;} else if (col < 0) {col = mc;}
    if (row > mr) {row = 0;} else if (row < 0) {row = mr;}
    nn.view.canvasLastOffsetCol = (maxCO < 1) ? 0 : maxCO; nn.view.canvasLastOffsetRow = (maxRO < 1) ? 0 : maxRO;
    nn.view.canvasOffsetCol = col; nn.view.canvasOffsetRow = row;
    fE.col_offset_label.innerHTML = ''+col; elC.value = Math.round(col/mc*100)/100;
    fE.row_offset_label.innerHTML = ''+row; elR.value = Math.round(row/mr*100)/100;
    fE.max_col_offset_label.innerHTML = ''+nn.view.canvasLastOffsetCol;
    fE.max_row_offset_label.innerHTML = ''+nn.view.canvasLastOffsetRow;
    nn.network_setPositions(nwk);
    nn.requestCanvasRender();
  };

  nn.updateNetwork = function (nwk) {
    var v; nn.net = nwk ??= nn.net; nn.view.topDown ??= 1; if (!nwk) {return;}
    nn.activationGraph = Number(fE.activation_graph.value);
    fE.activation_graph_label.innerHTML = nn.activationGraph ? nn.vars.actVals.PRIME : nn.vars.actVals.ACTIVATION;
    nn.autoExport = Number(fE.auto_export.value);
    nn.enableBeep = Number(fE.enable_beep.value);
    nn.extendStats = Number(fE.extend_stats.value);
    nn.layersOnly = Number(fE.layers_only.value);
    nn.targetsOnly = Number(fE.targets_only.value);
    nn.longVals = Number(fE.long_values.value);
    v = fE.training_period.value; nwk.trainingPeriod = Number('1e'+v);
    fE.training_period_label.innerHTML = (nwk.trainingPeriod < 1e4) ? ''+nwk.trainingPeriod : '10^'+v;
    nwk.shuffleData = Number(fE.shuffle_data.value);
    nn.offsetView(nwk, null, null);
  };

  nn.updateSelected = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    var nrn = nwk.lastSelectedNeuron, DIS = 'disabled', NON = '-', ROW = 'Row ', COL = ', Col ';
    if (nrn) {
      fE.selected_neuron.value = nn.roundNumberFormat(nrn.value, nn.vars.roundVal);
      fE.selected_neuron_label.innerHTML = ROW+(nrn.row+1)+COL+(nrn.col+1);
    } else {
      fE.selected_neuron.value = '';
      fE.selected_neuron_label.innerHTML = ROW+NON+COL+NON;
    }
    if (nrn && !nrn.pinned) {fE.selected_neuron.removeAttribute(DIS);
    } else {fE.selected_neuron.setAttribute(DIS, DIS);}
    if (nrn && nrn.targets.length && nwk.selectedTarget != -1) {
      fE.selected_target.value = nn.roundNumberFormat(nrn.targets[nwk.selectedTarget], nn.vars.roundVal);
      fE.selected_target.removeAttribute(DIS);
    } else {
      fE.selected_target.value = '';
      fE.selected_target.setAttribute(DIS, DIS);
    }
  };

  nn.updateDataset = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.network_adjustTargets(nwk);
    nn.requestCanvasRender();
    clearTimeout(nn.vars.updateDataset_to||0);
    nn.vars.updateDataset_to = setTimeout(function () {
      if (!aa.nn || !nn.form) {return;}
      fE.dataset_label.innerHTML = ''+((nwk.selectedTarget+1)||'+'); fE.datasets_label.innerHTML = ''+nwk.targetsLength;
      nn.toggleElementStyleClass(fE.datasets_label.parentElement, nn.view.f_d_fcolor_sc, nn.view.f_e_fcolor_sc, nwk.targetsLength >= 2);
      fE.data_sets.innerHTML = nwk.neuronsLength+'N x '+nwk.targetsLength+'DS';
      nn.toggleElementStyleClass(fE.learning_match, nn.view.f_d_fcolor_sc, nn.view.f_e_fcolor_sc, true); // nwk.targetsLength < 2 || !nwk.dataDiff || nwk.learningMatch/nwk.dataDiff < .5 // @show/hide color
      nn.toggleElementStyleClass(fE.learning_rate, nn.view.f_d_fcolor_sc, nn.view.f_e_fcolor_sc, true); // !nwk.valueDiff || nwk.learningRate/nwk.valueDiff < 1 // @show/hide color
      fE.data_diff_label.innerHTML = ''+nn.roundNumberFormat(nwk.dataDiff, nn.vars.roundVal); fE.value_diff_label.innerHTML = ''+nn.roundNumberFormat(nwk.valueDiff, nn.vars.roundVal);
      nn.toggleElementStyleClass(fE.data_diff_label.parentElement, nn.view.f_d_fcolor_sc, nn.view.f_e_fcolor_sc, nwk.targetsLength < 2 || nwk.dataDiff);
      nn.updateSelected(nwk);
    }, nn.vars.ms.LISTEN);
  };

  nn.updateForm = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    var v, DIS = 'disabled';
    var hiddenLayers = (nwk.layers.length < 2) ? 0 : nwk.layers.length-2;
    var hiddenNeurons = !hiddenLayers ? Number(fE.hidden_neurons.value) : !nwk.layers[1].length ? 0 : nwk.layers[1].length-nwk.bias;
    if (hiddenNeurons < 1) {hiddenNeurons = 1;}
    var inputNeurons = nwk.layers[0].length-nwk.bias;
    var outputNeurons = nwk.layers[nwk.layers.length-1].length;
    var biasNeurons = nwk.bias*(hiddenLayers+1);
    fE.network_name.value = nwk.name;
    fE.bias_neurons.value = nwk.bias;
    fE.freeze_bias.value = nwk.freezeBias;
    fE.input_neurons.value = inputNeurons;
    fE.output_neurons.value = outputNeurons;
    fE.hidden_neurons.value = hiddenNeurons;
    fE.hidden_layers.value = hiddenLayers;
    fE.bias_neurons_label.innerHTML = ''+biasNeurons;
    fE.activation_method.value = nwk.activationMethod;
    fE.min_input_value.value = nwk.minInputValue; fE.min_input_value_label.innerHTML = ''+nwk.minInputValue;
    fE.max_input_value.value = nwk.maxInputValue; fE.max_input_value_label.innerHTML = ''+nwk.maxInputValue;
    fE.min_output_value.value = nwk.minOutputValue; fE.min_output_value_label.innerHTML = ''+nwk.minOutputValue;
    fE.max_output_value.value = nwk.maxOutputValue; fE.max_output_value_label.innerHTML = ''+nwk.maxOutputValue;
    fE.min_domain_value.value = nwk.minDomainValue; fE.min_domain_value_label.innerHTML = ''+nwk.minDomainValue;
    fE.max_domain_value.value = nwk.maxDomainValue; fE.max_domain_value_label.innerHTML = ''+nwk.maxDomainValue;
    if (nwk.activationMethod == nn.vars.actVals.PARABOLIC || nwk.activationMethod == nn.vars.actVals.LINEAR) {
      fE.min_input_value.removeAttribute(DIS); fE.max_input_value.removeAttribute(DIS);
      fE.min_output_value.removeAttribute(DIS); fE.max_output_value.removeAttribute(DIS);
    } else {
      fE.min_input_value.setAttribute(DIS, DIS); fE.max_input_value.setAttribute(DIS, DIS);
      fE.min_output_value.setAttribute(DIS, DIS); fE.max_output_value.setAttribute(DIS, DIS);
    }
    fE.min_domain_value.setAttribute(DIS, DIS); // @show/hide use cases
    fE.adapt_neurons.setAttribute(DIS, DIS); // @show/hide // @todo adaptNeurons
    fE.adapt_neurons.value = nwk.adaptNeurons||0;
    fE.adapt_rate.value = nwk.adaptRate||0;
    fE.learning_rate.value = nn.roundNumberFormat(nwk.learningRate, nn.vars.roundVal);
    fE.learning_match.value = nn.roundNumberFormat(nwk.learningMatch, nn.vars.roundVal);
    fE.data_sets.innerHTML = nwk.neuronsLength+'N x '+nwk.targetsLength+'DS';
    fE.data_stats.innerHTML = fE.data_error.innerHTML = '-';
    if (nwk.trainingPeriod != null) {
      v = fE.training_period.value = nn.numberBase(nwk.trainingPeriod);
      fE.training_period_label.innerHTML = (nwk.trainingPeriod < 1e4) ? ''+nwk.trainingPeriod : '10^'+v;
    }
    if (nwk.shuffleData != null) {fE.shuffle_data.value = nwk.shuffleData;}
    fE.col_offset.value = 0; fE.col_offset_label.innerHTML = '0';
    fE.row_offset.value = 0; fE.row_offset_label.innerHTML = '0';
    // if (nn.autoExport) {fE.net_json.value = '';} // @hide/show
    fE.import_net.blur();
    nn.updateDataset(nwk);
    nn.updateNetwork(nwk);
  };

  nn.setNetwork = function (nwk, keepTraining) {
    if (!keepTraining) {
      nn.stopTraining();
      nn.setWorker(1);
    }
    nn.net = nwk = new nn.Network(nwk ?? nn.net);
    nn.updateForm(nwk);
    nn.renderStats(nwk, 1);
    setTimeout(nn.requestCanvasRender, nn.vars.ms.LISTEN);
  };

  nn.setLayers = function (nwk) {
    nwk ??= nn.net; if (!nwk) {return;}
    nwk.freezeBias = Number(fE.freeze_bias.value)||0;
    var i, bias = Number(fE.bias_neurons.value)||0;
    var hiddenLayers = Number(fE.hidden_layers.value)||0; if (hiddenLayers < 0) {hiddenLayers = 0;}
    var hiddenNeurons = Number(fE.hidden_neurons.value)||1; if (hiddenNeurons < 1) {hiddenNeurons = 1;}
    var inputNeurons = Number(fE.input_neurons.value)||1; if (inputNeurons < 1) {inputNeurons = 1;}
    var outputNeurons = Number(fE.output_neurons.value)||1; if (outputNeurons < 1) {outputNeurons = 1;}
    if (bias != nwk.bias) {
      if (bias) {for (i = 0; i < nwk.layers.length-1; i++) {nwk.layers[i].push({});}
      } else {for (i = 0; i < nwk.layers.length-1; i++) {nwk.layers[i].pop();}}
      nwk.bias = bias;
    }
    if (hiddenLayers > nwk.layers.length-2) {
      i = (nwk.layers.length > 2) ? nwk.layers[1].length : hiddenNeurons+nwk.bias;
      while (nwk.layers.length-2 < hiddenLayers) {nwk.layers.splice(nwk.layers.length-1, 0, i);}
    } else if (hiddenLayers < nwk.layers.length-2) {nwk.layers.splice(hiddenLayers+1, nwk.layers.length-2-hiddenLayers);}
    if (nwk.layers.length > 2 && hiddenNeurons != nwk.layers[1].length-nwk.bias) {
      for (i = 1; i < nwk.layers.length-1; i++) {
        nwk.layers[i] = !nwk.bias || !nwk.layers[i].length ? [] : [nwk.layers[i].at(-1)];
        while (nwk.layers[i].length-nwk.bias < hiddenNeurons) {nwk.layers[i].unshift({});}
      }
    }
    i = nwk.layers[0];
    if (inputNeurons > i.length-nwk.bias) {
      while (i.length-nwk.bias < inputNeurons) {i.splice(i.length-nwk.bias, 0, {});}
    } else if (inputNeurons < i.length-nwk.bias) {i.splice(inputNeurons, i.length-nwk.bias-inputNeurons);}
    i = nwk.layers.at(-1);
    if (outputNeurons > i.length) {while (i.length < outputNeurons) {i.push({});}
    } else if (outputNeurons < i.length) {i.splice(outputNeurons, i.length-outputNeurons);}
    nn.setNetwork(nwk);
  };

  nn.setLearning = function (nwk, match, rate, adaptR, adaptN) {
    nwk ??= nn.net; if (!nwk) {return;}
    nn.network_setLearning(nwk, match, rate, adaptR, adaptN);
    nn.setNetwork(nwk);
  };

  nn.setActivation = function (nwk, method, iv, ov, rx) {
    nwk ??= nn.net; if (!nwk) {return;}
    var i, av = nn.vars.actVals; iv ??= {}; ov ??= {}; rx ??= {};
    var origMethod = nwk.activationMethod||'', origLIV = nwk.minInputValue, origRIV = nwk.maxInputValue;
    if (method == -1) {
      var name = -1, names = [av.SIGMOID, av.TANGENT, av.PARABOLIC, av.LINEAR];
      for (i = 0; i < names.length; i++) {if (origMethod.indexOf(names[i]) != -1) {name = i; break;}}
      if (++name >= names.length) {name = 0;}
      method = names[name];
    }
    if (iv.min != null) {iv.min = Number(iv.min); if (iv.min >= 0 && iv.max <= 0) {iv.max = 1;}}
    if (iv.max != null) {iv.max = Number(iv.max); if (iv.max <= 0 && iv.min >= 0) {iv.min = -1;}}
    if (method != origMethod) {
      if (iv.min == null && iv.max == null) {nwk.minInputValue = nwk.maxInputValue = null;}
      if (ov.min == null && ov.max == null) {nwk.minOutputValue = nwk.maxOutputValue = null;}
      if (rx.min == null && rx.max == null) {nwk.minDomainValue = nwk.maxDomainValue = null;}
    }
    nn.network_setActivation(nwk, method, iv, ov, rx);
    if (nwk.activationMethod == origMethod && nwk.minInputValue == origLIV && nwk.maxInputValue == origRIV) {
      nn.updateForm(nwk);
    } else {nn.setNetwork(nwk);}
  };

  nn.setName = function (nwk, name) {
    nwk ??= nn.net; if (!nwk) {return;}
    nwk.name = name;
    for (var i = 0; i < nwk.layers.length; i++) {
      for (var j = 0; j < nwk.layers[i].length; j++) {nwk.layers[i][j].netName = name;}
    }
    nn.updateForm(nwk);
  };

  nn.importNetwork = function (nwk) {
    nwk ??= fE.net_json.value.trim() || nn.vars.AND_OR_XOR;
    nn.setNetwork(nwk);
  };

  nn.createNetwork = function (name) {
    var i, nwk = {}; nwk.name = name||'NN';
    nwk.bias = Number(fE.bias_neurons.value)||0;
    nwk.freezeBias = Number(fE.freeze_bias.value)||0;
    var inputNeurons = Number(fE.input_neurons.value)||1;
    var outputNeurons = Number(fE.output_neurons.value)||1;
    var hiddenNeurons = Number(fE.hidden_neurons.value)||1;
    var hiddenLayers = Number(fE.hidden_layers.value)||0;
    nwk.layers = []; nwk.layers.push(inputNeurons+nwk.bias);
    for (i = 0; i < hiddenLayers; i++) {nwk.layers.push(hiddenNeurons+nwk.bias);}
    nwk.layers.push(outputNeurons);
    nn.setNetwork(nwk);
  };

  nn.requestCanvasRender = function (play) {
    if (play == null) {play = nn.view.canvasRender;}
    nn.view.canvasRender = play||-1;
  };

  nn.requestCanvasRenderDelayed = function (play, delay) {
    if (delay == null) {delay = nn.vars.ms.LISTEN;}
    clearTimeout(nn.vars.requestCanvasRender_to||0);
    nn.vars.requestCanvasRender_to = setTimeout(nn.requestCanvasRender, delay, play);
  };

  nn.setCanvasTopDown = function (td) {
    if (!td) {nn.view.topDown = -nn.view.topDown;
    } else {nn.view.topDown = td;}
    nn.updateNetwork(null);
  };

  nn.setCanvasTheme = function (theme) {
    var toggle = function () {
      var col = nn.view.c_bcolor; nn.view.c_bcolor = nn.view.c_bcolor_i; nn.view.c_bcolor_i = col;
      col = nn.view.c_fcolor; nn.view.c_fcolor = nn.view.c_fcolor_i; nn.view.c_fcolor_i = col;
      col = nn.view.c_hcolor; nn.view.c_hcolor = nn.view.c_hcolor_i; nn.view.c_hcolor_i = col;
      col = nn.view.c_ecolor; nn.view.c_ecolor = nn.view.c_ecolor_i; nn.view.c_ecolor_i = col;
      col = nn.view.c_scolor; nn.view.c_scolor = nn.view.c_scolor_i; nn.view.c_scolor_i = col;
      col = nn.view.c_p_fcolor; nn.view.c_p_fcolor = nn.view.c_p_fcolor_i; nn.view.c_p_fcolor_i = col;
      col = nn.view.c_n_fcolor; nn.view.c_n_fcolor = nn.view.c_n_fcolor_i; nn.view.c_n_fcolor_i = col;
      col = nn.view.c_1_bcolor; nn.view.c_1_bcolor = nn.view.c_1_bcolor_i; nn.view.c_1_bcolor_i = col;
    };
    if (!theme || theme == 'dark') {theme = 0;} else if (theme == 'light') {theme = 1;}
    if (theme != nn.view.canvasTheme) {nn.view.canvasTheme = theme; toggle();}
    fE.canvas_theme.value = nn.view.canvasTheme;
    nn.requestCanvasRender();
  };

  nn.updateCanvas = function (flat) {
    if (flat == -1) {nn.view.collapseLayers = !nn.view.collapseLayers ? 1 : 0;
    } else if (flat != null) {nn.view.collapseLayers = flat;}
    var aspect = nn.view.collapseLayers ? nn.view.c_geom_aspect_1 : nn.view.c_geom_aspect;
    nn.view.height = Math.round(aspect*nn.view.width);
    nn.setCanvas(null);
    nn.updateNetwork(null);
  };

  nn.canvasDisplay = function (vis) {
    if (vis == -1) {vis = (nn.canvas.style.display == 'none');}
    nn.canvas.style.display = !vis ? 'none' : null;
    if (!vis && nn.form.style.display == 'none') {nn.formDisplay(1);}
  };

  nn.formDisplay = function (vis) {
    if (vis == -1) {vis = (nn.form.style.display == 'none');}
    nn.form.style.display = !vis ? 'none' : null;
    if (!vis && nn.canvas.style.display == 'none') {nn.canvasDisplay(1);}
  };

  nn.drawPolygon = function (canvas2d, sides, x, y, size, rot) {
    var sa = 2*Math.PI/sides; rot = (rot||0)*Math.PI;
    canvas2d.save();
    canvas2d.beginPath();
    canvas2d.moveTo(x+size*Math.cos(rot), y+size*Math.sin(rot));
    for (var i = 1; i <= sides; i++) {
      canvas2d.lineTo(x+size*Math.cos(rot+i*sa), y+size*Math.sin(rot+i*sa));
    }
    canvas2d.restore();
  };

  nn.distance = function (ax, ay, bx, by) {
    bx -= ax; bx *= bx; by -= ay; by *= by; bx += by; return Math.sqrt(bx);
  };

  nn.numberBase = function (num) {
    num = num.toExponential(); return Number(num.substring(num.indexOf('e')+1))||0;
  };

  nn.roundNumberFormat = function (num, dd, dx) {
    dd = dd||3; if (dx == null) {dx = dd-1;}
    var an = Math.abs(num), pd = Math.pow(10, dd);
    return (!an || an > 1/pd && an < pd) ? ''+Number(num.toPrecision(dd)) : num.toExponential(dx);
  };

  nn.formatJSON = function (json, format) {
    if (json && json.constructor == String) {
      json = json.trim(); if (format == -1) {format = (json.indexOf('\n') == -1 && json.length > 2);}
      try {json = JSON.parse(json);} catch (er) {}
    }
    if (json && json.constructor != String) {json = JSON.stringify(json, null, !format ? null : 2);}
    return json;
  };

  nn.toggleElementStyleClass = function (elem, trueSC, falseSC, cond) {
    var sargs = [].slice.call(arguments, 1, 3); if (elem.classList) {elem = [elem];}
    for (var i = 0; i < elem.length; i++) {
      var el = elem[i]; el.classList.remove.apply(el.classList, sargs);
      if (cond !== undefined && !cond) {el.classList.add(falseSC);} else {el.classList.add(trueSC);}
    }
  };

  nn.loadWorker = function (inp, fun) {
    var url; inp ??= {}; if (inp.constructor != Object) {inp = {url: inp};}
    if (!inp.url && typeof URL != 'undefined' && typeof Blob != 'undefined') {
      url = new Blob(['self.onmessage = '+function (ev) {
        var msg = ''+ev.data;
        if (msg.charAt(0) == '?') {
          msg = eval(msg.substring(1));
          if (typeof msg == 'object' && msg != null) {msg = JSON.stringify(msg);}
          self.postMessage(''+msg);
        } else {eval(msg);}
      }+';']);
      url = URL.createObjectURL(url); setTimeout(URL.revokeObjectURL, 0, url);
      inp.url = ''; if (inp.basePath == null) {inp.basePath = nn.vars.basePath;}
    } else {
      url = inp.url; if (inp.url.constructor != String) {inp.url = '';}
      if (inp.basePath == null) {inp.basePath = '';}
    }
    var wrk = new Worker(url); wrk.input = inp; if (nn.workers) {nn.workers.push(wrk);}
    wrk.onmessage = function (ev) {
      var msg = ''+ev.data;
      if (msg.charAt(0) == '?') {
        var i = msg.substring(1); msg = eval(i);
        if (typeof msg == 'object' && msg != null) {msg = JSON.stringify(msg);}
        wrk.postMessage(i+' = '+msg);
      } else {wrk.output = (msg.charAt(0) == '{' || msg.charAt(0) == '[') ? JSON.parse(msg) : msg;}
      if (fun) {fun(wrk);}
    };
    wrk.onerror = function (er) {wrk.error = er; if (fun) {fun(wrk);}};
    return wrk;
  };

  nn.unloadWorker = function (wrk) {
    if (wrk == nn.worker) {nn.worker = null;}
    var i = !nn.workers ? -1 : nn.workers.indexOf(wrk); if (i != -1) {nn.workers.splice(i, 1);}
    if (wrk && wrk.postMessage) {wrk.postMessage('self.close();');}
  };

  nn.setWorker = function (on) {
    if (nn.worker && nn.worker.terminate) {nn.worker.terminate();}
    if (on < 0) {return;}
    nn.worker = nn.loadWorker(null, function (wk) {
      var output = wk.output??wk.error??{};
      if (output.action == 'train') {
        if (nn.net.training <= 0 && output.net.training > 0) {output.net.training = -2;}
        nn.setNetwork(output.net, 1);
      }
    });
    nn.worker.postMessage('(function (inp) { "use strict";'
      +'\n  inp ||= {}; inp.basePath ??= "";'
      +'\n  self.input = inp; self.output = {};'
      +'\n  self.aa ??= {}; self.nn = aa.nn ??= {};'
      +'\n  nn.vars = '+JSON.stringify(nn.vars)+';'
      +'\n  const aG = nn.vars.actGeom;'
      +'\n  nn.actSigmoid = '+nn.actSigmoid+';'
      +'\n  nn.actSigmoidPrime = '+nn.actSigmoidPrime+';'
      +'\n  nn.actTangent = '+nn.actTangent+';'
      +'\n  nn.actTangentPrime = '+nn.actTangentPrime+';'
      +'\n  nn.actParabolic = '+nn.actParabolic+';'
      +'\n  nn.actParabolicPrime = '+nn.actParabolicPrime+';'
      +'\n  nn.actLinear = '+nn.actLinear+';'
      +'\n  nn.actLinearPrime = '+nn.actLinearPrime+';'
      +'\n  nn.neuron_calculate = '+nn.neuron_calculate+';'
      +'\n  nn.neuron_pull = '+nn.neuron_pull+';'
      +'\n  nn.neuron_getIndex = '+nn.neuron_getIndex+';'
      +'\n  nn.neuron_setWeights = '+nn.neuron_setWeights+';'
      +'\n  nn.neuron_setTargets = '+nn.neuron_setTargets+';'
      +'\n  nn.Neuron = '+nn.Neuron+';'
      +'\n  nn.network_train = '+nn.network_train+';'
      +'\n  nn.network_convergence = '+nn.network_convergence+';'
      +'\n  nn.network_setActivation = '+nn.network_setActivation+';'
      +'\n  nn.network_getDataDiff = '+nn.network_getDataDiff+';'
      +'\n  nn.network_export = '+nn.network_export+';'
      +'\n  nn.Network = '+nn.Network+';'
      +'\n  self.run = '+function (params) {
        params ??= {}; self.output.action = params.action;
        if (params.action == 'train') {
          if (nn.net && nn.net.training > 0) {nn.network_train(nn.net);}
          self.output.net = nn.network_export(nn.net);
        }
        self.postMessage(JSON.stringify(self.output));
      }+';'
      +'\n})('+JSON.stringify(nn.worker.input)+');'
    );
  };

  nn.setCanvas = function (theme) {
    var canvasContainer = nn.container.querySelector('[x-id="nn_canvas_container"]');
    nn.canvas = canvasContainer.querySelector('canvas');
    if (!nn.canvas) {
      nn.canvas = document.createElement('canvas');
      canvasContainer.appendChild(nn.canvas);
    }
    if (theme != null) {nn.setCanvasTheme(theme);}
    nn.canvas.width = nn.view.width; nn.canvas.height = nn.view.height;
    nn.canvas.style.width = nn.view.width/nn.view.SU; nn.canvas.style.height = nn.view.height/nn.view.SU;
    nn.canvas.style.backgroundImage = 'radial-gradient(ellipse farthest-corner at '+(nn.view.width/2)+'px '+(nn.view.height/2)+'px, '+nn.view.c_1_bcolor+' 0%, '+nn.view.c_bcolor+' 100%)';
    // nn.canvas.style.borderRadius = (32*nn.view.SU)+'px'; // @hide, 0, 32, 256
    // nn.canvas.style.position = 'relative'; nn.canvas.style.zIndex = -1; // @hide, old browsers misbehaviour.
    c2d = nn.canvas2d = nn.canvas.getContext('2d');
    c2d.lineWidth = nn.view.SU;
    c2d.font = (.65*nn.view.unit)+'px sans-serif';
    c2d.textAlign = 'left';
  };

  nn.setForm = function (on) {
    var i, el;
    if (nn.form && nn.form.el) {
      for (i in nn.form.el) {el = nn.form.el[i]; if (el.tagName) {el.onclick = el.onchange = el.oninput = null;}}
    }
    if (on < 0) {return;}
    nn.form = nn.container.querySelector('[x-id="nn_form_content"]')??document;
    fE = nn.form.el = {};
    var eventListener = function (ev) {
      var tgt = ev.target, num = Number(tgt.value); if (ev.type == 'input') {tgt.onchange = null;}
      if (tgt == fE.network_name) {nn.setName(null, tgt.value.trim());}
      if (tgt == fE.format_net) {tgt = fE.net_json; tgt.value = nn.formatJSON(tgt.value, -1);}
      if (tgt == fE.selected_target) {nn.setSelectedValue(null, null, num, null);
      } else if (tgt == fE.selected_neuron) {nn.setSelectedValue(null, num, null, null);
      } else if (tgt == fE.selected_neuron_pin) {nn.setSelectedValue(null, null, null, -1);}
      if (tgt == fE.input_neurons_lower) {tgt = fE.input_neurons; num = Number(tgt.value); tgt.value = num-1;}
      if (tgt == fE.input_neurons_higher) {tgt = fE.input_neurons; num = Number(tgt.value); tgt.value = num+1;}
      if (tgt == fE.output_neurons_lower) {tgt = fE.output_neurons; num = Number(tgt.value); tgt.value = num-1;}
      if (tgt == fE.output_neurons_higher) {tgt = fE.output_neurons; num = Number(tgt.value); tgt.value = num+1;}
      if (tgt == fE.hidden_neurons_lower) {tgt = fE.hidden_neurons; num = Number(tgt.value); tgt.value = num-1;}
      if (tgt == fE.hidden_neurons_higher) {tgt = fE.hidden_neurons; num = Number(tgt.value); tgt.value = num+1;}
      if (tgt == fE.hidden_layers_lower) {tgt = fE.hidden_layers; num = Number(tgt.value); tgt.value = num-1;}
      if (tgt == fE.hidden_layers_higher) {tgt = fE.hidden_layers; num = Number(tgt.value); tgt.value = num+1;}
      [fE.bias_neurons, fE.freeze_bias, fE.hidden_layers, fE.hidden_neurons, fE.input_neurons, fE.output_neurons]
        .includes(tgt) && nn.setLayers(null);
      if (tgt == fE.min_input_value) {nn.setActivation(null, null, {min: num}, null, null);
      } else if (tgt == fE.max_input_value) {nn.setActivation(null, null, {max: num}, null, null);
      } else if (tgt == fE.min_output_value) {nn.setActivation(null, null, null, {min: num}, null);
      } else if (tgt == fE.max_output_value) {nn.setActivation(null, null, null, {max: num}, null);
      } else if (tgt == fE.min_domain_value) {nn.setActivation(null, null, null, null, {min: num});
      } else if (tgt == fE.max_domain_value) {nn.setActivation(null, null, null, null, {max: num});}
      if (tgt == fE.learning_rate) {nn.setLearning(null, null, Math.abs(num), null, null);
      } else if (tgt == fE.learning_match) {nn.setLearning(null, Math.abs(num), null, null, null);
      } else if (tgt == fE.learning_match_lower) {nn.setLearning(null, -.333, null, null, null);
      } else if (tgt == fE.learning_calc) {nn.setLearning(null, 0, 0, null, null);
      } else if (tgt == fE.learning_rate_higher) {nn.setLearning(null, null, -1.33, null, null);
      } else if (tgt == fE.adapt_rate) {nn.setLearning(null, null, null, num, null);
      } else if (tgt == fE.adapt_neurons) {nn.setLearning(null, null, null, null, num);}
      if (tgt == fE.fixed_weights) {nn.setWeights(null, nn.vars.FIXED, null);
      } else if (tgt == fE.random_weights) {nn.setWeights(null, [], null);
      } else if (tgt == fE.lose_weights) {nn.setWeights(null, null, .5);}
      if (tgt == fE.col_offset || tgt == fE.row_offset) {nn.offsetView(null, null, null);}
      if (tgt == fE.import_net) {nn.importNetwork(null);}
      if (tgt == fE.export_net) {nn.exportNetwork(null);}
      if (tgt == fE.clear_data) {nn.clearData(null);}
      if (tgt == fE.delete_data) {nn.deleteData(null);}
      if (tgt == fE.save_data) {nn.saveData(null);}
      if (tgt == fE.prev_data) {nn.nextData(null, -1);}
      if (tgt == fE.next_data) {nn.nextData(null, 1);}
      if (tgt == fE.new_data) {nn.nextData(null, 0);}
      if (tgt == fE.train_data) {nn.changeTraining(null, null);}
      if (tgt == fE.bottom_up) {nn.setCanvasTopDown(null);}
      if (tgt == fE.canvas_hide) {nn.canvasDisplay(-1);}
      if (tgt == fE.canvas_theme) {nn.setCanvas(!nn.view.canvasTheme ? 1 : 0);}
      if (tgt == fE.collapse_layers) {nn.updateCanvas(-1);}
      if (tgt == fE.training_period || tgt == fE.shuffle_data
        || tgt == fE.auto_export || tgt == fE.enable_beep || tgt == fE.extend_stats
        || tgt == fE.layers_only || tgt == fE.targets_only || tgt == fE.activation_graph
        || tgt == fE.long_values) {nn.updateNetwork(null);}
      if (tgt == fE.samples_data) {
        nn.importNetwork(nn.vars[tgt.value]); setTimeout(function () {tgt.value = '';}, nn.vars.ms.REFRESH);
      }
      if (tgt == fE.activation_method) {nn.setActivation(null, tgt.value);}
    };
    el = fE.network_name = nn.form.querySelector('[x-id="network_name"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.selected_target = nn.form.querySelector('[x-id="selected_target"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.selected_neuron = nn.form.querySelector('[x-id="selected_neuron"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.selected_neuron_pin = nn.form.querySelector('[x-id="selected_neuron_pin"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.learning_rate = nn.form.querySelector('[x-id="learning_rate"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.learning_match = nn.form.querySelector('[x-id="learning_match"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.learning_match_lower = nn.form.querySelector('[x-id="learning_match_lower"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.learning_calc = nn.form.querySelector('[x-id="learning_calc"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.learning_rate_higher = nn.form.querySelector('[x-id="learning_rate_higher"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.format_net = nn.form.querySelector('[x-id="format_net"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.training_period = nn.form.querySelector('[x-id="training_period"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.shuffle_data = nn.form.querySelector('[x-id="shuffle_data"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.adapt_neurons = nn.form.querySelector('[x-id="adapt_neurons"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.adapt_rate = nn.form.querySelector('[x-id="adapt_rate"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.col_offset = nn.form.querySelector('[x-id="col_offset"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.row_offset = nn.form.querySelector('[x-id="row_offset"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.min_input_value = nn.form.querySelector('[x-id="min_input_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.max_input_value = nn.form.querySelector('[x-id="max_input_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.min_output_value = nn.form.querySelector('[x-id="min_output_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.max_output_value = nn.form.querySelector('[x-id="max_output_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.min_domain_value = nn.form.querySelector('[x-id="min_domain_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.max_domain_value = nn.form.querySelector('[x-id="max_domain_value"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.bias_neurons = nn.form.querySelector('[x-id="bias_neurons"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.freeze_bias = nn.form.querySelector('[x-id="freeze_bias"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.hidden_layers = nn.form.querySelector('[x-id="hidden_layers"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.hidden_layers_lower = nn.form.querySelector('[x-id="hidden_layers_lower"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.hidden_layers_higher = nn.form.querySelector('[x-id="hidden_layers_higher"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.hidden_neurons = nn.form.querySelector('[x-id="hidden_neurons"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.hidden_neurons_lower = nn.form.querySelector('[x-id="hidden_neurons_lower"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.hidden_neurons_higher = nn.form.querySelector('[x-id="hidden_neurons_higher"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.input_neurons = nn.form.querySelector('[x-id="input_neurons"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.input_neurons_lower = nn.form.querySelector('[x-id="input_neurons_lower"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.input_neurons_higher = nn.form.querySelector('[x-id="input_neurons_higher"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.output_neurons = nn.form.querySelector('[x-id="output_neurons"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.output_neurons_lower = nn.form.querySelector('[x-id="output_neurons_lower"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.output_neurons_higher = nn.form.querySelector('[x-id="output_neurons_higher"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.activation_graph = nn.form.querySelector('[x-id="activation_graph"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.auto_export = nn.form.querySelector('[x-id="auto_export"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.enable_beep = nn.form.querySelector('[x-id="enable_beep"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.extend_stats = nn.form.querySelector('[x-id="extend_stats"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.layers_only = nn.form.querySelector('[x-id="layers_only"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.targets_only = nn.form.querySelector('[x-id="targets_only"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.long_values = nn.form.querySelector('[x-id="long_values"]')??{}; if (el.tagName) {el.oninput = el.onchange = eventListener;}
    el = fE.samples_data = nn.form.querySelector('[x-id="samples_data"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.activation_method = nn.form.querySelector('[x-id="activation_method"]')??{}; if (el.tagName) {el.onchange = eventListener;}
    el = fE.import_net = nn.form.querySelector('[x-id="import_net"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.export_net = nn.form.querySelector('[x-id="export_net"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.clear_data = nn.form.querySelector('[x-id="clear_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.delete_data = nn.form.querySelector('[x-id="delete_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.save_data = nn.form.querySelector('[x-id="save_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.prev_data = nn.form.querySelector('[x-id="prev_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.next_data = nn.form.querySelector('[x-id="next_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.new_data = nn.form.querySelector('[x-id="new_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.random_weights = nn.form.querySelector('[x-id="random_weights"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.fixed_weights = nn.form.querySelector('[x-id="fixed_weights"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.lose_weights = nn.form.querySelector('[x-id="lose_weights"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.train_data = nn.form.querySelector('[x-id="train_data"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.bottom_up = nn.form.querySelector('[x-id="bottom_up"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.canvas_hide = nn.form.querySelector('[x-id="canvas_hide"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.canvas_theme = nn.form.querySelector('[x-id="canvas_theme"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    el = fE.collapse_layers = nn.form.querySelector('[x-id="collapse_layers"]')??{}; if (el.tagName) {el.onclick = eventListener;}
    fE.data_stats = nn.form.querySelector('[x-id="data_stats"]')??{};
    fE.data_error = nn.form.querySelector('[x-id="data_error"]')??{};
    fE.data_sets = nn.form.querySelector('[x-id="data_sets"]')??{};
    fE.net_json = nn.form.querySelector('[x-id="net_json"]')??{};
    fE.selected_neuron_label = nn.form.querySelector('[x-id="selected_neuron_label"]')??{};
    fE.col_offset_label = nn.form.querySelector('[x-id="col_offset_label"]')??{};
    fE.max_col_offset_label = nn.form.querySelector('[x-id="max_col_offset_label"]')??{};
    fE.row_offset_label = nn.form.querySelector('[x-id="row_offset_label"]')??{};
    fE.max_row_offset_label = nn.form.querySelector('[x-id="max_row_offset_label"]')??{};
    fE.activation_graph_label = nn.form.querySelector('[x-id="activation_graph_label"]')??{};
    fE.training_period_label = nn.form.querySelector('[x-id="training_period_label"]')??{};
    fE.bias_neurons_label = nn.form.querySelector('[x-id="bias_neurons_label"]')??{};
    fE.dataset_label = nn.form.querySelector('[x-id="dataset_label"]')??{};
    fE.datasets_label = nn.form.querySelector('[x-id="datasets_label"]')??{};
    fE.data_diff_label = nn.form.querySelector('[x-id="data_diff_label"]')??{};
    fE.value_diff_label = nn.form.querySelector('[x-id="value_diff_label"]')??{};
    fE.min_input_value_label = nn.form.querySelector('[x-id="min_input_value_label"]')??{};
    fE.max_input_value_label = nn.form.querySelector('[x-id="max_input_value_label"]')??{};
    fE.min_output_value_label = nn.form.querySelector('[x-id="min_output_value_label"]')??{};
    fE.max_output_value_label = nn.form.querySelector('[x-id="max_output_value_label"]')??{};
    fE.min_domain_value_label = nn.form.querySelector('[x-id="min_domain_value_label"]')??{};
    fE.max_domain_value_label = nn.form.querySelector('[x-id="max_domain_value_label"]')??{};
  };

  nn.setPointerXY = function (pointer, ev, local) {
    var rect, ev0 = (ev.touches && ev.touches.length) ? ev.touches[0] : ev;
    var x = (ev0.clientX||(ev0.pageX-document.documentElement.scrollLeft));
    var y = (ev0.clientY||(ev0.pageY-document.documentElement.scrollTop));
    if (isNaN(x) || isNaN(y)) {return;}
    pointer.x = x; pointer.y = y; pointer.out = x < 0 || x >= self.innerWidth || y < 0 || y >= self.innerHeight;
    if (local) {
      rect = ev.target.getBoundingClientRect();
      pointer.x -= rect.left; pointer.y -= rect.top;
    }
  };

  nn.onpointermoveListener = function (ev) {
    if (nn.view.pointer.preventMove) {nn.view.pointer.preventMove = false; return;}
    nn.view.pointer.dragging = nn.view.pointer.down;
    nn.setPointerXY(nn.view.pointer, ev, true);
    if (ev.target == nn.canvas) {nn.canvas_onpointermove(ev);}
    if (nn.view.pointer.out && nn.view.pointer.down) {nn.onpointerupListener(ev);}
  };

  nn.onpointerdownListener = function (ev) {
    nn.view.pointer.target = ev.target; nn.view.pointer.down = true; nn.view.pointer.dragging = false;
    nn.view.pointer.downtime = Date.now();
    nn.setPointerXY(nn.view.pointer, ev, true);
    if (nn.view.pointer.target == nn.canvas) {nn.canvas_onpointerdown(ev); nn.updateSelected(null);}
    nn.view.pointer.preventMove = true; // @show/hide prevent.
  };

  nn.onpointerupListener = function (ev) {
    var time = Date.now(); nn.view.pointer.dblclick = time-nn.view.pointer.uptime < nn.vars.ms.WATCH; // dblclick threshold
    nn.view.pointer.uptime = nn.view.pointer.dblclick ? 0 : time;
    nn.setPointerXY(nn.view.pointer, ev, true);
    if (nn.view.pointer.target == nn.canvas) {nn.canvas_onpointerup(ev); nn.updateSelected(null);}
    nn.view.pointer.target = null; nn.view.pointer.down = nn.view.pointer.dragging = false;
    nn.view.pointer.downtime = 0;
  };

  nn.onkeydown = function (ev) {
    // if (ev.which == 13) {nn.changeTraining(null, null);} // @hide/show
  };

  nn.onkeyup = function (ev) {};

  nn.setIntervalMethod = function (target, methodName, time) {
    target ??= this; var intervalId = methodName+'_interval', vars = target.vars??target;
    clearInterval(vars[intervalId]||0);
    if (time > 0 && typeof target[methodName] == 'function') {vars[intervalId] = setInterval(target[methodName], time);}
    return vars[intervalId];
  };

  nn.setEventListener = function (target, type, listener, options, add) {
    target.removeEventListener(type, listener, false);
    target.removeEventListener(type, listener, true);
    if (!add || add > 0) {target.addEventListener(type, listener, options??false);}
  };

  nn.setEvents = function (on) {
    nn.setEventListener(nn.canvas, 'mousemove', nn.onpointermoveListener, false, on);
    nn.setEventListener(nn.canvas, 'touchmove', nn.onpointermoveListener, false, on);
    nn.setEventListener(nn.canvas, 'mousedown', nn.onpointerdownListener, false, on);
    nn.setEventListener(nn.canvas, 'touchstart', nn.onpointerdownListener, false, on);
    nn.setEventListener(nn.canvas, 'mouseup', nn.onpointerupListener, false, on);
    nn.setEventListener(nn.canvas, 'touchend', nn.onpointerupListener, false, on);
    nn.setEventListener(nn.canvas, 'mouseout', nn.onpointerupListener, false, on);
    // nn.setEventListener(self, 'keydown', nn.onkeydown, false, on); // @hide/show
    // nn.setEventListener(self, 'keyup', nn.onkeyup, true, on); // @hide/show
    nn.setIntervalMethod(null, 'loop', nn.vars.ms.FRAME*(on||1));
    // aa.lay.drag.draggable(qso('[x-id="nn_form_content"]'), 1, null, null, null, 1); // @hide/show
  };

  nn.loop = function () {
    if (!nn.content || !nn.content.parentNode) {nn.destroy(); return;}
    if (nn.net) {
      if (nn.net.training == 1) {nn.trainNetwork(nn.net);
      } else if (nn.net.training < 0) {nn.changeTraining(nn.net, 0);}
      nn.canvas_render();
    }
  };

  nn.destroy = function () {
    nn.setEvents(-1); nn.setForm(-1); nn.setWorker(-1);
    nn.worker = nn.form = nn.canvas = nn.net = nn.nets = null;
    setTimeout(function () {aa.nn = null;}, 0);
  };

  (function ready() {
    nn.content = (nn.ini.container??document).querySelector('[x-id="nn_content"]');
    if (!nn.content?.querySelector('[x-id="nn_canvas_container"]')) return setTimeout(ready, nn.vars.ms.LISTEN);
    var i; nn.ini.container = nn.ini.container??nn.content.parentNode??document.body;
    for (i in nn.ini) {if (i in nn) {nn[i] = nn.ini[i];}}
    i = ''+nn.ini.theme; i = (i.indexOf('light') != -1 && i.indexOf('dark') == -1) ? 'light' : null;
    nn.setForm(1);
    nn.setCanvas(i);
    nn.importNetwork(null);
    nn.setEvents(1);
  })();
})();
