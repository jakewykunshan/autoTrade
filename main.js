function stratagy(lastPrice, nowPrice, callback) {
	// 振幅，根据历史值可以确定一个合理的振幅，
	console.log("Stratagy start");
	var stepFactor = 1.5;
	var lastPrice;
	var salePrice = lastPrice * (1 + stepFactor / 100);
	var buyPrice = lastPrice * (1 - stepFactor / 100);
	console.log("SalePrice = " + salePrice);
	console.log("BuyPrice = " + buyPrice);
	if (salePrice <= nowPrice) {
		callback("sell");
	}
	if (buyPrice >= nowPrice) {
		callback("buy");
	}
	console.log("Stratagy over");
}

function getPrice(sec, callback) {
	// return price;
	STP.util.jsLoad("http://hq.sinajs.cn/list=" + sec, function () {
		var stockInfo= window['hq_str_' + sec].split(',');
		callback(stockInfo[3]);
	});
}
// buy or sell.
function trade(sec, price, unitMoney, tradeType) {
	var amount = Math.ceil(unitMoney / price / 100) * 100;
	console.log("unitMoney is " + unitMoney);
	console.log("price is " + price);
	console.log("Trade amount is " + amount);
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

// 起始是开盘价
var lastPrice;
function scan(sid, unitMoney) {
	getPrice(sid, function (price) {
		lastPrice = price;
		setInterval(function () {
			getPrice(sid, function (nowPrice) {
				console.log("LastPrice = " + lastPrice);
				console.log("NowPrice = " + nowPrice);
				if (Number(nowPrice) != 0) {
					if (Number(lastPrice) == 0) {
						lastPrice = nowPrice;
						return;
					}
					stratagy(lastPrice, nowPrice, function (type) {
						trade(sid, nowPrice, unitMoney, type);
						lastPrice = nowPrice;
						console.log("Trade over");
					});
				} else {
					console.log("Trade System is not ready");
				}
			})
		}, 5000);
	})
}

// 启动入口
scan("sh601328", 5000);