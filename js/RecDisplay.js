PreData = {};
TrainData = {};
TestData = {};
predatatest={};
traindatatest={};
testdatatest={};

predatalength=0;
traindatalength=0;
testdatalength=0;

pageIndex=0;
pageCount=0;
rowCount=10;

panel=0;

/**
 * @author ideawu@163.com
 * @class
 * 分页控件, 使用原生的JavaScript代码编写. 重写onclick方法, 获取翻页事件,
 * 可用来向服务器端发起AJAX请求.
 *
 * @param {String} id: HTML节点的id属性值, 控件将显示在该节点中.
 * @returns {PagerView}: 返回分页控件实例.
 *
 * @example
 * ### HTML:
 * &lt;div id="pager"&gt;&lt;/div&gt;
 *
 * ### JavaScript:
 * var pager = new PagerView('pager');
 * pager.index = 3; // 当前是第3页
 * pager.size = 16; // 每页显示16条记录
 * pager.itemCount = 100; // 一共有100条记录
 *
 * pager.onclick = function(index){
 *	alert('click on page: ' + index);
 *	// display data...
 * };
 *
 * pager.render();
 *
 */
var PagerView = function(id){
    var self = this;
    this.id = id;

    this._pageCount = 0; // 总页数
    this._start = 1; // 起始页码
    this._end = 1; // 结束页码

    /**
     * 当前控件所处的HTML节点引用.
     * @type DOMElement
     */
    this.container = null;
    /**
     * 当前页码, 从1开始
     * @type int
     */
    this.index = 1;
    /**
     * 每页显示记录数
     * @type int
     */
    this.size = 1;
    /**
     * 显示的分页按钮数量
     * @type int
     */
    this.maxButtons = 9;
    /**
     * 记录总数
     * @type int
     */
    this.itemCount = 0;

    /**
     * 控件使用者重写本方法, 获取翻页事件, 可用来向服务器端发起AJAX请求.
     * 如果要取消本次翻页事件, 重写回调函数返回 false.
     * @param {int} index: 被点击的页码.
     * @returns {Boolean} 返回false表示取消本次翻页事件.
     * @event
     */
    this.onclick = function(index){
        return true;
    };

    /**
     * 内部方法.
     */
    this._onclick = function(index){
        var old = self.index;

        self.index = index;
        if(self.onclick(index) !== false){
            self.render();
        }else{
            self.index = old;
        }
    };

    /**
     * 在显示之前计算各种页码变量的值.
     */
    this._calculate = function(){
        self._pageCount = parseInt(Math.ceil(self.itemCount / self.size));
        self.index = parseInt(self.index);
        if(self.index > self._pageCount){
            self.index = self._pageCount;
        }
        if(self.index < 1){
            self.index = 1;
        }

        self._start = Math.max(1, self.index - parseInt(self.maxButtons/2));
        self._end = Math.min(self._pageCount, self._start + self.maxButtons - 1);
        self._start = Math.max(1, self._end - self.maxButtons + 1);
    };

    /**
     * 渲染控件.
     */
    this.render = function(){
        var div = document.getElementById(self.id);
        div.view = self;
        self.container = div;

        self._calculate();

        var str = '';
        str += '<div class="PagerView">\n';
        if(self._pageCount > 1){
            if(self.index != 1){
                str += '<a href="javascript://1"><span>|&lt;</span></a>';
                str += '<a href="javascript://' + (self.index-1) + '"><span>&lt;&lt;</span></a>';
            }else{
                str += '<span>|&lt;</span>';
                str += '<span>&lt;&lt;</span>';
            }
        }
        for(var i=self._start; i<=self._end; i++){
            if(i == this.index){
                str += '<span class="on">' + i + "</span>";
            }else{
                str += '<a href="javascript://' + i + '"><span>' + i + '</span></a>';
            }
        }
        if(self._pageCount > 1){
            if(self.index != self._pageCount){
                str += '<a href="javascript://' + (self.index+1) + '"><span>&gt;&gt;</span></a>';
                str += '<a href="javascript://' + self._pageCount + '"><span>&gt;|</span></a>';
            }else{
                str += '<span>&gt;&gt;</span>';
                str += '<span>&gt;|</span>';
            }
        }
        str += ' 一共' + self._pageCount + '页, ' + self.itemCount + '条记录 ';
        str += '</div><!-- /.pagerView -->\n';

        self.container.innerHTML = str;

        var a_list = self.container.getElementsByTagName('a');
        for(var i=0; i<a_list.length; i++){
            a_list[i].onclick = function(){
                var index = this.getAttribute('href');
                if(index != undefined && index != ''){
                    index = parseInt(index.replace('javascript://', ''));
                    self._onclick(index)
                }
                return false;
            };
        }
    };
}

function min(t1,t2){
    if(t1>=t2)
    {
        return t2;
    }
    else
    {
        return t1;
    }
}

var dsv = d3.dsv("|", "text/plain");
dsv("data/cfResult.csv")
    .row(function (d) {
        return {uid: +d.uid, rate: +d.rate, sid: +d.sid};
    })
    .get(function (error, rows) {
        rows.forEach(function (row) {
            var sid_rate = {sid: row.sid, rate: row.rate};
            if (!PreData[row['uid']]) {
                PreData[row['uid']] = [];
                predatalength++;
            }
            PreData[row['uid']].push(sid_rate);
        });
        console.log("PreData");
        initFirstTab();
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
                testdatalength++;
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
                traindatalength++;
            }
            TrainData[row['uid']].push(sid_rate);
        });
        console.log("TrainData");
    });

function initFirstTab () {
    tbody = initTable();
    panel=1;
    predatatest=undefined;
    predatatest={};
    pager.itemCount=predatalength;
    pager.index=1;
    pager.size=rowCount;
    var i=0;
    for(var item in PreData)
    {
        if(i>=(pager.index-1)*pager.size&&i<min((pager.index)*pager.size,predatalength)) {
            if (!predatatest[item]) {
                predatatest[item] = [];
            }
            for (var item2 in PreData[item])
            {
                var sid_rate = {sid: PreData[item][item2].sid, rate: PreData[item][item2].rate};
                predatatest[item].push(sid_rate);
            }
            console.log(item)
        }
        i++;
    }
    pager.render();
    console.log("initTable");
    fillBody(tbody, predatatest, TestData, true);
}

// Nav click Event
$().ready(function(){
    $('.nav li a').on("click", function(e) {
        fillPane(e);
    });
});


// 填充顶部导航
function fillPane (e) {
    var tbody;
    var disPlayHeader = ["用户ID", "商品ID", "用户评分"];
    switch (e.target.text) {
        case "推荐结果":
            // 填充推荐结果
            panel=1;
            pager.itemCount=predatalength;
            pager.index=1;
            pager.size=rowCount;
            pager.render();
            var i=0;
            predatatest=undefined;
            predatatest={};
            for(var item in PreData)
            {
                if(i>=(pager.index-1)*pager.size&&i<min((pager.index)*pager.size,predatalength)) {
                    if (!predatatest[item]) {
                        predatatest[item] = [];
                    }
                    for (var item2 in PreData[item])
                    {
                        var sid_rate = {sid: PreData[item][item2].sid, rate: PreData[item][item2].rate};
                        predatatest[item].push(sid_rate);
                    }
                    console.log(item)
                }
                i++;
            }
            document.getElementById("container").innerHTML="";
            tbody = initTable('#container', disPlayHeader);
            fillBody(tbody, predatatest, undefined, true, "#container td:last-child");
            break;
        case "训练数据":
            // 填充训练数据
            panel=2;
            pager.itemCount=traindatalength;
            pager.index=1;
            pager.size=rowCount;
            pager.render();
            var i=0;
           traindatatest=undefined;
            traindatatest={};
            for(var item in TrainData)
            {
                if(i>=(pager.index-1)*pager.size&&i<min((pager.index)*pager.size,traindatalength)) {
                    if (!traindatatest[item]) {
                        traindatatest[item] = [];
                    }
                    for (var item2 in TrainData[item])
                    {
                        var sid_rate = {sid: TrainData[item][item2].sid, rate: TrainData[item][item2].rate};
                        traindatatest[item].push(sid_rate);
                    }
                    console.log(item)
                }
                i++;
            }
            document.getElementById("trainData").innerHTML="";
            tbody = initTable('#trainData', disPlayHeader);
            fillBody(tbody, traindatatest, undefined, true, "#trainData td:last-child");
            break;
        case "测试数据":
            // 填充测试数据
            panel=3;
            pager.itemCount=testdatalength;
            pager.index=1;
            pager.size=rowCount
            pager.render();
            testdatatest=undefined;
            testdatatest=[];
            var i=0;
            for(var item in TestData)
            {
                if(i>=(pager.index-1)*pager.size&&i<min((pager.index)*pager.size,testdatalength)) {
                    if (!testdatatest[item]) {
                        testdatatest[item] = [];
                    }
                    for (var item2 in TestData[item])
                    {
                        var sid_rate = {sid: TestData[item][item2].sid, rate: TestData[item][item2].rate};
                        testdatatest[item].push(sid_rate);
                    }
                }
                i++;
            }
            document.getElementById("testData").innerHTML="";
            tbody = initTable('#testData', disPlayHeader);
            fillBody(tbody, testdatatest, undefined, true, "#testData td:last-child");
            break;
        default: alert('unknown tab name');break;
    }

}

function fillPane1 () {
    var tbody;
    var disPlayHeader = ["用户ID", "商品ID", "用户评分"];
    switch (panel) {
        case 1:
            // 填充推荐结果
            pager.render();
            var i = 0;
            predatatest = undefined;
            predatatest = [];
            for (var item in PreData) {
                if (i >= (pager.index - 1) * pager.size && i < min
                ((pager.index) * pager.size, predatalength)) {
                    if (!predatatest[item]) {
                        predatatest[item] = [];
                    }
                    for (var item2 in PreData[item]) {
                        var sid_rate = {sid: PreData[item][item2].sid, rate: PreData
                            [item][item2].rate};
                        predatatest[item].push(sid_rate);
                    }
                }
                i++;
            }
            document.getElementById('container').innerHTML = "";
            tbody = initTable('#container', disPlayHeader);
            fillBody(tbody, predatatest, undefined, true, "#container td:last-child");
            break;
        case 2:
            // 填充训练数据
            pager.render();
            var i = 0;
            traindatatest = undefined;
            traindatatest = [];
            for (var item in TrainData) {
                if (i >= (pager.index - 1) * pager.size && i < min((pager.index) * pager.size, traindatalength)) {
                    if (!traindatatest[item]) {
                        traindatatest[item] = [];
                    }
                    for (var item2 in TrainData[item]) {
                        var sid_rate = {sid: TrainData[item][item2].sid, rate: TrainData[item][item2].rate};
                        traindatatest[item].push(sid_rate);
                    }
                }
                i++;
            }
            document.getElementById('trainData').innerHTML = "";
            tbody = initTable('#trainData', disPlayHeader);
            fillBody(tbody, traindatatest, undefined, true, "#trainData td:last-child");
            break;
        case 3:
            // 填充测试数据
            pager.render();
            var i = 0;
            testdatatest = undefined;
            testdatatest = [];
            for (var item in TestData) {
                if (i >= (pager.index - 1) * pager.size && i < min((pager.index) * pager.size, testdatalength)) {
                    if (!testdatatest[item]) {
                        testdatatest[item] = [];
                    }
                    for (var item2 in TestData[item]) {
                        var sid_rate = {sid: TestData[item][item2].sid, rate: TestData[item][item2].rate};
                        testdatatest[item].push(sid_rate);
                    }
                }
                i++;
            }
            document.getElementById('testData').innerHTML = "";
            tbody = initTable('#testData', disPlayHeader);
            fillBody(tbody, testdatatest, undefined, true, "#testData td:last-child");
            break;
        default:
            alert('unknown tab name');
            break;
    }
}


function isVisible (selector) {
    return $(selector).css("display") != 'none';
}

//	初始化表格，并返回tbody
function initTable(selector, disPlayHeader, shouldCleanUserDetail) {
//    var tbodyExists = $("table","#userDetail") != undefined;
//    if (tbodyExists) {
//        $("#userDetail").empty();
//    }
    if (shouldCleanUserDetail) {
        $("#userDetail").empty();
    }
    if (!selector) {
        selector = "#container";
    }
    if (!disPlayHeader)
        displayColumns = ["用户ID", "商品ID", "预测评分", "实际评分"];
    else
        displayColumns = disPlayHeader;

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
 * @param btn_selector
 */
function fillBody(tbody, preData, testData, shouldAddBtn_showAll, btn_selector) {
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

    var badgeArray = [];

    var cell = rows.selectAll("td")
        .data(function (row) {
            // var tmp = columns.map(function (column) {
            // 	// TODO: Predict value, real value

            // 	return {column: column, value: row['data'][0][column]};
            // });
            var badge = row['data'].length;
            var tmp = row['data'][0];
            if (!tmp) {
                tmp = row['data'];
                badge = 1;
            }

            // 添加徽章(个数)
            badgeArray.push(badge);

            var data = [];
            // data.push({'value':row['uid']});
            // data.push({'value':tmp['sid']});
            // data.push({'value':tmp['rate']});
            // data.push({'value':''});

            var uid = row['uid'];
            var sid = tmp['sid'];
            var rate = parseFloat(tmp['rate']).toFixed(1);
            var realRate = -1;

            data.push({'value': uid});
            data.push({'value': sid});
            data.push({'value': rate});

            // 如果testData未定义，则不是 结果tab ，不求取实际评分.
            if (testData) {
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
                data.push({'value': realRate});
            }
            return data;
        })
        .enter()
        .append("td")
        .text(function (d) {
            return d.value
        });

    if (shouldAddBtn_showAll) {
        // d3.selectAll('tr')
        var _btn_selector = "td:last-child";
        if (btn_selector) {
            _btn_selector = btn_selector;
        }
        var tds = $(_btn_selector);
        for (var i = 0; i < tds.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'btn btn-xs btn-link showUserDetail';
            btn.setAttribute('data-toggle', 'modal');
            btn.setAttribute('data-target', '#myModal');
            btn.textContent = '显示所有';

            var badge = document.createElement('span');
            badge.className = 'label label-default';
            badge.textContent = badgeArray[i].toString();

            // btn.appendChild(badge);

            tds[i].appendChild(badge);
            tds[i].appendChild(btn);
        }

        // $('.showUserDetail').on('click', generateUserData(this));
        $('.showUserDetail').unbind('click');
        $('.showUserDetail').bind('click', function (who) {
            generateUserData(who, preData, _btn_selector);
        });

    }
}

function generateUserData(who, preData) {
    // 获取触发btn的uid
    var par = who.target.parentElement.parentElement;
    var uid = par.firstChild.textContent;

    var data = {};
    data[uid] = preData[uid];

    // 设置modal标题
    $('#myModalLabel').text('用户' + uid + '详情');

    // console.log(TestData);
    // RecResult tab

    var tbody;
    // 获取active tab
    var activeTab = $('.nav-tabs li[class="active"] a').text();
    switch (activeTab) {
        case '推荐结果':
            tbody = initTable("#userDetail", undefined, true);
            fillBody(tbody, data, TestData, false);
            break;
        default :
            tbody = initTable("#userDetail", ["用户ID", "商品ID", "用户评分"], true);
            fillBody(tbody, data, undefined, false);
            break;
    }

    // console.log(data);
}