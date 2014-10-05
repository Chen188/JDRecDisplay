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

        // tbody = initTable();
        // console.log("initTable");
        // fillBody(tbody, PreData, TestData, false, true);
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
        fillBody(tbody, PreData, TestData, true);
    });


//	初始化表格，并返回tbody
function initTable(selector, disPlayHeader, shouldCleanUserDetail) {
//    var tbodyExists = $("table","#userDetail") != undefined;
//    if (tbodyExists) {
//        $("#userDetail").empty();
//    }
    if (shouldCleanUserDetail) {
        $("#userDetail").empty()
    }
    if (!disPlayHeader)
        displayColumns = ["用户ID", "商品ID", "预测评分", "实际评分"];
    else
        displayColumns = disPlayHeader;

    if (!selector) {
        selector = "#container";
    }

    var table = d3.select(selector)
            .append("table")
            .attr("class", "table table-bordered");

    var thead = table.append("thead");
    var tbody = table.append("tbody");

    thead.append("tr")
        .selectAll("th")
        .data(displayColumns)
        .enter()
        .append("th")
        .text(function (column) {
            return column;
        });

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
 *  @param testData
 *  @param shouldAddBtn_showAll
 */
function fillBody(tbody, preData, testData, shouldAddBtn_showAll) {
    // tbody.remove();
//    if (shouldCleanUserDetail) {$('#userDetail table tbody').empty();}
//    var columns = ['uid', 'sid', 'rate', "RealRate"];
    var rows = tbody.selectAll("tr")
        .data(function () {
            var users = [];
            if (shouldAddBtn_showAll) {
                for (var user in preData) {
                    var uid_sid_rate = {'uid': +user, 'data': preData[user]};
                    users.push(uid_sid_rate);
                }
            } else {
                for (var user_ in preData) {
                    var user_data = preData[user_];
                    for (var cursor in user_data) {
                        var uid_sid_rate_ = {'uid': +user_, 'data': user_data[cursor]};
                        users.push(uid_sid_rate_);
                    }
                }
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
            if (!tmp) {
                tmp = row['data'];
            }
            var data = [];
            // data.push({'value':row['uid']});
            // data.push({'value':tmp['sid']});
            // data.push({'value':tmp['rate']});
            // data.push({'value':''});

            var uid = row['uid'];
            var sid = tmp['sid'];
            var rate = parseFloat(tmp['rate']).toFixed(1);
            var realRate = -1;

            var testdata = testData[uid];
            for (var cursor in testdata) {
                if (sid == testdata[cursor]['sid']) {
                    realRate = testdata[cursor]['rate'];
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
        .text(function (d) {
            return d.value
        });

    if (shouldAddBtn_showAll) {
        // d3.selectAll('tr')
        var tds = $('td:last-child');
        for (var i = tds.length - 1; i >= 0; i--) {
            var btn = document.createElement('button');
            btn.className = 'btn btn-xs btn-info btn-default showUserDetail';
            btn.setAttribute('data-toggle', 'modal');
            btn.setAttribute('data-target', '#myModal');
            btn.textContent = '显示所有';
            tds[i].appendChild(btn);
        }

        // $('.showUserDetail').on('click', generateUserData(this));
        $('.showUserDetail').on('click', function (who) {
            generateUserData(who);
        });
    }
}


function generateUserData(who) {
    // 获取触发btn的uid
    var par = who.target.parentElement.parentElement;
    var uid = par.firstChild.textContent;

    var data = {};
    data[uid] = PreData[uid];

    // 设置modal标题
    $('#myModalLabel').text('用户' + uid + '推荐详情');

    var tbody = initTable("#userDetail", undefined, true);
    // console.log(TestData);
    fillBody(tbody, data, TestData, false);
    // console.log(data);
}