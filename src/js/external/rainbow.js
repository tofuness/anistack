/**
 * jquery.rainbow: Make animated rainbow text
 *
 * Copyright (c) 2012 Michael Lelli
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($) {
  "use strict";

  var defaultSettings = {
    start:     0,
    width:     Math.PI / 8,
    speed:     Math.PI * 32,
    timeout:   50,
    redPos:    2 * Math.PI / 3,
    greenPos:  0,
    bluePos:   4 * Math.PI / 3,
    className: "rainbow",
    spanName:  "jQueryRainbow",
    timer:     null
  };

  function calculateColor(pos, settings, i) {
    if (pos === "high") {
      return 255;
    } else if (pos === "low") {
      return 0;
    } else {
      return Math.ceil((Math.sin(settings.width * i + pos - settings.start / (settings.speed / settings.timeout)) + 1) * 127.5);
    }
  }

  function rcolor(node, settings, i) {
    var r = calculateColor(settings.redPos, settings, i),
      g = calculateColor(settings.greenPos, settings, i),
      b = calculateColor(settings.bluePos, settings, i);

    if ($(node).is("img")) {
      $(node).css({backgroundColor: "rgb(" + r + "," + g + "," + b + ")"});
    } else {
      $(node).css({color: "rgb(" + r + "," + g + "," + b + ")"});
    }
  }

  function doRainbow(node) {
    var i = 0,
      settings = $(node).data("rainbowSettings");
    $(node).find("span, img").each(function () {
      rcolor(this, settings, i);
      i += 1;
    });
    settings.start += 1;
    $(node).data("rainbowSettings", settings);
  }

  // apparently jQuery doesn't feel like handling text nodes
  function rnode(node, settings) {
    var text = node.data,
      i = 0,
      s = node,
      s2;
    node.data = "";
    do {
      s2 = document.createElement("span");
      s2.className = settings.spanName;
      s2.appendChild(document.createTextNode(text.charAt(i)));
      if (!s.nextSibling) {
        s.parentNode.appendChild(s2);
      } else {
        s.parentNode.insertBefore(s2, s.nextSibling);
      }
      s = s2;
      i += 1;
    } while (i < text.length);
    return s;
  }

  function rainbowify(node, settings) {
    $(node).contents().each(function () {
      if (this.nodeType === 3) {
        rnode(this, settings);
      } else {
        $(this).each(function () {
          rainbowify(this, settings);
        });
      }
    });
  }

  $.fn.rainbow = function (settings) {
    this.each(function () {
      var $this = $(this),
        s = $this.data("rainbowSettings");
      if (settings === false) {
        if (typeof s === "object") {
          $this.removeClass(s.className);
          clearInterval(s.timer);
          if (typeof s.spanName === "string") {
            $this.find("span." + s.spanName).each(function () {
              $(this).replaceWith(this.childNodes);
            });
          }
        }
        $this.text($this.text().replace(/\r\n|\r|\n/g, ''));
        $this.data("rainbowSettings", null);
        return false;
      }
      if (s) {
        clearInterval(s.timer);
      }
      settings = $.extend({}, defaultSettings, settings || {});
      if (settings.start === "random") {
        settings.start = Math.ceil(Math.random() * Math.PI * 2 * settings.speed / settings.timeout);
      } else {
        settings.start = 0;
      }
      if (!s) {
        rainbowify($this[0], settings);
      }
      $this.addClass(settings.className);
      $this.data("rainbowSettings", settings);
      // we run it first and juggle the settings to account for high inital interval timeouts
      doRainbow(this);
      settings = $this.data("rainbowSettings");
      settings.timer = setInterval(function () {
        doRainbow($this[0]);
      }, settings.timeout);
      $this.data("rainbowSettings", settings);
    });
  };
}(window.jQuery));