// /import/aa/comps/aa-mm.js // require aa-core.js
(function () { "use strict";

  // Base Namespace Objects:

  window.aa = window.aa||{};
  if (aa.mm && aa.mm.destroy) {aa.mm.destroy();}
  aa.mm = {};
  aa.mm.ini = {};
  aa.dat.merge(aa.mm.ini, self.input);
  aa.mm.vars = {}; aa.mm.ext = {};

  aa.mm.audio = null; aa.mm.audios = [];
  aa.mm.video = null; aa.mm.videos = [];

  // Vars:

  aa.mm.vars.ms = {FRAME: 16, PLAY: 33, LISTEN: 66, WATCH: 300, REFRESH: 600, UPDATE: 2e3, WAIT: 9e3, TIMEOUT: 3e4, FORGET: 4e5};

  aa.mm.vars.LOOP_BUFFER = .265; // Def LOOP_BUFFER 0, .001, .265

  // File:

  aa.mm.ext.readFile = function (file, format, fun) { // console.log("readFile "+format, file);
    var reader = new FileReader();
    reader.onload = reader.onerror = reader.onabort = function (ev) { // console.log("readFile load "+!!reader.result, ev); // OK/KO
      if (fun) {fun(reader.result);}
    };
    if (!file) {reader.onabort(null); return;} // Method abort() does not work at this point.
    if (format == "ArrayBuffer") {reader.readAsArrayBuffer(file);
    } else if (format == "BinaryString") {reader.readAsBinaryString(file);
    } else if (format == "DataURL") {reader.readAsDataURL(file); // Base64
    } else {reader.readAsText(file);} // Text
  };

  aa.mm.ext.selectFileContent = function (ev, format, fun) { // console.log("selectFileContent '"+format+"'", ev); // file to content
    var file = !(ev.target.files.length) ? null : ev.target.files[0];
    aa.mm.ext.readFile(file, format, fun);
  };

  aa.mm.ext.selectFileName = function (ev, urlPrefix, fun) { // console.log("selectFileName '"+urlPrefix+"'", ev);
    var resources = [];
    if (urlPrefix) { // files to urls
      for (var i = 0; i < ev.target.files.length; i++) {resources.push(urlPrefix+ev.target.files[i].name);}
    } else {resources =  ev.target.files;}
    if (fun) {fun(resources);}
  };

  aa.mm.ext.selectFile = function (ev, fun) {if (fun) {fun(ev.target.files);}};

  // Media:

  aa.mm.vars.pxt = "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

  aa.mm.vars.empty_mp3 = "data:audio/mp3;base64,//MYxAAAAANIAcAAAExBTUUzLjgyVVVVVVVVVVVVVVVVVUxB//MYxBcAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxC4AAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxEUAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxFwAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxHMAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxIoAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxKEAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxLgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxM8AAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOYAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVUxB//MYxOgAAANIAAAAAE1FMy44MlVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxOgAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQ=";
  aa.mm.vars.atom_mp3 = "data:audio/mp3;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  aa.mm.vars.atom_mp4 = "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==";
  aa.mm.vars.atom_webm = "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=";

  // Player:

  aa.mm.playpause = function (mm, on) {
    if (!mm || !mm.src) {return;}
    if (on == null) {on = mm.paused;}
    if (on) {mm.play();
    } else {mm.pause();}
  };

  aa.mm.soundmute = function (mm, on) {
    if (!mm || !mm.src) {return;}
    if (mm.audio && mm.audio.src) {mm = mm.audio;}
    if (on == null) {on = mm.muted || !mm.volume;}
    mm.volume = on ? 1 : 0;
    mm.muted = !mm.volume;
  };

  aa.mm.unloadMedia = function (media) {
    if (!media || !media.pause) {return;}
    if (media.src) {media.pause();} // URL.revokeObjectURL(media.src);
    media.src = ""; media.removeAttribute("src");
    if (media.subtitles) {
      media.subtitles.mode = "hidden"; // URL.revokeObjectURL(media.subtitles.src);
      media.subtitles.src = ""; media.subtitles.removeAttribute("src");
    }
    if (media.audio) {
      if (media.audio.src) {media.audio.pause();} // URL.revokeObjectURL(media.audio.src);
      media.audio.src = ""; media.audio.removeAttribute("src");
    }
    if (media.vars.poster_on) { // URL.revokeObjectURL(media.poster);
      media.poster = ""; media.vars.poster_on = 0;
    }
  };

  aa.mm.loadMedia = function (media, resources) { // console.log("loadMedia ", resources);
    if (!media || !media.pause) {return;}
    var i, fcM = null, fcS = null, fcA = null, fcP = null; aa.mm.unloadMedia(media);
    if (resources) {
      if (resources.constructor == String || !(window.Symbol ? typeof resources[Symbol.iterator] == 'function' : resources.length != null)) {resources = [resources];}
      for (i = 0; i < resources.length; i++) {
        var st = (resources[i].name||resources[i]||'').substring(0, 1024), mk = (st.indexOf('data:') == 0) ? '/' : '.';
        if (resources.length > 1 && (st.indexOf(mk+"vtt") != -1 || st.indexOf(mk+"srt") != -1)) {fcS = resources[i];
        } else if (st.indexOf(mk+"mp3") != -1 || st.indexOf(mk+"wav") != -1 || st.indexOf(mk+"ogg") != -1) {fcA = resources[i];
        } else if (st.indexOf(mk+"svg") != -1 || st.indexOf(mk+"jpg") != -1 || st.indexOf(mk+"png") != -1 || st.indexOf(mk+"gif") != -1) {fcP = resources[i];
        } else {fcM = resources[i];}
      }
      if (!fcM) {if (fcA) {fcM = fcA; fcA = null;} else if (fcP) {fcM = aa.mm.vars.empty_mp3;}}
    }
    media.vars.poster_on = !!fcP; media.autoplay = !fcP; media.muted = !media.volume;
    if (fcM instanceof Blob) {media.src = URL.createObjectURL(fcM); setTimeout(URL.revokeObjectURL, 0, media.src);
    } else {media.src = fcM||'';}
    if (fcP instanceof Blob) {media.poster = URL.createObjectURL(fcP); setTimeout(URL.revokeObjectURL, 0, media.poster);
    } else {media.poster = fcP||'';}
    if (media.constructor == HTMLVideoElement) {aa.mm.video_setSubtitles(media, fcS); aa.mm.video_setAudio(media, fcA);}
    // if (fcM && !fcP) {media.play();}
  };

  aa.mm.newAudio = function (props) {
    var i, au = new Audio(); au.vars = {}; if (!props) {props = {};}
    if (props.loopbuffer == null) {props.loopbuffer = aa.mm.vars.LOOP_BUFFER;}
    for (i in props) {if (i in au) {au[i] = props[i];} else {au.vars[i] = props[i];}}
    au.addEventListener("loadeddata", function (ev) { // console.log("ALoaded "+mm.duration, ev.target);
    }, false);
    au.addEventListener("timeupdate", function (ev) {
      if (au.duration && au.vars.loopbuffer && au.vars.play_on && au.currentTime > au.duration-au.vars.loopbuffer) {
        au.currentTime = 0; au.play();
      }
    }, false);
    au.addEventListener("play", function (ev) {au.vars.play_on = 1;}, false);
    au.addEventListener("pause", function (ev) {au.vars.play_on = 0;}, false);
    return au;
  };

  aa.mm.newCanvas = function (props) {
    var i, canvas = document.createElement("canvas"), canvas2d = canvas.getContext("2d");
    canvas.vars = {}; if (!props) {props = {};}
    if (props.id) {canvas.setAttribute("x-id", props.id);}
    if (props.style) {canvas.setAttribute("style", props.style);}
    if (props.classes) {canvas.classList.add.apply(null, props.classes.split(" "));}
    for (i in props) {
      if (["id", "style", "classes"].indexOf(i) != -1) {continue;}
      if (i in canvas) {canvas[i] = props[i];
      } else if (i in canvas2d) {canvas2d[i] = props[i];
      } else {canvas.vars[i] = props[i];}
    }
    if (canvas.vars.container) {i = document.querySelector(canvas.vars.container); if (i) {i.appendChild(canvas);}}
    return canvas;
  };

  aa.mm.newVideo = function (props) {
    var i, vi = document.createElement("video"); vi.vars = {}; if (!props) {props = {};}
    if (!props.id) {props.id = "videoPlayer";}
    if (!props.poster) {props.poster = "";}
    props.poster_on = !!props.poster; props.autoplay = !props.poster;
    if (props.controls == null) {props.controls = true;}
    if (props.volume == null) {props.volume = 1;}
    if (props.loopbuffer == null) {props.loopbuffer = aa.mm.vars.LOOP_BUFFER;}
    if (!props.framerate) {props.framerate = aa.mm.vars.ms.PLAY;}
    if (!props.style) {props.style = "background-color: #000000;";}
    if (props.style.indexOf("height:") == -1) {props.style = "height: auto; "+props.style;}
    if (props.style.indexOf("width:") == -1) {props.style = "width: 100%; "+props.style;}
    if (props.classes) {vi.classList.add.apply(null, props.classes.split(" "));}
    vi.setAttribute("x-id", props.id); vi.setAttribute("style", props.style);
    for (i in props) {
      if (["id", "style", "classes", "subtitles", "audio", "canvas"].indexOf(i) != -1) {continue;}
      if (i in vi) {vi[i] = props[i];} else {vi.vars[i] = props[i];}
    }
    aa.mm.video_setSubtitles(vi, null); aa.mm.video_setAudio(vi, null); aa.mm.video_setCanvas(vi);
    vi.addEventListener("loadeddata", function (ev) { // console.log("VLoaded "+mm.duration+" "+mm.videoWidth+"x"+mm.videoHeight, ev.target);
      aa.mm.video_setFilters(vi, undefined);
    }, false);
    vi.addEventListener("timeupdate", function (ev) {
      if (vi.duration && vi.vars.loopbuffer && vi.vars.play_on && vi.currentTime > vi.duration-vi.vars.loopbuffer) {
        vi.currentTime = 0; vi.play();
        if (vi.audio.src && !vi.audio.vars.loopbuffer) {vi.audio.currentTime = 0; vi.audio.play();}
      }
    }, false);
    vi.timeframe = function () {
      setTimeout(vi.timeframe, (!vi.duration || vi.paused) ? aa.mm.vars.ms.REFRESH : vi.vars.framerate);
      if (vi.duration && vi.vars.filters) {aa.mm.video_applyFilters(vi);}
    };
    vi.addEventListener("play", function (ev) {vi.vars.play_on = 1; if (vi.audio.src && vi.audio.paused) {vi.audio.play();}}, false);
    vi.addEventListener("pause", function (ev) {vi.vars.play_on = 0; if (vi.audio.src && !vi.audio.paused) {vi.audio.pause();}}, false);
    if (vi.vars.container) {aa.mm.video_setParent(vi, document.querySelector(vi.vars.container));}
    vi.timeframe();
    return vi;
  };

  aa.mm.video_setParent = function (vi, elem) {
    elem.appendChild(vi); if (vi.canvas) {elem.appendChild(vi.canvas);}
  };

  aa.mm.video_setSubtitles = function (vi, src) {
    var props = vi.vars.subtitles_props||{};
    if (vi.subtitles && vi.subtitles.parentNode) {vi.subtitles.parentNode.removeChild(vi.subtitles);}
    vi.subtitles = document.createElement("track");
    vi.subtitles.setAttribute("kind", "subtitles"); vi.subtitles.setAttribute("default", "default");
    vi.subtitles.setAttribute("srclang", props.srclang||""); vi.subtitles.setAttribute("label", props.label||"Subtitles");
    if (src) {
      if (src instanceof Blob) {vi.subtitles.src = URL.createObjectURL(src); setTimeout(URL.revokeObjectURL, 0, vi.subtitles.src);
      } else {vi.subtitles.src = src;}
      vi.subtitles.mode = "showing";
    } else {vi.subtitles.src = ''; vi.subtitles.mode = "hidden";}
    vi.appendChild(vi.subtitles);
  };

  aa.mm.video_setAudio = function (vi, src) {
    if (!vi.audio) {vi.audio = aa.mm.newAudio(vi.vars.audio_props);}
    if (src) {
      if (src instanceof Blob) {vi.audio.src = URL.createObjectURL(src); setTimeout(URL.revokeObjectURL, 0, vi.audio.src);
      } else {vi.audio.src = src;}
    } else {vi.audio.removeAttribute("src");}
    vi.audio.muted = false; vi.muted = (!vi.volume || !!src);
  };

  aa.mm.video_setCanvas = function (vi) {
    if (vi.canvas) {return;}
    var prp = vi.vars.canvas_props||{};
    if (!prp.id && vi.getAttribute("x-id")) {prp.id = vi.getAttribute("x-id")+"Canvas";}
    if (!prp.container) {prp.container = vi.vars.container;}
    if (!prp.style) {prp.style = vi.getAttribute("style");}
    if (!prp.resolution) {prp.resolution = 1;}
    vi.canvas = aa.mm.newCanvas(prp);
    vi.canvas.style.display = "none";
  };

  aa.mm.video_setFilters = function (vi, filters) {
    if (typeof filters != "undefined") {vi.vars.filters = filters;}
    if (aa.mm.fx && vi.vars.filters) {
      if (vi.videoHeight) {
        vi.canvas.width = vi.videoWidth*vi.canvas.vars.resolution; vi.canvas.height = vi.videoHeight*vi.canvas.vars.resolution;
      }
      vi.canvas.style.display = "block"; vi.style.display = "none";
    } else {vi.style.display = "block"; vi.canvas.style.display = "none";}
  };

  aa.mm.video_applyFilters = function (vi) {
    if (vi.vars.poster_on && vi.paused && !vi.currentTime) {vi.vars.image = new Image(); vi.vars.image.src = vi.poster;
    } else {vi.vars.image = vi;}
    vi.vars.image.width = vi.canvas.width; vi.vars.image.height = vi.canvas.height;
    if (aa.mm.fx && vi.vars.image.width) {aa.mm.fx.applyFilters(vi.vars.filters, vi.vars.image, vi.canvas);
    } else {vi.canvas.getContext("2d").drawImage(vi.vars.image, 0, 0, vi.canvas.width, vi.canvas.height);}
  };

  // Media Filters:

  aa.mm.fx = {};

  aa.mm.fx.newCanvas = function (width, height) {
    if (arguments.length == 1) {height = width.videoHeight||width.height||135; width = width.videoWidth||width.width||240;}
    var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    return canvas;
  };

  aa.mm.fx.getCanvas = function (source, clone) {
    if (!source) {source = {};}
    if (source.canvas && source.putImageData) {source = source.canvas;}
    var canvas = source;
    if (clone || !canvas.getContext) {
      var wd = source.videoWidth||source.width||240, ht = source.videoHeight||source.height||135;
      canvas = aa.mm.fx.newCanvas(wd, ht);
      if (source.data) {canvas.getContext('2d').putImageData(source, 0, 0, 0, 0, wd, ht);
      } else {canvas.getContext('2d').drawImage(source, 0, 0, wd, ht);}
    }
    return canvas;
  };

  aa.mm.fx.newImageData = function (data, width, height) { // IE does not support new ImageData.
    if (arguments.length == 2) {height = width; width = data; data = null;}
    var imd = document.createElement('canvas').getContext('2d').createImageData(width, height);
    if (data) {imd.data.set(data);}
    return imd;
  };

  aa.mm.fx.getImageData = function (image, clone) {
    if (image && image.data) {
      if (clone || image.constructor != ImageData) {image = aa.mm.fx.newImageData(image.data, image.width, image.height);}
    } else {image = aa.mm.fx.getCanvas(image, clone).getContext('2d').getImageData(0, 0, image.width, image.height);}
    return image;
  };

  aa.mm.fx.applyFilters = function (filters, source, target) {
    if (!filters || !source) {return;}
    var pixels = aa.mm.fx.getImageData(source); if (!target) {target = source;}
    for (var f = 0; f < filters.length; f++) {
      var filter = filters[f];
      if (filter && aa.mm.fx[filter.filter]) { // filters[keys[f]]||[]
        if (filter.min && !filter.max) {filter.max = filter.min;} if (filter.max && !filter.min) {filter.min = filter.max;}
        if (!filter.min) {filter.min = [];} else if (filter.min.length == null) {filter.min = [filter.min];}
        if (!filter.max) {filter.max = [];} else if (filter.max.length == null) {filter.max = [filter.max];}
        while (filter.max.length < filter.min.length) {filter.max.push(filter.min[filter.max.length]);}
        while (filter.min.length < filter.max.length) {filter.min.push(filter.max[filter.min.length]);}
        var values = []; if (!filter.pos) {filter.pos = 0;}
        for (var i = 0; i < filter.min.length; i++) {
          var val = filter.min[i]; if (!isNaN(val)) {val += filter.pos*(filter.max[i]-val);}
          values.push(val);
        }
        pixels = aa.mm.fx[filter.filter].apply(null, [pixels].concat(values));
        if (!pixels) {break;} // if (pixels.constructor != ImageData) {pixels = aa.mm.fx.getImageData(pixels, true);} // Hide/Show
      }
    }
    var canvas = aa.mm.fx.getCanvas(target);
    if (pixels) {canvas.getContext('2d').putImageData(pixels, 0, 0, 0, 0, canvas.width, canvas.height);}
    if ('src' in target) {target.src = canvas.toDataURL();}
  };

  aa.mm.fx.grayscale = function (pixels) {
    var idat = pixels.data; // CIE RGB luminance: Red and blue de-emphasized for the human eye.
    for (var i = 0; i < idat.length; i += 4) {
      idat[i] = idat[i+1] = idat[i+2] = .2126*idat[i]+.7152*idat[i+1]+.0722*idat[i+2];
    }
    return pixels;
  };

  aa.mm.fx.brightness = function (pixels, adjust) {
    var idat = pixels.data;
    for (var i = 0; i < idat.length; i += 4) {
      idat[i] += adjust; idat[i+1] += adjust; idat[i+2] += adjust;
    }
    return pixels;
  };

  aa.mm.fx.threshold = function (pixels, threshold) {
    var idat = pixels.data;
    for (var i = 0; i < idat.length; i += 4) {
      var v = (0.2126*idat[i]+0.7152*idat[i+1]+0.0722*idat[i+2] >= threshold) ? 255 : 0;
      idat[i] = idat[i+1] = idat[i+2] = v;
    }
    return pixels;
  };

  aa.mm.fx.convolute = function (pixels, weights, alpha, float) {
    var output, side = Math.round(Math.sqrt(weights.length)), sideh = Math.floor(side/2);
    var sw = pixels.width, sh = pixels.height; alpha = Number(alpha)||0;
    if (float) {output = {width: sw, height: sh, data: new Float32Array(sw*sh*4)};
    } else {output = aa.mm.fx.newImageData(sw, sh);}
    var idat = pixels.data, odat = output.data;
    for (var y = 0; y < sh; y++) {
      for (var x = 0; x < sw; x++) {
        var dstOff = (y*sw+x)*4, r = 0, g = 0, b = 0, a = 0;
        for (var cy = 0; cy < side; cy++) {
          for (var cx = 0; cx < side; cx++) {
            var scy = y+cy-sideh, scx = x+cx-sideh;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4, wt = weights[cy*side+cx];
              r += idat[srcOff]*wt; g += idat[srcOff+1]*wt; b += idat[srcOff+2]*wt; a += idat[srcOff+3]*wt;
            }
          }
        }
        odat[dstOff] = r; odat[dstOff+1] = g; odat[dstOff+2] = b; odat[dstOff+3] = a+alpha*(255-a);
      }
    }
    return output;
  };

  aa.mm.fx.blur = function (pixels, sd) {
    if (!sd) {sd = 3;} else {sd = Math.round(sd);} sd *= sd;
    var ws = Array.apply(null, new Array(sd)).map(function (v, i, a) {return 1/sd;});
    return aa.mm.fx.convolute(pixels, ws, 0);
  };

  aa.mm.fx.sharpen = function (pixels, val) {
    if (val == null) {val = 5;}
    return aa.mm.fx.convolute(pixels, [0, -1, 0, -1,  val, -1, 0, -1,  0], 0);
  };

  aa.mm.fx.laplaceEdges = function (pixels, gray, al) {
    if (gray) {pixels = aa.mm.fx.grayscale(pixels);} if (al == null) {al = 1;}
    return aa.mm.fx.convolute(pixels, [1, 1, 1, 1, -8, 1, 1, 1, 1], al);
  };

  aa.mm.fx.sobelEdges = function (pixels, gray, al) {
    if (gray) {pixels = aa.mm.fx.grayscale(pixels);} if (al == null) {al = 1;}
    var verRaw = aa.mm.fx.convolute(pixels, [-1, 0, 1, -2, 0, 2, -1, 0, 1], 0, true); // Raw float data object.
    var horRaw = aa.mm.fx.convolute(pixels, [-1, -2, -1, 0, 0, 0, 1, 2, 1], 0, true); // Raw float data object.
    pixels = aa.mm.fx.newImageData(verRaw.width, verRaw.height);
    var idat = pixels.data;
    for (var i = 0; i < idat.length; i += 4) {
      var vr = Math.abs(verRaw.data[i]), hg = Math.abs(horRaw.data[i]);
      idat[i] = vr; idat[i+1] = hg; idat[i+2] = Math.abs((vr+hg)/4); idat[i+3] = al*255;
    }
    return pixels;
  };

  aa.mm.fx.spherize0 = function(pixels, rfr, rad, cx, cy) { // TODO
    var wd = pixels.width, ht = pixels.height, output = aa.mm.fx.getImageData(pixels, true);
    if (rfr == null) {rfr = .5;} if (rad == null) {rad = Math.floor(wd*.47);}
    if (cx == null) {cx = Math.floor(wd/2);} if (cy == null) {cy = Math.floor(ht/2);}
    var x, y, rad2 = rad*rad; rfr = 1-rfr;
    for (y = 0; y < ht; y++) {
      for (x = 0; x < wd; x++) {
        var dx = x-cx, dy = y-cy, dx2 = dx*dx, dy2 = dy*dy, z2 = rad2-dx2-dy2;
        if (z2 > 0) {
          var q = Math.sqrt(z2);
          var sx = x-(q*Math.tan(Math.asin(dx/Math.sqrt(dx2+z2))*rfr)+.5)|0;
          var sy = y-(q*Math.tan(Math.asin(dy/Math.sqrt(dy2+z2))*rfr)+.5)|0;
          var p = (y*wd+x)*4; q = (sy*wd+sx)*4;
          for (var i = 0; i < 3; i++) {output.data[p+i] = pixels.data[q+i];}
        }
      }
    }
    return output;
  };

  aa.mm.fx.spherize = function(pixels, target, rfr, rad, scl, cx, cy) {
    var wd = pixels.width, ht = pixels.height;
    if (rfr == null) {rfr = 1;} if (rad == null) {rad = 1;} if (scl == null) {scl = 1;}
    if (cx == null) {cx = Math.floor(wd/2);} if (cy == null) {cy = Math.floor(ht/2);}
    var source = aa.mm.fx.getCanvas(pixels), target2d = (target||aa.mm.fx.newCanvas(pixels)).getContext('2d');
    var len = Math.floor(wd/4), wh = wd/2, hh = ht/2, rfx = rfr*wd/4, rfy = rfr*ht/4, pi2 = Math.PI*2; rad *= wh;
    for (var i = 0; i < len; i++) {
      var j = i/len, rx = j*rfx, ry = j*rfy;
      target2d.save();
      target2d.beginPath();
      target2d.arc(wh, hh, rad*(1-j), 0, pi2);
      target2d.clip();
      target2d.drawImage(source, rx, ry, wd-rx*2, ht-ry*2, 0, 0, wd, ht);
      target2d.restore();
    }
    return !target ? target2d.getImageData(0, 0, wd, ht) : null;
  };

  //

  aa.mm.addAudio = function (props) {
    var media = aa.mm.newAudio(props);
    aa.mm.audios.push(media);
    return media;
  };

  aa.mm.removeAudio = function (media) {
    var i = aa.mm.audios.indexOf(media);
    aa.mm.unloadMedia(media); media.load();
    if (i != -1) {aa.mm.audios.splice(i, 1);}
    return (i != -1);
  };

  aa.mm.addVideo = function (props) {
    var media = aa.mm.newVideo(props);
    aa.mm.videos.push(media);
    return media;
  };

  aa.mm.removeVideo = function (media) {
    var i = aa.mm.videos.indexOf(media);
    aa.mm.unloadMedia(media); media.load();
    if (media.canvas && media.canvas.parentNode) {media.canvas.parentNode.removeChild(media.canvas);}
    if (media.parentNode) {media.parentNode.removeChild(media);}
    if (i != -1) {aa.mm.videos.splice(i, 1);}
    return (i != -1);
  };

  aa.mm.destroy = function () {
    while (aa.mm.audios.length) {aa.mm.removeAudio(aa.mm.audios[0]);}
    while (aa.mm.videos.length) {aa.mm.removeVideo(aa.mm.videos[0]);}
  };

  (function ready() {
    if (!document.body) {return setTimeout(ready, aa.mm.vars.ms.LISTEN);}
    aa.mm.audio = aa.mm.audio||aa.mm.addAudio(aa.mm.ini.audio_props);
    aa.mm.video = aa.mm.video||aa.mm.addVideo(aa.mm.ini);
    aa.mm.fx.filters = [
      {filter: 'grayscale'},
      {filter: 'brightness', min: [-127], max: [127]},
      {filter: 'threshold', min: [0], max: [255]},
      {filter: 'blur', min: [1], max: [21]},
      {filter: 'sharpen'},
      {filter: 'laplaceEdges'},
      {filter: 'sobelEdges'},
      {filter: 'spherize', min: [aa.mm.video.canvas, -1], max: [null, 1]}
    ];
  })();

})();
