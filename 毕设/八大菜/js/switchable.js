/**
 * Author:xiaomei
 */
(function($,w){
    /**
    * Switchable 抽象类，外部不能直接调用
    * @constructor
    * @param {string} 容器的ID
    * @param {object} 配置参数
    */
	function Switchable(container,o){				
		if(arguments.length !== 0){
			o = o ||{};
			this.ID = container;            
			this.NAVCLS   = o.navCls || "js_switch_nav";
			this.CONTCLS  = o.contentCls || "js_switch_ct";
			this.TRIGGERCLS = o.triggerCls || "js_switch_trigger";
			this.PREVCLS  = o.prevCls || "js_switch_prev";
			this.NEXTCLS  = o.nextCls || "js_switch_next";
			this.PANELCLS = o.panelCls || "js_switch_panel";
			this.PREVCLS  = o.prevCls || "js_switch_prev";
			this.ACTIVEYRIGGERCLS = o.activeTriggerCls || "js_active";
			this.DISABLEBTNCLS = o.disableBtnCls || "js_switch_off";
			this.TRIGGERTYPE = o.triggerType || "click";
			this.EFFECT = o.effect || "normal";
			this.HASTRIGGERS = ( o.hasTriggers !== undefined ) ? o.HASTRIGGERS : true;
			this.AUTOPLAY = ( o.autoPlay !== undefined ) ? o.autoPlay : false;
			this.CIRCULAR = ( o.circular !== undefined ) ? o.circular : true;
			this.DELAY = o.delay || 200;
			this.STEPS = o.steps || 1;
			this.VIEWSIZE = o.viewSize || 1;
			this.INTERVAL = o.interval || 5000;
			this.DURATION = o.duration || 500;
			this.EASING = o.easing || "swing";
			this._activeIndex = o.activeIndex || 0;
			this.CALLFUN = o.func || null;
			this._autoPlayTimer; //自动播放的timer
            this._eventTimer;   //事件触发的timer
		}
	}
	//重写Switchable原型
	Switchable.prototype = {
        //设置HTML结构
        _struct : function () {
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS ),
				$content = $cont.find( "." + this.CONTCLS );
			
            switch( this.EFFECT ) {
                case "scrollx":
                    var contWidth = $panel.outerWidth( true ) * $panel.length + "px";
                    $content.css( {"position":"absolute","width":contWidth} );
                    $panel.css( {"float":"left"} );
                    break;
                case "scrolly":
                    $content.css({"position":"absolute"});
                    break;
                case "fade":
                    $panel.css({"position":"absolute","left":"0","top":"0","z-index":"0","opacity":"0"});
                    break;
            }
            //运行自动播放
            (this.AUTOPLAY === true) && this._auto();		
        },
        _switch : function(index){
            //console.log(index);
            switch(this.EFFECT){
                case "scrollx":
                    this._switchScrollx(index);
                    break;
                case "scrolly":
                    this._switchScrolly(index);
                    break;
                case "fade":
                    this._switchFade(index);
                    break;
                default:
                    this._switchNormal(index);
            }
        },
        //没有动画效果的撤换
        _switchNormal : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS );
		
            this._setActiveTriggerCls(index);
            
            $panel.hide();		
            $panel.eq(index).show();
            
            this._activeIndex = index;
			
			//调用配置callback
			( this.CALLFUN !== null ) && this.CALLFUN.call( this, index );
        },
        _switchScrolly : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS ),
				$content = $cont.find( "." + this.CONTCLS ),
				panelWidth = $panel.outerHeight(true),
				moveWidth = -index * this.STEPS * panelWidth;
                            
			this._setActiveTriggerCls( index );
			
            $content
                .stop()
                .animate( {"top":moveWidth}, this.DURATION, this.EASING );
            
			this._activeIndex = index;
			//设置上下按钮是否可点
			( this.CIRCULAR === false ) && this._setDisableBtnCls( index );
			( this.CALLFUN !== null ) && this.CALLFUN.call( this, index );
        },
        _switchScrollx : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS ),
				$content = $cont.find( "." + this.CONTCLS ),
		        panelWidth = $panel.outerWidth( true ),
                moveWidth = - index * this.STEPS * panelWidth;

            this._setActiveTriggerCls(index);
    
            $content
                .stop()
                .animate( {"left":moveWidth }, this.DURATION, this.EASING );
        
			 this._activeIndex = index;	
			( this.CIRCULAR === false ) && this._setDisableBtnCls( index );
			( this.CALLFUN !== null ) && this.CALLFUN.call( this, index );
        },
        _switchFade : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS );
			
            this._setActiveTriggerCls(index);
            
            $panel
                .eq( this._activeIndex )
                .stop()
                .animate( {opacity:0}, this.DURATION, this.EASING )
                .css( "z-index", 0 );
                
            $panel
                .eq( index )
                .stop()
                .animate( { opacity : 1 }, this.DURATION, this.EASING )
                .css( "z-index", 1);
                
            this._activeIndex = index;
			( this.CALLFUN !== null ) && this.CALLFUN.call( this, index );
        },
        _setActiveTriggerCls : function( index ) {
			var $cont = $( "#" + this.ID ),
				$trigger = $cont.find( "." + this.TRIGGERCLS ),
				index = index||0;
				
            $trigger.removeClass( this.ACTIVEYRIGGERCLS );
            $trigger.eq( index ).addClass( this.ACTIVEYRIGGERCLS );
        },
        _setDisableBtnCls : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS ),
				$prev = $cont.find( "." + this.PREVCLS ),
				$next = $cont.find( "." + this.NEXTCLS ),
				maxIndex = Math.ceil( ($panel.length - this.VIEWSIZE) / this.STEPS );
            if(index==0){
                $prev.addClass(this.DISABLEBTNCLS);
                if($panel.length <= this.VIEWSIZE){
                	$next.addClass(this.DISABLEBTNCLS);
                }else{
                	$next.removeClass(this.DISABLEBTNCLS);
                }
            }else if(index == maxIndex){
                $next.addClass(this.DISABLEBTNCLS);
                $prev.removeClass(this.DISABLEBTNCLS);
            }else{
                $prev.removeClass(this.DISABLEBTNCLS);
                $next.removeClass(this.DISABLEBTNCLS);
            }
        },
        _auto : function(){
            var self = this,
				$cont = $( "#" + this.ID );
    
            clearInterval(this._autoPlayTimer);
            self._autoPlayTimer = setInterval(function(){
                self._doPlay();
            },self.INTERVAL);
            
            $cont.unbind("mouseenter");
            $cont.unbind("mouseleave");
            $cont.mouseenter(function(){
                clearInterval(self._autoPlayTimer);
            });
            
            $cont.mouseleave(function(){
                self._autoPlayTimer = setInterval(function(){
                    self._doPlay();
                },self.INTERVAL);
            });
        },
        _doPlay : function(){
            this._switch(this._checkActiveIndex(this._activeIndex + 1));
        },
        //
        _checkActiveIndex : function(index){
			var $cont = $( "#" + this.ID ),
				$panel = $cont.find( "." + this.PANELCLS ),
				maxIndex = Math.ceil(($panel.length - this.VIEWSIZE)/this.STEPS);
            
            if(index<0){
                return maxIndex;
            }else if(index > maxIndex){
                return 0
            }
            return index;
        },
        /**
        * 公有方法 - 停止自动播放
        **/
        stop : function(){
			var $cont = $( "#" + this.ID );
			
            $cont.unbind("mouseenter");
            $cont.unbind("mouseleave");
            clearInterval(this._autoPlayTimer);
        },
        /**
        * 公有方法 - 开始自动播放
        **/
        start : function(){
            this._auto();
        },
        switchTo : function(index){
            this._switch(index);
        },
        /**
        * 公有方法 - 撤换到上一个
        **/
        prev : function(){
            this._switch(this._checkActiveIndex(this._activeIndex - 1));
        },
        /**
        * 公有方法 - 撤换到下一个
        **/
        next : function(){
            this._switch(this._checkActiveIndex(this._activeIndex + 1));
        },
        //绑定组件的事件
        _bindEvent : function(){
            var self = this,
				$cont = $( "#" + this.ID ),
				$trigger = $cont.find( "." + this.TRIGGERCLS ),
				$prev = $cont.find( "." + this.PREVCLS ),
				$next = $cont.find( "." + this.NEXTCLS );
				
            $trigger.each(function(index, elem){
                $( elem )[ self.TRIGGERTYPE ](function(){
                    if( self.TRIGGERTYPE === "click" ){
                        self._switch(index);
                    }else{
                       //防止过快移动触发
                       self._eventTimer = setTimeout ( function(){
                               self._switch( index );
                        }, self.DELAY );
                    }
                });
            });
            
            if(self.TRIGGERTYPE === "mouseenter"){
				$trigger.bind("mouseleave",function(){
					clearTimeout(self._eventTimer);
				});
			}
            
            $next[self.TRIGGERTYPE](function(){
                if($(this).hasClass(self.DISABLEBTNCLS)) return;
                self.next();
            });
            
            $prev[self.TRIGGERTYPE](function(){
                if($(this).hasClass(self.DISABLEBTNCLS)) return;
                self.prev();
            });
            
        },
		_init: function(cont,config){
			this._struct();
			this._bindEvent();
			this._switch(this._activeIndex);
		}
        
    };
	
	//添加命名空间
	var Switch = w.Switch = {};
    
	Switch.Tabs = function (container,config){
		//继承 Switchable 实例对象
		Switchable.call(this,container,config);
		this._init(container,config);
	}
	//继承 Switchable 原型方法
	Switch.Tabs.prototype = new Switchable();
	Switch.Tabs.prototype.constructor = Switch.Tabs;
	
	Switch.Slide = function (container,config){
		//继承 Switchable 实例对象
		Switchable.call(this,container,config);
		this._init(container,config)
	}
	//继承 Switchable 原型方法
	Switch.Slide.prototype = new Switchable();
	Switch.Slide.prototype.constructor = Switch.Slide;
	
	
	Switch.Carousel = function(container,config){
		//继承 Switchable 实例对象
		Switchable.call(this,container,config);
		this._init(container,config)
	};
	//继承 Switchable 原型方法
	Switch.Carousel.prototype = new Switchable();
	Switch.Carousel.prototype.constructor = Switch.Carousel;
	
	Switch.Carousel.prototype._init = function(cont,config){
		this._struct();
		(this.CIRCULAR === false) && this._setDisableBtnCls(this._activeIndex);
		this._setTrigger(config);
		this._bindEvent();
		this._switch(this._activeIndex);
	};
	
	Switch.Carousel.prototype._setTrigger = function(o){
		var trigger = "",
			$cont = $( "#" + this.ID ),
			$trigger = $cont.find( "." + this.TRIGGERCLS ),
			$panel = $cont.find( "." + this.PANELCLS ),
			$nav = $cont.find( "." + this.NAVCLS ),
			maxIndex = Math.ceil(($panel.length - this.VIEWSIZE)/this.STEPS);

		for(var i=1;i<=maxIndex+1;i++){
			trigger = trigger + '<li class="js_switch_trigger"><span>'+ i +'</span></li>';
		}
		
		$nav.html(trigger);
		$trigger = $cont.find("." + (o.triggerCls||"js_switch_trigger"));
	};
	


})(jQuery,window);

jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},

	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}
});
