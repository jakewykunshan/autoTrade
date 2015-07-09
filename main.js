(function (win) {
	function getUid() {
		var cookie = readCookie("SUP");
		var val = decodeURIComponent(cookie);
		var vals = val.split("&");
		var len = vals.length;
		var curVal;
		for (i = 0; i < len; ++i) {
			var curVal = vals[i].split("=");
			if (curVal[0] === "uid") {
				return curVal[1];
			}
		}
	}

	function readCookie (name){
	    var cookieValue = "";
	    var search = name + "=";
	    if (document.cookie.length > 0)
	    {
	        offset = document.cookie.indexOf (search);
	        if (offset != -1)
	        {
	            offset += search.length;
	            end = document.cookie.indexOf (";", offset);
	            if (end == -1)
	                end = document.cookie.length;
	            cookieValue = unescape (document.cookie.substring (offset, end))
	        }
	    }
	    return cookieValue;
	}

	function getPrice(sec, callback) {
		// return price;
		STP.util.jsLoad("http://hq.sinajs.cn/list=" + sec, function () {
			var stockInfo= window['hq_str_' + sec].split(',');
			callback(stockInfo[3]);
		});
	}
	function log(string, type) {
		var style = "";
		if (type === "highlight") {
			style = "color:#f00; font-size: 18px;"
		}
		console.log("%c" + string, style);
	}
	// buy or sell.
	function trade(sec, price, unitMoney, tradeType) {
		var amount = Math.ceil(unitMoney / price / 100) * 100;
		log("unitMoney is " + unitMoney);
		log("Trade price is " + price, "highlight");
		log("Trade amount is " + amount, "highlight");
		new STP.orderBuy({
			prams:{
				sid: getUid(),
				symbol: sec,
				price: price,
				amount: amount,
				type: tradeType,
				enc: 'utf8'
			}
		})
	}
	var tool = win.tradeTool = {};
	tool.getPrice = getPrice;
	tool.trade = trade;
	// You can add stratagy to tradeStratagy here.
	function stratagy(lastPrice, nowPrice, callback) {
		// 振幅，根据历史值可以确定一个合理的振幅，
		log("Stratagy start");
		var stepFactor = 1;
		var lastPrice;
		var salePrice = lastPrice * (1 + stepFactor / 100);
		var buyPrice = lastPrice * (1 - stepFactor / 100);
		log("SalePrice = " + salePrice);
		log("BuyPrice = " + buyPrice);
		if (salePrice <= nowPrice) {
			callback("sell");
		}
		if (buyPrice >= nowPrice) {
			callback("buy");
		}
		log("Stratagy over");
		log("");
	}
	var tradeStratagy = win.tradeStratagy = {};
	win.log = log;
	tradeStratagy.swing = stratagy;
})(window)
// 起始是开盘价
function scan(sid, unitMoney) {
	var lastPrice;
	tradeTool.getPrice(sid, function (price) {
		lastPrice = price;
		setInterval(function () {
			tradeTool.getPrice(sid, function (nowPrice) {
				log("LastPrice = " + lastPrice);
				log("NowPrice = " + nowPrice);
				if (Number(nowPrice) != 0) {
					if (Number(lastPrice) == 0) {
						lastPrice = nowPrice;
						return;
					}
					tradeStratagy.swing(lastPrice, nowPrice, function (type) {
						tradeTool.trade(sid, nowPrice, unitMoney, type);
						lastPrice = nowPrice;
						log("Trade over");
					});
				} else {
					log("Trade System is not ready");
				}
			})
		}, 5000);
	})
}

// 启动入口
scan("sh601328", 5000);
//scan("sz002008", 5000);
