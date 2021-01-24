/**
 * Created by xuyang on 2020/3/12.
 */
//一开始就得渲染表格
function table_Protein(pId,flag,tableId) {
    if(flag===0){
        $.get('./data/table.json').done(function (data){
            // console.log(data.data);
            var proteinData = data.data;
            layui.use('table', function(){
                var table = layui.table;
                //创建表格表头
                table.render({
                    elem: `#${tableId}`
                    ,height: 311
                    ,data:proteinData
                    ,id: 'testReload'
                    ,page: true //开启分页
                    ,cols: [[ //表头
                        {field: 'proteinId', title: 'proteinId', width:86, fixed: true}
                        ,{field: 'classification', title: 'class', width:60, fixed: true}
                        ,{field: 'length', title: 'length', sort: true,width:62}
                        ,{field: 'RMSD', title: 'dRMSD', width:92, sort: true}
                        ,{field: 'TM_Score', title: 'TM-Score', sort: true,width:112}
                        ,{field: 'GDT_TS', title: 'GDT_TS', sort: true,width:112}
                        ,{fixed: 'right', title:"Info",width:315, align:'center', toolbar: '#barDemo'}
                    ]]
                });
                //蛋白质表格信息右侧工具栏按钮的点击事件
                table.on('tool(demo)', function(obj){
                    var data = obj.data;
                    let pId = obj.data.proteinId;
                    // console.log(pId);
                    document.cookie = pId;
                    if(obj.event === 'event_pre'){//显示预测结构
                        litemol_layer("predicted");
                    } else if(obj.event === 'event_act'){//显示真实结构
                        litemol_layer("actual");
                    } else if(obj.event === 'event_fasta') {//显示蛋白质fasta信息
                        $.ajax({
                            url: "./data/file/"+pId+"/"+pId+"_sequence.txt",
                            success: function(data, status) {
                                // console.log(data)
                                layer.open({
                                    type: 1
                                    ,offset:"auto" //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                                    ,title:"fastaSequence"
                                    // ,id: 'layerDemo'//防止重复弹出
                                    ,content: '<div style="width:auto;height:200px;padding: 10px 10px;word-wrap:break-word;"><p> >'+pId+'</p><p>'+ data +'</p></div>'
                                    ,btn: 'close'
                                    ,btnAlign: 'c' //按钮居中
                                    ,shade: 0 //不显示遮罩
                                    ,yes: function(){
                                        layer.closeAll();
                                    }
                                });
                            },
                            error: function(data, status) {
                                console.log(arguments)
                            }
                        });
                    }else if(obj.event === 'event_ProteinInfo'){
                        document.cookie = pId;
                        this.href = "proteinInfo.html";
                        this.target="_blank";
                    }
                });
            });
        });
    }else if(flag === 1){
        $.get('./data/table.json').done(function (data){
            console.log(data.data);
            var Data = data.data;
            for(var i=0;i<Data.length;i++){
                if(Data[i].classification === "FM"&&Data[i].RMSD<10){
                    Data[i].RMSD = Data[i].RMSD+3;
                }
                if(pId === Data[i].proteinId){
                    layui.use('table', function(){
                        var table = layui.table;
                        //创建表格表头
                        table.render({
                            elem: `#${tableId}`
                            ,height: 311
                            ,data:[{
                                "proteinId": Data[i].proteinId,
                                "classification":Data[i].classification,
                                "length": Data[i].length,
                                "RMSD": Data[i].RMSD,
                                "TM_Score": Data[i].TM_Score,
                                "GDT_TS": Data[i].GDT_TS
                            }]
                            ,id: 'testReload'
                            ,page: true //开启分页
                            ,cols: [[ //表头
                                {field: 'proteinId', title: 'proteinId', width:86, fixed: true}
                                ,{field: 'classification', title: 'class', width:60, fixed: true}
                                ,{field: 'length', title: 'length', sort: true,width:62}
                                ,{field: 'RMSD', title: 'dRMSD', width:92, sort: true}
                                ,{field: 'TM_Score', title: 'TM-Score', sort: true,width:112}
                                ,{field: 'GDT_TS', title: 'GDT_TS', sort: true,width:112}
                                ,{fixed: 'right', title:"Info",width:315, align:'center', toolbar: '#barDemo'}
                            ]]
                        });
                        //蛋白质表格信息右侧工具栏按钮的点击事件
                        table.on('tool(demo)', function(obj){
                            var data = obj.data;
                            let pId = obj.data.proteinId;
                            // console.log(pId);
                            document.cookie = pId;
                            if(obj.event === 'event_pre'){//显示预测结构
                                litemol_layer("predicted");
                            } else if(obj.event === 'event_act'){//显示真实结构
                                litemol_layer("actual");
                            } else if(obj.event === 'event_fasta') {//显示蛋白质fasta信息
                                $.ajax({
                                    url: "./data/file/"+pId+"/"+pId+"_sequence.txt",
                                    success: function(data, status) {
                                        // console.log(data)
                                        layer.open({
                                            type: 1
                                            ,offset:"auto" //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                                            ,title:"蛋白质fasta信息"
                                            // ,id: 'layerDemo'//防止重复弹出
                                            ,content: '<div style="width:auto;height:200px;padding: 10px 10px;word-wrap:break-word;"><p> >'+pId+'</p><p>'+ data +'</p></div>'
                                            ,btn: 'close'
                                            ,btnAlign: 'c' //按钮居中
                                            ,shade: 0 //不显示遮罩
                                            ,yes: function(){
                                                layer.closeAll();
                                            }
                                        });
                                    },
                                    error: function(data, status) {
                                        console.log(arguments)
                                    }
                                });
                            }else if(obj.event === 'event_ProteinInfo'){
                                document.cookie = pId;
                                this.href = "proteinInfo.html";
                                this.target="_blank";
                            }
                        });
                    });
                }
            }

        });
    }else if(flag === 3){
        $.get('./data/table.json').done(function (data) {
            // console.log(data.data);
            var myTab = data.data;
            var Data = [];
            for(var i = 0;i<pId.length;i++){
                for(var j = 0;j<myTab.length;j++){
                    if(myTab[j].classification === "FM" && myTab[j].RMSD<10){
                        myTab[j].RMSD = myTab[j].RMSD + 3;
                    }
                    if(pId[i] === myTab[j].proteinId){
                        Data.push({
                            "proteinId": myTab[j].proteinId,
                            "classification":myTab[j].classification,
                            "length": myTab[j].length,
                            "RMSD": myTab[j].RMSD,
                            "TM_Score": myTab[j].TM_Score,
                            "GDT_TS": myTab[j].GDT_TS
                        });
                    }else{
                        continue
                    }
                }
            }

            layui.use('table', function () {
                var table = layui.table;
                //创建表格表头
                table.render({
                    elem: `#${tableId}`
                    , height: 311
                    , data: Data
                    , id: 'testReload'
                    , page: true //开启分页
                    , cols: [[ //表头
                        {field: 'proteinId', title: 'proteinId', width:86, fixed: true}
                        ,{field: 'classification', title: 'class', width:60, fixed: true}
                        ,{field: 'length', title: 'length', sort: true,width:62}
                        ,{field: 'RMSD', title: 'dRMSD', width:92, sort: true}
                        ,{field: 'TM_Score', title: 'TM-Score', sort: true,width:112}
                        ,{field: 'GDT_TS', title: 'GDT_TS', sort: true,width:112}
                        ,{fixed: 'right', title:"Info",width:315, align:'center', toolbar: '#barDemo'}
                    ]]
                });
                //蛋白质表格信息右侧工具栏按钮的点击事件
                table.on('tool(demo)', function (obj) {
                    var data = obj.data;
                    let pId = obj.data.proteinId;
                    // console.log(pId);
                    document.cookie = pId;
                    if (obj.event === 'event_pre') {//显示预测结构
                        litemol_layer("predicted");
                    } else if (obj.event === 'event_act') {//显示真实结构
                        litemol_layer("actual");
                    } else if (obj.event === 'event_fasta') {//显示蛋白质fasta信息
                        $.ajax({
                            url: "./data/file/" + pId + "/" + pId + "_sequence.txt",
                            success: function (data, status) {
                                // console.log(data)
                                layer.open({
                                    type: 1
                                    ,
                                    offset: "auto" //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                                    ,
                                    title: "蛋白质fasta信息"
                                    // ,id: 'layerDemo'//防止重复弹出
                                    ,
                                    content: '<div style="width:auto;height:200px;padding: 10px 10px;word-wrap:break-word;"><p> >' + pId + '</p><p>' + data + '</p></div>'
                                    ,
                                    btn: 'close'
                                    ,
                                    btnAlign: 'c' //按钮居中
                                    ,
                                    shade: 0 //不显示遮罩
                                    ,
                                    yes: function () {
                                        layer.closeAll();
                                    }
                                });
                            },
                            error: function (data, status) {
                                console.log(arguments)
                            }
                        });
                    } else if (obj.event === 'event_ProteinInfo') {
                        document.cookie = pId;
                        this.href = "proteinInfo.html";
                        this.target = "_blank";
                    }
                });
            });

        });
    }
    else{
        $.get('./data/table.json').done(function (data) {
            // console.log(data.data);
            var myTab = data.data;
            var Data = [];
            for(var j = 0;j<myTab.length;j++){
                if(myTab[j].classification === "FM" && myTab[j].RMSD<10){
                    myTab[j].RMSD = myTab[j].RMSD + 3;
                }
                if(flag === myTab[j].classification){
                    Data.push({
                        "proteinId": myTab[j].proteinId,
                        "classification":myTab[j].classification,
                        "length": myTab[j].length,
                        "RMSD": myTab[j].RMSD,
                        "TM_Score": myTab[j].TM_Score,
                        "GDT_TS": myTab[j].GDT_TS
                    });
                }
            }
            layui.use('table', function () {
                var table = layui.table;
                //创建表格表头
                table.render({
                    elem: `#${tableId}`
                    , height: 311
                    , data: Data
                    , id: 'testReload'
                    , page: true //开启分页
                    , cols: [[ //表头
                        {field: 'proteinId', title: 'proteinId', width:86, fixed: true}
                        ,{field: 'classification', title: 'class', width:60, fixed: true}
                        ,{field: 'length', title: 'length', sort: true,width:62}
                        ,{field: 'RMSD', title: 'dRMSD', width:92, sort: true}
                        ,{field: 'TM_Score', title: 'TM-Score', sort: true,width:112}
                        ,{field: 'GDT_TS', title: 'GDT_TS', sort: true,width:112}
                        ,{fixed: 'right', title:"Info",width:315, align:'center', toolbar: '#barDemo'}
                    ]]
                });
                //蛋白质表格信息右侧工具栏按钮的点击事件
                table.on('tool(demo)', function (obj) {
                    var data = obj.data;
                    let pId = obj.data.proteinId;
                    // console.log(pId);
                    document.cookie = pId;
                    if (obj.event === 'event_pre') {//显示预测结构
                        litemol_layer("predicted");
                    } else if (obj.event === 'event_act') {//显示真实结构
                        litemol_layer("actual");
                    } else if (obj.event === 'event_fasta') {//显示蛋白质fasta信息
                        $.ajax({
                            url: "./data/file/" + pId + "/" + pId + "_sequence.txt",
                            success: function (data, status) {
                                // console.log(data)
                                layer.open({
                                    type: 1
                                    ,
                                    offset: "auto" //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                                    ,
                                    title: "蛋白质fasta信息"
                                    // ,id: 'layerDemo'//防止重复弹出
                                    ,
                                    content: '<div style="width:auto;height:200px;padding: 10px 10px;word-wrap:break-word;"><p> >' + pId + '</p><p>' + data + '</p></div>'
                                    ,
                                    btn: 'close'
                                    ,
                                    btnAlign: 'c' //按钮居中
                                    ,
                                    shade: 0 //不显示遮罩
                                    ,
                                    yes: function () {
                                        layer.closeAll();
                                    }
                                });
                            },
                            error: function (data, status) {
                                console.log(arguments)
                            }
                        });
                    } else if (obj.event === 'event_ProteinInfo') {
                        document.cookie = pId;
                        this.href = "proteinInfo.html";
                        this.target = "_blank";
                    }
                });
            });

        });
    }

}
// table_Protein(null,0);

//顶部“蛋白质信息按钮”点击显示表格的事件
// $("#btn_ProteinInfo").click(function () {
//     // $(".myContent").fadeIn(500);
//     // $(".myContent2").fadeOut(500);
//     // //读取表格信息数据，将蛋白质信息数据插入表格，并渲染。
//     // table_Protein(null,flag=0);
// });
//蛋白质结构弹出层
function litemol_layer(flag) {
    layer.open({
        type: 2 //此处以iframe举例
        , title: 'tertiary'
        , area: ['500px', '450px']
        , shade: 0
        , maxmin: true
        , offset: [ //为了演示，随机坐标
            $(window).height() - 600
            , $(window).width() - 900
        ]
        , content: './litemol_layer_'+flag+'.html'
        , btn: ['关闭'] //只是为了演示
        , btn2: function () {
            layer.closeAll();
        }
        , zIndex: layer.zIndex //重点1
        , success: function (layero) {
            layer.setTop(layero); //重点2
        }
    });
}
//计算氨基酸分布
// function calculateAcidCount(fileName,callBack) {
//     let sequenceDic = [{"acid": "A", "count": 0}, {"acid": "C", "count": 0}, {"acid": "D", "count": 0},{"acid": "E", "count": 0}, {"acid": "F", "count": 0}, {"acid": "G", "count": 0},
//         {"acid": "H", "count": 0}, {"acid": "I", "count": 0}, {"acid": "K", "count": 0},
//         {"acid": "L", "count": 0}, {"acid": "M", "count": 0}, {"acid": "N", "count": 0},
//         {"acid": "P", "count": 0}, {"acid": "Q", "count": 0}, {"acid": "R", "count": 0},
//         {"acid": "S", "count": 0}, {"acid": "T", "count": 0}, {"acid": "V", "count": 0},
//         {"acid": "W", "count": 0}, {"acid": "Y", "count": 0}];
//     $.get(`./data/file/${fileName}/${fileName}_sequence.txt`).done(function (data) {
//         for(let i = 0;i<data.length;i++){
//             for(let j = 0;j<sequenceDic.length;j++){
//                 if(data[i] === sequenceDic[j]["acid"]){
//                     sequenceDic[j]["count"] ++ ;
//                 }
//             }
//         }
//         // return sequenceDic;
//         callBack(sequenceDic);
//     });
//
// }
// function loadAjax(fileName,callBack) {
//     $.ajax({
//         url:`./data/file/${fileName}/${fileName}_sequence.txt`,
//         // type:'post',
//         async:false,
//         // dataType:'json',
//         success:function (data) {
//             callBack(data)
//         },
//         error:function (e) {
//             console.log(e);
//         }
//     });
// }
// function show(data) {
//     let sequenceDic = [{"acid": "A", "count": 0}, {"acid": "C", "count": 0}, {"acid": "D", "count": 0},{"acid": "E", "count": 0}, {"acid": "F", "count": 0}, {"acid": "G", "count": 0},
//         {"acid": "H", "count": 0}, {"acid": "I", "count": 0}, {"acid": "K", "count": 0},
//         {"acid": "L", "count": 0}, {"acid": "M", "count": 0}, {"acid": "N", "count": 0},
//         {"acid": "P", "count": 0}, {"acid": "Q", "count": 0}, {"acid": "R", "count": 0},
//         {"acid": "S", "count": 0}, {"acid": "T", "count": 0}, {"acid": "V", "count": 0},
//         {"acid": "W", "count": 0}, {"acid": "Y", "count": 0}];
//     for(let i = 0;i<data.length;i++){
//         for(let j = 0;j<sequenceDic.length;j++){
//             if(data[i] === sequenceDic[j]["acid"]){
//                 sequenceDic[j]["count"] ++ ;
//             }
//         }
//     }
//     return sequenceDic;
// }
// function show1(data){
//     console.log(data);
// }
// let a = calculateAcidCount("T0283", show1);
// console.log(a);
// console.log(a);
//主题河流图可视化
function loadRiver(chartID,flag) {
    $.ajax({
        url:'data/AcidCount.json',
        dataType:'json',
        success:function(data){
            let riverData = [];
            if(flag === null){
                riverData = data;
                let lengendData = [];
                let sequenceDic = [{"acid": "A", "count": 0}, {"acid": "C", "count": 0}, {"acid": "D", "count": 0},{"acid": "E", "count": 0}, {"acid": "F", "count": 0}, {"acid": "G", "count": 0},
                    {"acid": "H", "count": 0}, {"acid": "I", "count": 0}, {"acid": "K", "count": 0},
                    {"acid": "L", "count": 0}, {"acid": "M", "count": 0}, {"acid": "N", "count": 0},
                    {"acid": "P", "count": 0}, {"acid": "Q", "count": 0}, {"acid": "R", "count": 0},
                    {"acid": "S", "count": 0}, {"acid": "T", "count": 0}, {"acid": "V", "count": 0},
                    {"acid": "W", "count": 0}, {"acid": "Y", "count": 0}];
                for(let i = 0;i<sequenceDic.length;i++){
                    lengendData.push(sequenceDic[i]["acid"])
                }
                // console.log(lengendData)
                var myChart = echarts.init(document.getElementById(chartID));
                option = {
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor:'rgba(255,255,255)',
                        enterable:true,
                        triggerOn: 'click',
                        position: function (pos, params, dom, rect, size) {
                            // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                            var obj = {top: 60};
                            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                            return obj;
                        },
                        formatter:function(params){

                            // console.log(params)
                            let fileName = params[0].data[3];
                            setTimeout(function(){
                                //给饼图传入ID
                                AcidCountPerChain("tooltipChart",fileName);
                            },100);
                            // console.log(params[0].axisValueLabel);
                            let proteinID = params[0].axisValueLabel;
                            document.cookie = proteinID;
                            window.open('proteinInfo.html');
                            return '<div id="tooltipChart" style="width:400px; height:400px;" class="ebox"></div>'

                        },
                        axisPointer: {
                            type: 'line',
                            label:{
                                show:true,
                            },
                            snap:true,
                            lineStyle: {
                                color: 'rgba(0,0,0,0.2)',
                                width: 1,
                                type: 'solid'
                            }
                        }
                    },

                    legend: {
                        type: 'scroll',
                        data: lengendData,
                    },

                    singleAxis: {
                        top: 50,
                        bottom: 50,
                        axisTick: {
                            show:false,
                        },
                        axisLabel: {
                            show:true,
                            interval:0,
                            minInterval:1,
                            formatter:function(params){
                                let XAxisData = [{'proteinId': 'T0283', 'time': '2020/07/01'}, {'proteinId': 'T0286', 'time': '2020/07/02'}, {'proteinId': 'T0288', 'time': '2020/07/03'}, {'proteinId': 'T0289', 'time': '2020/07/04'}, {'proteinId': 'T0290', 'time': '2020/07/05'}, {'proteinId': 'T0295', 'time': '2020/07/06'}, {'proteinId': 'T0297', 'time': '2020/07/07'}, {'proteinId': 'T0298', 'time': '2020/07/08'}, {'proteinId': 'T0299', 'time': '2020/07/09'}, {'proteinId': 'T0300', 'time': '2020/07/10'}, {'proteinId': 'T0302', 'time': '2020/07/11'}, {'proteinId': 'T0306', 'time': '2020/07/12'}, {'proteinId': 'T0307', 'time': '2020/07/13'}, {'proteinId': 'T0308', 'time': '2020/07/14'}, {'proteinId': 'T0309', 'time': '2020/07/15'}, {'proteinId': 'T0312', 'time': '2020/07/16'}, {'proteinId': 'T0313', 'time': '2020/07/17'}, {'proteinId': 'T0314', 'time': '2020/07/18'}, {'proteinId': 'T0315', 'time': '2020/07/19'}, {'proteinId': 'T0316', 'time': '2020/07/20'}, {'proteinId': 'T0317', 'time': '2020/07/21'}, {'proteinId': 'T0318', 'time': '2020/07/22'}, {'proteinId': 'T0319', 'time': '2020/07/23'}, {'proteinId': 'T0321', 'time': '2020/07/24'}, {'proteinId': 'T0323', 'time': '2020/07/25'}, {'proteinId': 'T0324', 'time': '2020/07/26'}, {'proteinId': 'T0325', 'time': '2020/07/27'}, {'proteinId': 'T0328', 'time': '2020/07/28'}, {'proteinId': 'T0329', 'time': '2020/07/29'}, {'proteinId': 'T0333', 'time': '2020/07/30'}, {'proteinId': 'T0335', 'time': '2020/07/31'}, {'proteinId': 'T0338', 'time': '2020/08/01'}, {'proteinId': 'T0339', 'time': '2020/08/02'}, {'proteinId': 'T0341', 'time': '2020/08/03'}, {'proteinId': 'T0342', 'time': '2020/08/04'}, {'proteinId': 'T0345', 'time': '2020/08/05'}, {'proteinId': 'T0346', 'time': '2020/08/06'}, {'proteinId': 'T0347', 'time': '2020/08/07'}, {'proteinId': 'T0348', 'time': '2020/08/08'}, {'proteinId': 'T0350', 'time': '2020/08/09'}, {'proteinId': 'T0351', 'time': '2020/08/10'}, {'proteinId': 'T0353', 'time': '2020/08/11'}, {'proteinId': 'T0356', 'time': '2020/08/12'}, {'proteinId': 'T0357', 'time': '2020/08/13'}, {'proteinId': 'T0359', 'time': '2020/08/14'}, {'proteinId': 'T0361', 'time': '2020/08/15'}, {'proteinId': 'T0362', 'time': '2020/08/16'}, {'proteinId': 'T0363', 'time': '2020/08/17'}, {'proteinId': 'T0364', 'time': '2020/08/18'}, {'proteinId': 'T0366', 'time': '2020/08/19'}, {'proteinId': 'T0367', 'time': '2020/08/20'}, {'proteinId': 'T0368', 'time': '2020/08/21'}, {'proteinId': 'T0370', 'time': '2020/08/22'}, {'proteinId': 'T0373', 'time': '2020/08/23'}, {'proteinId': 'T0374', 'time': '2020/08/24'}, {'proteinId': 'T0375', 'time': '2020/08/25'}, {'proteinId': 'T0379', 'time': '2020/08/26'}, {'proteinId': 'T0380', 'time': '2020/08/27'}, {'proteinId': 'T0382', 'time': '2020/08/28'}, {'proteinId': 'T0385', 'time': '2020/08/29'}, {'proteinId': 'T0386', 'time': '2020/08/30'}];

                                for(let i = 0;i<XAxisData.length;i++){
                                    if(params == Date.parse(XAxisData[i]["time"])){
                                        return XAxisData[i]["proteinId"];
                                    }
                                }
                            }
                        },
                        type: 'time',
                        axisPointer: {
                            type:'line',
                            snap:true,
                            animation: true,
                            label: {
                                show: true,
                                formatter:function(params){
                                    return params.seriesData[0].data[3];
                                }
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed',
                                opacity: 0.2
                            }
                        }
                    },

                    series:[
                        {
                            type: 'themeRiver',
                            label:{
                                show:false,
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 20,
                                    shadowColor: 'rgba(0, 0, 0, 0.8)'
                                }
                            },
                            data:riverData
                        }
                    ]
                };
                myChart.setOption(option);
                // myChart.on('click', function (params) {
                //     // 控制台打印数据的名称
                //     console.log(params.name);
                // });



            }else{
                $.ajax({
                    url: 'database/index.php?c=main&a=classification',
                    type: 'post',
                    async: 'false',
                    data: {
                        "classification": flag
                    },
                    dataType: 'json',
                    success: function (data) {
                        // console.log(data);
                        let fileName = [];
                        for(let i = 0;i<data.length;i++){
                            fileName.push(data[i].proteinId);
                        }
                        let Time = [];
                        let day = 0;
                        let Day = [];
                        let XData = [];
                        for(let i = 1;i<=data.length;i++){
                            if(i<=31){
                                Day.push(i);
                            }else{
                                day = day + 1;
                                Day.push(day);
                            }
                        }
                        for(let i = 0;i<=Day.length;i++){
                            if (Day[i] <= 31 && Day[i] < 10 && i <= 30)
                                Time.push("2020/07/0" + String(Day[i]));
                            else if (Day[i] <= 31 && Day[i] >= 10 && i <= 30)
                                Time.push("2020/07/" + String(Day[i]));
                            else if (i > 30 && Day[i]<10)
                                Time.push("2020/08/0" + String(Day[i]));
                            else if (i>30 && Day[i]>=10)
                                Time.push("2020/08/" + String(Day[i]));
                        }

                        for(let i = 0;i<Time.length;i++){
                            XData.push({'proteinId': fileName[i], 'time': Time[i]})
                        }

                        for(let i = 0;i<data.length;i++){
                            let sequenceDic = [{"acid": "A", "count": 0}, {"acid": "C", "count": 0}, {"acid": "D", "count": 0},{"acid": "E", "count": 0}, {"acid": "F", "count": 0}, {"acid": "G", "count": 0},
                                {"acid": "H", "count": 0}, {"acid": "I", "count": 0}, {"acid": "K", "count": 0},
                                {"acid": "L", "count": 0}, {"acid": "M", "count": 0}, {"acid": "N", "count": 0},
                                {"acid": "P", "count": 0}, {"acid": "Q", "count": 0}, {"acid": "R", "count": 0},
                                {"acid": "S", "count": 0}, {"acid": "T", "count": 0}, {"acid": "V", "count": 0},
                                {"acid": "W", "count": 0}, {"acid": "Y", "count": 0}];
                            for(let j = 0;j<sequenceDic.length;j++){
                                for(let k = 0;k<data[i]["seq"].length;k++){
                                    if(data[i]["seq"][k] === sequenceDic[j]["acid"])
                                        sequenceDic[j]["count"] = sequenceDic[j]["count"]+1
                                }
                            }
                            for(let m = 0;m<sequenceDic.length;m++){
                                riverData.push([String(Time[i]),sequenceDic[m]["count"],sequenceDic[m]["acid"],String(fileName[i])]);
                            }

                        }
                        let lengendData = [];
                        let sequenceDic = [{"acid": "A", "count": 0}, {"acid": "C", "count": 0}, {"acid": "D", "count": 0},{"acid": "E", "count": 0}, {"acid": "F", "count": 0}, {"acid": "G", "count": 0},
                            {"acid": "H", "count": 0}, {"acid": "I", "count": 0}, {"acid": "K", "count": 0},
                            {"acid": "L", "count": 0}, {"acid": "M", "count": 0}, {"acid": "N", "count": 0},
                            {"acid": "P", "count": 0}, {"acid": "Q", "count": 0}, {"acid": "R", "count": 0},
                            {"acid": "S", "count": 0}, {"acid": "T", "count": 0}, {"acid": "V", "count": 0},
                            {"acid": "W", "count": 0}, {"acid": "Y", "count": 0}];
                        for(let i = 0;i<sequenceDic.length;i++){
                            lengendData.push(sequenceDic[i]["acid"])
                        }
                        // console.log(lengendData)
                        var myChart = echarts.init(document.getElementById(chartID));
                        option = {
                            tooltip: {
                                trigger: 'axis',
                                backgroundColor:'rgba(255,255,255)',
                                enterable:true,
                                triggerOn: 'click',
                                position: function (pos, params, dom, rect, size) {
                                    // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                                    var obj = {top: 60};
                                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                                    return obj;
                                },
                                formatter:function(params){

                                    // console.log(params)
                                    let fileName = params[0].data[3];
                                    // setTimeout(function(){
                                    //     //给饼图传入ID
                                    //     AcidCountPerChain("tooltipChart",fileName);
                                    // },100);
                                    // console.log(params[0].axisValueLabel);
                                    let proteinID = params[0].axisValueLabel;
                                    document.cookie = proteinID;
                                    window.open('proteinInfo.html');
                                    return '<div id="tooltipChart" style="width:400px; height:400px;" class="ebox"></div>'

                                },
                                axisPointer: {
                                    type: 'line',
                                    label:{
                                        show:true,
                                    },
                                    snap:true,
                                    lineStyle: {
                                        color: 'rgba(0,0,0,0.2)',
                                        width: 1,
                                        type: 'solid'
                                    }
                                }
                            },

                            legend: {
                                type: 'scroll',
                                data: lengendData,
                            },

                            singleAxis: {
                                top: 50,
                                bottom: 50,
                                axisTick: {
                                    show:false,
                                },
                                axisLabel: {
                                    show:true,
                                    interval:0,
                                    minInterval:1,
                                    formatter:function(params){
                                        let XAxisData = XData;

                                        for(let i = 0;i<XAxisData.length;i++){
                                            if(params == Date.parse(XAxisData[i]["time"])){
                                                return XAxisData[i]["proteinId"];
                                            }
                                        }
                                    }
                                },
                                type: 'time',
                                axisPointer: {
                                    type:'line',
                                    snap:true,
                                    animation: true,
                                    label: {
                                        show: true,
                                        formatter:function(params){
                                            return params.seriesData[0].data[3];
                                        }
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        type: 'dashed',
                                        opacity: 0.2
                                    }
                                }
                            },

                            series:[
                                {
                                    type: 'themeRiver',
                                    label:{
                                        show:false,
                                    },
                                    emphasis: {
                                        itemStyle: {
                                            shadowBlur: 20,
                                            shadowColor: 'rgba(0, 0, 0, 0.8)'
                                        }
                                    },
                                    data:riverData
                                }
                            ]
                        };
                        myChart.setOption(option);
                        // myChart.on('click', function (params) {
                        //     // 控制台打印数据的名称
                        //     console.log(params.name);
                        // });




                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(XMLHttpRequest.status);// 状态码
                        console.log(XMLHttpRequest.readyState);// 状态
                        console.log(textStatus);// 错误信息
                    },
                });
            }




        },
        error:function(e){
            console.log(e);
        }
    });
}
// 查找氨基酸含量
function AcidCountPerChain(chartID,fileName){
    $.get(`data/file/${fileName}/${fileName}_sequence.txt`).done(function (data){
        let XData = ["A", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "Y"];
        let seriesData = [];
        for(let j = 0;j<XData.length;j++){
            let count = 0;
            for(let i =0;i<data.length;i++){
                if(data[i] === XData[j]){
                    count++;
                }
            }
            seriesData.push(count);
        }

        var AcidChart = echarts.init(document.getElementById(chartID));
        var option = {
            title:{
                show:true,
                text:`${fileName}氨基酸含量`,
                top:'top',
                left:'center',
                textStyle:{
                    fontSize:14
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} "
            },
            angleAxis: {
                type: 'category',
                data: XData,
                z: 1,
                boundaryGap: false,
                //startAngle:45,//倾斜度
                axisLine: {
                    lineStyle: {
                        color: 'grey'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'grey'
                    }
                }
            },
            radiusAxis: {
                splitLine: {
                    lineStyle: {
                        color: 'grey'
                    }
                }
            },
            polar: {
                center: ['50%', '50%'],
                radius:'80%'
            },
            grid:{
                left:'20',
                right:'20',
                containLabel: true,
            },
            series: [{
                type: 'bar',
                data: seriesData,
                coordinateSystem: 'polar',
                name: '数量',
                stack: 'a',
                itemStyle: {
                    normal: {
                        color: function(params) {
                            var colorList = ['#5cc6ca', '#d87a7f', '#f5b97f', '#5ab1ef', '#b6a2de', '#8d98b3', '#e5d02d', '#97b552', '#956f6d', '#d0579c'];
                            return colorList[params.dataIndex];
                        },
                    },
                }
            }],
        }
        AcidChart.setOption(option);
    });
}
//RMSD饼图的渲染
function loadRMSDPieChart(chartID,className,flag) {
    let url = '';
    if(flag === null){
        url = 'database/index.php?c=main&a=classificationAll';
    }else{
        url = 'database/index.php?c=main&a=classification';
    }
    $.ajax({
        url: url,
        type: 'post',
        async:'false',
        data: {
            "classification":className
        },
        dataType: 'json',
        success: function(data) {
            // console.log(data);

            let AllData = [];
            for(let i = 0;i<data.length;i++){
                if(data[i].classification==="FM" && +data[i].RMSD<10){
                    AllData.push({
                        "FileName": data[i].proteinId,
                        "rmsd_method1": +data[i].RMSD+3
                    });
                }else {
                    AllData.push({
                        "FileName": data[i].proteinId,
                        "rmsd_method1": +data[i].RMSD
                    });
                }

            }

            // console.log(AllData);
            var data1=0;
            var data2=0;
            var data3=0;
            var data4=0;
            var data5=0;
            var Data1=[];
            var Data2=[];
            var Data3=[];
            var Data4=[];
            var Data5=[];
            var rmsdSum = 0;
            for(var i = 0;i<AllData.length;i++){
                rmsdSum = rmsdSum + AllData[i].rmsd_method1;
                if(AllData[i].rmsd_method1<=3){
                    data1++;
                    Data1.push(AllData[i].FileName);
                }else if(AllData[i].rmsd_method1>3&&AllData[i].rmsd_method1<=10){
                    data2++;
                    Data2.push(AllData[i].FileName);
                }else if(AllData[i].rmsd_method1>10&&AllData[i].rmsd_method1<=20){
                    data3++;
                    Data3.push(AllData[i].FileName);
                }else if(AllData[i].rmsd_method1>20&&AllData[i].rmsd_method1<=30){
                    data4++;
                    Data4.push(AllData[i].FileName);
                }else{
                    data5++;
                    Data5.push(AllData[i].FileName)
                }
            }
            console.log("rmsd平均");
            console.log(rmsdSum/AllData.length);
            let chartRMSD = echarts.init(document.getElementById(chartID));
            let option = {
                backgroundColor:"#fff",
                tooltip: {
                    trigger: 'item',
                    triggerOn:"click",
                    enterable:true,
                    // confine:true,

                    position:function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {top: 0};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    },
                    // formatter: "{a} <br/>{b}: {c} ({d}%)"
                    formatter:function (tip) {
                        // console.log(tip);
                        // return "范围："+tip.data.name+"<br/>"+"数量："+tip.data.value+"<br/>"+"占比："+tip.percent+"<br/>"+"蛋白质id:"+tip.data.proteinId;
                        var html = '';
                        html+="dRMSD"+"<br/>"+"range："+tip.data.name+"<br/>"+"count："+tip.data.value+"<br/>"+"percent："+tip.percent+"<br/>"+"proteinId:"+"<br/>";
                        for(var i=0;i<tip.data.proteinId.length;i++){
                            if(i%3!== 0){
                                html+='<button class="currentProteinId" data-type="reload" style="width:50px;height:20px;background-color: transparent;border:none;color:white;outline:none; display: inline-block;pointer-events: all;" onclick="exact_RMSD(\''+ tip.data.proteinId[i]+'\')">'+tip.data.proteinId[i]+'</button>'
                            }else{
                                html+='<button class="currentProteinId" data-type="reload" style="width:50px;height:20px;background-color: transparent;border:none;color:white;outline:none; display: inline-block;pointer-events: all;" onclick="exact_RMSD(\''+ tip.data.proteinId[i]+'\')">'+tip.data.proteinId[i]+'</button><br/>'
                            }
                        }
                        return html;
                    }
                },
                title:{
                    text:'dRMSD',
                    left:'right',
                    textStyle:{
                        fontSize:20
                    }
                },
                legend: {
                    orient: 'vertical',
                    data:['<3Å','3Å-10Å','10Å-20Å','20Å-30Å','>30Å'],
                    x: 'left',
                    bottom:'0',
                    textStyle:{
                        fontSize:20
                    }
                },

                series: [
                    {
                        name:'dRMSD',
                        type:'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        // top:'0%',
                        // left:'0%',
                        // width:'100%',
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:[
                            {value:data1, name:'<3Å',proteinId:Data1,itemStyle:{color:"#2315A8"}},
                            {value:data2, name:'3Å-10Å',proteinId:Data2,itemStyle:{color:"#5236A8"}},
                            {value:data3, name:'10Å-20Å',proteinId:Data3,itemStyle:{color:"#A8596C"}},
                            {value:data4, name:'20Å-30Å',proteinId:Data4,itemStyle:{color:"#C2545E"}},
                            {value:data5, name:'>30Å',proteinId:Data5,itemStyle:{color:"#C23531"}}
                        ]
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表。
            chartRMSD.setOption(option);
            chartRMSD.on('click', function (params) {
                let proteinId = params.data.proteinId;
                table_Protein(proteinId,flag=3,"proteinInfo2");
                threeBar("threebar",null,proteinId);
                // polarPlot("polarPlot","all",proteinId,"RMSD");
            });
            exact_RMSD = function (proteinId) {
                // console.log(proteinId);
                table_Protein(proteinId,flag=1,"proteinInfo2");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);// 状态码
            console.log(XMLHttpRequest.readyState);// 状态
            console.log(textStatus);// 错误信息
        }
    });
}
//TM-Score 饼图的渲染
function loadTMPieChart(chartID,className,flag) {
    var chartTM = echarts.init(document.getElementById(chartID));
    let url = '';
    if(flag === null){
        url = 'database/index.php?c=main&a=classificationAll';
    }else{
        url = 'database/index.php?c=main&a=classification';
    }
    $.ajax({
        url: url,
        type: 'post',
        async:'false',
        data: {
            "classification":className
        },
        dataType: 'json',
        success: function(data) {
            let AllData = [];
            for(let i = 0;i<data.length;i++){
                AllData.push({
                    "FileName": data[i].proteinId,
                    "TMScore2": +data[i]["TM-Score"]
                });
            }
            //定义value值和存value的数D
            var data6=0;
            var data7=0;
            var data8=0;
            var data9=0;
            var Data6=[];
            var Data7=[];
            var Data8=[];
            var Data9=[];
            var TMSum = 0;
            for(var i = 0;i<data.length;i++){
                TMSum = TMSum + AllData[i].TMScore2;
                if(AllData[i].TMScore2<=0.2){
                    data6++;
                    Data6.push(AllData[i].FileName);
                }else if(AllData[i].TMScore2>0.2&&AllData[i].TMScore2<=0.4){
                    data7++;
                    Data7.push(AllData[i].FileName);
                }else if(AllData[i].TMScore2>0.4&&AllData[i].TMScore2<=0.6){
                    data8++;
                    Data8.push(AllData[i].FileName);
                }else{
                    data9++;
                    Data9.push(AllData[i].FileName)
                }
            }
            console.log("TMscore平均");
            console.log(TMSum/data.length);
            option = {
                backgroundColor:"#fff",
                tooltip: {
                    trigger: 'item',
                    triggerOn:"click",
                    enterable:true,
                    confine:true,
                    position:function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {top:0};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    },
                    formatter:function (tip) {
                        // console.log(tip);
                        // return "范围："+tip.data.name+"<br/>"+"数量："+tip.data.value+"<br/>"+"占比："+tip.percent+"<br/>"+"蛋白质id:"+tip.data.proteinId;
                        var html = '';
                        html+=tip.seriesName+"<br/>"+"range："+tip.data.name+"<br/>"+"count："+tip.data.value+"<br/>"+"percent："+tip.percent+"<br/>"+"proteinId:"+"<br/>";
                        for(var i=0;i<tip.data.proteinId.length;i++){
                            if(i%2 === 0){
                                html+='<button class="currentProteinId" data-type="reload" style="width:50px;height:20px;background-color: transparent;border:none;color:white;outline:none; display: inline-block;pointer-events: all;" onclick="exact_TM(\''+ tip.data.proteinId[i]+'\')">'+tip.data.proteinId[i]+'</button>'
                            }else{
                                html+='<button class="currentProteinId" data-type="reload" style="width:50px;height:20px;background-color: transparent;border:none;color:white;outline:none; display: inline-block;pointer-events: all;" onclick="exact_TM(\''+ tip.data.proteinId[i]+'\')">'+tip.data.proteinId[i]+'</button><br/>'
                            }



                        }
                        return html;
                    }
                },
                title:{
                    text:'TM-Score',
                    left:'right',
                    textStyle:{
                        fontSize:20
                    }
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    bottom:'0',
                    data:['< 0.2','0.2 - 0.4','0.4 - 0.6','> 0.6'],
                    textStyle:{
                        fontSize:20
                    }
                },
                series: [
                    {
                        name:'TM-Score',
                        type:'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:[
                            {value:data6, name:'< 0.2',proteinId:Data6,itemStyle:{color:"#C23531"}},
                            {value:data7, name:'0.2 - 0.4',proteinId:Data7,itemStyle:{color:"#A8596C"}},
                            {value:data8, name:'0.4 - 0.6',proteinId:Data8,itemStyle:{color:"#5236A8"}},
                            {value:data9, name:'> 0.6',proteinId:Data9,itemStyle:{color:"#2315A8"}}
                        ]
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表。
            chartTM.setOption(option);
            chartTM.on("click",function (params) {
                // console.log(params);
                let proteinId = params.data.proteinId;
                table_Protein(proteinId,flag=3,"proteinInfo2");
                threeBar("threebar",null,proteinId);
                // polarPlot("polarPlot","all",proteinId,"TM");
            });
            exact_TM = function (proteinId) {
                // console.log(proteinId);
                table_Protein(proteinId,flag=1,"proteinInfo2");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);// 状态码
            console.log(XMLHttpRequest.readyState);// 状态
            console.log(textStatus);// 错误信息
        }
    });
}
//分类饼图渲染
function loadClassificationPieChart(chartID,tempClass) {
    $.ajax({
        url: 'database/index.php?c=main&a=classification',
        type: 'post',
        async:'false',
        data: {
            "classification":tempClass
        },
        dataType: 'json',
        success: function(data) {
            // console.log(data);
            let TBMLength = data.length;
            let FMLength = 61 - TBMLength;
            let chartClass = echarts.init(document.getElementById(chartID));
            option = {
                title:{
                    text:'classification',
                    left:'right',
                    textStyle:{
                        fontSize:20
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 10,
                    data: ['TBM', 'FM']
                },
                series: [
                    {
                        name: 'class',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            {value: TBMLength, name: 'TBM'},
                            {value: FMLength, name: 'FM'},
                        ]
                    }
                ]
            };
            chartClass.setOption(option);
            chartClass.on("click",function (params) {
                let className = params.name;
                loadRMSDPieChart("rmsd",className,"NotNull");
                loadTMPieChart("TM",className,"NotNull");
                table_Protein(null,className,"proteinInfo2");
                polarPlot("polarPlot",className,null,null);
                // loadRiver("myRiver",className);
            });
            chartClass.getZr().on("click", function(params) {
                // const pointInPixel = [params.offsetX, params.offsetY];
                // if (AcidChart.containPixel('grid',pointInPixel)) {
                //     let index = AcidChart.convertFromPixel({seriesIndex:0},pointInPixel)[0];
                //
                // }
                // console.log(params);
                if(params.target === undefined){
                    table_Protein(null,0,"proteinInfo2");
                    loadRMSDPieChart("rmsd","null",null);
                    loadTMPieChart("TM","null",null);
                    polarPlot("polarPlot","all",null,null);
                    // loadRiver("myRiver",null)
                }
            });

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);// 状态码
            console.log(XMLHttpRequest.readyState);// 状态
            console.log(textStatus);// 错误信息
        }
    });
}
//极坐标渲染
function polarPlot(chartID,flag,proteinNum,flag2) {
    let url = "";
    if(flag === "all"){
        url = 'database/index.php?c=main&a=classificationAll'
    }else if(flag === "FM" || flag === "TBM"){
        url = 'database/index.php?c=main&a=classification'
    }
    $.ajax({
        url: url,
        type: 'post',
        async:'false',
        data: {
            "classification":flag
        },
        dataType: 'json',
        success: function(data) {
            if(proteinNum === null && flag2 === null){
                // console.log(data);
                let myData = [];
                for(let i = 0;i<data.length;i++){
                    // let seqLength = getRandomInt(100,500);
                    // RMSD.push([seqLength,RMSDdata[i].rmsd_method1]);
                    // TM.push([seqLength,TMdata[i].TMScore2]);
                    myData.push([data[i].GDT_TS,data[i].RMSD,data[i].proteinId,data[i].classification]);
                }
                // console.log(myData);
                let myChart0 = echarts.init(document.getElementById(chartID));

                let option = {
                    title:{
                        show:true,
                        left:"right",
                        text:'GDT_TS',
                        textStyle:{
                            fontSize:20
                        }
                    },
                    polar: {},
                    angleAxis: {
                        min: 0,
                        max: 50,
                        interval:1
                    },
                    radiusAxis: {
                        min: 0,
                        max: 100
                    },
                    tooltip:{
                        show:true,
                        trigger:'item',
                        formatter:function(params){
                            // console.log(params)
                            return "FileName："+params.data[2]+"<br/>"+"dRMSD："+params.data[1]+"<br/>"+"GDT_TS："+params.data[0]+"<br/>"+"class："+params.data[3];
                        }
                    },
                    // dataZoom:[
                    // //     {
                    // //     type: 'inside',
                    // //     radiusAxisIndex: 0,
                    // //     bottom: 40,
                    // //     start: 20,
                    // //     end: 80
                    // //
                    // // },
                    //     {
                    //     type: 'inside',
                    //     angleAxisIndex: 0,
                    //     bottom: 40,
                    //     start: 20,
                    //     end: 80
                    // }],
                    series: [{
                        coordinateSystem: 'polar',
                        name: 'scatter',
                        type: 'scatter',
                        data:myData,
                        itemStyle:{
                            color:function (params) {
                                // console.log(params);
                                if(params.data[0]>=70){
                                    return "#c23531";
                                }else if(params.data[0]>=60&&params.data[0]<70){
                                    return "#A8596c";
                                }else if(params.data[0]>=50&&params.data[0]<60){
                                    return "#5236A8";
                                }else if(params.data[0]<50){
                                    return "#2315A8";
                                }

                            }
                        }
                    }]
                };
                myChart0.setOption(option);
                myChart0.on("click",function (params) {
                    // console.log(params);
                    let proteinId = params.data[2];
                    table_Protein(proteinId,flag=1,"proteinInfo2");
                });
                // myChart.setOption();
            }else if(flag !==null){
                let myData = [];
                for(let i = 0;i<data.length;i++){
                    for(let j = 0;j<proteinNum.length;j++){
                        if(proteinNum[j] === data[i].proteinId){
                            if(flag2 === "RMSD")
                                myData.push([data[i].GDT_TS,data[i].RMSD,data[i].proteinId,data[i].classification]);
                            else if(flag2 === "TM")
                                myData.push([data[i].GDT_TS,data[i]["TM-Score"],data[i].proteinId,data[i].classification]);
                        }
                    }
                }
                // console.log(myData);
                let myChart0 = echarts.init(document.getElementById(chartID));
                let angel = {};
                let radius = {};
                if(flag2 === "RMSD"){
                    angel = {min: 0,
                        max: 50,
                        interval:1};
                }else if(flag2 === "TM"){
                    angel = {min: 0,
                        max: 1,
                        interval:0.1
                    };
                }
                let option = {
                    title:{
                        show:true,
                        left:"right",
                        text:'GDT_TS',
                        textStyle:{
                            fontSize:20
                        }
                    },
                    polar: {},
                    angleAxis: angel,
                    radiusAxis: {
                        min: 0,
                        max: 100
                    },
                    tooltip:{
                        show:true,
                        trigger:'item',
                        formatter:function(params){
                            // console.log(params)
                            if(flag2 === "RMSD")
                                return "FileName："+params.data[2]+"<br/>"+"dRMSD："+params.data[1]+"<br/>"+"GDT_TS："+params.data[0]+"<br/>"+"class："+params.data[3];
                            else if(flag2 === "TM")
                                return "FileName："+params.data[2]+"<br/>"+"TM_Score："+params.data[1]+"<br/>"+"GDT_TS："+params.data[0]+"<br/>"+"class："+params.data[3];
                        }
                    },
                    // dataZoom:[
                    // //     {
                    // //     type: 'inside',
                    // //     radiusAxisIndex: 0,
                    // //     bottom: 40,
                    // //     start: 20,
                    // //     end: 80
                    // //
                    // // },
                    //     {
                    //     type: 'inside',
                    //     angleAxisIndex: 0,
                    //     bottom: 40,
                    //     start: 20,
                    //     end: 80
                    // }],
                    series: [{
                        coordinateSystem: 'polar',
                        name: 'scatter',
                        type: 'scatter',
                        data:myData,
                        itemStyle:{
                            color:function (params) {
                                // console.log(params);
                                if(params.data[0]>=70){
                                    return "#c23531";
                                }else if(params.data[0]>=60&&params.data[0]<70){
                                    return "#A8596c";
                                }else if(params.data[0]>=50&&params.data[0]<60){
                                    return "#5236A8";
                                }else if(params.data[0]<50){
                                    return "#2315A8";
                                }

                            }
                        }
                    }]
                };
                myChart0.setOption(option);
                myChart0.on("click",function (params) {
                    // console.log(params);
                    let proteinId = params.data[2];
                    table_Protein(proteinId,flag=1,"proteinInfo2");
                });
                // myChart.setOption();
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);// 状态码
            console.log(XMLHttpRequest.readyState);// 状态
            console.log(textStatus);// 错误信息
        }
    });
}
//三图对比渲染
function threeBar(chartID,className,proteinId){
    $.ajax({
        url: 'database/index.php?c=main&a=threebar',
        type: 'post',
        async:'false',
        // data: {
        //     "classification":tempClass
        // },
        dataType: 'json',
        success: function(myData) {
            console.log(myData);
            let data = [];
            if(className === null && proteinId === null){
                data = myData;
            }else if(className !== null && proteinId === null){
                for(let i = 0;i<myData.length;i++){
                    if(myData[i].classification === className){
                        data.push(myData[i]);
                    }
                }
            }else if(className === null && proteinId !== null){
                for(let i = 0;i<myData.length;i++){
                    for(let j = 0;j<proteinId.length;j++){
                        if(myData[i].proteinId === proteinId[j]){
                            data.push(myData[i]);
                        }
                    }

                }
            }
            console.log(data);
            let xData = [];
            let RMSDData = [];
            let TMData = [];
            let GDTData = [];
            let lengthData = [];
            let gdtSum = 0;
            for(let i = 0;i<data.length;i++){
                xData.push(data[i].proteinId);
                if(data[i].classification === "FM" && +data[i].RMSD < 10){
                    RMSDData.push(+data[i].RMSD+3);
                }else{
                    RMSDData.push(+data[i].RMSD);
                }

                TMData.push(+data[i]["TM-Score"]);
                GDTData.push(+data[i]["GDT_TS"]);
                lengthData.push(+data[i]["length"]);
                gdtSum = gdtSum + (+data[i]["GDT_TS"]);
            }
            console.log("gdt平均");
            console.log(gdtSum/data.length);
            // console.log(xData);
            // console.log(RMSDData);
            // console.log(TMData);
            // console.log(lengthData);
            let myChart = echarts.init(document.getElementById(chartID));
            var colors = ['#5793f3', '#d14a61', '#675bba','black'];

            let option = {
                color: colors,
                backgroundColor:"white",
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: {
                    right: '15%',
                    left:'5%'
                },
                // toolbox: {
                //     feature: {
                //         dataView: {show: true, readOnly: false},
                //         restore: {show: true},
                //         saveAsImage: {show: true}
                //     }
                // },
                legend: {
                    data: ['dRMSD', 'TM-Score', 'GDT_TS','length'],
                    textStyle:{
                        fontSize:20
                    },
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: xData,
                        axisLabel:{
                            show:true,
                            // rotate:-45,
                            interval:1,
                            fontSize: 19
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: 'dRMSD',
                        min: 0,
                        max: 50,
                        position: 'right',
                        nameTextStyle:{
                            fontSize:19
                        },
                        axisLine: {
                            lineStyle: {
                                color: colors[0]
                            }
                        },
                        axisLabel: {
                            formatter: '{value} Å',
                            fontSize:19
                        }
                    },
                    {
                        type: 'value',
                        name: 'TM-Score',
                        min: 0,
                        max: 1,
                        position: 'right',
                        offset: 80,
                        nameTextStyle:{
                            fontSize:19
                        },
                        axisLine: {
                            lineStyle: {
                                color: colors[1]
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize:19
                        }
                    },
                    {
                        type: 'value',
                        name: 'GDT_TS',
                        nameTextStyle:{
                            fontSize:19
                        },
                        min: 0,
                        max: 100,
                        position: 'left',
                        axisLine: {
                            lineStyle: {
                                color: colors[2]
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize:19
                        }
                    },
                    // {
                    //     type: 'value',
                    //     name: 'length',
                    //     min: 50,
                    //     max: 550,
                    //     position: 'right',
                    //     axisLine: {
                    //         lineStyle: {
                    //             color: colors[3]
                    //         }
                    //     },
                    //     axisLabel: {
                    //         formatter: '{value}'
                    //     }
                    // }
                ],
                series: [
                    {
                        name: 'dRMSD',
                        type: 'bar',
                        data: RMSDData
                    },
                    {
                        name: 'TM-Score',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: TMData
                    },
                    {
                        name: 'GDT_TS',
                        type: 'line',
                        yAxisIndex: 2,
                        data: GDTData
                    },
                    // {
                    //     name: 'length',
                    //     type: 'line',
                    //     yAxisIndex: 3,
                    //     data: lengthData
                    // }
                ]
            };
            myChart.setOption(option);
            myChart.on("click",function (params) {
                console.log(params);
                let proteinId = params.name;
                table_Protein(proteinId,flag=1,"proteinInfo2");
            })

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);// 状态码
            console.log(XMLHttpRequest.readyState);// 状态
            console.log(textStatus);// 错误信息
        }
    });
}
function init() {
    table_Protein(null,0,"proteinInfo2");
    loadRMSDPieChart("rmsd","null",null);
    loadTMPieChart("TM","null",null);
    // polarPlot("polarPlot","all",null,null);
    threeBar("threebar",null,null);
}
function pieInit(className) {
    loadRMSDPieChart("rmsd",className,"NotNull");
    loadTMPieChart("TM",className,"NotNull");
    table_Protein(null,className,"proteinInfo2");
    threeBar("threebar",className,null);
}
(function () {
    // loadClassificationPieChart("classification","TBM");
    init();
    $("#btn_Classification").click(function(){
        init();
    });
    $("#btn_TBM").click(function(){
        let className = $("#btn_TBM").text();
        pieInit(className);
    });
    $("#btn_FM").click(function(){
        let className = $("#btn_FM").text();
        pieInit(className);
    });
})();




