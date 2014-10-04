PreData = {};
TrainData = {};
TestData = {};

var dsv = d3.dsv("|", "text/plain");
dsv("data/test.csv")
    .row(function (d) {
        return {uid: +d.uid, rate: +d.rate, sid: +d.sid};
    })
    .get(function (error, rows) {
    	rows.forEach(function (row) {
    		var sid_rate = {sid: row.sid, rate: row.rate};
    		if (!PreData[row['uid']]) {
    			PreData[row['uid']] = [];
    		}
    		PreData[row['uid']].push(sid_rate);
    	});
    	console.log("PreData");
//    	console.log(PreData);
    });
// 读取测试数据
dsv("data/cftest.csv")
    .row(function (d) {
        return {uid: +d.uid, rate: +d.rate, sid: +d.sid};
    })
    .get(function (error, rows) {
    	rows.forEach(function (row) {
    		var sid_rate = {sid: row.sid, rate: row.rate};
    		if (!TestData[row['uid']]) {
                TestData[row['uid']] = [];
    		}
    		TestData[row['uid']].push(sid_rate);
    	});
    	console.log("TestData");
    });

// 读取训练数据
dsv("data/cftrain.csv")
    .row(function (d) {
        return {uid: +d.uid, rate: +d.rate, sid: +d.sid};
    })
    .get(function (error, rows) {
    	rows.forEach(function (row) {
    		var sid_rate = {sid: row.sid, rate: row.rate};
    		if (!TrainData[row['uid']]) {
                TrainData[row['uid']] = [];
    		}
            TrainData[row['uid']].push(sid_rate);
    	});
    	console.log("TrainData");
		tbody = initTable();
		console.log("initTable");
		fillBody(tbody, PreData, TestData);
    });



//	初始化表格，并返回tbody
function initTable(disPlayHeader) {
    if (!disPlayHeader)
        displayColumns = ["用户ID", "商品ID", "预测评分", "实际评分"];
    else
        displayColumns = disPlayHeader;

	var table = d3.select("#container")
		.append("table")
		.attr("class", "table table-bordered"),

		thead = table.append("thead"),
		tbody = table.append("tbody");

	thead.append("tr")
		.selectAll("th")
		.data(displayColumns)
		.enter()
		.append("th")
			.text(function (column) {return column;});

	return tbody;
}

/**
 * 填充表格内容
 * @param tbody
 * @param preData
 * {
 *  '1': [{sid:1,rate:2},{sid:3,rate:4},...]
 *  '2': [{sid:1,rate:2},{sid:3,rate:4},...]
 *  ...
 *  }
 */
function fillBody (tbody, preData, testData) {
    // tbody.remove();
	var columns = ['uid', 'sid', 'rate', "RealRate"];
	var rows = tbody.selectAll("tr")
		.data(function () {
            var users = [];
            for (user in preData) {
            	var uid_sid_rate = {'uid':user,'data':preData[user]}
                users.push(uid_sid_rate);
            }
            return users;
        })
		.enter()
		.append("tr");

	var cell = rows.selectAll("td")
		.data(function (row) {
			// var tmp = columns.map(function (column) {
			// 	// TODO: Predict value, real value

			// 	return {column: column, value: row['data'][0][column]};
			// });
			var tmp = row['data'][0];
			var data = [];
			// data.push({'value':row['uid']});
			// data.push({'value':tmp['sid']});
			// data.push({'value':tmp['rate']});
			// data.push({'value':''});

            var uid = row['uid']; var sid = tmp['sid'];
            var rate = tmp['rate']; var realRate = -1;

            var testdata = testData[uid];
            for (var cursor in testdata) {
                if (sid == cursor[0]){
                    realRate = cursor[1];
                    break;
                }
            }
            if (-1 == realRate) {
                realRate = "未购买";
            }
			data.push({'value': uid});
			data.push({'value': sid});
			data.push({'value': rate});

			data.push({'value': realRate});

			return data;
		})
		.enter()
		.append("td")
			.text(function (d) {return d.value});
}