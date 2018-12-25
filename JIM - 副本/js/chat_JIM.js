;
(function () {
    $.fn.c_JIM = function (options) {
        var defaults = $.extend({
            show: true
        }, options);

        var state = { //页面元素
            container: null,

        };



        var $this = this; //调用flexisel()的jq对象
        var settings = $.extend({}, defaults, options);
        var methods = {
            init: function () {
                return this.each(function () { //当页面有多个应用对象
                    console.log(1111)
                });
            },

        }


        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this);
        } else {
            $.error('Method "' + method + '" does not exist in flexisel plugin!');
        }
    }
})(jQuery)