/**
 * Created by xuyang on 2020/3/16.
 */
var LiteMolPluginInstance;
(function (LiteMolPluginInstance) {
    // For the plugin CSS, look to Plugin/Skin
    // There is also an icon font in assets/font -- CSS path to it is in Plugin/Skin/LiteMol-plugin.scss
    // To compile the scss, refer to README.md in the root dir.
    var Plugin = LiteMol.Plugin;
    var Views = Plugin.Views;
    var Bootstrap = LiteMol.Bootstrap;
    // everything same as before, only the namespace changed.
    var Query = LiteMol.Core.Structure.Query;
    // You can look at what transforms are available in Bootstrap/Entity/Transformer
    // They are well described there and params are given as interfaces.
    var Transformer = Bootstrap.Entity.Transformer;
    var Tree = Bootstrap.Tree;
    var Transform = Tree.Transform;
    var LayoutRegion = Bootstrap.Components.LayoutRegion;
    var CoreVis = LiteMol.Visualization;
    var Visualization = Bootstrap.Visualization;
    // all commands and events can be found in Bootstrap/Event folder.
    // easy to follow the types and parameters in VSCode.
    // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)
    var Command = Bootstrap.Command;
    var Event = Bootstrap.Event;
    var moleculeId = '1sa1';
    // var moleculeId;
    var pluginPredicted,pluginActual,pluginRotate,pluginFold;

//--------------------------------------my函数及事件---------------------
    //顶部select渲染以及下拉框的渲染
    layui.use('form', function(){
        var form = layui.form;
        //option选中监听
        form.on('select(proteinSelect)', function(data){
            //拿到select中option中的值
            var proteinId = data.elem.selectedOptions[0].text;
            if(proteinId.length===5){
                $(".div_sequence>.title_sequence").css("display","block");
                chart_Sequence(proteinId,"Sequence_chart",function (len) {
                    // console.log(len);
                });

                // //染色
                // // setTimeout(function(){colorChainPredicted()}, 400);
                //
                // chart_Distance_Matrix(proteinId,"predictedMatrix","pre");
                // chart_Distance_Matrix(proteinId,"actualMatrix","act");
            }else{return;}

        });
    });
    //点击蛋白质id这几个字获取所有的蛋白质id
    $(".layui-form-label").click(function () {
        //访问数据库 动态添加proteinID
        $(".layui-input-inline>select").empty();
        $.ajax({
            url: 'database/index.php?c=main&a=test',
            type: 'post',
            async:'false',
            // data: {
            //     "proteinId"
            // },
            dataType: 'json',
            success: function(data) {
                // console.log(data[0].proteinId);
                $(".layui-input-inline>select").append("<option value=''>直接选择或搜索选择</option>");
                for(var proteinIndex = 0;proteinIndex<data.length;proteinIndex++){
                    $(".layui-input-inline>select").append("<option value="+data[proteinIndex].proteinId+">"+data[proteinIndex].proteinId+"</option>");
                }
                //将元素添加进去一定要重新渲染。
                layui.use('form', function(){
                    var form = layui.form;
                    form.render('select');
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest.status);// 状态码
                console.log(XMLHttpRequest.readyState);// 状态
                console.log(textStatus);// 错误信息
            }
        });



    });
    //图表(1)一级序列可视化图表
    function chart_Sequence(proteinId,chartId,callBack) {
        $.get("./data/file/"+proteinId+"/"+proteinId+"_sequence.txt").done(function (mydata){
            // console.log(mydata.length);
            callBack(mydata.length);
            var myChart = echarts.init(document.getElementById(chartId));
            var seq=[];
            var datax=[];
            for(var k=0,j=1;k<mydata.length;k++,j++){
                seq.push(mydata[k]);
                datax.push(j);
            }
            // app.title = '笛卡尔坐标系上的热力图';
            var y_title = [''];
            // var data = [[0,0,1,'A'],[0,1,1,'B'],[0,2,1,'B'],[0,3,1,'B'],[0,4,1,'B'],[0,5,1,'B'],[0,6,1,'B']];
            var data=[];
            for (var m=0;m<mydata.length;m++){
                data.push([0,m,1,mydata[m]]);
            }
            // console.log(data);
            data = data.map(function (item) {
                return [item[1], item[0], item[2],item[3] || '-'];
            });
            option = {
                tooltip: {
                    position: 'bottom',
                    formatter:function (e) {
                        return "sequence-"+(e.value[0]+1)+":"+e.value[3]
                    },
                },
                // animation: false,
                grid: {
                    height: '30%',
                    left:'0%',
                    right:'0%',
                    top:'20%',
                    backgroundColor:'gray'
                },
                xAxis: {
                    type: 'category',
                    data: datax,
                    splitArea: {
                        show: false
                    },
                    splitLine:{
                        show:false
                    },
                    axisLine:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    }
                },
                yAxis: {
                    type: 'category',
                    data: y_title,
                    splitArea: {
                        show: true
                    },
                    axisLine:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    }
                },
                dataZoom: [
                    {   // 这个dataZoom组件，默认控制x轴。
                        type: 'inside', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                        start: 0,      // 左边在 10% 的位置。
                        end: 6  ,      // 右边在 60% 的位置。
                    }
                ],
                visualMap: {
                    min: 1,
                    max: 1,
                    range:[0,1],
                    show:false,
                    calculable: false,
                    // color:'red',
                    inRange:{
                        color:['#f4f7fa','#f4f7fa']
                    },
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%'
                },
                series: [{
                    name: 'Punch Card',
                    type: 'heatmap',
                    data: data,
                    // visualMap:false,
                    label: {
                        normal: {
                            show: true,
                            fontWeight:'bold',
                            fontSize:14,
                            color:"black",
                            align:'center',
                            formatter: function (v) {
                                return v.value[3]
                            }
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            itemStyle:{
                                color:'gray'
                            },
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };


            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            //echarts中的事件和行为
            myChart.on('mouseover', function (params) {
                // console.log(params.data[0]+1);
                var residue_number=params.data[0]+1;
                // document.cookie=residue_number;
                // console.log(document.cookie);
                if(pluginActual&&pluginPredicted){
                    colorSequencePredicted(residue_number);
                    colorSequenceActual(residue_number);
                }
                if(pluginRotate){
                    colorSequenceRotate(residue_number,null);
                }


            });
            myChart.on('mouseout', function (params) {
                var residue_number=params.data[0]+1;
                // alert("鼠标移出")
                if(pluginActual&&pluginPredicted){
                    colorOffPredicted(residue_number);
                    colorOffActual(residue_number);
                }
                if(pluginRotate){
                    colorOffRotate(residue_number,null);
                }
            });
            myChart.on('click', function (params) {
                // console.log(params.data[0]+1);
                var residue_number=params.data[0]+1;
                // document.cookie=residue_number;
                // console.log(document.cookie);
                if(pluginActual&&pluginPredicted) {
                    focusResiduePredicted(residue_number);
                    focusResidueActual(residue_number);
                }
            });
        });

    }
    //图表(2)距离矩阵的可视化图表
    function chart_Distance_Matrix(proteinId,chartId1,chartId2,chartId3) {
        let chart_disMatrix;
        let temp=[];
        let distance_matrix=[];
        //let distance_matrix=new Array();
        let distance=0;
        $.get("./data/distanceMatrix/"+proteinId+"_distanceMatrix.json").done(function (data){
            // console.log(URL);
            // console.log(data);
            // console.log(data.length);
            //开始画图
            var myChart1 = echarts.init(document.getElementById(chartId1));
            var myChart2 = echarts.init(document.getElementById(chartId2));
            var myChart3 = echarts.init(document.getElementById(chartId3));
            var app = {};
            app.title = '热力图 - 2w 数据';

            var xData = [];
            var yData = [];
            var PreDisData=[];//预测结构距离矩阵
            var ActDisData=[];//真实结构距离矩阵
            var DividedDisData=[];//相减之后距离矩阵
            for(let axis=1;axis<=data[0].length;axis++){//data.length = 3
                xData.push(axis);//序列长度
                yData.push(axis);//序列长度
            }
            for(let m=0;m<data[0].length;m++){
                for(let n=0;n<data[0].length;n++){
                    PreDisData.push([m,n,data[0][m][n]]);
                    ActDisData.push([m,n,data[1][m][n]]);
                    DividedDisData.push([m,n,data[2][m][n]]);
                }
            }

            var option1 = {
                tooltip: {},
                grid:{
                    top:"10px",
                    left:"15px",
                    bottom:"10px",

                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    show:false
                },
                yAxis: {
                    type: 'category',
                    data: yData,
                    show:false
                },
                visualMap: {
                    min: 0,
                    max:30,
                    show:false,
                    calculable: true,
                    realtime: false,
                    inRange: {
                        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                    }
                },
                series: [{
                    name: 'distance',
                    type: 'heatmap',
                    data: PreDisData,
                    itemStyle: {
                        emphasis: {
                            borderColor: '#333',
                            borderWidth: 1
                        }
                    },
                    progressive: 1000,
                    animation: false
                }]
            };
            var option2 = {
                tooltip: {},
                grid:{
                    top:"10px",
                    left:"15px",
                    bottom:"10px",

                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    show:false
                },
                yAxis: {
                    type: 'category',
                    data: yData,
                    show:false
                },
                visualMap: {
                    min: 0,
                    max:30,
                    show:false,
                    calculable: true,
                    realtime: false,
                    inRange: {
                        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                    }
                },
                series: [{
                    name: 'distance',
                    type: 'heatmap',
                    data: ActDisData,
                    itemStyle: {
                        emphasis: {
                            borderColor: '#333',
                            borderWidth: 1
                        }
                    },
                    progressive: 1000,
                    animation: false
                }]
            };
            var option3 = {
                tooltip: {},
                grid:{
                    top:"10px",
                    left:"15px",
                    bottom:"10px",

                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    show:false
                },
                yAxis: {
                    type: 'category',
                    data: yData,
                    show:false
                },
                visualMap: {
                    min: 0,
                    max:30,
                    show:false,
                    calculable: true,
                    realtime: false,
                    inRange: {
                        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                    }
                },
                series: [{
                    name: 'distance',
                    type: 'heatmap',
                    data:DividedDisData,
                    itemStyle: {
                        emphasis: {
                            borderColor: '#333',
                            borderWidth: 1
                        }
                    },
                    progressive: 1000,
                    animation: false
                }]
            };
            myChart1.setOption(option1);
            myChart2.setOption(option2);
            myChart3.setOption(option3);
            myChart1.group = 'group1';
            myChart2.group = 'group1';
            myChart3.group = 'group1';
            echarts.connect('group1');
        });
    }
    //图表(3)最佳旋转的可视化图表
    function chart_ScatterRoteBest(proteinId,chartId,flag) {
        var dom = document.getElementById(chartId);
        var myChart = echarts.init(dom);
        var URL="";
        if(flag === "0"){
            URL="./data/ScatterRotateBest/With-centroid_PreCoordinate/"+proteinId+"_WithCentroid_PreCoordinate.json";
        }else if(flag === "1"){
            URL="./data/ScatterRotateBest/With-centroid_BackCoordinate/"+proteinId+"_WithCentroid_backCoordinate.json";
        }
        var app = {};
        option = null;

        $.get(URL).done(function (data) {
            let length=data[0].length;
            // console.log(data[0].length);
            var data1=[];
            var data2=[];
            let centroid_P=[];
            let centroid_Q=[];
            centroid_P.push(data[0][length-1]);
            centroid_Q.push(data[1][length-1]);
            // console.log(centroid_P);
            // console.log(centroid_Q)
            for(var i=0;i<length-1;i++){
                data1.push(data[0][i]);
                data2.push(data[1][i]);
            }
            // console.log(data1);
            var symbolSize = 10;
            option = {
                grid3D: {},

                tooltip:{},
                xAxis3D: {
                    type: 'category'
                },
                yAxis3D: {},
                zAxis3D: {},
                legend:{
                    right:10,
                    data:["Pre-centroid","Predicted","Act-centroid","Actual"]
                },
                // dataset: {
                //     dimensions: [
                //         'X',
                //         'Y',
                //         'Z',
                //     ],
                //     source: data
                // },
                series: [
                    {
                        name:"Pre-centroid",
                        type:'scatter3D',
                        symbolSize: 20,
                        // data:centroid_P,
                        data:centroid_P,
                        itemStyle:{
                            color:"orange"
                        }
                    },
                    {
                        name:"Predicted",
                        type: 'scatter3D',
                        symbolSize: symbolSize,
                        data:data1,
                        itemStyle:{
                            color:"green"
                        }
                    },
                    {
                        name:"Act-centroid",
                        type:'scatter3D',
                        symbolSize: 20,
                        data:centroid_Q,
                        itemStyle:{
                            color:"purple"
                        }
                    },
                    {
                        name:"Actual",
                        type: 'scatter3D',
                        symbolSize: symbolSize,
                        // encode: {
                        //     x: 'X',
                        //     y: 'Y',
                        //     z: 'Z',

                        // },
                        data:data2,
                        itemStyle:{
                            color:"red"
                        }
                    }

                ]
            };

            myChart.setOption(option);
            myChart.on('mouseover', function (params) {
                // console.log(params);
                var residue_number=params.dataIndex+1;
                if(pluginRotate){
                    if(params.seriesName === "Predicted"){
                        colorSequenceRotate(residue_number,"pre");
                    }else if(params.seriesName === "Actual"){
                        colorSequenceRotate(residue_number,"act");
                    }
                }
            });
            myChart.on('mouseout', function (params) {
                var residue_number=params.dataIndex+1;
                if(pluginRotate){
                    if(params.seriesName === "Predicted"){
                        colorOffRotate(residue_number,"pre");
                    }else if(params.seriesName === "Actual"){
                        colorOffRotate(residue_number,"act");
                    }
                }
            });
        });
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
    //图表(4)扭转角的可视化图表
    function chart_TorsionAngel(proteinId,chartId) {
        var myChart = echarts.init(document.getElementById(chartId));
        $.get('./data/TorsionAngel/'+proteinId+'/'+proteinId+'_NEW_Angel.json').done(function (data) {
            let predicted_data=[];
            let actual_data=[];
            for(let i=0;i<data[0].length;i=i+3){
                predicted_data.push([data[0][i],data[0][i+2]]);
            }
            for(let i=0;i<data[1].length;i=i+3){
                actual_data.push([data[1][i],data[1][i+2]]);
            }
            //console.log(predicted_data);
            var fSize = 12;
            var color = "black";
            option = {
                //color: ['#01b3e9', '#2f9b4f', '#96d107', '#4d5ae1', '#ff9c00', '#d804d6', '#bd146c'],
                //backgroundColor: 'rgba(0,0,0,1)',
                brush:{
                    brushType:'rect',
                    throttleType:'debounce',
                    throttleDelay:2000,
                    //brushMode:'single',
                    transformable:false,
                    toolbox:['rect'],
                    xAxisIndex: 'all',
                    yAxisIndex: 'all',

                },
                tooltip: {
                    formatter: function(params) {
                        return proteinId+"<br>"+params.seriesName + '<br>psi : ' + params.data[0] +"°"+ '<br>phi : ' + params.data[1]+"°";
                    },
                    textStyle: {
                        fontSize: fSize
                    }
                },
                legend: {
                    orient: 'horizontal',
                    x: 'center',
                    y: '3%',
                    itemWidth: 12,
                    itemHeight: 12,
                    icon: 'circle',
                    selectedMode: true,
                    textStyle: {
                        color: color, // 图例文字颜色
                        fontSize: fSize
                    },
                    data: ["Predicted", 'Actual']
                },
                grid: {
                    left: '10%',
                    right: '20%',
                    bottom: '10%',
                    top: "20%",
                    containLabel: true
                },
                xAxis: {
                    axisLabel: {
                        inside: false,
                        textStyle: {
                            color: color,
                            fontSize: fSize
                        }
                    },
                    nameTextStyle: {
                        color: color,
                        fontSize: fSize
                    },
                    min: '-180',
                    max: '180',
                    axisTick: {
                        lineStyle: {
                            color: color
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: color,
                            width: 1
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#CD4F39',
                            type: 'dashed'
                        }
                    },
                    name: "psi"
                },
                yAxis: {
                    axisLabel: {
                        textStyle: {
                            color: color,
                            fontSize: fSize
                        }
                    },
                    min: '-180',
                    max: '180',
                    axisTick: {
                        lineStyle: {
                            color: color
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: color,
                            width: 1
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#CD4F39',
                            type: 'dashed'
                        }
                    },
                    name: 'phi',
                    nameTextStyle: {
                        color: color,
                        fontSize: fSize,
                    }
                },
                visualMap: {
                    show: false,
                    max: 180,
                    inRange: {
                        symbolSize: [12, 12]
                    }
                },
                series: [{
                    name: 'Predicted',
                    type: 'scatter',
                    data:predicted_data
                },
                    {
                        name: 'Actual',
                        type: 'scatter',
                        data: actual_data
                    },
                ],
                /*animationDelay: function(idx) {
                 return idx * 50;
                 },
                 animationEasing: 'elasticOut'*/
            };
            myChart.setOption(option);
            myChart.on('brushSelected', function (params) {
                //console.log(params.batch[0].areas[0]);
                if(params.batch[0].areas[0]!==undefined){
                    //console.log(params.batch[0].selected[0].seriesName);
                    //console.log(params.batch[0].selected[0].dataIndex);
                    var preData = params.batch[0].selected[0].dataIndex;
                    var actData = params.batch[0].selected[1].dataIndex;
                    if($(".div_newTorsionAngel").children().hasClass("div_newTorsionInfo")){
                        $("#scatterNum").attr("placeholder",preData.length+actData.length+"个");
                        $("#pre_scatterNum").attr("placeholder",preData.length+"个");
                        $("#act_scatterNum").attr("placeholder",actData.length+"个");
                        $("#atomPredictedIndex").val(preData);
                        $("#atomActualIndex").val(actData);
                    }
                    for(var i = 0;i<preData.length;i++){
                        if(pluginRotate)
                            colorSequenceRotate(preData[i]+1,"pre");
                        // if($("#cancelBtn").click){
                        //     colorOffRotate(preData[i]+1,"pre");
                        // }
                    }
                    for(var j = 0;j<actData.length;j++){
                        if(pluginRotate)
                            colorSequenceRotate(actData[j]+1,"act");
                    }
                    //取消框选
                    $("#cancelBtn").click(function () {
                        for(var i = 0;i<preData.length;i++){
                            if(pluginRotate)
                                colorOffRotate(preData[i]+1,"pre");
                        }
                        for(var j = 0;j<actData.length;j++){
                            if(pluginRotate)
                                colorOffRotate(preData[i]+1,"act");
                        }
                        if($(".div_newTorsionAngel").children().hasClass("div_newTorsionInfo")){
                            $("#scatterNum").attr("placeholder","null");
                            $("#pre_scatterNum").attr("placeholder","null");
                            $("#act_scatterNum").attr("placeholder","null");
                            $("#atomPredictedIndex").val("null");
                            $("#atomActualIndex").val("null");
                        }
                        myChart.dispatchAction({
                            type: 'brush',//选择action行为
                            areas:[]//areas表示选框的集合，此时为空即可。
                        });

                    });
                }

            });
            myChart.on('mouseover', function (params) {
                //console.log(params);
                var pre_residue_number=params.dataIndex+1;//拿到该扭转角涉及到的残基索引
                var next_residue_number=params.dataIndex+2;//拿到该扭转角涉及到的残基索引
                if(pluginActual&&pluginPredicted){
                    if(params.seriesName === "Predicted"){
                        colorSequencePredicted(pre_residue_number);
                    }
                    else if(params.seriesName === "Actual")
                        colorSequenceActual(pre_residue_number);
                }
            });
            myChart.on('mouseout', function (params) {
                var residue_number=params.dataIndex+1;
                if(pluginActual&&pluginPredicted){
                    if(params.seriesName === "Predicted"){
                        colorOffPredicted(residue_number);
                    }
                    else if(params.seriesName === "Actual")
                        colorOffActual(residue_number);


                }
            });
            myChart.on('click', function (params) {
                //console.log(params);
                var pre_residue_number=params.dataIndex+1;//拿到该扭转角涉及到的残基索引
                var next_residue_number=params.dataIndex+2;//拿到该扭转角涉及到的残基索引
                if($(".div_torsionAngel").children().hasClass("div_torsionAngelInfo")){
                    $("#angelPsi").attr("placeholder",params.data[0]);
                    $("#angelPhi").attr("placeholder",params.data[1]);
                    $("#atomPreIndex").attr("placeholder",pre_residue_number);
                    $("#atomNextIndex").attr("placeholder",next_residue_number);
                    $("#StructureInfo").attr("placeholder",params.seriesName);
                }

                if(pluginActual&&pluginPredicted){
                    if(params.seriesName === "Predicted"){
                        focusResiduePredicted(pre_residue_number);
                    }
                    else if(params.seriesName === "Actual")
                        focusResidueActual(pre_residue_number);
                }
            });
        });

    }
    //图表(5)扭转角的折线图可视化图表
    function chart_Fold_TorsionAngel(proteinId,chartId) {
        var myChart = echarts.init(document.getElementById(chartId));
        $.get('./data/TorsionAngel/'+proteinId+'/'+proteinId+'_NEW_Angel.json').done(function(data){
            //console.log(data);
            var datax=[];
            var preData=[];
            var actData=[];
            var preData2=[];
            var actData2=[];
            for(var i=0;i<(data[0].length)+1;i++){
                datax.push([i+1]);
            }
            for(let i = 0;i<data[0].length;i++){
                preData.push(data[0][i][0]);//预测结构φ角
                actData.push(data[1][i][0]);//真实结构φ角
                preData2.push(data[0][i][1]);//预测结构ψ角
                actData2.push(data[1][i][1]);//真实结构ψ角
            }
            myChart.setOption(option = {
                title:[
                    {
                        text:'ψ角',
                        textStyle:{
                            fontSize:14,
                            color:'#008080'
                        },
                        left:0,
                        top:-5
                    },{
                        text:'φ角',
                        textStyle:{
                            fontSize:14,
                            color:'#008080'
                        },
                        left:0,
                        top:'40%'
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    color: ["#F58080", "#47D8BE"],
                    data: ['predicted', 'actual'],
                    left: 'center',
                    bottom: 'bottom'
                },
                axisPointer: {
                    // show:'true',
                    link: {xAxisIndex: [0, 1],},
                    // label: {
                    //     backgroundColor: 'red'
                    // }
                },
                grid:[{
                    left: 50,
                    right: 50,
                    top:'5%',
                    height: '30%'
                }, {
                    left: 50,
                    right: 50,
                    top: '50%',
                    height: '30%'
                }],
                xAxis: [{
                    // gridIndex: 0,
                    type: 'category',
                    data: datax,
                    axisLine: {
                        lineStyle: {
                            color: "#999"
                        }
                    }
                },{
                    gridIndex: 1,
                    type: 'category',
                    data: datax,
                    axisLine: {
                        lineStyle: {
                            color: "#999"
                        }
                    }
                }],
                yAxis: [{
                    // gridIndex: 0,
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#DDD'
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: "#333"
                        },
                    },
                    nameTextStyle: {
                        color: "#999"
                    },
                    splitArea: {
                        show: false
                    }
                },{
                    gridIndex: 1,
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#DDD'
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: "#333"
                        },
                    },
                    nameTextStyle: {
                        color: "#999"
                    },
                    splitArea: {
                        show: false
                    }
                }],
                brush:{
                    toolbox:['lineX'],
                    brushLink:'all',
                    // seriesIndex:'all',
                    xAxisIndex: [0,1],
                    // inBrush: {
                    //     opacity: 1
                    // },
                    outOfBrush:{
                        opacity:0.1
                    },
                    throttleType:'debounce',
                    throttleDelay:'300'

                },
                series: [
                    {
                        name: 'predicted',
                        type: 'line',
                        data: preData,
                        // xAxisIndex: 0,
                        //    yAxisIndex: 0,
                        color: "#F58080",

                        itemStyle: {
                            normal: {
                                color: '#F58080',
                                borderWidth: 1,
                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                 shadowBlur: 100,*/
                                borderColor: "#F58080"
                            }
                        },
                        smooth: true
                    },
                    {
                        name: 'actual',
                        type: 'line',
                        data: actData,
                        // xAxisIndex: 0,
                        //    yAxisIndex: 0,

                        itemStyle: {
                            normal: {
                                color: '#AAF487',
                                borderWidth: 1,
                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                 shadowBlur: 100,*/
                                borderColor: "#AAF487"
                            }
                        },
                        smooth: true
                    },
                    {
                        name: 'predicted',
                        type: 'line',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data:preData2,
                        color: "#F58080",

                        itemStyle: {
                            normal: {
                                color: '#F58080',
                                borderWidth: 1,
                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                 shadowBlur: 100,*/
                                borderColor: "#F58080"
                            }
                        },
                        smooth: true
                    },
                    {
                        name: 'actual',
                        type: 'line',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data:actData2,

                        itemStyle: {
                            normal: {
                                color: '#AAF487',
                                borderWidth: 1,
                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                 shadowBlur: 100,*/
                                borderColor: "#AAF487"
                            }
                        },
                        smooth: true
                    }

                ]
            },true);
            myChart.on('brushSelected', function (params) {
                if(params.batch[0].areas[0]!==undefined){
                    // console.log(params.batch[0].areas[0].coordRange);
                    var selected1 = params.batch[0].areas[0].coordRange[0];//
                    var selected2 = params.batch[0].areas[0].coordRange[1];
                    for(var i = selected1;i<=selected2;i++){
                        if(pluginFold)
                            colorSequenceFold(i+1,null);
                    }
                    $("#AtomSelected").attr("placeholder",(selected2-selected1)+"个");
                    $("#preAtom").attr("placeholder",selected1);
                    $("#nextAtom").attr("placeholder",selected2);

                    //取消框选
                    $("#btn_cancel").click(function () {
                        for(var i = selected1;i<=selected2;i++){
                            if(pluginFold)
                                colorOffFold(i+1,null);
                        }
                        for(var j = selected1;j<=selected2;j++){
                            if(pluginFold)
                                colorOffFold(j+1,null);
                        }
                        $("#AtomSelected").attr("placeholder","null");
                        $("#preAtom").attr("placeholder","null");
                        $("#nextAtom").attr("placeholder","null");
                        myChart.dispatchAction({
                            type: 'brush',//选择action行为
                            areas:[]//areas表示选框的集合，此时为空即可。
                        });

                    });
                }
            });
        });
    }
    //
    //1、监听顶部距离矩阵按钮的事件
    $("#btn_Distance_Matrix").click(function () {
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5){
            //如果旋转插件存在，销毁，不存在，啥都不做
            if(pluginRotate){destroypluginRotate();}
            //如果预测真实插件存在，不做，不存在，创建
            if(pluginPredicted && pluginActual){}else{
                creatPluginPredicted("preStructure");
                creatPluginActual("actStructure");
            }
            $(".div_sub_Structure .div_Structure_3D").css("display","block");
            $(".div_sub_Structure .div_Distance_Matrix").css("display","block");
            $(".div_sub_Structure .div_RotateBest").css("display","none");
            $(".div_sub_Structure .div_Scatter").css("display","none");
            $(".div_sub_Structure .div_newTorsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel").css("display","none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "none");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "none");
            // //重新加载插件
            resetModelPredicted();
            resetModelActual();
            // //加载pdb文件
            loadMoleculePredicted(id);
            loadMoleculeActual(id);
            //加载距离矩阵
            chart_Distance_Matrix(id,"predictedMatrix","actualMatrix","DividedMatrix");
            //2秒之后加载详细信息
            setTimeout(function () {
                $.get("./data/table.json").done(function (data){
                // console.log(data.data);
                for(var i=0;i<data.data.length;i++){
                    if(id === data.data[i].proteinId){
                        $("#Input_length").attr("placeholder",data.data[i].length);
                        $("#Input_RMSD").attr("placeholder",data.data[i].RMSD);
                        $("#Input_TM").attr("placeholder",data.data[i].TM_Score);
                    }
                }
            });
            }, 2000);
        }else{
            return;
        }


    });
    //2、监听顶部最佳旋转按钮的事件
    $("#btn_kabsch").click(function () {
        //加载最佳旋转PDB文件
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5){
            if(pluginPredicted && pluginActual){
                resetModelPredicted();
                resetModelActual();
            }else{
                creatPluginPredicted("preStructure");
                creatPluginActual("actStructure");
            }
            //如果旋转插件存在，啥都不做，不存在，创建一个
            if(pluginRotate){resetModelRotate();}else{
                createpluginRotate("RotateBest");
            }
            $(".div_Distance_Matrix").css("display","none");
            $(".div_sub_Structure .div_torsionAngel").css("display","none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "none");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "none");
            $(".div_sub_Structure .div_Structure_3D").css("display","block");
            $(".div_RotateBest").css("display","block");
            // //重新加载插件

            // //加载pdb文件
            loadMoleculePredicted(id);
            loadMoleculeActual(id);
            loadMoleculeRotate(id,"pre");
            loadMoleculeRotate(id,"act");
            chart_Sequence(id,"Sequence_chart",function (len) {
                setTimeout(function(){colorSequence(id, len)}, 410);
            });
            setTimeout(function(){colorChainRotate();}, 610);

        }else{
            return;
        }
    });
    //3、监听顶部散点按钮的事件
    $("#btn_Scatter").click(function () {
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5){
            $(".div_sub_Structure .div_Structure_3D").css("display","none");
            $(".div_sub_Structure .div_Distance_Matrix").css("display","none");
            $(".div_sub_Structure .div_torsionAngel").css("display","none");
            $(".div_sub_Structure .div_newTorsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "none");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "none");
            $(".div_sub_Structure .div_Scatter").css("display","block");
            chart_ScatterRoteBest(id,"ScatterRotateBest","0");//旋转之前
        }else{
            return;
        }
    });
    //3.1 监听散点图内部按钮的点击事件
    var f = false;
    $("#toggleRotate").click(function(){
        if(f = !f){
            var id1 = $("#layui_ProteinId").val();
            chart_ScatterRoteBest(id1,"ScatterRotateBest","1");
        }else{
            var id2 = $("#layui_ProteinId").val();
            chart_ScatterRoteBest(id2,"ScatterRotateBest","0");
        }
    });
    //4、监听顶部二面角按钮1的点击事件
    $("#btn_dihedral1").click(function () {
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5) {
            $(".div_sub_Structure .div_Distance_Matrix").css("display", "none");
            $(".div_sub_Structure .div_Scatter").css("display", "none");
            $(".div_sub_Structure .div_RotateBest").css("display", "none");
            $(".div_sub_Structure .div_newTorsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "none");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel").css("display", "block");
            chart_TorsionAngel(id,"torsionAngel");
        }else{
            return;
        }
    });
    //5、监听顶部二面角2的点击事件
    $("#btn_dihedral2").click(function () {
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5) {
            $(".div_sub_Structure .div_Structure_3D").css("display","none");
            $(".div_sub_Structure .div_Distance_Matrix").css("display", "none");
            $(".div_sub_Structure .div_Scatter").css("display", "none");
            $(".div_sub_Structure .div_newTorsionAngel").css("display", "block");
            $(".div_sub_Structure .div_torsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "none");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "none");

            chart_TorsionAngel(id,"newTorsionAngel");
        }else{
            return;
        }
    });
    //6、监听顶部二面角3按钮的点击事件
    $("#btn_dihedral3").click(function () {
        var id = $("#layui_ProteinId").val();
        if(id===null){return;}
        if(id.length===5) {
            //如果旋转插件存在，啥都不做，不存在，创建一个
            if(pluginFold){}else{createpluginFold("Fold_Rotate");}
            $(".div_sub_Structure .div_Structure_3D").css("display","none");
            $(".div_sub_Structure .div_Distance_Matrix").css("display", "none");
            $(".div_sub_Structure .div_Scatter").css("display", "none");
            $(".div_sub_Structure .div_RotateBest").css("display", "none");
            $(".div_sub_Structure .div_newTorsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel").css("display", "none");
            $(".div_sub_Structure .div_torsionAngel3").css("display", "block");
            $(".div_sub_Structure .div_FoldInfo_Rotate").css("display", "block");
            chart_Fold_TorsionAngel(id,"Fold_TorsionAngel");
            loadMoleculeFold(id,"pre");
            loadMoleculeFold(id,"act");
            setTimeout(function(){colorChainFold()}, 500);
        }else{
            return;
        }
    });
    //----------------------------------------------------------------------------------折叠结构函数-------------------------------------------------------------------------------
    //折叠结构的函数
    function applyTransformsFold(actions) {
        return pluginFold.applyTransform(actions);
    }
    //节点选择
    function selectNodesFold(what) {
        return pluginFold.context.select(what);
    }
    //重置颜色
    function cleanUpFold() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(pluginFold.context, 'sequence-selection');
    }
    //创建插件函数
    function createpluginFold(id){
        var flag =1;
        pluginFold = create(document.getElementById(id));
        setBgcFold();
        Command.Visual.ResetScene.getStream(pluginFold.context).subscribe(function () { return cleanUpFold(); });
        Command.Visual.ResetTheme.getStream(pluginFold.context).subscribe(function () { return cleanUpFold(); });
        return flag;
    }
    //设置背景颜色
    function setBgcFold(){
        return Command.Layout.SetViewportOptions.dispatch(pluginFold.context, {
            clearColor: CoreVis.Color.fromRgb(244, 247, 250)
        });
    }
    //销毁插件函数
    function destroypluginFold(){
        var flagFold = 1;
        pluginFold.destroy(); pluginFold = void 0;
        return flagFold;
    }
    //加载分子函数
    function loadMoleculeFold(fileName,flag) {
        var URL="";
        if(flag === "act"){URL="_BackActual"}else if(flag === "pre"){URL = "_BackPredicted"}
        resetModelFold();
        var id=moleculeId;
        var action = Transform.build()
            .add(pluginFold.context.tree.root, Transformer.Data.Download, { url: "./data/RotatePDB/"+fileName+"/"+fileName+URL+".cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransformsFold(action);


    }
    //选择，提取，聚焦
    function select(reNumber) {
        var visual = selectNodesFold('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsFold(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginFold.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginFold.context, selectNodesFold('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesFold('model')[0] as any, query })
        });
    }
    //通过点击残基聚焦该残基
    function focusResidueFold(reNumber) {
        resetFold();
        var visual = selectNodesFold('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsFold(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginFold.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginFold.context, selectNodesFold('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesFold('model')[0] as any, query })
        });
    }
    //鼠标hover上颜色
    function colorSequenceFold(reNumber,flag){
        var model1 = selectNodesFold('model')[0];
        var model2 = selectNodesFold('model')[1];
        if (!model1 || !model2)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        if(flag===null){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: true });
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: true });
        }else if(flag === "pre"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: true });
        }else if(flag === "act"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: true });
        }

    }
    //鼠标mouseout消颜色
    function colorOffFold(reNumber,flag){
        var model1 = selectNodesFold('model')[0];
        var model2 = selectNodesFold('model')[1];
        if (!model1 || !model2)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        if(flag === null){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: false });
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: false });
        }else if(flag === "pre"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: false });
        }else if(flag === "act"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: false });
        }

    }
    //给链上颜色
    function colorChainFold() {
        var visual = selectNodesFold('polymer-visual')[1];
        var model = selectNodesFold('model')[1];
        if (!model || !visual)
            return;
        var colors = new Map();
        colors.set('A', CoreVis.Color.fromRgb(255, 0, 0));
        // etc.
        var theme = Visualization.Molecule.createColorMapThemeProvider(
            // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
            // you can also get more creative and use "composite properties"
            // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
            //
            // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
            function (m) { return ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }); }, colors,
            // this a fallback color used for elements not in the set
            CoreVis.Color.fromRgb(0, 0, 123))(model);
        Command.Visual.UpdateBasicTheme.dispatch(pluginFold.context, { visual: visual, theme: theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.
    }
    /*清空函数 重新加载插件*/
    function resetModelFold(){
        Bootstrap.Command.Tree.RemoveNode.dispatch(pluginFold.context, pluginFold.context.tree.root);
    }
    //重置函数
    function resetFold() {
        Command.Visual.ResetScene.dispatch(pluginFold.context, void 0);
    }
    //----------------------------------------------------------------------------------旋转结构函数-------------------------------------------------------------------------------
//旋转结构的函数
    function applyTransformsRotate(actions) {
        return pluginRotate.applyTransform(actions);
    }
    //节点选择
    function selectNodesRotate(what) {
        return pluginRotate.context.select(what);
    }
    //重置颜色
    function cleanUpRotate() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(pluginRotate.context, 'sequence-selection');
    }
    //创建插件函数
    function createpluginRotate(id){
        var flag =1;
        pluginRotate = create(document.getElementById(id));
        setBgcRotate();
        Command.Visual.ResetScene.getStream(pluginRotate.context).subscribe(function () { return cleanUpRotate(); });
        Command.Visual.ResetTheme.getStream(pluginRotate.context).subscribe(function () { return cleanUpRotate(); });
        return flag;
    }
    function setBgcRotate(){
        return Command.Layout.SetViewportOptions.dispatch(pluginRotate.context, {
            clearColor: CoreVis.Color.fromRgb(244, 247, 250)
        });
    }
    //销毁插件函数
    function destroypluginRotate(){
        var flagRotate = 1;
        pluginRotate.destroy(); pluginRotate = void 0;
        return flagRotate;
    }
    //加载分子函数
    function loadMoleculeRotate(fileName,flag) {
        var URL="";
        if(flag === "act"){URL="_BackActual"}else if(flag === "pre"){URL = "_BackPredicted"}
        resetModelRotate();
        var id=moleculeId;
        var action = Transform.build()
            .add(pluginRotate.context.tree.root, Transformer.Data.Download, { url: "./data/RotatePDB/"+fileName+"/"+fileName+URL+".cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransformsRotate(action);


    }
    //选择，提取，聚焦
    function select(reNumber) {
        var visual = selectNodesRotate('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsRotate(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginRotate.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginRotate.context, selectNodesRotate('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesRotate('model')[0] as any, query })
        });
    }
    //通过点击残基聚焦该残基
    function focusResidueRotate(reNumber) {
        resetRotate();
        var visual = selectNodesRotate('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsRotate(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginRotate.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginRotate.context, selectNodesRotate('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesRotate('model')[0] as any, query })
        });
    }
    //鼠标hover上颜色
    function colorSequenceRotate(reNumber,flag){
        var model1 = selectNodesRotate('model')[0];
        var model2 = selectNodesRotate('model')[1];
        if (!model1 || !model2)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        if(flag===null){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model1, query: query, isOn: true });
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model2, query: query, isOn: true });
        }else if(flag === "pre"){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model1, query: query, isOn: true });
        }else if(flag === "act"){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model2, query: query, isOn: true });
        }

    }
    //鼠标mouseout消颜色
    function colorOffRotate(reNumber,flag){
        var model1 = selectNodesRotate('model')[0];
        var model2 = selectNodesRotate('model')[1];
        if (!model1 || !model2)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        if(flag === null){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model1, query: query, isOn: false });
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model2, query: query, isOn: false });
        }else if(flag === "pre"){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model1, query: query, isOn: false });
        }else if(flag === "act"){
            Command.Molecule.Highlight.dispatch(pluginRotate.context, { model: model2, query: query, isOn: false });
        }

    }
    //给链上颜色
    function colorChainRotate() {
        var visual = selectNodesRotate('polymer-visual')[1];
        var model = selectNodesRotate('model')[1];
        if (!model || !visual)
            return;
        var colors = new Map();
        colors.set('A', CoreVis.Color.fromRgb(0, 0, 0));
        // etc.
        var theme = Visualization.Molecule.createColorMapThemeProvider(
            // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
            // you can also get more creative and use "composite properties"
            // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
            //
            // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
            function (m) { return ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }); }, colors,
            // this a fallback color used for elements not in the set
            CoreVis.Color.fromRgb(0, 0, 123))(model);
        Command.Visual.UpdateBasicTheme.dispatch(pluginRotate.context, { visual: visual, theme: theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.
    }
    //读取误差数据的函数
    function loadCorrectData(proteinID,callBack) {
        $.ajax({
            url:'data/Dis_Correct/'+proteinID+'/'+proteinID+'_dis_correct.json',
            dataType:"json",
            success:function (data) {
                callBack(data);
            },
            error:function (e) {
                console.log(e);
            }
        });
    }
    //将数值映射为颜色
    function getColorByNumber(n,max) {
        let halfMax = max / 2;  //最大数值的二分之一
        //var 百分之一 = (单色值范围) / halfMax;  单颜色的变化范围只在50%之内
        var one = 255 / halfMax;
        // console.log('one= ' + one)
        var r = 0;
        var g = 0;
        var b = 0;


        if (n < halfMax) {
            // 比例小于halfMax的时候红色是越来越多的,直到红色为255时(红+绿)变为黄色.
            r = one * n;
            g = 0;
            b = (255-one);
        }

        if (n >= halfMax) {
            // 比例大于halfMax的时候绿色是越来越少的,直到0 变为纯红
            g = (255 - ((n - halfMax) * one)) < 0 ? 0 : (255 - ((n - halfMax) * one))
            r = 255 - one;

            //b = one * n;

        }
        r = parseInt(r);// 取整
        g = parseInt(g);// 取整
        b = parseInt(b);// 取整

        // console.log(r,g,b)
        return {"r":r,"g":g,"b":b};
    }
    //给序列添加自定义颜色
    function colorSequence(proteinID, len){
        loadCorrectData(proteinID,function (correct_data) {
            var colorSeq = [];
            for(var i = 0; i < len; i++){
                colorSeq.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (i), end_residue_number: (i+1), color: getColorByNumber(correct_data[i],20)});
            }
            let model = pluginRotate.selectEntities('model')[0];
            if (!model)
                return;
            let coloring = {
                base: { r: 255, g: 255, b: 255 },
                entries:colorSeq
            };
            let theme = LiteMolPluginInstance.CustomTheme.createTheme(model.props.model, coloring);
            // instead of "polymer-visual", "model" or any valid ref can be used: all "child" visuals will be colored.
            LiteMolPluginInstance.CustomTheme.applyTheme(pluginRotate, 'polymer-visual', theme);
        });

    }
    /*清空函数 重新加载插件*/
    function resetModelRotate(){
        Bootstrap.Command.Tree.RemoveNode.dispatch(pluginRotate.context, pluginRotate.context.tree.root);
    }
    //重置函数
    function resetRotate() {
        Command.Visual.ResetScene.dispatch(pluginRotate.context, void 0);
    }
    //----------------------------------------------------------------------------------预测结构函数-------------------------------------------------------------------------------
    //预测结构的函数
    function applyTransformsPredicted(actions) {
        return pluginPredicted.applyTransform(actions);
    }
    //节点选择
    function selectNodesPredicted(what) {
        return pluginPredicted.context.select(what);
    }
    //重置颜色
    function cleanUpPredicted() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(pluginPredicted.context, 'sequence-selection');
    }
    //创建插件函数
    function creatPluginPredicted(id){
        var flag =1;
        pluginPredicted = create(document.getElementById(id));
        setBgcPredicted();
        Command.Visual.ResetScene.getStream(pluginPredicted.context).subscribe(function () { return cleanUpPredicted(); });
        Command.Visual.ResetTheme.getStream(pluginPredicted.context).subscribe(function () { return cleanUpPredicted(); });
        return flag;
    }
    function setBgcPredicted(){
        return Command.Layout.SetViewportOptions.dispatch(pluginPredicted.context, {
            clearColor: CoreVis.Color.fromRgb(244, 247, 250)
        });
    }
    //销毁插件函数
    function destroyPluginPredicted(){
        pluginPredicted.destroy(); pluginPredicted = void 0;
    }
    //加载分子函数
    function loadMoleculePredicted(fileName) {
        resetModelPredicted();
        var id=moleculeId;
        var action = Transform.build()
            .add(pluginPredicted.context.tree.root, Transformer.Data.Download, { url: "./data/file/"+fileName+"/"+fileName+"_Predicted.cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransformsPredicted(action);


    }
    //选择，提取，聚焦
    function select(reNumber) {
        var visual = selectNodesPredicted('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsPredicted(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginPredicted.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginPredicted.context, selectNodesPredicted('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesPredicted('model')[0] as any, query })
        });
    }
    //通过点击残基聚焦该残基
    function focusResiduePredicted(reNumber) {
        resetPredicted();
        var visual = selectNodesPredicted('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsPredicted(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginPredicted.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginPredicted.context, selectNodesPredicted('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesPredicted('model')[0] as any, query })
        });
    }
    //鼠标hover上颜色
    function colorSequencePredicted(reNumber){
        var model = selectNodesPredicted('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        Command.Molecule.Highlight.dispatch(pluginPredicted.context, { model: model, query: query, isOn: true });
    }
    //鼠标mouseout消颜色
    function colorOffPredicted(reNumber){
        var model = selectNodesPredicted('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        Command.Molecule.Highlight.dispatch(pluginPredicted.context, { model: model, query: query, isOn: false });
    }
    //给链上颜色
    function colorChainPredicted() {
        var visual = selectNodesPredicted('polymer-visual')[0];
        var model = selectNodesPredicted('model')[0];
        if (!model || !visual)
            return;
        var colors = new Map();
        colors.set('A', CoreVis.Color.fromRgb(255, 153, 0));
        // etc.
        var theme = Visualization.Molecule.createColorMapThemeProvider(
            // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
            // you can also get more creative and use "composite properties"
            // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
            //
            // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
            function (m) { return ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }); }, colors,
            // this a fallback color used for elements not in the set
            CoreVis.Color.fromRgb(0, 0, 123))(model);
        Command.Visual.UpdateBasicTheme.dispatch(pluginPredicted.context, { visual: visual, theme: theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.
    }
    /*清空函数 重新加载插件*/
    function resetModelPredicted(){
        Bootstrap.Command.Tree.RemoveNode.dispatch(pluginPredicted.context, pluginPredicted.context.tree.root);
    }
    //重置函数
    function resetPredicted() {
        Command.Visual.ResetScene.dispatch(pluginPredicted.context, void 0);
    }
    //----------------------------------------------------------------------------------真实结构函数---------------------------------------------------------------------------------
    //真实结构的函数
    function applyTransformsActual(actions) {
        return pluginActual.applyTransform(actions);
    }
    //节点选择
    function selectNodesActual(what) {
        return pluginActual.context.select(what);
    }
    //重置颜色
    function cleanUpActual() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(pluginActual.context, 'sequence-selection');
    }
    //创建插件函数
    function creatPluginActual(id){
        var flag = 1;
        pluginActual = create(document.getElementById(id));
        setBgcActual();
        Command.Visual.ResetScene.getStream(pluginActual.context).subscribe(function () { return cleanUpActual(); });
        Command.Visual.ResetTheme.getStream(pluginActual.context).subscribe(function () { return cleanUpActual(); });
        return flag;
    }
    //设置背景色
    function setBgcActual(){
        return Command.Layout.SetViewportOptions.dispatch(pluginActual.context, {
            clearColor: CoreVis.Color.fromRgb(244, 247, 250)
        });
    }
    //销毁插件函数
    function destroyPluginActual(){
        pluginActual.destroy(); pluginActual = void 0;
    }
    //加载分子函数
    function loadMoleculeActual(fileName) {
        resetModelActual();
        var id=moleculeId;
        var action = Transform.build()
            .add(pluginActual.context.tree.root, Transformer.Data.Download, { url: "./data/file/"+fileName+"/"+fileName+"_Actual.cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransformsActual(action);
    }
    //选择，提取，聚焦
    function select(reNumber) {
        var visual = selectNodesActual('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsActual(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginActual.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginActual.context, selectNodesActual('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesActual('model')[0] as any, query })
        });
    }
    //通过点击残基聚焦该残基
    function focusResidueActual(reNumber) {
        resetActual();
        var visual = selectNodesActual('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransformsActual(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(pluginActual.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(pluginActual.context, selectNodesActual('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodesActual('model')[0] as any, query })
        });
    }
    //鼠标hover上颜色
    function colorSequenceActual(reNumber){
        var model = selectNodesActual('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        Command.Molecule.Highlight.dispatch(pluginActual.context, { model: model, query: query, isOn: true });
    }
    //鼠标mouseout消颜色
    function colorOffActual(reNumber){
        var model = selectNodesActual('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        Command.Molecule.Highlight.dispatch(pluginActual.context, { model: model, query: query, isOn: false });
    }
    /*清空函数 重新加载插件*/
    function resetModelActual(){
        Bootstrap.Command.Tree.RemoveNode.dispatch(pluginActual.context, pluginActual.context.tree.root);
    }
    //重置函数
    function resetActual() {
        Command.Visual.ResetScene.dispatch(pluginActual.context, void 0);
    }
    function createSelectionTheme(color) {
        // for more options also see Bootstrap/Visualization/Molecule/Theme
        var colors = LiteMol.Core.Utils.FastMap.create();
        colors.set('Uniform', CoreVis.Color.fromHex(0xffffff));
        colors.set('Selection', color);
        colors.set('Highlight', CoreVis.Theme.Default.HighlightColor);
        return Visualization.Molecule.uniformThemeProvider(void 0, { colors: colors });
    }
    //----------------------------------------------------------------------------------加载序列文件--------------------------------------------------------------------------------------------


    var DefaultComponents = [
        Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
        Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
        Plugin.Components.Transform.View(LayoutRegion.Right),
        Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
        Plugin.Components.Context.Overlay(LayoutRegion.Root),
        Plugin.Components.Context.Toast(LayoutRegion.Main, true),
        Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
    ];
    var NoLogComponents = [
        Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
        Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
        Plugin.Components.Transform.View(LayoutRegion.Right),
        Plugin.Components.Context.Overlay(LayoutRegion.Root),
        Plugin.Components.Context.Toast(LayoutRegion.Main, true),
        Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
    ];
    function create(target) {
        var customSpecification = {
            settings: {
                // currently these are all the 'global' settings available
                'molecule.model.defaultQuery': "residues({ name: 'ALA' })",
                'molecule.model.defaultAssemblyName': '1',
                'molecule.coordinateStreaming.defaultId': '1jj2',
                'molecule.coordinateStreaming.defaultServer': 'https://cs.litemol.org/',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5
            },
            transforms: [
                // These are the controls that are available in the UI. Removing any of them wont break anything, but the user
                // be able to create a particular thing if he deletes something.
                { transformer: LiteMol.Viewer.DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField },
                { transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile },
                { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download },
                { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile },
                // this uses the custom view defined in the CustomTransformView.tsx
                //{ transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming },
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: LiteMol.Example.CoordianteStreamingCustomView },
                // Raw data transforms
                { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
                // Molecule(model) transforms
                { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel },
                { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection },
                { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly },
                { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates },
                { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                // density transforms
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                // Coordinate streaming
                { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty },
                // Validation report
                { transformer: LiteMol.Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: LiteMol.Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty }
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                // keep these 2
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                // you will most likely not want this as this could cause trouble
                //Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
                // this colors the visual when it's selected by mouse or touch
                Bootstrap.Behaviour.ApplyInteractivitySelection,
                // this shows what atom/residue is the pointer currently over
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                // when the same element is clicked twice in a row, the selection is emptied
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                // distance to the last "clicked" element
                Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),
                // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                // While it is not required for any functionality, we as authors are very much interested in basic
                // usage statistics of the application and would appriciate if this behaviour is used.
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
            ],
            components: DefaultComponents,
            viewport: {
                // dont touch this either
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout,
            tree: {
                // or this
                region: LayoutRegion.Left,
                view: Views.Entity.Tree
            }
        };
        var plugin = Plugin.create({ target: target, customSpecification: customSpecification, layoutState: { hideControls: true } });
        plugin.context.logger.message("LiteMol Plugin Commands Example " + Plugin.VERSION.number);
        return plugin;
    }
    LiteMolPluginInstance.create = create;
})(LiteMolPluginInstance || (LiteMolPluginInstance = {}));


