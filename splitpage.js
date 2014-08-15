// +----------------------------------------------------------------------+
// | SplitPage.js   分页控件
// +----------------------------------------------------------------------+
// | Author: Neoxone
// +----------------------------------------------------------------------+
// | Site: www.cssass.com
// +----------------------------------------------------------------------+
function SplitPage(config){
    this.pageWrap = config.node;  //容器
    this.pageWrap.className = "pageNavi";
    this.showLimit = config.showLimit || 3; //显示页码数（左3右3）
    this.count = config.count || 10; //每页显示数
    this.url = config.url;  //请求地址(可带参数)
    this.req = {
        start : 0,
        end : this.count - 1
    };
    extendCopy(config.data || {}, this.req); //请求参数
    this.callback = config.callback;  //请求回调
    this.type = config.type; //支持jsonp
    this.disabled = false;
    this.init();
}
SplitPage.prototype = {
    init : function(){
        var that = this;
        this.myPageSpan = document.createElement("span");
        this.pageWrap.appendChild(this.myPageSpan);
        this.ajaxGet(function(){
            that.setLinks();
            that.bindLinks();
        });
    },
    search : function(url,data){  //按条件重设分页
        this.pageWrap.innerHTML = "";
        this.url = url;
        this.req = {
            start : 0,
            end : this.count - 1
        };
        extendCopy(data || {}, this.req);
        this.init();
    },
    prev : function(){
        this.req.start -= this.count;
        this.req.end -= this.count;
        this.ajaxGet(this.setLinks);
    },
    next : function(){
        this.req.start += this.count;
        this.req.end += this.count;
        this.ajaxGet(this.setLinks);
    },
    getByNum : function(n){
        this.req.start = (n - 1) * this.count;
        this.req.end = n * this.count - 1 ;
        this.ajaxGet(this.setLinks);
    },
    ajaxGet : function(func){
        var that = this;
        if(this.disabled) return;
        this.disabled = true;
        var _apply = function(msg){
            that.msg = msg;
            if(that.callback) that.callback(msg.data,msg.total);
            func.call(that);
            that.disabled = false;
        };
        if(this.type == 'jsonp'){
            $jsonp(this.url,this.req,_apply);
        }else{
            $.get(this.url,this.req, _apply,'json');
        };
    },
    setLinks : function(){
        this.myPageSpan.innerHTML = "";
        var data = this.msg.data;
        this.totalNum = Math.ceil(this.msg.total/this.count);
        if(this.totalNum < 2) return false;
        var links ="",
            currNum = Math.ceil(this.req.end/this.count),
            startNum = Math.max(2, currNum - this.showLimit),
            endNum = Math.min(this.totalNum-1, currNum + this.showLimit);
        links += "<a href='javascript:;' class='page_prev'>上一页</a>";
        links += "<a href='javascript:;' pid='1' class='page_home'>1</a>";
        if(this.totalNum && startNum > 2) links += "<a href='javascript:;' class='nolink' >...</a>";
        for(var i = startNum; i<= endNum; i++){
            if(i == currNum){
                links += "<a href='javascript:;' class='curr' pid='"+ i +"'>"+ i +"</a>";
            }else{
                links += "<a href='javascript:;' pid='"+ i +"'>"+ i +"</a>";
            }
        };
        if(endNum < this.totalNum-1) links += "<a href='javascript:;' class='nolink' >...</a>";
        links += "<a href='javascript:;' pid="+this.totalNum+" class='page_end'>"+this.totalNum+"</a>";
        links += "<a href='javascript:;' class='page_next'>下一页</a>";
        if(this.showLimit*2 < this.totalNum) {
            links += "<input type='number' min='1' max="+this.totalNum+" class='pageIndex' /><a href='javascript:;' class='page_go'>Go</a>";
        }
        this.myPageSpan.innerHTML = links;

        this.midAnchor = $tag("a[pid]", this.myPageSpan);
        this.prevAnchor = $class("page_prev", this.myPageSpan)[0];
        this.nextAnchor = $class("page_next", this.myPageSpan)[0];
        this.homeAnchor = $class("page_home", this.myPageSpan)[0];
        this.endAnchor = $class("page_end", this.myPageSpan)[0];
        this.goAnchor = $class("page_go", this.myPageSpan)[0];
        removeClass($class("nolink"),'nolink');
        if(this.req.start < 1){
            addClass(this.prevAnchor,"nolink");
            addClass(this.homeAnchor,"nolink");
        };
        if(this.req.end + 1 >= this.msg.total){
            addClass(this.nextAnchor,"nolink");
            addClass(this.endAnchor,"nolink");
        };
    },
    bindLinks : function(){
        var that = this;
        events.delegate(that.myPageSpan, '.page_prev', 'click',function(){
            if(!hasClass(that.prevAnchor,'nolink')) that.prev();
        });
        events.delegate(that.myPageSpan, '.page_next', 'click', function(){
            if(!hasClass(that.nextAnchor,'nolink')) that.next();
        });
        events.delegate(that.myPageSpan, '.page_go', 'click', function(){
            var n = that.goAnchor.previousSibling.value;
            if(n-0 > 0 && n-0 <= that.totalNum) that.getByNum(n);
        });
        events.delegate(that.myPageSpan,'a', 'click',function(){
            var e = arguments[0] || window.event,
                target = e.srcElement || e.target,
                n = target.getAttribute("pid");
            if(n && !hasClass(target,'curr')) that.getByNum(n);
        });
    }
};