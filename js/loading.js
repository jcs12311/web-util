/**
 *  todo: 支持多个字体库加载
 *  todo: 图片字体一起加载
 *  todo: 支持多种位置的图片,目前有backgroundimage,img标签
 **/

(function(name, definition) {
    var hasDefine = typeof define === 'function',
        hasExports = typeof module !== 'undefined' && module.exports;
    if (hasDefine) {
        define(definition);
    } else {
        this[name] = definition();
    }
})("Loading", function() {
    var Loading = function(container, params) {
        if (!(this instanceof Loading)) return new Loading(container, params);

        var defaults = {
            loadFontName: "", // 加载字体资源
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            } else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        var l = this;

        l.params = params,
        l.params.onImagesCompleted = null,
        l.$container = $(container);

        var createAnimateBox = function(theme) {
            var $box = $('loading-animate-box');
            if ($box.length > 1) {
                return $box[0];
            }
            var box = document.createElement("div");
            box.className = "loading-animate-box";
            box.style.zIndex = 99999;
            var animateHTML = '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div>';
            document.body.appendChild(box);
            box.innerHTML = animateHTML;
            return box;
        }

        /*===========================
         * 图片加载
         *=========================*/
        l.imagesToLoad = [],
            l.loadedImage = 0;
        var loadImage = function(imageElement, src, callback) {
            var image;

            function onReady() {
                if (callback) callback();
            }
            if (!imageElement.complete) {
                if (src) {
                    image = new window.Image();
                    image.src = src;
                    image.onerror = onReady;
                    image.onload = onReady;
                } else {
                    onReady();
                }
            } else {
                onReady();
            }
        }

        /*===========================
         * 检查图片是否都加载完成 
         *==========================*/
        var preloadImage = function(onCompleted) {
            l.imagesToLoad = $(document).find("img");

            function _onReady() {
                if (typeof l === 'undefined' || l === null) return;
                if (l.loadedImage !== undefined) l.loadedImage++;
                if (l.loadedImage === l.imagesToLoad.length) {
                    if (onCompleted) onCompleted();
                }
            }
            for (var i = 0; i < l.imagesToLoad.length; i++) {
                loadImage(l.imagesToLoad[i], l.imagesToLoad[i].src, _onReady);
            }
        }

        var getStyle = function(ele) {
            var style = null;
            if (window.getComputedStyle) {
                style = window.getComputedStyle(ele, null);
            } else {
                style = ele.currentStyle;
            }
            return style;
        }

        var InsertIMGToBody = function(ele) {
            var src = getStyle(ele).backgroundImage;
            if (!src || src == "none") {
                return false;
            }
            src = src[0] == '"' ? src.substring(1, src.length - 1) : src.substring(4, src.length - 1);
            var img = document.createElement("img");
            img.src = src;
            img.style.display = "none";
            img.className = "loading-no-use-image";
            document.body.appendChild(img);
        }


        /*===========================
        * 每个有background images属性的元素都生成一个img标签插入body
        *==========================*/
        var traverseDOMToInsertIMG = function(ele, handleEle, complete) {
            var i = 0,
                len = ele.childNodes.length,
                child = ele.firstChild;
            while (i++ < len) {
                if (child.nodeType == 1) {
                    handleEle(child);
                    traverseDOMToInsertIMG(child, handleEle);
                }
                child = child.nextSibling;
            }
            if (i == len + 1 && complete) {
                complete();
            }
        }

        /*===========================
         * todo:字体库加载
         *==========================*/
        var loadFonts = function(font, callback) {
            var font = font;
            var defaultFont = "sans-serif"; // this font should all browser supported
            var span = document.createElement("span");
            span.innerHTML = "gW@i#QMT"; // these char size change obvious when font change
            span.style.position = "absolute";
            span.style.top = "-9999px";
            span.style.left = "-9999px";
            span.style.visibility = "hidden";
            span.style.fontSize = "500px";
            span.style.fontFamily = defaultFont;
            document.body.appendChild(span);
            var width_now = span.offsetWidth;
            // compare target font and default font size
            span.style.fontFamily = font + ", " + defaultFont;
            var timeout = 15000 / 50;
            var interval_check = setInterval(function() {
                if (timeout-- <= 0)
                    return false;
                if (span.offsetWidth != width_now) {
                    clearInterval(interval_check);
                    callback(); // completed
                    document.body.removeChild(span);
                    span = null;
                }
            }, 50);
        }

        l.$animateBox = $(createAnimateBox());

        l.open = function() {
            l.$container.hide();
            l.$animateBox.show();
        }

        l.close = function() {
            l.$container.show();
            l.$animateBox.hide();
        }
        // test code
        l.init = function() {
            l.open();
            if (l.params.loadingImages) {

            }

            if (l.params.loadFontsName && l.params.onFontsCompleted) {
                loadFonts(l.params.loadFontsName, l.params.onFontsCompleted());
            }
        }

        l.checkImagesLoaded = function(onCompleted) {
            // 遍历DOM，给有backgroundimage的元素在body插入img标签
            traverseDOMToInsertIMG(document.body, function(child) {
                InsertIMGToBody(child);
            }, function() {
                preloadImage(onCompleted);
            });
        }

        l.closeWhenImagesAllLoaded = function(){
            l.checkImagesLoaded(function(){
                l.close();
            })
        }
    };

    return Loading;
});
