import Vue from 'vue';
import { Plugin } from 'vue-fragment';

function rgbToHSv(ref) {
    var red = ref.red;
    var green = ref.green;
    var blue = ref.blue;

    var rr;
    var gg;
    var bb;
    var h;
    var s;

    var rabs = red / 255;
    var gabs = green / 255;
    var babs = blue / 255;
    var v = Math.max(rabs, gabs, babs);
    var diff = v - Math.min(rabs, gabs, babs);
    var diffc = function (c) { return (v - c) / 6 / diff + 1 / 2; };
    if (diff === 0) {
        h = 0;
        s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return {
        hue: Math.round(h * 360),
        saturation: Math.round(s * 100),
        value: Math.round(v * 100),
    };
}

function getRgbByHue(hue) {
    var C = 1;
    var H = hue / 60;
    var X = C * (1 - Math.abs(H % 2 - 1));
    var m = 0;
    var precision = 255;
    var r = 0;
    var g = 0;
    var b = 0;

    C = (C + m) * precision | 0;
    X = (X + m) * precision | 0;

    if (H >= 0 && H < 1) {
        r = C | 0;
        g = X | 0;
        b = m | 0;
    }
    if (H >= 1 && H < 2) {
        r = X | 0;
        g = C | 0;
        b = m | 0;
    }
    if (H >= 2 && H < 3) {
        r = m | 0;
        g = C | 0;
        b = X | 0;
    }
    if (H >= 3 && H < 4) {
        r = m | 0;
        g = X | 0;
        b = C | 0;
    }
    if (H >= 4 && H < 5) {
        r = X | 0;
        g = m | 0;
        b = C | 0;
    }
    if (H >= 5 && H <= 6) {
        r = C | 0;
        g = m | 0;
        b = X | 0;
    }

    return {
        red: r,
        green: g,
        blue: b,
    };
}

function isValidRGBValue(value) {
    return (typeof (value) === 'number' && Number.isNaN(value) === false && value >= 0 && value <= 255);
}

function setRGBA(red, green, blue, alpha) {
    if (isValidRGBValue(red) && isValidRGBValue(green) && isValidRGBValue(blue)) {
        var color = {
            red: red | 0,
            green: green | 0,
            blue: blue | 0,
        };

        if (isValidRGBValue(alpha) === true) {
            color.alpha = alpha | 0;
        }

        // RGBToHSL(color.r, color.g, color.b);

        return color;
    }
}

function hsvToRgb(hue, saturation, value) {
    value /= 100;
    var sat = saturation / 100;
    var C = sat * value;
    var H = hue / 60;
    var X = C * (1 - Math.abs(H % 2 - 1));
    var m = value - C;
    var precision = 255;

    C = (C + m) * precision | 0;
    X = (X + m) * precision | 0;
    m = m * precision | 0;

    if (H >= 1 && H < 2) {
        return setRGBA(X, C, m);
    }
    if (H >= 2 && H < 3) {
        return setRGBA(m, C, X);
    }
    if (H >= 3 && H < 4) {
        return setRGBA(m, X, C);
    }
    if (H >= 4 && H < 5) {
        return setRGBA(X, m, C);
    }
    if (H >= 5 && H <= 6) {
        return setRGBA(C, m, X);
    }

    return setRGBA(C, X, m);
}

function changePicker(x, y, height, width, hue) {
    if (x > width) { x = width; }
    if (y > height) { y = height; }
    if (x < 0) { x = 0; }
    if (y < 0) { y = 0; }
    var value = 100 - (y * 100 / height) | 0;
    var saturation = x * 100 / width | 0;
    return Object.assign({}, hsvToRgb(hue, saturation, value),
        {saturation: saturation,
        value: value});
}

function getHue(offsetX, width, saturation, value) {
    var hue = ((360 * offsetX) / width) | 0;

    hue = hue < 0 ? 0 : hue > 360 ? 360 : hue;

    return Object.assign({}, hsvToRgb(hue, saturation, value),
        {hue: hue});
}

function getAlpha(value, width) {
    value = Number((value / width).toFixed(2));

    return value > 1 ? 1 : value < 0 ? 0 : value;
}

function rgbToHex(red, green, blue) {
    var r16 = red.toString(16);
    var g16 = green.toString(16);
    var b16 = blue.toString(16);

    if (red < 16) { r16 = "0" + r16; }
    if (green < 16) { g16 = "0" + g16; }
    if (blue < 16) { b16 = "0" + b16; }

    return r16 + g16 + b16;
}

var hexRegexp = /(^#{0,1}[0-9A-F]{6}$)|(^#{0,1}[0-9A-F]{3}$)|(^#{0,1}[0-9A-F]{8}$)/i;

var regexp = /([0-9A-F])([0-9A-F])([0-9A-F])/i;

function hexToRgb(value) {
    var valid = hexRegexp.test(value);

    if (valid) {
        if (value[0] === '#') { value = value.slice(1, value.length); }

        if (value.length === 3) { value = value.replace(regexp, '$1$1$2$2$3$3'); }

        var red = parseInt(value.substr(0, 2), 16);
        var green = parseInt(value.substr(2, 2), 16);
        var blue = parseInt(value.substr(4, 2), 16);
        var alpha = parseInt(value.substr(6, 2), 16) / 255;

        var color = setRGBA(red, green, blue, alpha);
        var hsv = rgbToHSv(Object.assign({}, color));

        return Object.assign({}, color,
            hsv);
    }

    return false;
}

function updateGradientActivePercent(offsetX, width) {
    var leftPercent = (offsetX * 100) / width;
    return leftPercent < 0 ? 0 : leftPercent > 100 ? 100 : leftPercent;
}

function calculateDegree(x, y, centerX, centerY) {
    var radians = Math.atan2(x - centerX, y - centerY);
    return (radians * (180 / Math.PI) * -1) + 180;
}

function getRightValue(newValue, oldValue) {
    return (!newValue && newValue !== 0) ? oldValue : newValue;
}

function generateSolidStyle(red, green, blue, alpha) {
    return ("rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")");
}

function generateGradientStyle(points, type, degree) {
    var style = '';
    var sortedPoints = points.slice();

    sortedPoints.sort(function (a, b) { return a.left - b.left; });

    if (type === 'linear') {
        style = "linear-gradient(" + degree + "deg,";
    } else {
        style = 'radial-gradient(';
    }

    sortedPoints.forEach(function (point, index) {
        style += "rgba(" + (point.red) + ", " + (point.green) + ", " + (point.blue) + ", " + (point.alpha) + ") " + (point.left) + "%";

        if (index !== sortedPoints.length - 1) {
            style += ',';
        }
    });
    
    style += ')';

    return style;
}

function useMouseEvents(mouseDownHandler, mouseMoveHandler, mouseUpHandler) {
    return function mouseEventsHandler(event) {
        var positions = mouseDownHandler(event);

        function onMouseMove(event) {
            positions = mouseMoveHandler(event, positions) || positions;
        }

        window.addEventListener('mousemove', onMouseMove);

        window.addEventListener('mouseup', function (event) {
            window.removeEventListener('mousemove', onMouseMove);

            mouseUpHandler && mouseUpHandler(event, positions);
        }, { once: true });
    };
}

var script = {
    name: "Picker",

    props: {
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        hue: Number,
        saturation: Number,
        value: Number,
        updateColor: Function,
    },

    data: function data() {
        return {
            width: 0,
            height: 0,
            mouseEvents: function () {},
        }
    },

    mounted: function mounted() {
        var ref = this.$refs;
        var pickerAreaRef = ref.pickerAreaRef;

        if (pickerAreaRef) {
            this.width = pickerAreaRef.clientWidth;
            this.height = pickerAreaRef.clientHeight;
        }

        this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
    },

    computed: {
        offsetLeft: function offsetLeft() {
            return ((this.saturation * this.width / 100) | 0) - 6;
        },

        offsetTop: function offsetTop() {
            return (this.height - (this.value * this.height / 100) | 0) - 6;
        },

        pointerStyle: function pointerStyle() {
            return {
                backgroundColor: ("rgb(" + (this.red) + ", " + (this.green) + ", " + (this.blue) + ")"),
                left: ((this.offsetLeft) + "px"),
                top: ((this.offsetTop) + "px"),
            }
        },

        pickerStyle: function pickerStyle() {
            var ref = getRgbByHue(this.hue);
            var red = ref.red;
            var green = ref.green;
            var blue = ref.blue;

            return { backgroundColor: ("rgb(" + red + ", " + green + ", " + blue + ")") };
        }
    },

    methods: {
        mouseDownHandler: function mouseDownHandler(event) {
            var ref = this.$refs.pickerAreaRef.getBoundingClientRect();
            var elementX = ref.x;
            var elementY = ref.y;
            var startX = event.pageX;
            var startY = event.pageY;
            var positionX = startX - elementX;
            var positionY = startY - elementY;

            var color = changePicker(positionX, positionY, this.height, this.width, this.hue);

            this.updateColor(color, 'onStartChange');
            return {
                startX: startX,
                startY: startY,
                positionX: positionX,
                positionY: positionY,

            };
        },

        changeObjectPositions: function changeObjectPositions(event, ref) {
            var startX = ref.startX;
            var startY = ref.startY;
            var positionX = ref.positionX;
            var positionY = ref.positionY;

            var moveX = event.pageX - startX;
            var moveY = event.pageY - startY;
            positionX += moveX;
            positionY += moveY;

            var color = changePicker(positionX, positionY, this.height, this.width, this.hue);

            return {
                positions: {
                    positionX: positionX,
                    positionY: positionY,
                    startX: event.pageX,
                    startY: event.pageY,
                },
                color: color,
            };
        },

        mouseMoveHandler: function mouseMoveHandler(event, ref) {
            var startX = ref.startX;
            var startY = ref.startY;
            var positionX = ref.positionX;
            var positionY = ref.positionY;

            var ref$1 = this.changeObjectPositions(event, {
                startX: startX, startY: startY, positionX: positionX, positionY: positionY,
            });
            var positions = ref$1.positions;
            var color = ref$1.color;

            this.updateColor(color, 'onChange');

            return positions;
        },

        mouseUpHandler: function mouseUpHandler(event, ref) {
            var startX = ref.startX;
            var startY = ref.startY;
            var positionX = ref.positionX;
            var positionY = ref.positionY;

            var ref$1 = this.changeObjectPositions(event, {
                startX: startX, startY: startY, positionX: positionX, positionY: positionY,
            });
            var positions = ref$1.positions;
            var color = ref$1.color;

            this.updateColor(color, 'onEndChange');

            return positions;
        },
    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      ref: "pickerAreaRef",
      staticClass: "picking-area",
      style: _vm.pickerStyle,
      on: { mousedown: _vm.mouseEvents }
    },
    [
      _c("div", { staticClass: "picking-area-overlay1" }, [
        _c("div", { staticClass: "picking-area-overlay2" }, [
          _c("div", { staticClass: "picker-pointer", style: _vm.pointerStyle })
        ])
      ])
    ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

var script$1 = {
    name: "area-preview",

    props: {
        isGradient: Boolean,
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        points: Array,
        gradientDegree: Number,
        gradientType: String,
    },

    computed: {
        style: function style() {
            if (this.isGradient) {
                var style$1 = generateGradientStyle(this.points, this.gradientType, this.gradientDegree);

                return { background: style$1 };
            }

            var style = generateSolidStyle(this.red, this.green, this.blue, this.alpha);

            return { backgroundColor: style };
        }
    }
};

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "preview-area" }, [
    _c("div", { staticClass: "preview-box", style: _vm.style })
  ])
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );

var script$2 = {
    name: "hue",

    props: {
        hue: Number,
        saturation: Number,
        value: Number,
        updateColor: Function,
    },

    data: function data() {
        return {
            width: 0,
            mouseEvents: function () {},
        }
    },

    mounted: function mounted() {
        var ref = this.$refs;
        var hueRef = ref.hueRef;

        if (hueRef) {
            this.width = hueRef.clientWidth;
        }

        this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
    },

    computed: {
        offsetLeft: function offsetLeft() {
            return ((this.hue * this.width / 360) | 0) - 6;
        },

        pointerStyle: function pointerStyle() {
            return {
                left: ((this.offsetLeft) + "px"),
            }
        },
    },

    methods: {
        mouseDownHandler: function mouseDownHandler(event) {
            var elementX = event.currentTarget.getBoundingClientRect().x;
            var startX = event.pageX;
            var positionX = startX - elementX;

            var color = getHue(positionX, this.width, this.saturation, this.value);

            this.updateColor(color, 'onStartChange');

            return {
                startX: startX,
                positionX: positionX,
            };
        },

        changeObjectPositions: function changeObjectPositions(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var moveX = event.pageX - startX;
            positionX += moveX;

            // update value and saturation
            var offsetX = positionX > this.width ? this.width : positionX <= 0 ? 0 : positionX;
            var color = getHue(offsetX, this.width, this.saturation, this.value);

            return {
                positions: {
                    positionX: positionX,
                    startX: event.pageX,
                },
                color: color,
            };
        },

        mouseMoveHandler: function mouseMoveHandler(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var ref$1 = this.changeObjectPositions(event, { startX: startX, positionX: positionX });
            var positions = ref$1.positions;
            var color = ref$1.color;

            this.updateColor(color, 'onChange');

            return positions;
        },

        mouseUpHandler: function mouseUpHandler(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var ref$1 = this.changeObjectPositions(event, { startX: startX, positionX: positionX });
            var positions = ref$1.positions;
            var color = ref$1.color;

            this.updateColor(color, 'onEndChange');

            return positions;
        },
    }
};

/* script */
var __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hue", on: { mousedown: _vm.mouseEvents } }, [
    _c("div", { ref: "hueRef", staticClass: "hue-area" }, [
      _c("div", { staticClass: "picker-pointer", style: _vm.pointerStyle })
    ])
  ])
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  var __vue_inject_styles__$2 = undefined;
  /* scoped */
  var __vue_scope_id__$2 = undefined;
  /* module identifier */
  var __vue_module_identifier__$2 = undefined;
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    undefined,
    undefined,
    undefined
  );

var script$3 = {
    name: "alpha",

    props: {
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        updateColor: Function,
    },

    data: function data() {
        return {
            width: 0,
            mouseEvents: function () {},
        }
    },

    mounted: function mounted() {
        var ref = this.$refs;
        var alphaMaskRef = ref.alphaMaskRef;

        if (alphaMaskRef) {
            this.width = alphaMaskRef.clientWidth;
        }

        this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
    },

    computed: {
        offsetLeft: function offsetLeft() {
            return ((this.alpha * this.width) | 0) - 6;
        },

        pointerStyle: function pointerStyle() {
            return {left: ((this.offsetLeft) + "px"),}
        },

        style: function style() {
            return {
                background: ("linear-gradient(to right, rgba(0, 0, 0, 0), rgb(" + (this.red) + ", " + (this.green) + ", " + (this.blue) + "))"),
            }
        }
    },

    methods: {
        mouseDownHandler: function mouseDownHandler(event) {
            var elementX = event.currentTarget.getBoundingClientRect().x;
            var startX = event.pageX;
            var positionX = startX - elementX;

            this.updateColor({ alpha: getAlpha(positionX, this.width) }, 'onStartChange');

            return {
                startX: startX,
                positionX: positionX,

            };
        },

        changeObjectPositions: function changeObjectPositions(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var moveX = event.pageX - startX;
            positionX += moveX;

            var alpha = getAlpha(positionX, this.width);

            return {
                positions: {
                    positionX: positionX,
                    startX: event.pageX,
                },
                alpha: alpha,
            };
        },

        mouseMoveHandler: function mouseMoveHandler(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var ref$1 = this.changeObjectPositions(event, { startX: startX, positionX: positionX });
            var positions = ref$1.positions;
            var alpha = ref$1.alpha;

            this.updateColor({ alpha: alpha }, 'onChange');

            return positions;
        },

        mouseUpHandler: function mouseUpHandler(event, ref) {
            var startX = ref.startX;
            var positionX = ref.positionX;

            var ref$1 = this.changeObjectPositions(event, { startX: startX, positionX: positionX });
            var positions = ref$1.positions;
            var alpha = ref$1.alpha;

            this.updateColor({ alpha: alpha }, 'onEndChange');

            return positions;
        },
    }
};

/* script */
var __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "alpha", on: { mousedown: _vm.mouseEvents } },
    [
      _c("div", { staticClass: "gradient", style: _vm.style }),
      _vm._v(" "),
      _c("div", { staticClass: "alpha-area" }, [
        _c("div", { ref: "alphaMaskRef", staticClass: "alpha-mask" }, [
          _c("div", { staticClass: "picker-pointer", style: _vm.pointerStyle })
        ])
      ])
    ]
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  var __vue_inject_styles__$3 = undefined;
  /* scoped */
  var __vue_scope_id__$3 = undefined;
  /* module identifier */
  var __vue_module_identifier__$3 = undefined;
  /* functional template */
  var __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    undefined,
    undefined,
    undefined
  );

var script$4 = {
  name: "GradientPoint",

  props: {
    point: Object,
    activePointIndex: Number,
    index: Number,
    width: Number,
    positions: Object,
    changeActivePointIndex: Function,
    updateGradientLeft: Function,
    removePoint: Function,
  },

  data: function data() {
    return {
      mouseEvents: function () { },
    }
  },

  mounted: function mounted() {
    this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
  },

  computed: {
    activeClassName: function activeClassName() {
      return this.activePointIndex === this.index ? ' active' : '';
    },

    pointStyle: function pointStyle() {
      return { left: (((this.point.left * (this.width / 100)) - 6) + "px"), }
    }
  },

  methods: {
    mouseDownHandler: function mouseDownHandler(event) {
      event.stopPropagation();
      this.changeActivePointIndex(this.index);

      var startX = event.target.offsetLeft;
      var startY = event.pageY;
      var offsetX = startX - this.positions.x;

      this.updateGradientLeft(this.point.left, this.index, 'onStartChange');

      return {
        startX: startX,
        startY: startY,
        offsetX: offsetX,
        layerX: startX,
        mouseStatus: 'down'
      };
    },

    changeObjectPositions: function changeObjectPositions(event, ref) {
      var offsetX = ref.offsetX;
      var layerX = ref.layerX;

      var newLayerX = event.layerX;

      var moveX = newLayerX - layerX;
      offsetX += moveX;
      // update point percent
      var left = updateGradientActivePercent(offsetX, this.width);

      return {
        positions: {
          offsetX: offsetX,
          startX: event.pageX,
          layerX: newLayerX,
          pageX: event.pageX
        },
        left: left,
      };
    },

    mouseMoveHandler: function mouseMoveHandler(event, ref) {
      var startX = ref.startX;
      var offsetX = ref.offsetX;
      var layerX = ref.layerX;

      event.stopPropagation();
      var ref$1 = this.changeObjectPositions(event, { startX: startX, offsetX: offsetX, layerX: layerX, mouseStatus: 'moving' });
      var positions = ref$1.positions;
      var left = ref$1.left;

      this.updateGradientLeft(left, this.index, 'onChange');

      return positions;
    },

    mouseUpHandler: function mouseUpHandler(event, ref) {
      var startX = ref.startX;
      var offsetX = ref.offsetX;
      var layerX = ref.layerX;
      var mouseStatus = ref.mouseStatus;

      event.stopPropagation();
      if (mouseStatus === 'down') {
        // 没有moving，无需更新
        return
      }
      var ref$1 = this.changeObjectPositions(event, { startX: startX, offsetX: offsetX, layerX: layerX, mouseStatus: 'up' });
      var positions = ref$1.positions;
      var left = ref$1.left;

      this.updateGradientLeft(left, this.index, 'onEndChange');

      return positions;
    },
  }
};

/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      class: "picker-pointer" + _vm.activeClassName,
      style: _vm.pointStyle,
      on: {
        mousedown: _vm.mouseEvents,
        dblclick: function() {
          return _vm.removePoint(_vm.index)
        },
        click: function($event) {
          $event.stopPropagation();
        }
      }
    },
    [_c("span", { class: "child-point" + _vm.activeClassName })]
  )
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  var __vue_inject_styles__$4 = undefined;
  /* scoped */
  var __vue_scope_id__$4 = undefined;
  /* module identifier */
  var __vue_module_identifier__$4 = undefined;
  /* functional template */
  var __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    undefined,
    undefined,
    undefined
  );

var script$5 = {
  name: "index",

  props: {
    points: Array,
    activePointIndex: Number,
    changeActivePointIndex: Function,
    updateGradientLeft: Function,
    addPoint: Function,
    removePoint: Function,
  },

  data: function data() {
    return {
      width: 0,
      positions: { x: 0, y: 0 }
    }
  },

  components: {
    GradientPoint: __vue_component__$4
  },

  mounted: function mounted() {
    var pointer = this.$refs.pointsContainerRef;

    if (pointer) {
      this.width = pointer.clientWidth;

      // const pointerPos = pointer.getBoundingClientRect();

      this.positions = { x: pointer.offsetLeft, y: pointer.offsetTop };
    }
  },

  computed: {
    pointsStyle: function pointsStyle() {
      var style = generateGradientStyle(this.points, 'linear', 90);

      return { background: style };
    }
  },

  methods: {
    pointsContainerClick: function pointsContainerClick(event) {
      var left = updateGradientActivePercent(event.layerX, this.width);

      this.addPoint(left);
    },
  }
};

/* script */
var __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "gradient",
      style: _vm.pointsStyle,
      on: { mousedown: _vm.pointsContainerClick }
    },
    [
      _c(
        "div",
        { ref: "pointsContainerRef", staticClass: "gradient-slider-container" },
        _vm._l(_vm.points, function(point, index) {
          return _c("GradientPoint", {
            key: index,
            attrs: {
              activePointIndex: _vm.activePointIndex,
              index: index,
              point: point,
              width: _vm.width,
              positions: _vm.positions,
              changeActivePointIndex: _vm.changeActivePointIndex,
              updateGradientLeft: _vm.updateGradientLeft,
              removePoint: _vm.removePoint
            }
          })
        }),
        1
      )
    ]
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  var __vue_inject_styles__$5 = undefined;
  /* scoped */
  var __vue_scope_id__$5 = undefined;
  /* module identifier */
  var __vue_module_identifier__$5 = undefined;
  /* functional template */
  var __vue_is_functional_template__$5 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    undefined,
    undefined,
    undefined
  );

var script$6 = {
    name: "Area",

    props: {
        isGradient: Boolean,
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        hue: Number,
        saturation: Number,
        value: Number,
        updateColor: Function,
        points: Array,
        degree: Number,
        type: String,
        activePointIndex: Number,
        changeGradientControl: Function,
        changeActivePointIndex: Function,
        updateGradientLeft: Function,
        addPoint: Function,
        removePoint: Function,
    },

    components: {
        Picker: __vue_component__,
        GradientPoints: __vue_component__$5,
        Preview: __vue_component__$1,
        Hue: __vue_component__$2,
        Alpha: __vue_component__$3
    },
};

/* script */
var __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "picker-area" },
    [
      _c("Picker", {
        attrs: {
          red: _vm.red,
          green: _vm.green,
          blue: _vm.blue,
          hue: _vm.hue,
          saturation: _vm.saturation,
          value: _vm.value,
          updateColor: _vm.updateColor
        }
      }),
      _vm._v(" "),
      _vm.isGradient
        ? _c("GradientPoints", {
            attrs: {
              type: _vm.type,
              degree: _vm.degree,
              points: _vm.points,
              activePointIndex: _vm.activePointIndex,
              changeActivePointIndex: _vm.changeActivePointIndex,
              updateGradientLeft: _vm.updateGradientLeft,
              addPoint: _vm.addPoint,
              removePoint: _vm.removePoint
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "preview" },
        [
          _c("Preview", {
            attrs: {
              red: _vm.red,
              green: _vm.green,
              blue: _vm.blue,
              alpha: _vm.alpha,
              isGradient: _vm.isGradient,
              points: _vm.points,
              gradientDegree: _vm.degree,
              gradientType: _vm.type
            }
          }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "color-hue-alpha" },
            [
              _c("Hue", {
                attrs: {
                  hue: _vm.hue,
                  saturation: _vm.saturation,
                  value: _vm.value,
                  updateColor: _vm.updateColor
                }
              }),
              _vm._v(" "),
              _c("Alpha", {
                attrs: {
                  alpha: _vm.alpha,
                  red: _vm.red,
                  green: _vm.green,
                  blue: _vm.blue,
                  updateColor: _vm.updateColor
                }
              })
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  var __vue_inject_styles__$6 = undefined;
  /* scoped */
  var __vue_scope_id__$6 = undefined;
  /* module identifier */
  var __vue_module_identifier__$6 = undefined;
  /* functional template */
  var __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    undefined,
    undefined,
    undefined
  );

var script$7 = {
    name: "Input",

    props: {
        value: {
            type: String | Number,
            default: '',
        },
        label: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'text'
        },
        classes: {
            type: String,
            default: ''
        },
        onFocus: {
            type: Function,
            default: function () {
            }
        },
        onBlur: {
            type: Function,
            default: function () {
            }
        },
    },

    model: {
        prop: "value",
        event: "input"
    }
};

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
var __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { class: "input-field " + _vm.classes }, [
    _c("div", { staticClass: "input-container" }, [
      _c("input", {
        class: _vm.type + "-input input",
        domProps: { value: _vm.value },
        on: {
          focus: _vm.onFocus,
          blur: _vm.onBlur,
          input: function($event) {
            return _vm.$emit("input", $event)
          }
        }
      })
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "label" }, [
      _vm._v("\n        " + _vm._s(_vm.label) + "\n    ")
    ])
  ])
};
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  var __vue_inject_styles__$7 = function (inject) {
    if (!inject) { return }
    inject("data-v-6ece3a14_0", { source: ".input-field {\n  display: flex;\n  flex-shrink: 0;\n  align-items: center;\n  flex-direction: column;\n}\n.input-field .label {\n  font-size: 12px;\n  line-height: 15px;\n  font-weight: 600;\n  margin-top: 6px;\n  margin-bottom: 0;\n  color: #1F2667;\n}\n.input-field .input-container {\n  display: flex;\n  align-items: center;\n  position: relative;\n  width: 100%;\n  border-radius: 6px;\n  color: #28314d;\n}\n.input-field .input-container .input {\n  width: 100%;\n  outline: 0;\n  color: #1F2667;\n  border-radius: inherit;\n  border: 1px solid #bbbfc5;\n  height: 24px;\n  font-size: 12px;\n  font-weight: 600;\n  padding: 0 6px;\n}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$7 = undefined;
  /* module identifier */
  var __vue_module_identifier__$7 = undefined;
  /* functional template */
  var __vue_is_functional_template__$7 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$7 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    false,
    createInjector,
    undefined,
    undefined
  );

var script$8 = {
    name: "Preview",

    props: {
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        updateColor: Function,
    },

    components: {
        Input: __vue_component__$7
    },

    data: function data() {
        return {
            inProgress: false,
            hexValue: rgbToHex(this.red, this.green, this.blue),
        }
    },

    computed: {
        hex: function hex() {
            return rgbToHex(this.red, this.green, this.blue)
        }
    },

    watch: {
        inProgress: "setHex",
        red: "setHex",
        green: "setHex",
        blue: "setHex",
    },

    methods: {
        setHex: function setHex() {
            if (this.inProgress) {
                return;
            }

            this.hexValue = this.hex;
        },

        changeHex: function changeHex(event) {
            var color = hexToRgb(event.target.value);

            if (color) {
                this.updateColor(color);
            }
        }
    }
};

/* script */
var __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "fragment",
    [
      _c("Input", {
        attrs: {
          value: _vm.hexValue,
          label: "hex",
          onFocus: function() {
            return (_vm.inProgress = true)
          },
          onBlur: function() {
            return (_vm.inProgress = false)
          },
          inProgress: _vm.inProgress,
          classes: "hex"
        },
        on: { input: _vm.changeHex }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  var __vue_inject_styles__$8 = undefined;
  /* scoped */
  var __vue_scope_id__$8 = undefined;
  /* module identifier */
  var __vue_module_identifier__$8 = undefined;
  /* functional template */
  var __vue_is_functional_template__$8 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$8 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    false,
    undefined,
    undefined,
    undefined
  );

var script$9 = {
    name: "RGBItem",

    props: {
        value: String | Number,
        type: String,
        label: String,
        onChange: Function,
    },

    components: {
        Input: __vue_component__$7
    },

    data: function data() {
        return {
            inputValue: this.value,
            inProgress: false
        }
    },

    watch: {
        value: "setValue"
    },

    methods: {
        onChangeHandler: function onChangeHandler(event) {
            var value = +event.target.value;

            if (Number.isNaN(value) || value.length > 3 || value < 0 || value > 255) {
                this.inputValue = this.value;

                this.$forceUpdate();

                return;
            }

            this.inputValue = event.target.value;

            this.onChange(value);
        },

        onBlur: function onBlur() {
            if (!this.inputValue && !this.inputValue !== 0) {
                this.inputValue = this.value;
            }

            this.inProgress = false;
        },

        setValue: function setValue() {
            if (this.value !== +this.inputValue && this.inputValue !== '') {
                this.inputValue = this.value;
            }
        }
    }
};

/* script */
var __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _c("Input", {
        attrs: {
          value: _vm.inputValue,
          type: _vm.type,
          label: _vm.label,
          onFocus: function() {
            return (_vm.inProgress = true)
          },
          onBlur: _vm.onBlur,
          inProgress: _vm.inProgress,
          classes: "rgb"
        },
        on: { input: _vm.onChangeHandler }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  var __vue_inject_styles__$9 = function (inject) {
    if (!inject) { return }
    inject("data-v-2db12720_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"index.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$9 = "data-v-2db12720";
  /* module identifier */
  var __vue_module_identifier__$9 = undefined;
  /* functional template */
  var __vue_is_functional_template__$9 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$9 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    createInjector,
    undefined,
    undefined
  );

var script$a = {
    name: "RGB",

    props: {
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        updateColor: Function,
    },

    components: {
        RGBItem: __vue_component__$9
    },

    methods: {
        changeValue: function changeValue(field, value) {
            var obj, obj$1;

            if (field === 'alpha') {
                this.updateColor({ alpha: value / 100 });

                return;
            }

            var color = rgbToHSv(( obj = {
                red: this.red, green: this.green, blue: this.blue
            }, obj[field] = value, obj ));

            this.updateColor(Object.assign({}, color, ( obj$1 = {}, obj$1[field] = value, obj$1 )));
        },
    }
};

/* script */
var __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "fragment",
    [
      _c("RGBItem", {
        attrs: {
          value: _vm.red,
          type: "number",
          label: "R",
          onChange: function(value) {
            return _vm.changeValue("red", value)
          }
        }
      }),
      _vm._v(" "),
      _c("RGBItem", {
        attrs: {
          value: _vm.green,
          type: "number",
          label: "G",
          onChange: function(value) {
            return _vm.changeValue("green", value)
          }
        }
      }),
      _vm._v(" "),
      _c("RGBItem", {
        attrs: {
          value: _vm.blue,
          type: "number",
          label: "B",
          onChange: function(value) {
            return _vm.changeValue("blue", value)
          }
        }
      }),
      _vm._v(" "),
      _c("RGBItem", {
        attrs: {
          value: parseInt(_vm.alpha * 100, 10),
          type: "number",
          label: "Alpha",
          onChange: function(value) {
            return _vm.changeValue("alpha", value)
          }
        }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  var __vue_inject_styles__$a = function (inject) {
    if (!inject) { return }
    inject("data-v-b8ce4ac8_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"index.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$a = "data-v-b8ce4ac8";
  /* module identifier */
  var __vue_module_identifier__$a = undefined;
  /* functional template */
  var __vue_is_functional_template__$a = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$a = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    false,
    createInjector,
    undefined,
    undefined
  );

var script$b = {
    name: "Preview",

    props: {
        red: Number,
        green: Number,
        blue: Number,
        alpha: Number,
        updateColor: Function,
    },

    components: {
        Hex: __vue_component__$8,
        RGB: __vue_component__$a
    }
};

/* script */
var __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "color-preview-area" }, [
    _c(
      "div",
      { staticClass: "input-group" },
      [
        _c("Hex", {
          attrs: {
            red: _vm.red,
            green: _vm.green,
            blue: _vm.blue,
            updateColor: _vm.updateColor
          }
        }),
        _vm._v(" "),
        _c("RGB", {
          attrs: {
            red: _vm.red,
            green: _vm.green,
            blue: _vm.blue,
            alpha: _vm.alpha,
            updateColor: _vm.updateColor
          }
        })
      ],
      1
    )
  ])
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  var __vue_inject_styles__$b = undefined;
  /* scoped */
  var __vue_scope_id__$b = undefined;
  /* module identifier */
  var __vue_module_identifier__$b = undefined;
  /* functional template */
  var __vue_is_functional_template__$b = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$b = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    false,
    undefined,
    undefined,
    undefined
  );

var script$c = {
    name: "Solid",

    props: {
        red: {
            type: Number,
            default: 255
        },
        green: {
            type: Number,
            default: 0
        },
        blue: {
            type: Number,
            default: 0
        },
        alpha: {
            type: Number,
            default: 1
        },
        hue: Number,
        saturation: Number,
        value: Number,
        onStartChange: Function,
        onChange: Function,
        onEndChange: Function,
    },

    components: {
        Area: __vue_component__$6,
        Preview: __vue_component__$b,
    },

    data: function data() {
        return {
            colorRed: this.red,
            colorGreen: this.green,
            colorBlue: this.blue,
            colorAlpha: this.alpha,
            colorHue: 0,
            colorSaturation: 100,
            colorValue: 100,
            actions: {
                onStartChange: this.onStartChange,
                onChange: this.onChange,
                onEndChange: this.onEndChange,
            }

        }
    },

    mounted: function mounted() {
        var ref = rgbToHSv({ red: this.colorRed, green: this.colorGreen, blue: this.colorBlue });
        var hue = ref.hue;
        var saturation = ref.saturation;
        var value = ref.value;

        this.colorHue = hue;
        this.colorSaturation = saturation;
        this.colorValue = value;
    },

    computed: {
        hsv: function hsv() {
            if (this.hue === undefined || this.saturation === undefined || this.value=== undefined) {
                return rgbToHSv({ red: this.red, green: this.green, blue: this.blue });
            }

            return  {
                hue: this.hue,
                saturation: this.saturation,
                value: this.value,
            }
        },

        color: function color() {
            return {
                red: this.red,
                green: this.green,
                blue: this.blue,
                alpha: this.alpha,

            }
        }
    },

    watch: {
        hsv: function (ref) {
            var hue = ref.hue;
            var saturation = ref.saturation;
            var value = ref.value;

            this.colorHue = hue;
            this.colorSaturation = saturation;
            this.colorValue = value;
        },

        color: function (ref) {
            var red = ref.red;
            var green = ref.green;
            var blue = ref.blue;
            var alpha = ref.alpha;

            this.colorRed = red;
            this.colorGreen = green;
            this.colorBlue = blue;
            this.colorAlpha = alpha;
        },
    },

    methods: {
        updateColor: function updateColor(ref, actionName) {
            var red = ref.red;
            var green = ref.green;
            var blue = ref.blue;
            var alpha = ref.alpha;
            var hue = ref.hue;
            var saturation = ref.saturation;
            var value = ref.value;
            if ( actionName === void 0 ) actionName = 'onChange';

            red = getRightValue(red, this.colorRed);
            green = getRightValue(green, this.colorGreen);
            blue = getRightValue(blue, this.colorBlue);
            alpha = getRightValue(alpha, this.colorAlpha);
            hue = getRightValue(hue, this.colorHue);
            saturation = getRightValue(saturation, this.colorSaturation);
            value = getRightValue(value, this.colorValue);

            this.colorRed = red;
            this.colorGreen = green;
            this.colorBlue = blue;
            this.colorAlpha = alpha;
            this.colorHue = hue;
            this.colorSaturation = saturation;
            this.colorValue = value;

            var action = this.actions[actionName];

            action && action({
                red: red,
                green: green,
                blue: blue,
                alpha: alpha,
                hue: hue,
                saturation: saturation,
                value: value,
                style: generateSolidStyle(red, green, blue, alpha),
            });
        },
    }
};

/* script */
var __vue_script__$c = script$c;

/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "fragment",
    [
      _c("Area", {
        attrs: {
          red: _vm.colorRed,
          green: _vm.colorGreen,
          blue: _vm.colorBlue,
          alpha: _vm.colorAlpha,
          hue: _vm.colorHue,
          saturation: _vm.colorSaturation,
          value: _vm.colorValue,
          updateColor: _vm.updateColor,
          "is-gradient": false
        }
      }),
      _vm._v(" "),
      _c("Preview", {
        attrs: {
          red: _vm.colorRed,
          green: _vm.colorGreen,
          blue: _vm.colorBlue,
          alpha: _vm.colorAlpha,
          updateColor: _vm.updateColor
        }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  var __vue_inject_styles__$c = undefined;
  /* scoped */
  var __vue_scope_id__$c = undefined;
  /* module identifier */
  var __vue_module_identifier__$c = undefined;
  /* functional template */
  var __vue_is_functional_template__$c = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$c = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    false,
    undefined,
    undefined,
    undefined
  );

var script$d = {
    name: "GradientControls",

    props: {
        type: String,
        degree: Number,
        changeGradientControl: {
            type: Function,
            default: function () {}
        }
    },
    data: function data() {
        return {
            disableClick: false,
            mouseEvents: function () {},
        }
    },

    mounted: function mounted() {
        this.mouseEvents = useMouseEvents(this.mouseDownHandler, this.mouseMoveHandler, this.mouseUpHandler);
    },

    computed: {
        degreesStyle: function degreesStyle() {
            return { transform: ("rotate(" + (this.degree) + "deg)") };
        }
    },

    methods: {
        mouseDownHandler: function mouseDownHandler(event) {
            var pointer = event.target;
            var pointerBox = pointer.getBoundingClientRect();
            var centerY = pointerBox.top + parseInt(8 - window.pageYOffset, 10);
            var centerX = pointerBox.left + parseInt(8 - window.pageXOffset, 10);

            return {
                centerY: centerY,
                centerX: centerX,

            };
        },

        mouseMoveHandler: function mouseMoveHandler(event, ref) {
            var centerX = ref.centerX;
            var centerY = ref.centerY;

            this.disableClick = true;

            var newDegree = calculateDegree(event.clientX, event.clientY, centerX, centerY);

            this.changeGradientControl({ degree: parseInt(newDegree, 10) });
        },

        mouseUpHandler: function mouseUpHandler(event) {
            var targetClasses = event.target.classList;

            if (targetClasses.contains('gradient-degrees') || targetClasses.contains('icon-rotate')) {
                return;
            }

            this.disableClick = false;
        },

        onClickGradientDegree: function onClickGradientDegree() {
            if (this.disableClick) {
                this.disableClick = false;
                return;
            }

            var gradientDegree = this.degree + 45;

            if (gradientDegree >= 360) {
                gradientDegree = 0;
            }

            this.changeGradientControl({ degree: parseInt(gradientDegree, 10) });
        }
    }
};

/* script */
var __vue_script__$d = script$d;

/* template */
var __vue_render__$d = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "gradient-controls" }, [
    _c("div", { staticClass: "gradient-type" }, [
      _c("div", {
        class:
          "gradient-type-item liner-gradient " +
          (_vm.type === "linear" ? "active" : ""),
        on: {
          click: function() {
            return _vm.changeGradientControl({ type: "linear" })
          }
        }
      }),
      _vm._v(" "),
      _c("div", {
        class:
          "gradient-type-item radial-gradient " +
          (_vm.type === "radial" ? "active" : ""),
        on: {
          click: function() {
            return _vm.changeGradientControl({ type: "radial" })
          }
        }
      })
    ]),
    _vm._v(" "),
    _vm.type === "linear"
      ? _c("div", { staticClass: "gradient-degrees-options" }, [
          _c(
            "div",
            {
              staticClass: "gradient-degrees",
              on: {
                mousedown: _vm.mouseEvents,
                click: _vm.onClickGradientDegree
              }
            },
            [
              _c(
                "div",
                {
                  staticClass: "gradient-degree-center",
                  style: _vm.degreesStyle
                },
                [_c("div", { staticClass: "gradient-degree-pointer" })]
              )
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "gradient-degree-value" }, [
            _c("p", [
              _vm._v(
                "\n                " + _vm._s(_vm.degree) + "°\n            "
              )
            ])
          ])
        ])
      : _vm._e()
  ])
};
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  var __vue_inject_styles__$d = undefined;
  /* scoped */
  var __vue_scope_id__$d = undefined;
  /* module identifier */
  var __vue_module_identifier__$d = undefined;
  /* functional template */
  var __vue_is_functional_template__$d = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$d = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    false,
    undefined,
    undefined,
    undefined
  );

var script$e = {
    name: "Gradient",

    props: {
        type: {
            type: String,
            default: 'linear'
        },
        degree: {
            type: Number,
            default: 0
        },
        points: {
            type: Array,
            default: function () {
                return [
                    {
                        left: 0,
                        red: 0,
                        green: 0,
                        blue: 0,
                        alpha: 1,
                    },
                    {
                        left: 100,
                        red: 255,
                        green: 0,
                        blue: 0,
                        alpha: 1,
                    } ];
            }
        },
        onStartChange: Function,
        onChange: Function,
        onEndChange: Function,
    },

    components: {
        GradientControls: __vue_component__$d,
        Area: __vue_component__$6,
        Preview: __vue_component__$b
    },

    data: function data() {
        return {
            activePointIndex: 0,
            gradientPoints: this.points,
            activePoint: this.points[0],
            colorRed: this.points[0].red,
            colorGreen: this.points[0].green,
            colorBlue: this.points[0].blue,
            colorAlpha: this.points[0].alpha,
            colorHue: 0,
            colorSaturation: 100,
            colorValue: 100,
            gradientType: this.type,
            gradientDegree: this.degree,
            actions: {
                onStartChange: this.onStartChange,
                onChange: this.onChange,
                onEndChange: this.onEndChange,
            }
        }
    },

    mounted: function mounted() {
        var ref = rgbToHSv({ red: this.colorRed, green: this.colorGreen, blue: this.colorBlue });
        var hue = ref.hue;
        var saturation = ref.saturation;
        var value = ref.value;

        this.colorHue = hue;
        this.colorSaturation = saturation;
        this.colorValue = value;

        document.addEventListener('keyup', this.keyUpHandler);
    },

    beforeDestroy: function beforeDestroy() {
        document.removeEventListener('keyup', this.keyUpHandler);
    },

    methods: {
        removePoint: function removePoint(index) {
            if ( index === void 0 ) index = this.activePointIndex;

            if (this.gradientPoints.length <= 2) {
                return;
            }

            this.gradientPoints.splice(index, 1);


            if (index > 0) {
                this.activePointIndex = index - 1;
            }

            this.onChange && this.onChange({
                points: this.gradientPoints,
                type: this.gradientType,
                degree: this.gradientDegree,
                style: generateGradientStyle(this.gradientPoints, this.gradientType, this.gradientDegree),
            });
        },

        keyUpHandler: function keyUpHandler(event) {
            if ((event.keyCode === 46 || event.keyCode === 8)) {
                this.removePoint(this.activePointIndex);
            }
        },

        changeActivePointIndex: function changeActivePointIndex(index) {
            this.activePointIndex = index;

            this.activePoint = this.gradientPoints[index];

            var ref = this.activePoint;
            var red = ref.red;
            var green = ref.green;
            var blue = ref.blue;
            var alpha = ref.alpha;

            this.colorRed = red;
            this.colorGreen = green;
            this.colorBlue = blue;
            this.colorAlpha = alpha;

            var ref$1 = rgbToHSv({ red: red, green: green, blue: blue });
            var hue = ref$1.hue;
            var saturation = ref$1.saturation;
            var value = ref$1.value;

            this.colorHue = hue;
            this.colorSaturation = saturation;
            this.colorValue = value;
        },

        changeGradientControl: function changeGradientControl(ref) {
            var type = ref.type;
            var degree = ref.degree;

            type = getRightValue(type, this.gradientType);
            degree = getRightValue(degree, this.gradientDegree);

            this.gradientType = type;
            this.gradientDegree = degree;

            this.onChange({
                points: this.gradientPoints,
                type: this.gradientType,
                degree: this.gradientDegree,
                style: generateGradientStyle(this.gradientPoints, this.gradientType, this.gradientDegree),
            });
        },

        updateColor: function updateColor(ref, actionName) {
            var red = ref.red;
            var green = ref.green;
            var blue = ref.blue;
            var alpha = ref.alpha;
            var hue = ref.hue;
            var saturation = ref.saturation;
            var value = ref.value;
            if ( actionName === void 0 ) actionName = 'onChange';

            red = getRightValue(red, this.colorRed);
            green = getRightValue(green, this.colorGreen);
            blue = getRightValue(blue, this.colorBlue);
            alpha = getRightValue(alpha, this.colorAlpha);
            hue = getRightValue(hue, this.colorHue);
            saturation = getRightValue(saturation, this.colorSaturation);
            value = getRightValue(value, this.colorValue);

            var localGradientPoints = this.gradientPoints.slice();

            localGradientPoints[this.activePointIndex] = Object.assign({}, localGradientPoints[this.activePointIndex],
                {red: red,
                green: green,
                blue: blue,
                alpha: alpha});

            this.colorRed = red;
            this.colorGreen = green;
            this.colorBlue = blue;
            this.colorAlpha = alpha;
            this.colorHue = hue;
            this.colorSaturation = saturation;
            this.colorValue = value;
            this.gradientPoints = localGradientPoints;

            var action = this.actions[actionName];

            action && action({
                points: localGradientPoints,
                type: this.gradientType,
                degree: this.gradientDegree,
                style: generateGradientStyle(localGradientPoints, this.gradientType, this.gradientDegree),
            });
        },

        updateGradientLeft: function updateGradientLeft(left, index, actionName) {
            if ( actionName === void 0 ) actionName = 'onChange';

            this.gradientPoints[index].left = left;

            var action = this.actions[actionName];

            action && action({
                points: this.gradientPoints,
                type: this.gradientType,
                degree: this.gradientDegree,
                style: generateGradientStyle(this.gradientPoints, this.gradientType, this.gradientDegree),
            });
        },

        addPoint: function addPoint(left) {
            this.gradientPoints.push(Object.assign({}, this.gradientPoints[this.activePointIndex],
                {left: left}));

            this.activePointIndex = this.gradientPoints.length - 1;

            this.onChange && this.onChange({
                points: this.gradientPoints,
                type: this.gradientType,
                degree: this.gradientDegree,
                style: generateGradientStyle(this.gradientPoints, this.gradientType, this.gradientDegree),
            });
        },

    }
};

/* script */
var __vue_script__$e = script$e;

/* template */
var __vue_render__$e = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "fragment",
    [
      _c("GradientControls", {
        attrs: {
          type: _vm.gradientType,
          degree: _vm.gradientDegree,
          changeGradientControl: _vm.changeGradientControl
        }
      }),
      _vm._v(" "),
      _c("Area", {
        attrs: {
          red: _vm.colorRed,
          green: _vm.colorGreen,
          blue: _vm.colorBlue,
          alpha: _vm.colorAlpha,
          hue: _vm.colorHue,
          saturation: _vm.colorSaturation,
          value: _vm.colorValue,
          updateColor: _vm.updateColor,
          "is-gradient": true,
          type: _vm.gradientType,
          degree: _vm.gradientDegree,
          points: _vm.gradientPoints,
          activePointIndex: _vm.activePointIndex,
          changeGradientControl: _vm.changeGradientControl,
          changeActivePointIndex: _vm.changeActivePointIndex,
          updateGradientLeft: _vm.updateGradientLeft,
          addPoint: _vm.addPoint,
          removePoint: _vm.removePoint
        }
      }),
      _vm._v(" "),
      _c("Preview", {
        attrs: {
          red: _vm.colorRed,
          green: _vm.colorGreen,
          blue: _vm.colorBlue,
          alpha: _vm.colorAlpha,
          updateColor: _vm.updateColor
        }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  var __vue_inject_styles__$e = undefined;
  /* scoped */
  var __vue_scope_id__$e = undefined;
  /* module identifier */
  var __vue_module_identifier__$e = undefined;
  /* functional template */
  var __vue_is_functional_template__$e = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$e = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    false,
    undefined,
    undefined,
    undefined
  );

Vue.use(Plugin);

var script$f = {
    name: "ColorPicker",

    props: {
        isGradient: {
            type: Boolean,
            default: false,
        },
        color: {
            type: Object,
            default: function () { return ({
                red: 255,
                green: 0,
                blue: 0,
                alpha: 1,
                hue: 0,
                saturation: 100,
                value: 100,
            }); }
        },

        gradient: {
            type: Object,
            default: function () { return ({
                type: 'linear',
                degree: 0,
                points: [
                    {
                        left: 0,
                        red: 0,
                        green: 0,
                        blue: 0,
                        alpha: 1,
                    },
                    {
                        left: 100,
                        red: 255,
                        green: 0,
                        blue: 0,
                        alpha: 1,
                    } ],
            }); }
        },

        onStartChange: {
            type: Function,
            default: function () {}
        },
        onChange: {
            type: Function,
            default: function () {}
        },
        onEndChange: {
            type: Function,
            default: function () {}
        },
    },

    components: {
        Solid: __vue_component__$c,
        Gradient: __vue_component__$e
    }
};

/* script */
var __vue_script__$f = script$f;

/* template */
var __vue_render__$f = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "ui-color-picker" },
    [
      _vm.isGradient
        ? _c("Gradient", {
            attrs: {
              points: _vm.gradient.points,
              type: _vm.gradient.type,
              degree: _vm.gradient.degree,
              onChange: _vm.onChange,
              onStartChange: _vm.onStartChange,
              onEndChange: _vm.onEndChange
            }
          })
        : _c("Solid", {
            attrs: {
              red: _vm.color.red,
              green: _vm.color.green,
              blue: _vm.color.blue,
              alpha: _vm.color.alpha,
              hue: _vm.color.hue,
              saturation: _vm.color.saturation,
              value: _vm.color.value,
              onChange: _vm.onChange,
              onStartChange: _vm.onStartChange,
              onEndChange: _vm.onEndChange
            }
          })
    ],
    1
  )
};
var __vue_staticRenderFns__$f = [];
__vue_render__$f._withStripped = true;

  /* style */
  var __vue_inject_styles__$f = function (inject) {
    if (!inject) { return }
    inject("data-v-10a7b98c_0", { source: "* {\n  box-sizing: border-box;\n}\n.ui-color-picker {\n  margin: 8px;\n  background-color: #ffffff;\n  display: flex;\n  flex-direction: column;\n  width: 280px;\n  user-select: none;\n}\n.ui-color-picker .gradient-controls {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  width: 100%;\n  margin-bottom: 8px;\n  height: 24px;\n  padding: 0 16px;\n}\n.ui-color-picker .gradient-controls .gradient-type {\n  flex: 1;\n  display: flex;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item {\n  height: 28px;\n  width: 28px;\n  border-radius: 50%;\n  position: relative;\n  cursor: pointer;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.active::after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -3px;\n  bottom: -3px;\n  left: -3px;\n  right: -3px;\n  border: 2px solid #1f2667;\n  border-radius: 50%;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.liner-gradient {\n  background: linear-gradient(270deg, #ffffff 0%, #1f2667 100%);\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.radial-gradient {\n  margin-left: 8px;\n  background: radial-gradient(circle, #ffffff 0%, #1f2667 100%);\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options {\n  position: relative;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees {\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  position: relative;\n  width: 28px;\n  height: 28px;\n  border: 3px solid #1f2667;\n  border-radius: 18px;\n  margin-right: 54px;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees .gradient-degree-center {\n  position: relative;\n  width: 6px;\n  height: 22px;\n  pointer-events: none;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees .gradient-degree-center .gradient-degree-pointer {\n  position: absolute;\n  width: 6px;\n  height: 6px;\n  top: 2px;\n  border-radius: 3px;\n  background: #1f2667;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degree-value {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 48px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid #bbbfc5;\n  border-radius: 6px;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degree-value p {\n  text-align: center;\n  padding: 0 6px;\n}\n.ui-color-picker .picker-area {\n  display: flex;\n  flex-direction: column;\n  padding: 0 16px;\n}\n.ui-color-picker .picker-area.gradient-tab .picking-area {\n  margin-bottom: 10px;\n}\n.ui-color-picker .picker-area .picking-area {\n  width: 100%;\n  height: 160px;\n  margin-bottom: 16px;\n  position: relative;\n  border-radius: 8px;\n}\n.ui-color-picker .picker-area .picking-area:hover {\n  cursor: default;\n}\n.ui-color-picker .picker-area .picking-area .picking-area-overlay1 {\n  height: 100%;\n  width: 100%;\n  background: linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%);\n  border-radius: 3px;\n}\n.ui-color-picker .picker-area .picking-area .picking-area-overlay1 .picking-area-overlay2 {\n  height: 100%;\n  width: 100%;\n  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, black 100%);\n  border-radius: 8px;\n}\n.ui-color-picker .picker-area .preview {\n  display: flex;\n  flex-direction: row;\n  margin-bottom: 16px;\n}\n.ui-color-picker .picker-area .preview .preview-box {\n  box-sizing: border-box;\n  height: 36px;\n  width: 36px;\n  border-radius: 8px;\n  border: 1px solid #ebedf5;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  margin-left: 6px;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .hue {\n  width: 100%;\n  position: relative;\n  border-radius: 10px;\n  margin-bottom: 8px;\n  padding: 0 7px;\n  background-color: red;\n  cursor: pointer;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .hue .hue-area {\n  position: relative;\n  height: 14px;\n  background: -webkit-linear-gradient(left, #ff0000, #ff0080, #ff00ff, #8000ff, #0000ff, #0080ff, #00ffff, #00ff80, #00ff00, #80ff00, #ffff00, #ff8000, #ff0000);\n  background: -o-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: -ms-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: -moz-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: linear-gradient(to right, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n  border-radius: 10px;\n  height: 14px;\n  cursor: pointer;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .gradient {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .alpha-area {\n  width: 100%;\n  height: 100%;\n  background: url(\"../../assets/images/alpha-background.svg\");\n  background-size: auto;\n  background-position: 50% 50%;\n  border-radius: 10px;\n  padding: 0 7px;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .alpha-area .alpha-mask {\n  width: 100%;\n  height: 100%;\n  position: relative;\n}\n.ui-color-picker .picker-area .gradient {\n  width: 100%;\n  height: 14px;\n  position: relative;\n  cursor: pointer;\n  border-radius: 10px;\n  margin-bottom: 8px;\n  padding: 0 7px;\n}\n.ui-color-picker .picker-area .gradient .gradient-slider-container {\n  height: 100%;\n  width: 100%;\n  position: relative;\n}\n.ui-color-picker .picker-area .picker-pointer {\n  position: absolute;\n  top: 1px;\n  height: 12px;\n  width: 12px;\n  border: 1px solid #ffffff;\n  background: transparent;\n  border-radius: 50%;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);\n}\n.ui-color-picker .picker-area .picker-pointer .child-point {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  height: 3px;\n  width: 3px;\n  background: #ffffff;\n  border-radius: 50%;\n  opacity: 0;\n  transition: opacity 0.33s;\n}\n.ui-color-picker .picker-area .picker-pointer .child-point.active {\n  opacity: 1;\n}\n.ui-color-picker .color-preview-area {\n  margin-bottom: 8px;\n  padding: 0 16px;\n}\n.ui-color-picker .color-preview-area .input-group {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n}\n.ui-color-picker .color-preview-area .input-group .uc-field-group:not(:last-child) {\n  margin-right: 7px;\n}\n.ui-color-picker .color-preview-area .hex {\n  width: 65px;\n}\n.ui-color-picker .color-preview-area .rgb {\n  width: 40px;\n}\n.ui-color-picker .colors {\n  padding: 3px 16px 0;\n}\n.ui-color-picker .colors .colors-label {\n  display: flex;\n  align-items: center;\n  margin-bottom: 4px;\n  cursor: pointer;\n}\n.ui-color-picker .colors .colors-label .uc-icon {\n  margin-right: 8px;\n  transition: transform 0.3s;\n}\n.ui-color-picker .colors .colors-label .tp-text {\n  text-transform: uppercase;\n}\n.ui-color-picker .colors .colors-label.show + .colors-item-container {\n  max-height: 80px;\n  padding-bottom: 16px;\n}\n.ui-color-picker .colors .colors-label.show .uc-icon {\n  transform: rotate(-90deg);\n}\n.ui-color-picker .colors .template {\n  display: flex;\n  flex-direction: column;\n}\n.ui-color-picker .colors .global {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n.ui-color-picker .colors .colors-item-container {\n  display: flex;\n  flex-wrap: wrap;\n  width: 100%;\n  transition: max-height 0.3s, padding-bottom 0.3s;\n  max-height: 0;\n  overflow: hidden;\n}\n.ui-color-picker .colors .colors-item-container .colors-item {\n  height: 24px;\n  width: 24px;\n  border-radius: 50%;\n  background-color: #ebedf5;\n  cursor: pointer;\n  position: relative;\n  margin-top: 4px;\n  flex-shrink: 0;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:not(.plus) {\n  border: 1px solid #ebedf5;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.empty {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.empty .line {\n  width: 2px;\n  height: 16px;\n  background-color: #8892b3;\n  border-radius: 1px;\n  transform: rotate(45deg);\n}\n.ui-color-picker .colors .colors-item-container .colors-item.plus {\n  margin-bottom: 4px;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.plus .uc-icon {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  opacity: 1;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:not(:first-child):not(:nth-child(9)) {\n  margin-left: 8px;\n}\n.ui-color-picker .colors .colors-item-container .colors-item .uc-icon {\n  position: absolute;\n  right: -8px;\n  top: -3px;\n  opacity: 0;\n  transition: opacity 0.3s;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:hover .uc-icon {\n  opacity: 1;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.active::after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -3px;\n  bottom: -3px;\n  left: -3px;\n  right: -3px;\n  border: 2px solid #8892b3;\n  border-radius: 50%;\n}\n\n/*# sourceMappingURL=index.vue.map */", map: {"version":3,"sources":["/Users/zhengying/project/open_source_code/vue-color-gradient-picker/src/lib/components/ColorPicker/index.vue","index.vue"],"names":[],"mappings":"AA8BA;EACA,sBAAA;AC7BA;ADgCA;EACA,WAAA;EACA,yBAAA;EACA,aAAA;EACA,sBAAA;EACA,YAAA;EACA,iBAAA;AC7BA;AD+BA;EACA,aAAA;EACA,mBAAA;EACA,mBAAA;EACA,WAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;AC7BA;AD+BA;EACA,OAAA;EACA,aAAA;AC7BA;AD+BA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;EACA,kBAAA;EACA,eAAA;AC7BA;ADgCA;EACA,WAAA;EACA,cAAA;EACA,kBAAA;EACA,SAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,yBAAA;EACA,kBAAA;AC9BA;ADkCA;EACA,6DAAA;AChCA;ADmCA;EACA,gBAAA;EACA,6DAAA;ACjCA;ADsCA;EACA,kBAAA;ACpCA;ADsCA;EACA,oBAAA;EACA,aAAA;EACA,wBAAA;EACA,qBAAA;EACA,uBAAA;EACA,yBAAA;EACA,sBAAA;EACA,mBAAA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,yBAAA;EACA,mBAAA;EACA,kBAAA;ACpCA;ADsCA;EACA,kBAAA;EACA,UAAA;EACA,YAAA;EACA,oBAAA;ACpCA;ADsCA;EACA,kBAAA;EACA,UAAA;EACA,WAAA;EACA,QAAA;EACA,kBAAA;EACA,mBAAA;ACpCA;ADyCA;EACA,kBAAA;EACA,MAAA;EACA,QAAA;EACA,WAAA;EACA,YAAA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;EACA,yBAAA;EACA,kBAAA;ACvCA;ADyCA;EACA,kBAAA;EACA,cAAA;ACvCA;AD6CA;EACA,aAAA;EACA,sBAAA;EACA,eAAA;AC3CA;AD8CA;EACA,mBAAA;AC5CA;ADgDA;EACA,WAAA;EACA,aAAA;EACA,mBAAA;EACA,kBAAA;EACA,kBAAA;AC9CA;ADgDA;EACA,eAAA;AC9CA;ADiDA;EACA,YAAA;EACA,WAAA;EACA,4EAAA;EAKA,kBAAA;ACnDA;ADqDA;EACA,YAAA;EACA,WAAA;EACA,uEAAA;EAKA,kBAAA;ACvDA;AD4DA;EACA,aAAA;EACA,mBAAA;EACA,mBAAA;AC1DA;AD4DA;EACA,sBAAA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;EACA,yBAAA;AC1DA;AD6DA;EACA,aAAA;EACA,sBAAA;EACA,OAAA;EACA,gBAAA;AC3DA;AD6DA;EACA,WAAA;EACA,kBAAA;EACA,mBAAA;EACA,kBAAA;EACA,cAAA;EACA,qBAAA;EACA,eAAA;AC3DA;AD6DA;EACA,kBAAA;EACA,YAAA;EACA,8JAAA;EAgBA,yJAAA;EAgBA,0JAAA;EAgBA,2JAAA;EAgBA,0JAAA;ACvHA;AD0IA;EACA,kBAAA;EACA,WAAA;EACA,gBAAA;EACA,mBAAA;EACA,YAAA;EACA,eAAA;ACxIA;AD0IA;EACA,kBAAA;EACA,MAAA;EACA,OAAA;EACA,QAAA;EACA,SAAA;ACxIA;AD2IA;EACA,WAAA;EACA,YAAA;EACA,2DAAA;EACA,qBAAA;EACA,4BAAA;EACA,mBAAA;EACA,cAAA;ACzIA;AD2IA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;ACzIA;ADgJA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;EACA,eAAA;EACA,mBAAA;EACA,kBAAA;EACA,cAAA;AC9IA;ADgJA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;AC9IA;ADkJA;EACA,kBAAA;EACA,QAAA;EACA,YAAA;EACA,WAAA;EACA,yBAAA;EACA,uBAAA;EACA,kBAAA;EACA,wCAAA;AChJA;ADkJA;EACA,kBAAA;EACA,QAAA;EACA,SAAA;EACA,gCAAA;EACA,WAAA;EACA,UAAA;EACA,mBAAA;EACA,kBAAA;EACA,UAAA;EACA,yBAAA;AChJA;ADkJA;EACA,UAAA;AChJA;ADsJA;EACA,kBAAA;EACA,eAAA;ACpJA;ADsJA;EACA,WAAA;EACA,aAAA;EACA,mBAAA;EACA,8BAAA;ACpJA;ADsJA;EACA,iBAAA;ACpJA;ADwJA;EACA,WAAA;ACtJA;ADyJA;EACA,WAAA;ACvJA;AD2JA;EACA,mBAAA;ACzJA;AD2JA;EACA,aAAA;EACA,mBAAA;EACA,kBAAA;EACA,eAAA;ACzJA;AD2JA;EACA,iBAAA;EACA,0BAAA;ACzJA;AD4JA;EACA,yBAAA;AC1JA;AD8JA;EACA,gBAAA;EACA,oBAAA;AC5JA;AD+JA;EACA,yBAAA;AC7JA;ADkKA;EACA,aAAA;EACA,sBAAA;AChKA;ADmKA;EACA,aAAA;EACA,sBAAA;EACA,uBAAA;ACjKA;ADoKA;EACA,aAAA;EACA,eAAA;EACA,WAAA;EACA,gDAAA;EACA,aAAA;EACA,gBAAA;AClKA;ADoKA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;EACA,yBAAA;EACA,eAAA;EACA,kBAAA;EACA,eAAA;EACA,cAAA;AClKA;ADoKA;EACA,yBAAA;AClKA;ADqKA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;ACnKA;ADqKA;EACA,UAAA;EACA,YAAA;EACA,yBAAA;EACA,kBAAA;EACA,wBAAA;ACnKA;ADuKA;EACA,kBAAA;ACrKA;ADuKA;EACA,kBAAA;EACA,QAAA;EACA,SAAA;EACA,gCAAA;EACA,UAAA;ACrKA;ADyKA;EACA,gBAAA;ACvKA;AD0KA;EACA,kBAAA;EACA,WAAA;EACA,SAAA;EACA,UAAA;EACA,wBAAA;ACxKA;AD4KA;EACA,UAAA;AC1KA;AD+KA;EACA,WAAA;EACA,cAAA;EACA,kBAAA;EACA,SAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,yBAAA;EACA,kBAAA;AC7KA;;AAEA,oCAAoC","file":"index.vue","sourcesContent":["<template>\n  <div class=\"ui-color-picker\">\n    <Gradient\n      v-if=\"isGradient\"\n      :points=\"gradient.points\"\n      :type=\"gradient.type\"\n      :degree=\"gradient.degree\"\n      :onChange=\"onChange\"\n      :onStartChange=\"onStartChange\"\n      :onEndChange=\"onEndChange\"\n    />\n\n    <Solid\n      v-else\n      :red=\"color.red\"\n      :green=\"color.green\"\n      :blue=\"color.blue\"\n      :alpha=\"color.alpha\"\n      :hue=\"color.hue\"\n      :saturation=\"color.saturation\"\n      :value=\"color.value\"\n      :onChange=\"onChange\"\n      :onStartChange=\"onStartChange\"\n      :onEndChange=\"onEndChange\"\n    />\n  </div>\n</template>\n\n<script src=\"./script.js\" />\n<style lang=\"scss\" >\n* {\n  box-sizing: border-box;\n}\n\n.ui-color-picker {\n  margin: 8px;\n  background-color: #ffffff;\n  display: flex;\n  flex-direction: column;\n  width: 280px;\n  user-select: none;\n\n  .gradient-controls {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    width: 100%;\n    margin-bottom: 8px;\n    height: 24px;\n    padding: 0 16px;\n\n    .gradient-type {\n      flex: 1;\n      display: flex;\n\n      .gradient-type-item {\n        height: 28px;\n        width: 28px;\n        border-radius: 50%;\n        position: relative;\n        cursor: pointer;\n\n        &.active {\n          &::after {\n            content: \"\";\n            display: block;\n            position: absolute;\n            top: -3px;\n            bottom: -3px;\n            left: -3px;\n            right: -3px;\n            border: 2px solid #1f2667;\n            border-radius: 50%;\n          }\n        }\n\n        &.liner-gradient {\n          background: linear-gradient(270deg, #ffffff 0%, #1f2667 100%);\n        }\n\n        &.radial-gradient {\n          margin-left: 8px;\n          background: radial-gradient(circle, #ffffff 0%, #1f2667 100%);\n        }\n      }\n    }\n\n    .gradient-degrees-options {\n      position: relative;\n\n      .gradient-degrees {\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-pack: center;\n        -ms-flex-pack: center;\n        justify-content: center;\n        -webkit-box-align: center;\n        -ms-flex-align: center;\n        align-items: center;\n        position: relative;\n        width: 28px;\n        height: 28px;\n        border: 3px solid #1f2667;\n        border-radius: 18px;\n        margin-right: 54px;\n\n        .gradient-degree-center {\n          position: relative;\n          width: 6px;\n          height: 22px;\n          pointer-events: none;\n\n          .gradient-degree-pointer {\n            position: absolute;\n            width: 6px;\n            height: 6px;\n            top: 2px;\n            border-radius: 3px;\n            background: #1f2667;\n          }\n        }\n      }\n\n      .gradient-degree-value {\n        position: absolute;\n        top: 0;\n        right: 0;\n        width: 48px;\n        height: 28px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border: 1px solid #bbbfc5;\n        border-radius: 6px;\n\n        p {\n          text-align: center;\n          padding: 0 6px;\n        }\n      }\n    }\n  }\n\n  .picker-area {\n    display: flex;\n    flex-direction: column;\n    padding: 0 16px;\n\n    &.gradient-tab {\n      .picking-area {\n        margin-bottom: 10px;\n      }\n    }\n\n    .picking-area {\n      width: 100%;\n      height: 160px;\n      margin-bottom: 16px;\n      position: relative;\n      border-radius: 8px;\n\n      &:hover {\n        cursor: default;\n      }\n\n      .picking-area-overlay1 {\n        height: 100%;\n        width: 100%;\n        background: linear-gradient(\n          to right,\n          white 0%,\n          rgba(255, 255, 255, 0) 100%\n        );\n        border-radius: 3px;\n\n        .picking-area-overlay2 {\n          height: 100%;\n          width: 100%;\n          background: linear-gradient(\n            to bottom,\n            rgba(0, 0, 0, 0) 0%,\n            black 100%\n          );\n          border-radius: 8px;\n        }\n      }\n    }\n\n    .preview {\n      display: flex;\n      flex-direction: row;\n      margin-bottom: 16px;\n\n      .preview-box {\n        box-sizing: border-box;\n        height: 36px;\n        width: 36px;\n        border-radius: 8px;\n        border: 1px solid #ebedf5;\n      }\n\n      .color-hue-alpha {\n        display: flex;\n        flex-direction: column;\n        flex: 1;\n        margin-left: 6px;\n\n        .hue {\n          width: 100%;\n          position: relative;\n          border-radius: 10px;\n          margin-bottom: 8px;\n          padding: 0 7px;\n          background-color: red;\n          cursor: pointer;\n\n          .hue-area {\n            position: relative;\n            height: 14px;\n            background: -webkit-linear-gradient(\n              left,\n              #ff0000,\n              #ff0080,\n              #ff00ff,\n              #8000ff,\n              #0000ff,\n              #0080ff,\n              #00ffff,\n              #00ff80,\n              #00ff00,\n              #80ff00,\n              #ffff00,\n              #ff8000,\n              #ff0000\n            );\n            background: -o-linear-gradient(\n              left,\n              #ff0000,\n              #ff8000,\n              #ffff00,\n              #80ff00,\n              #00ff00,\n              #00ff80,\n              #00ffff,\n              #0080ff,\n              #0000ff,\n              #8000ff,\n              #ff00ff,\n              #ff0080,\n              #ff0000\n            );\n            background: -ms-linear-gradient(\n              left,\n              #ff0000,\n              #ff8000,\n              #ffff00,\n              #80ff00,\n              #00ff00,\n              #00ff80,\n              #00ffff,\n              #0080ff,\n              #0000ff,\n              #8000ff,\n              #ff00ff,\n              #ff0080,\n              #ff0000\n            );\n            background: -moz-linear-gradient(\n              left,\n              #ff0000,\n              #ff8000,\n              #ffff00,\n              #80ff00,\n              #00ff00,\n              #00ff80,\n              #00ffff,\n              #0080ff,\n              #0000ff,\n              #8000ff,\n              #ff00ff,\n              #ff0080,\n              #ff0000\n            );\n            background: linear-gradient(\n              to right,\n              #ff0000,\n              #ff8000,\n              #ffff00,\n              #80ff00,\n              #00ff00,\n              #00ff80,\n              #00ffff,\n              #0080ff,\n              #0000ff,\n              #8000ff,\n              #ff00ff,\n              #ff0080,\n              #ff0000\n            );\n          }\n        }\n\n        .alpha {\n          position: relative;\n          width: 100%;\n          overflow: hidden;\n          border-radius: 10px;\n          height: 14px;\n          cursor: pointer;\n\n          .gradient {\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n          }\n\n          .alpha-area {\n            width: 100%;\n            height: 100%;\n            background: url(\"../../assets/images/alpha-background.svg\");\n            background-size: auto;\n            background-position: 50% 50%;\n            border-radius: 10px;\n            padding: 0 7px;\n\n            .alpha-mask {\n              width: 100%;\n              height: 100%;\n              position: relative;\n            }\n          }\n        }\n      }\n    }\n\n    .gradient {\n      width: 100%;\n      height: 14px;\n      position: relative;\n      cursor: pointer;\n      border-radius: 10px;\n      margin-bottom: 8px;\n      padding: 0 7px;\n\n      .gradient-slider-container {\n        height: 100%;\n        width: 100%;\n        position: relative;\n      }\n    }\n\n    .picker-pointer {\n      position: absolute;\n      top: 1px;\n      height: 12px;\n      width: 12px;\n      border: 1px solid #ffffff;\n      background: transparent;\n      border-radius: 50%;\n      box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);\n\n      .child-point {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        height: 3px;\n        width: 3px;\n        background: #ffffff;\n        border-radius: 50%;\n        opacity: 0;\n        transition: opacity 0.33s;\n\n        &.active {\n          opacity: 1;\n        }\n      }\n    }\n  }\n\n  .color-preview-area {\n    margin-bottom: 8px;\n    padding: 0 16px;\n\n    .input-group {\n      width: 100%;\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between;\n\n      .uc-field-group:not(:last-child) {\n        margin-right: 7px;\n      }\n    }\n\n    .hex {\n      width: 65px;\n    }\n\n    .rgb {\n      width: 40px;\n    }\n  }\n\n  .colors {\n    padding: 3px 16px 0;\n\n    .colors-label {\n      display: flex;\n      align-items: center;\n      margin-bottom: 4px;\n      cursor: pointer;\n\n      .uc-icon {\n        margin-right: 8px;\n        transition: transform 0.3s;\n      }\n\n      .tp-text {\n        text-transform: uppercase;\n      }\n\n      &.show {\n        & + .colors-item-container {\n          max-height: 80px;\n          padding-bottom: 16px;\n        }\n\n        .uc-icon {\n          transform: rotate(-90deg);\n        }\n      }\n    }\n\n    .template {\n      display: flex;\n      flex-direction: column;\n    }\n\n    .global {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n    }\n\n    .colors-item-container {\n      display: flex;\n      flex-wrap: wrap;\n      width: 100%;\n      transition: max-height 0.3s, padding-bottom 0.3s;\n      max-height: 0;\n      overflow: hidden;\n\n      .colors-item {\n        height: 24px;\n        width: 24px;\n        border-radius: 50%;\n        background-color: #ebedf5;\n        cursor: pointer;\n        position: relative;\n        margin-top: 4px;\n        flex-shrink: 0;\n\n        &:not(.plus) {\n          border: 1px solid #ebedf5;\n        }\n\n        &.empty {\n          display: flex;\n          align-items: center;\n          justify-content: center;\n\n          .line {\n            width: 2px;\n            height: 16px;\n            background-color: #8892b3;\n            border-radius: 1px;\n            transform: rotate(45deg);\n          }\n        }\n\n        &.plus {\n          margin-bottom: 4px;\n\n          .uc-icon {\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            opacity: 1;\n          }\n        }\n\n        &:not(:first-child):not(:nth-child(9)) {\n          margin-left: 8px;\n        }\n\n        .uc-icon {\n          position: absolute;\n          right: -8px;\n          top: -3px;\n          opacity: 0;\n          transition: opacity 0.3s;\n        }\n\n        &:hover {\n          .uc-icon {\n            opacity: 1;\n          }\n        }\n\n        &.active {\n          &::after {\n            content: \"\";\n            display: block;\n            position: absolute;\n            top: -3px;\n            bottom: -3px;\n            left: -3px;\n            right: -3px;\n            border: 2px solid #8892b3;\n            border-radius: 50%;\n          }\n        }\n      }\n    }\n  }\n}\n</style>\n","* {\n  box-sizing: border-box;\n}\n\n.ui-color-picker {\n  margin: 8px;\n  background-color: #ffffff;\n  display: flex;\n  flex-direction: column;\n  width: 280px;\n  user-select: none;\n}\n.ui-color-picker .gradient-controls {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  width: 100%;\n  margin-bottom: 8px;\n  height: 24px;\n  padding: 0 16px;\n}\n.ui-color-picker .gradient-controls .gradient-type {\n  flex: 1;\n  display: flex;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item {\n  height: 28px;\n  width: 28px;\n  border-radius: 50%;\n  position: relative;\n  cursor: pointer;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.active::after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -3px;\n  bottom: -3px;\n  left: -3px;\n  right: -3px;\n  border: 2px solid #1f2667;\n  border-radius: 50%;\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.liner-gradient {\n  background: linear-gradient(270deg, #ffffff 0%, #1f2667 100%);\n}\n.ui-color-picker .gradient-controls .gradient-type .gradient-type-item.radial-gradient {\n  margin-left: 8px;\n  background: radial-gradient(circle, #ffffff 0%, #1f2667 100%);\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options {\n  position: relative;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees {\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  position: relative;\n  width: 28px;\n  height: 28px;\n  border: 3px solid #1f2667;\n  border-radius: 18px;\n  margin-right: 54px;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees .gradient-degree-center {\n  position: relative;\n  width: 6px;\n  height: 22px;\n  pointer-events: none;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degrees .gradient-degree-center .gradient-degree-pointer {\n  position: absolute;\n  width: 6px;\n  height: 6px;\n  top: 2px;\n  border-radius: 3px;\n  background: #1f2667;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degree-value {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 48px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid #bbbfc5;\n  border-radius: 6px;\n}\n.ui-color-picker .gradient-controls .gradient-degrees-options .gradient-degree-value p {\n  text-align: center;\n  padding: 0 6px;\n}\n.ui-color-picker .picker-area {\n  display: flex;\n  flex-direction: column;\n  padding: 0 16px;\n}\n.ui-color-picker .picker-area.gradient-tab .picking-area {\n  margin-bottom: 10px;\n}\n.ui-color-picker .picker-area .picking-area {\n  width: 100%;\n  height: 160px;\n  margin-bottom: 16px;\n  position: relative;\n  border-radius: 8px;\n}\n.ui-color-picker .picker-area .picking-area:hover {\n  cursor: default;\n}\n.ui-color-picker .picker-area .picking-area .picking-area-overlay1 {\n  height: 100%;\n  width: 100%;\n  background: linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%);\n  border-radius: 3px;\n}\n.ui-color-picker .picker-area .picking-area .picking-area-overlay1 .picking-area-overlay2 {\n  height: 100%;\n  width: 100%;\n  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, black 100%);\n  border-radius: 8px;\n}\n.ui-color-picker .picker-area .preview {\n  display: flex;\n  flex-direction: row;\n  margin-bottom: 16px;\n}\n.ui-color-picker .picker-area .preview .preview-box {\n  box-sizing: border-box;\n  height: 36px;\n  width: 36px;\n  border-radius: 8px;\n  border: 1px solid #ebedf5;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  margin-left: 6px;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .hue {\n  width: 100%;\n  position: relative;\n  border-radius: 10px;\n  margin-bottom: 8px;\n  padding: 0 7px;\n  background-color: red;\n  cursor: pointer;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .hue .hue-area {\n  position: relative;\n  height: 14px;\n  background: -webkit-linear-gradient(left, #ff0000, #ff0080, #ff00ff, #8000ff, #0000ff, #0080ff, #00ffff, #00ff80, #00ff00, #80ff00, #ffff00, #ff8000, #ff0000);\n  background: -o-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: -ms-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: -moz-linear-gradient(left, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n  background: linear-gradient(to right, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n  border-radius: 10px;\n  height: 14px;\n  cursor: pointer;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .gradient {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .alpha-area {\n  width: 100%;\n  height: 100%;\n  background: url(\"../../assets/images/alpha-background.svg\");\n  background-size: auto;\n  background-position: 50% 50%;\n  border-radius: 10px;\n  padding: 0 7px;\n}\n.ui-color-picker .picker-area .preview .color-hue-alpha .alpha .alpha-area .alpha-mask {\n  width: 100%;\n  height: 100%;\n  position: relative;\n}\n.ui-color-picker .picker-area .gradient {\n  width: 100%;\n  height: 14px;\n  position: relative;\n  cursor: pointer;\n  border-radius: 10px;\n  margin-bottom: 8px;\n  padding: 0 7px;\n}\n.ui-color-picker .picker-area .gradient .gradient-slider-container {\n  height: 100%;\n  width: 100%;\n  position: relative;\n}\n.ui-color-picker .picker-area .picker-pointer {\n  position: absolute;\n  top: 1px;\n  height: 12px;\n  width: 12px;\n  border: 1px solid #ffffff;\n  background: transparent;\n  border-radius: 50%;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);\n}\n.ui-color-picker .picker-area .picker-pointer .child-point {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  height: 3px;\n  width: 3px;\n  background: #ffffff;\n  border-radius: 50%;\n  opacity: 0;\n  transition: opacity 0.33s;\n}\n.ui-color-picker .picker-area .picker-pointer .child-point.active {\n  opacity: 1;\n}\n.ui-color-picker .color-preview-area {\n  margin-bottom: 8px;\n  padding: 0 16px;\n}\n.ui-color-picker .color-preview-area .input-group {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n}\n.ui-color-picker .color-preview-area .input-group .uc-field-group:not(:last-child) {\n  margin-right: 7px;\n}\n.ui-color-picker .color-preview-area .hex {\n  width: 65px;\n}\n.ui-color-picker .color-preview-area .rgb {\n  width: 40px;\n}\n.ui-color-picker .colors {\n  padding: 3px 16px 0;\n}\n.ui-color-picker .colors .colors-label {\n  display: flex;\n  align-items: center;\n  margin-bottom: 4px;\n  cursor: pointer;\n}\n.ui-color-picker .colors .colors-label .uc-icon {\n  margin-right: 8px;\n  transition: transform 0.3s;\n}\n.ui-color-picker .colors .colors-label .tp-text {\n  text-transform: uppercase;\n}\n.ui-color-picker .colors .colors-label.show + .colors-item-container {\n  max-height: 80px;\n  padding-bottom: 16px;\n}\n.ui-color-picker .colors .colors-label.show .uc-icon {\n  transform: rotate(-90deg);\n}\n.ui-color-picker .colors .template {\n  display: flex;\n  flex-direction: column;\n}\n.ui-color-picker .colors .global {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n.ui-color-picker .colors .colors-item-container {\n  display: flex;\n  flex-wrap: wrap;\n  width: 100%;\n  transition: max-height 0.3s, padding-bottom 0.3s;\n  max-height: 0;\n  overflow: hidden;\n}\n.ui-color-picker .colors .colors-item-container .colors-item {\n  height: 24px;\n  width: 24px;\n  border-radius: 50%;\n  background-color: #ebedf5;\n  cursor: pointer;\n  position: relative;\n  margin-top: 4px;\n  flex-shrink: 0;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:not(.plus) {\n  border: 1px solid #ebedf5;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.empty {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.empty .line {\n  width: 2px;\n  height: 16px;\n  background-color: #8892b3;\n  border-radius: 1px;\n  transform: rotate(45deg);\n}\n.ui-color-picker .colors .colors-item-container .colors-item.plus {\n  margin-bottom: 4px;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.plus .uc-icon {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  opacity: 1;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:not(:first-child):not(:nth-child(9)) {\n  margin-left: 8px;\n}\n.ui-color-picker .colors .colors-item-container .colors-item .uc-icon {\n  position: absolute;\n  right: -8px;\n  top: -3px;\n  opacity: 0;\n  transition: opacity 0.3s;\n}\n.ui-color-picker .colors .colors-item-container .colors-item:hover .uc-icon {\n  opacity: 1;\n}\n.ui-color-picker .colors .colors-item-container .colors-item.active::after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -3px;\n  bottom: -3px;\n  left: -3px;\n  right: -3px;\n  border: 2px solid #8892b3;\n  border-radius: 50%;\n}\n\n/*# sourceMappingURL=index.vue.map */"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$f = undefined;
  /* module identifier */
  var __vue_module_identifier__$f = undefined;
  /* functional template */
  var __vue_is_functional_template__$f = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$f = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    false,
    createInjector,
    undefined,
    undefined
  );

export { __vue_component__$f as ColorPicker };
//# sourceMappingURL=index-es.js.map
