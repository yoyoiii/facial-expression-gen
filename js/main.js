
var controller = {
    img: null,  // 上传图片
    cropper: null,
    resImg: null,  // 剪切后图片
    txt: "",  // 文字
    init: function() {
        var _this = this
        this.initFile();
        this.getTxt();
        this.event();
    },

    // ？？
    initFile: function() {
        var $file = $("#file");
        function getIos() {
            var ua = navigator.userAgent.toLowerCase();
            if(getIos()) {
                $file.removeAttr("capture");
            }
            if(ua.match(/iPhone\sOS/i) == "iphone os") {
                return true;
            } else {
                return false;
            }
        }
    },

    getTxt: function(success) {
        var _this = this;
        var text = _this.txt, len = text.length
        var c = document.getElementById("poster"), cheight = c.height; 
        var fontSize = 80, contents = [], startY = [];

        if(len >= 0) {   // 有字
            startY.push(cheight - 20);
            contents.push(text.slice(0, 10));
            if(len > 10) {
                contents.splice(0, contents.length)
                len = Math.ceil(len / 2)
                contents.unshift(text.slice(0, len));
                contents.unshift(text.slice(len));
            }  
            
            fontSize = fontSize - (len - 1) * 5;
            startY.push(startY - fontSize - 5);
                     
            success && success(contents, fontSize, startY);
        }
    },

    // 截取图片
    screenImg: function(img) {
        var $screen = $(".screen");
        $screen.append(img);
        $screen.show();
        this.cropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
            scalable: false,
            zoomable: false,
        })
    },

    // 制作
    makeExpression: function(flag) {
        var _this = this;
        var img = this.resImg;
        var c = document.getElementById("poster"), cwidth = c.width;
        var ctx = c.getContext('2d');
        this.getTxt(function(contents, fontSize, startY) {
            ctx.clearRect(0, 0, 400, 400);
            // 画图
            ctx.drawImage(img, 0, 0, 400, 400);

            // 写字
            ctx.font= fontSize + "px 'PingFang SC'";
            ctx.lineWidth = 5;
            // 字体样式
            if(flag) {  // 白字
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black"     
            } else { // 默认黑字
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white"
            }

            ctx.textAlign = "center";

            contents.forEach((content,index) => {
                ctx.strokeText(content, cwidth/2, startY[index], 380);
                ctx.fillText(content, cwidth/2, startY[index], 380);
            });
   
            var data = c.toDataURL("image/png", 1);
            $("#result").attr("src", data);
            _this.cropper && _this.destroy();
        })
    },

    // 销毁裁剪框 重置inputfile和txt
    destroy: function() {
        var _this = this;
        $(".screen").hide();
        _this.cropper.destroy();
        _this.cropper = null;
        $(".screen #target").remove();
        $("#file").val("");
    },

    event: function(){
        var _this = this;
        $("#file").on("change", function() {
            var reader = new FileReader();
            // filses就是input[type=file]文件列表，files[0]就是第一个文件，这里就是将选择的第一个图片文件转化为base64的码
            // this 是 dom 对象
            reader.readAsDataURL(this.files[0]);
            reader.onload = function(e) {
                var upImg = new Image();
                upImg.src = e.target.result;
                upImg.id = "target";
                upImg.onload = function() {
                    _this.screenImg(upImg);
                }
                upImg.onerror = function() {
                    alert("图片加载失败，请重新选择图片~")
                }
            }
        });

        $(".cancel").on("tap click", function() {
            var _this = this;
            _this.destroy();
        });

        $(".confirm").on("tap click", function() {
            var cutImg = _this.cropper.getCroppedCanvas({
                imageSmoothingQuality: "high"
            });
            var base64Url = cutImg.toDataURL("image/png", 1);
            var resImg = new Image();
            resImg.src = base64Url;
            resImg.onload = function() {
                _this.resImg = resImg;
                $("#result").attr("src", base64Url);
                $(".show p").show();
                _this.cropper && _this.destroy();
            }
            resImg.onerror = function() {
                alert("图片剪切失败，请刷新重试~")
            }
            
        });

        $(".text").on("change", function() {
            if($(this).val().length <= 20) {
                _this.txt = $(this).val();
            }
        });

        // 生成
        $(".btn-gen").on("tap click", function() {    
            if(_this.resImg && _this.txt) {   
                _this.makeExpression(false); // 默认黑字
                $(".text").val("");
                $("#switch").attr("data-js", "0");       
            } else if(!_this.resImg) {
                alert("请先选择图片~");
            } else if(!_this.txt) {
                alert("字太多啦，请删减~");
            }
        });

        $("#switch").on("tap click", function() {
            var switchCode = $(this).attr("data-js");
            var flag = (switchCode == "0") ? false : true;
            if(_this.resImg) {   
                _this.makeExpression(!flag);
                $(this).attr("data-js", flag ? "0" : "1"); 
            }
        });

        // 禁止拖动
        $(".screen").on("touchmove", function(e) {
            e.preventDefault();
        });
    },
};

$(function(){
    controller.init();
});
