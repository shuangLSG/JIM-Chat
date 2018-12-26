 var Util={
    getFileFormData:file=> {
        let fd = new FormData();
        fd.append(file.files[0].name, file.files[0]);
        return fd;
    },
 /**
     * fileReader预览图片返回img url
     * @param {Element} file - input type=file dom element
     * @param {Function} callback - 回调函数
     * @param {Function} callback2 - 回调函数
     */
     imgReader: function(file, callback, callback2){
        let files = file.files[0];
        if (!files) {
            return false;
        }
        if (!files.type || files.type === '' || !/image\/\w+/.test(files.type)) {
            callback();
            return false;
        }
        let reader = new FileReader();
        reader.readAsDataURL(files);
        let img = new Image();
        let promise = new Promise((resolve, reject) => {
            reader.onload = function (e) {
                img.src = this.result;
                let that = this;
                img.onload = function () {
                    let width = img.naturalWidth;
                    let height = img.naturalHeight;
                    resolve({
                        src: that.result,
                        width,
                        height
                    });
                };
            };
        })
        promise.then((value) => {
            callback2(value);
        }).catch(() => {
            console.log('Promise Rejected');
        });
    },
    /**
     * 获取头像裁剪的预览对象
     * @param {Object} file - input type=file dom element的files[0]
     * @param {Function} callback1 - 回调函数1
     * @param {Function} callback2 - 回调函数2
     * @param {Function} callback3 - 回调函数3
     */
     getAvatarImgObj:function(file, callback1, callback2, callback3){
        if (!file) {
            return false;
        }
        if (!file.type || file.type === '' || !/image\/\w+/.test(file.type)) {
            callback1();
            return false;
        }
        const that = this;
        let img = new Image();
        let pasteFile = file;
        let reader = new FileReader();
        reader.readAsDataURL(pasteFile);
        let fd = new FormData();
        fd.append(file.name, file);
        reader.onload = function (e) {
            img.src = this.result;
            const _this = this;
            img.onload = function () {
                // 如果选择的图片尺寸小于80*80，弹窗提示
                if (img.naturalWidth < 80 || img.naturalHeight < 80) {
                    callback2();
                    return;
                }
                callback3(_this, pasteFile, img);
            };
        };
    },
    /**
     * fileReader预览图片url
     * @param {Element} file - input type=file dom element
     * @param {Function} callback - 回调函数
     */
     fileReader:function(file, callback){
        let files = file.files[0];
        if (!files.type || files.type === '') {
            return false;
        }
        if (!/image\/\w+/.test(files.type)) {
            callback();
            return false;
        }
        let reader = new FileReader();
        reader.readAsDataURL(files);
        return new Promise((resolve, reject) => {
            reader.onload = function (e) {
                resolve(this.result);
            };
        }).catch(() => {
            console.log('Promise Rejected');
        });
    },
    reducerDate:function(msgTime){
        const time = new Date(msgTime);
        const now = new Date();
        const msgYear = time.getFullYear();
        const nowYear = now.getFullYear();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();
        const nowSecond = now.getSeconds();
        const nowTime = now.getTime();
        const todayTime = nowHour * 60 * 1000 * 60 + nowMinute * 1000 * 60 + nowSecond * 1000;
        const gapDate = (nowTime - todayTime - msgTime) / 1000 / 60 / 60 / 24;
        let showTime = '';
        if (msgYear !== nowYear) {
            showTime = 'year';
        } else if (gapDate > 6) {
            showTime = 'month';
        } else if (gapDate <= 6 && gapDate > 2) {
            showTime = 'day';
        } else if (gapDate <= 2 && gapDate > 1) {
            showTime = 'the day before';
        } else if (gapDate <= 1 && gapDate > 0) {
            showTime = 'yesterday';
        } else if (gapDate <= 0) {
            showTime = 'today';
        }
        return showTime;
    },
    fiveMinutes :function(oldTime, newTime){
        const gap = newTime - oldTime;
        return gap / 1000 / 60 > 5 ? true : false;
    }
}


    // 获取图片对象
    function getImgObj(file) {
        var avatarConfig={};
        const isNotImage = '选择的文件必须是图片';
        const imageTooSmall = '选择的图片宽或高的尺寸太小，请重新选择图片';
        Util.getAvatarImgObj(file,
            () => mui.toast(isNotImage),
            () => mui.toast(imageTooSmall),
            (that, pasteFile, img) => {
                avatarConfig={
                    info : {
                        src: that.result,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        pasteFile
                    },
                    src : that.result,
                    show : true,
                    filename : file.name
                }
            }
        );
        return avatarConfig;
    }