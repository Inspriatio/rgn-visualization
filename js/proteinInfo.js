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
    $(function () {
        //1.获取到从form。html页面传过来的蛋白质id
        var proteinId = document.cookie.split(";")[0];
        //2.设置标题
        if(proteinId.length===5){
            $(document).attr("title",`${proteinId}-Information`);
            //3.可视化初始三级结构
            //3.1先判断是否获取到proteinId，再创建插件，再加载文件
            $("#btn_tertiary_structure").click(function () {
                divControl(".content");
                if($(".preStructure").children().length == 0 && $(".actStructure").children().length == 0){
                    loadInitStructure(proteinId,"preStructure","pre");
                    loadInitStructure(proteinId,"actStructure","act");
                    setTimeout(function(){colorChainPredicted()}, 600);
                }else{return;}
            });
            //3.2 创建空间曲线
            $("#btn_Space_Curve").click(function () {
                divControl(".content");
                if($(".initCurve").children().length == 0){
                    loadSpaceCurve(proteinId,"initCurve","pre");
                }else{return;}
            });
            //3.3 加载最佳平移旋转
            $("#btn_rotate_translate").click(function () {
                divControl(".content");
                //空间曲线
                if($(".KabschCurve").children().length == 0){
                    loadSpaceCurve(proteinId,"KabschCurve","next");
                }else{return;}
                //最佳旋转三级结构
                if($(".Kabsch").children().length === 0){
                        loadKabschStructure(proteinId,"Kabsch","preSplice");
                        $(".colorChain").click(function () {
                            colorChainFold();
                        });
                        // setTimeout(function(){colorChainFold()}, 800);
                    }else{return;}


            });
            //4.分片分析蛋白质结构
            // $("#btn_slice").click(function () {
            //     divControl(".content1");
            //     if($(".splicePDB").children().length != 0){
            //         return;
            //     }else{
            //         //加载分片蛋白质误差，序列，结构，扭转角
            //         loadSpliceCorrect(proteinId,"spliceData",function (Number) {
            //             for(let i = 0;i<Number;i++){
            //                 (function (j) {
            //                     setTimeout(function(){
            //                         var $perPDB = $(`<div class="perPDB" id="perPDB${j}"></div>`);
            //                         var $perPDBAngel = $(`<div class="perPDBAngel" id="perPDBAngel${j}"></div>`);
            //                         $("#splicePDB").append($perPDB);
            //                         $("#spliceAngel").append($perPDBAngel);
            //                         //加载每一段的三级结构
            //                         loadKabschStructure(proteinId,`perPDB${j}`,j);
            //                         $(`#perPDB${j}`).find(".lm-viewport-controls").css("opacity","0.3");
            //                         setTimeout(function(){colorChainFold()}, 1000);
            //                         //加载每一段的扭转角结构
            //                         loadSpliceAngel(proteinId,`perPDBAngel${j}`,j);
            //                     },2000 * j);
            //                 })(i);
            //
            //
            //
            //
            //             }
            //             // var $perPDB = $(`<div class="perPDB" id="perPDB${Number-1}"></div>`);
            //             // $("#splicePDB").append($perPDB);
            //             // loadKabschStructure(proteinId,`perPDB${Number-1}`,Number-1);
            //             // setTimeout(function(){colorChainFold()}, 800);
            //         });
            //     }
            //
            // });

            //5.可视化蛋白质氨基酸信息，三级结构，总体扭转角误差信息，实现框选可视化
            $("#btn_general_Information").click(function () {
                divControl(".content2");
                if($(".Acid_distribution").children().length !== 0){
                    return;
                }else{
                    //实现该氨基酸分布
                    AcidCountPerChain("Acid_distribution",proteinId);
                    //实现最佳旋转三级结构的可视化
                    loadKabschStructure(proteinId,"tertiaryStructure","preSplice");
                    $(`#tertiaryStructure`).find(".lm-viewport-controls").css("opacity","0.3");
                    //实现扭转角误差信息
                    allChart("Fold_chartSet",proteinId,null,0);
                    $(".colorChain").click(function () {
                        colorChainFold();
                    });
                }

            });
            //6.加载拉式图
            $("#btn_Ramachandran").click(function(){
                divControl(".content3");
                Ramachandran(proteinId,"Ramachandran");
                Ramachandran_region(proteinId,"Ramachandran_region")
            });
        }else{return;}

        //返回两个数之间的随机整数
        function getRandomNumberByRange(start, end) {
            return Math.floor(Math.random() * (end - start) + start)
        }
        //控制div显示消失
        function divControl(tempDiv) {
            $(tempDiv).fadeIn(500);
            $(tempDiv).siblings().fadeOut(500);
        }
        //加载初始蛋白质文件
        function loadInitStructure(proteinId,chartID,flag) {
            if(proteinId === null) return;
            else if(flag == "pre"){
                //创建插件
                creatPluginPredicted(chartID);
                // //加载文件
                loadMoleculePredicted(proteinId);
            }else if(flag == "act"){
                //创建插件
                creatPluginActual(chartID);
                // //加载文件
                loadMoleculeActual(proteinId);
            }
        }
        //加载空间曲线
        function loadSpaceCurve(fileName,chartID,flag){
            var dom = document.getElementById(chartID);
            var myChart = echarts.init(dom);
            var app = {};
            option = null;
            var data = [];
            let fileURL1 = "";
            let fileURL2 = "";
            if(flag == "pre"){
                fileURL1 = "data/Space_curve_coordinate/"+ fileName+"/"+fileName+"_preActCoordinate.csv";
                fileURL2 = "data/Space_curve_coordinate/"+ fileName+"/"+fileName+"_prePredicCoordinate.csv";
            }else if(flag == "next"){
                fileURL1 = "data/Space_curve_coordinate/"+ fileName+"/"+fileName+"_nextActCoordinate.csv";
                fileURL2 = "data/Space_curve_coordinate/"+ fileName+"/"+fileName+"_nextPredicCoordinate.csv";
            }
            Papa.parse(fileURL1, {
                download: true,
                complete: function(results1) {
                    // console.log(results.data)
                    Papa.parse(fileURL2, {
                        download: true,
                        complete: function(results2) {
                            // var Actdata = results1.data;
                            // var Predata = results2.data;
                            // console.log(Actdata)
                            // console.log(Predata)
                            var ActData=[];
                            var PreData=[];
                            for(var i=1;i<results1.data.length;i++){
                                ActData.push([+results1.data[i][0],+results1.data[i][1],+results1.data[i][2]]);
                            }
                            for(var i=1;i<results2.data.length;i++){
                                PreData.push([+results2.data[i][0],+results2.data[i][1],+results2.data[i][2]]);
                            }
                            // console.log(PreData)
                            // console.log(ActData)
                            option = {
                                tooltip: {
                                    formatter:function(e){
                                        if(e.seriesIndex == 0){
                                            return "predicted Structure"+"<br/>"+"coordinate："+"<br/>"+e.data
                                        }else if(e.seriesIndex == 1){
                                            return "Actual Structure"+"<br/>"+"coordinate："+"<br/>"+e.data
                                        }
                                    }
                                },
                                backgroundColor:'rgb(244, 247, 250)',
                                // visualMap: {
                                //     show: false,
                                //     dimension: 2,
                                //     min: 0,
                                //     max: 30,
                                //     inRange: {
                                //         color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                                //     }
                                // },
                                xAxis3D: {
                                    type: 'value'
                                },
                                yAxis3D: {
                                    type: 'value'
                                },
                                zAxis3D: {
                                    type: 'value'
                                },
                                grid3D: {
                                    viewControl: {
                                        projection: 'orthographic'
                                    }
                                },
                                series: [{
                                    type: 'line3D',
                                    data: PreData,
                                    lineStyle: {
                                        width: 4
                                    }
                                },{
                                    type: 'line3D',
                                    data: ActData,
                                    lineStyle: {
                                        width: 4
                                    }
                                }]
                            };
                            ;
                            if (option && typeof option === "object") {
                                myChart.setOption(option, true);
                            }


                        }
                    });
                }
            });
        }
        //加载平移后的结构（空间曲线加三级结构）
        function loadKabschStructure(proteinId,chartID,flag) {
            if(flag==="preSplice"){
                if(proteinId === null) return;
                else{
                    //创建插件
                    createpluginFold(chartID);
                    // //加载文件
                    loadMoleculeFold(proteinId,"act","rotate","preSplice");
                    loadMoleculeFold(proteinId,"pre","rotate","preSplice");

                }
            }else{
                if(proteinId === null) return;
                else{
                    //创建插件
                    createpluginFold(chartID);
                    // //加载文件
                    loadMoleculeFold(proteinId,"act","rotate",flag);
                    loadMoleculeFold(proteinId,"pre","rotate",flag);

                }
            }

        }
        //加载蛋白质分片图
        function loadSpliceCorrect(fileName,chartID,callBack) {
            $.ajax({
                //距离误差数据
                url:`data/Dis_Correct/${fileName}/${fileName}_dis_correct.json`,
                dataType:'json',
                success:function(data){
                    $.get(`data/file/${fileName}/${fileName}_sequence.txt`).done(function(sequenceData){
                        $.get(`data/flux_Correct2/${fileName}/${fileName}_flux_correct.json`).done(function(fluxData){
                            $.get(`data/RMSDProcess/${fileName}/${fileName}_RMSDProcess.json`).done(function(RMSDData){
                                $.get(`data/TorsionAngel/${fileName}/${fileName}_NEW_Angel.json`).done(function(AngelData){
                                    // console.log(AngelData)
                                    let sequence = [];
                                    let Mysequence=[];
                                    let RMSDSeries = [];
                                    let gridSeries = [];
                                    let seriesData = [];
                                    let dataX = [];
                                    let dataY = [];
                                    let dataXSeries = [];
                                    let dataYSeries = [];
                                    let dataSequence = [];
                                    let visualMapSeries = [];
                                    //根据序列长度判断有几行 每行50个
                                    let rowLength = 50;
                                    //看看能分为几行
                                    let row = Math.ceil(data.length/rowLength);
                                    callBack(row);
                                    // console.log(`共有${row}行`);
                                    //误差数据
                                    Dis_Correct_Data = splitArray(rowLength,data);
                                    // console.log(`误差数据`);
                                    // console.log(Dis_Correct_Data)

                                    //序列数据
                                    for(let i = 0;i<sequenceData.length;i++){
                                        dataSequence.push([i,0,1,i,sequenceData[i]]);
                                    }
                                    sequence = splitArray(rowLength,dataSequence);

                                    for(let i = 0;i<sequence.length;i++){
                                        for(let j = 0;j<sequence[i].length;j++){
                                            sequence[i][j][0] = j;
                                            for(let k = 0;k<fluxData.length;k++){
                                                if(fluxData[k].item === sequence[i][j][3]){
                                                    sequence[i][j][2] = 2;
                                                }
                                            }
                                        }
                                    }
                                    // console.log(`氨基酸数据`);
                                    // console.log(sequence)
                                    //RMSD数据处理
                                    RMSDSeries = splitArray(rowLength,RMSDData);
                                    // console.log("RMSD处理数据");
                                    // console.log(RMSDSeries);
                                    // for(let i = 0;i<RMSDData.length;i++){

                                    // }
                                    //处理gridSeries
                                    for(let i = 0;i<2*row;i++){
                                        if(i == 2*row - 1){
                                            gridSeries.push({
                                                left:'30',
                                                right:'10',
                                                height:'30px',
                                                width:'400px',
                                                top:`${Math.floor(i/2)*200+200+Math.floor(i/2)*30}px`
                                            });
                                        }else if(i == 2*row - 2){
                                            gridSeries.push({
                                                left:'30',
                                                right:'10',
                                                height:`150px`,
                                                width:'400px',
                                                top:`${Math.floor(i/2)*200+20+Math.floor(i/2)*30}px`
                                            });
                                        }else{
                                            if(i%2==0){
                                                gridSeries.push({
                                                    left:'30',
                                                    right:'25',
                                                    height:`150px`,
                                                    top:`${Math.floor(i/2)*200+20+Math.floor(i/2)*30}px`
                                                });
                                            }else{
                                                gridSeries.push({
                                                    left:'30',
                                                    right:'25',
                                                    height:'30px',
                                                    top:`${Math.floor(i/2)*200+200+Math.floor(i/2)*30}px`
                                                });
                                            }
                                        }

                                    }//success
                                    // console.log("grid数据");
                                    // console.log(gridSeries)
                                    //处理dataX
                                    // X轴数据
                                    for(var i = 0;i<data.length;i++){
                                        dataX.push(i);//[0,1,2,3,...n]
                                    }
                                    DataX = splitArray(rowLength,dataX);

                                    for(let i = 0;i<2*row;i++){
                                        if(i%2==0){
                                            dataXSeries.push({
                                                type: 'category',
                                                data: DataX[Math.floor(i/2)],
                                                gridIndex:i,
                                            });
                                        }else{
                                            dataXSeries.push({
                                                type: 'category',
                                                data: DataX[Math.floor(i/2)],
                                                gridIndex:i,
                                                axisLabel: {
                                                    show: false
                                                },
                                                axisLine: {
                                                    show: false
                                                },
                                                axisTick:{show:false}
                                            });
                                        }
                                    }//success
                                    // console.log("X轴数据");
                                    // console.log(dataXSeries)
                                    //处理y轴数据
                                    for(let i = 0;i<50;i++){
                                        dataY.push(i);
                                    }
                                    for(let i = 0;i<2*row;i++){
                                        if(i%2==0){
                                            dataYSeries.push( {
                                                    gridIndex:i,
                                                    // name: '误差',
                                                    type: 'value',
                                                    max: 30,

                                                },
                                                {
                                                    gridIndex:i,
                                                    // name: 'RMSD',
                                                    nameLocation: 'start',
                                                    max: 15,
                                                    type: 'value',
                                                    inverse: true,

                                                });
                                        }else{
                                            dataYSeries.push({
                                                type: 'category',
                                                // show:false,
                                                gridIndex: i,
                                                splitNumber: 1,
                                                axisLabel: {
                                                    show: false
                                                },
                                                axisLine: {
                                                    show: false
                                                },
                                                axisTick:{show:false}
                                            });
                                        }
                                    }//success
                                    // console.log("Y轴数据");
                                    // console.log(dataYSeries)
                                    //处理visualMap数据
                                    for(let i = 2;i<3*row;i=i+3){
                                        // if(i%2!=0){
                                        visualMapSeries.push({
                                            show:false,
                                            seriesIndex:i,
                                            min: 1,
                                            max: 2,
                                            dimension:2,
                                            calculable: true,
                                            orient: 'horizontal',
                                            left: 'center',
                                            bottom: '40%',
                                            color:["blue","red"]
                                        });
                                        // };

                                    }//success
                                    // console.log("visualMap数据");
                                    // console.log(visualMapSeries)
                                    //处理series数据
                                    for(let i = 0;i<2*row;i++){
                                        if(i%2==0){
                                            seriesData.push(
                                                {
                                                    name: '误差',
                                                    type: 'line',
                                                    animation: false,
                                                    xAxisIndex: `${i}`,
                                                    yAxisIndex: `${i/2*3}`,
                                                    areaStyle: {},
                                                    lineStyle: {
                                                        width: 1
                                                    },
                                                    data:Dis_Correct_Data[Math.floor(i/2)],
                                                },
                                                {
                                                    name: 'dRMSD',
                                                    type: 'line',
                                                    animation: false,
                                                    xAxisIndex: `${i}`,
                                                    yAxisIndex: `${i/2*3+1}`,
                                                    areaStyle: {},
                                                    lineStyle: {
                                                        width: 1
                                                    },
                                                    data: RMSDSeries[Math.floor(i/2)],
                                                }
                                            );
                                        }else{
                                            // let number = Math.floor(i/2) * 3 + 2;
                                            // console.log(number)
                                            seriesData.push({
                                                name: 'Acid',
                                                data: sequence[Math.floor(i/2)],
                                                type:'heatmap',
                                                xAxisIndex: `${i}`,
                                                yAxisIndex: `${Math.floor(i/2) * 3 + 2}`,
                                                tooltip:{
                                                    trigger:'item',
                                                    formatter(params){
                                                        if(params.data[2]==2){
                                                            return `索引：${params.data[3]}<br/>
															波动氨基酸：${params.data[4]}
									          				`;
                                                        }else{
                                                            return `索引：${params.data[3]}<br/>
															氨基酸：${params.data[4]}
									          				`;
                                                        }

                                                    }
                                                },
                                                label: {
                                                    show: true,
                                                    formatter: function(params) {
                                                        //根据params的data不同设置返回不同的数据
                                                        return params.data[4]
                                                        // console.log(params)
                                                    }
                                                },
                                                emphasis: {
                                                    itemStyle: {
                                                        shadowBlur: 10,
                                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                    },

                                                }
                                            });
                                        }

                                    }
                                    // console.log("series数据");
                                    // console.log(seriesData);
                                    // console.log(sequence[0])
                                    // console.log(sequence[1])

                                    var myChart = echarts.init(document.getElementById(chartID));
                                    // 指定图表的配置项和数据
                                    var option = {
                                        tooltip:{},
                                        // legend: {
                                        //        data: ['误差', 'dRMSD'],
                                        //        left: 10
                                        //    },
                                        grid:gridSeries,
                                        xAxis: dataXSeries,
                                        yAxis:dataYSeries,

                                        series: seriesData,
                                        visualMap:visualMapSeries,
                                    };
                                    // 使用刚指定的配置项和数据显示图表。
                                    myChart.setOption(option);
                                    // myChart.on('click', function (params) {
                                    //     // 控制台打印数据的名称
                                    //     console.log(params.name);
                                    // });
                                });
                            });
                        });
                    });

                },
                error:function(e){
                    console.log(e);
                }
            });
        }
        //加载扭转角分片图
        function loadSpliceAngel(fileName,chartID,tempNumber) {
            var myChart = echarts.init(document.getElementById(chartID));
            $.get('./data/TorsionAngel/'+fileName+'/'+fileName+'_NEW_Angel.json').done(function(data){
               let AllpreData = splitArray(50,data[0]);
               let AllactData = splitArray(50,data[1]);
               let AllData = [];
               for(let i = 0;i<AllpreData.length;i++){
                   let tempData = [];
                   tempData.push([AllpreData[i],AllactData[i]]);
                   AllData.push(tempData);
               }
                // console.log(AllData);
                // console.log(AllData[tempNumber]);
                var datax=[];
                var preData=[];
                var actData=[];
                var preData2=[];
                var actData2=[];
                for(var i=0;i<(data[0].length);i++){
                    datax.push(i);
                }
                datax = splitArray(50,datax);
                // console.log(datax);
                for(let i = 0;i<datax[tempNumber].length;i++){
                    preData.push(AllData[tempNumber][0][0][i][0]);//预测结构φ角
                    actData.push(AllData[tempNumber][0][1][i][0]);//真实结构φ角
                    preData2.push(AllData[tempNumber][0][0][i][1]);//预测结构ψ角
                    actData2.push(AllData[tempNumber][0][1][i][1]);//真实结构ψ角
                }
                // console.log(preData);
                // console.log(actData);
                // console.log(preData2);
                // console.log(actData2);
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
                        data: datax[tempNumber],
                        axisLine: {
                            lineStyle: {
                                color: "#999"
                            }
                        }
                    },{
                        gridIndex: 1,
                        type: 'category',
                        data: datax[tempNumber],
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
        //序列处理函数 140个序列以100个序列为一行处理为一行零40个 N = 100 Q = 需要处理的数组
        function splitArray(N,Q){
            var a=[],i;
            for(i = 0;i<Q.length;){
                a.push(Q.slice(i,i+=N));
            }
            return a;
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
                    backgroundColor:"#f4f7fa",
                    title:{
                        show:true,
                        text:`${fileName} Amino acid`,
                        top:'top',
                        left:'10',
                        textStyle:{
                            color:'#388852',
                            fontWeight:'lighter',
                            fontSize:16
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
                        bottom:'0',
                        containLabel: true,
                    },
                    series: [{
                        type: 'bar',
                        data: seriesData,
                        coordinateSystem: 'polar',
                        name: 'count',
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
                AcidChart.on('click', function (params) {
                    // console.log(params);
                    let acidName = params.name;
                    colorSequenceFold1(acidName);
                    allChart("Fold_chartSet",proteinId,"yes",acidName);
                });
                AcidChart.getZr().on("click", function(params) {
                    // const pointInPixel = [params.offsetX, params.offsetY];
                    // if (AcidChart.containPixel('grid',pointInPixel)) {
                    //     let index = AcidChart.convertFromPixel({seriesIndex:0},pointInPixel)[0];
                    //
                    // }
                    // console.log(params);
                    if(params.target === undefined){
                        allChart("Fold_chartSet",proteinId,null,0);
                        //实现最佳旋转三级结构的可视化
                        destroypluginFold();
                        loadKabschStructure(proteinId,"tertiaryStructure","preSplice");
                        $(`#tertiaryStructure`).find(".lm-viewport-controls").css("opacity","0.3");
                    }
                });
            });
        }
        // 扭转角，误差，序列，dRMSD一块显示
        function allChart(chartID,fileName,flag,acid) {
            $.ajax({
                //距离误差数据
                url:`data/Dis_Correct/${fileName}/${fileName}_dis_correct.json`,
                dataType:'json',
                success:function(data){
                    $.get(`data/file/${fileName}/${fileName}_sequence.txt`).done(function(sequenceData){
                        $.get(`data/TorsionAngel/${fileName}/${fileName}_NEW_Angel.json`).done(function(AngelData){
                            $.get(`data/RMSDProcess/${fileName}/${fileName}_RMSDProcess.json`).done(function(RMSDData){
                                if(flag !== null){
                                    let tempData = [];
                                    let correctData = [];
                                    let seqData = [];
                                    let angelData = [];
                                    let dRMSDData = [];
                                    for(let i = 0;i<sequenceData.length;i++){
                                        if(acid === sequenceData[i]){
                                            tempData.push(i);
                                        }
                                    }
                                    //处理误差,序列，RMSD数据
                                    for(let i = 0;i<data.length;i++){
                                        for(let j = 0;j<tempData.length;j++){
                                            if(tempData[j] === i){
                                                correctData.push(data[i]);
                                                seqData.push(sequenceData[i]);
                                                dRMSDData.push(RMSDData[i]);
                                                continue;
                                            }
                                        }

                                    }
                                    //处理扭转角数据
                                    let tempAngelact = [];
                                    let tempAngelpre = [];
                                    for(let i = 0;i<AngelData[0].length;i++){
                                        for(let j = 0;j<tempData.length;j++){
                                            if(tempData[j] === i){
                                                tempAngelpre.push(AngelData[0][i]);
                                                tempAngelact.push(AngelData[1][i]);
                                                continue;
                                            }
                                        }
                                    }
                                    angelData.push(tempAngelpre);
                                    angelData.push(tempAngelact);
                                    // console.log("误差数据");
                                    // console.log(correctData);
                                    // console.log("序列数据");
                                    // console.log(seqData);
                                    // console.log("扭转角数据");
                                    // console.log(angelData);
                                    // console.log("RMSD数据");
                                    // console.log(dRMSDData);
                                    let gridData = [];
                                    let dataX = [];
                                    let dataXSeries = [];
                                    let dataY = [];
                                    let dataYSeries = [];
                                    let dataVisualMap = [];
                                    let seriesData = [];
                                    let preAngel_Phi = [];
                                    let preAngel_Psi = [];
                                    let actAngel_Phi = [];
                                    let actAngel_Psi = [];
                                    let sequence = [];

                                    for(let i = 0;i<seqData.length;i++){
                                        sequence.push([i,0,1,seqData[i]])
                                    }
                                    for(let i = 0;i<angelData[0].length;i++){
                                        preAngel_Phi.push(angelData[0][i][0]);
                                        preAngel_Psi.push(angelData[0][i][1]);
                                        actAngel_Phi.push(angelData[1][i][0]);
                                        actAngel_Psi.push(angelData[1][i][1]);
                                    }
                                    // console.log(AngelData)
                                    //处理grid数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'10px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                            case 1:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'130px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                        formatter(params){
                                                            console.log(params)

                                                        }
                                                    },
                                                });
                                                break;
                                            case 2:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'250px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                            case 3:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'30px',
                                                    width:'800px',
                                                    top:'380px',
                                                    tooltip:{
                                                        trigger: 'item',
                                                        formatter:function(params){
                                                            return "seqNumber:"+(params.name)+"<br/>"+"Adid:  "+params.data[3];
                                                            // return params.data[3]
                                                        }

                                                    },
                                                });
                                                break;
                                            case 4:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'420px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("grid数据");
                                    // console.log(gridData);
                                    //处理dataX数据
                                    for(let i = 0;i < tempData.length;i++){
                                        dataX.push(tempData[i]+1);
                                    }
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 1:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 2:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 3:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                    axisLabel: {
                                                        show: false
                                                    },
                                                    axisLine: {
                                                        show: false
                                                    },
                                                    axisTick:{show:false}
                                                });
                                                break;
                                            case 4:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("X数据");
                                    // console.log(dataXSeries);
                                    //处理Y轴数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                dataYSeries.push({
                                                    type: 'value',
                                                    max:50,
                                                    min:0,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 1:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                            case 2:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                            case 3:
                                                dataYSeries.push({
                                                    type: 'category',

                                                    gridIndex:i,
                                                    axisLabel: {
                                                        show: false
                                                    },
                                                    axisLine: {
                                                        show: false
                                                    },
                                                    axisTick:{show:false}
                                                });
                                                break;
                                            case 4:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("Y数据");
                                    // console.log(dataYSeries);
                                    //处理visualMap数据
                                    dataVisualMap.push({
                                        show:false,
                                        seriesIndex:3,
                                        min: 1,
                                        max: 1,
                                        // dimension:2,
                                        calculable: true,
                                        orient: 'horizontal',
                                        left: 'center',
                                        bottom: '40%',
                                        color:["blue","red"]
                                    });
                                    // console.log("VisualMap数据");
                                    // console.log(dataVisualMap);
                                    //处理series数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                seriesData.push({
                                                    name: 'error',
                                                    data: correctData,
                                                    type:'line',
                                                    xAxisIndex: i,
                                                    yAxisIndex: i,
                                                    areaStyle: {},
                                                });
                                                break;
                                            case 1:
                                                seriesData.push({
                                                        // name: 'predicted-phi',
                                                        name: 'predict',
                                                        type: 'line',
                                                        data: preAngel_Phi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,

                                                        lineStyle:{
                                                            color:'blue'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'blue',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#F58080"
                                                            }
                                                        },
                                                        // smooth: true
                                                    },
                                                    {
                                                        // name: 'actual-phi',
                                                        name: 'actual',
                                                        type: 'line',
                                                        data: actAngel_Phi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'red'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'red',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#AAF487"
                                                            }
                                                        },
                                                        // smooth: true
                                                    });
                                                break;
                                            case 2:
                                                seriesData.push({
                                                        // name: 'predicted-psi',
                                                        name: 'predict',
                                                        type: 'line',
                                                        data: preAngel_Psi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'blue'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'blue',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#F58080"
                                                            }
                                                        },
                                                        // smooth: true
                                                    },
                                                    {
                                                        // name: 'actual-psi',
                                                        name: 'actual',
                                                        type: 'line',
                                                        data: actAngel_Psi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'red'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'red',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#AAF487"
                                                            }
                                                        },
                                                        // smooth: true
                                                    });
                                                break;
                                            case 3:
                                                seriesData.push({
                                                    name: 'Acid',
                                                    data: sequence,
                                                    type:'heatmap',
                                                    xAxisIndex: i,
                                                    yAxisIndex: i,

                                                    label: {
                                                        show: true,
                                                        formatter: function(params) {
                                                            //根据params的data不同设置返回不同的数据
                                                            return params.data[3]
                                                            // console.log(params)
                                                        }
                                                    },
                                                    emphasis: {
                                                        itemStyle: {
                                                            shadowBlur: 10,
                                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                        },

                                                    }
                                                });
                                                break;
                                            case 4:
                                                seriesData.push({
                                                    name: 'dRMSD',
                                                    type: 'line',
                                                    animation: false,

                                                    xAxisIndex: i,
                                                    yAxisIndex: i,
                                                    lineStyle: {
                                                        width: 1
                                                    },
                                                    data: dRMSDData,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("series数据");
                                    // console.log(seriesData);
                                    var myChart1 = echarts.init(document.getElementById(chartID));
                                    var option1 = {
                                        backgroundColor:'#f4f7fa',
                                        title:[{
                                            text:'Error',
                                            right:'0',
                                            top:'0',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Angle-φ',
                                            right:'0',
                                            top:'32%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Angle-ψ',
                                            right:'0',
                                            top:'45%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Seq',
                                            right:'0',
                                            top:'62%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'dRMSD',
                                            right:'0',
                                            top:'70%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        }],
                                        tooltip:{
                                            trigger: 'axis',

                                        },
                                        legend: {
                                            // color: ["#F58080", "#47D8BE"],
                                            // color: ["blue", "red"],
                                            data: ["predict","actual"],
                                            right: '0',
                                            bottom: '55%',
                                            orient:'vertical',
                                            itemGap:20
                                        },
                                        grid:gridData,
                                        xAxis: dataXSeries,
                                        yAxis:dataYSeries,
                                        axisPointer: {
                                            // show:'true',
                                            link: {xAxisIndex: [1, 2]},
                                            // label: {
                                            //     backgroundColor: 'red'
                                            // }
                                        },
                                        dataZoom:{
                                            type:'slider',
                                            xAxisIndex: [0, 1,2,3,4],
                                            start:0,
                                            end:30,
                                            bottom:"11%",
                                            throttle:1000
                                        },
                                        series: seriesData,
                                        visualMap:dataVisualMap,
                                    };
                                    // 使用刚指定的配置项和数据显示图表。
                                    myChart1.setOption(option1);
                                    myChart1.on("mouseover",function(params){
                                        // console.log(params);

                                        let tempNumber = +params.name;
                                        if(pluginFold && params.componentSubType === "heatmap"){
                                            colorSequenceFold(tempNumber,null);
                                        }else{return;}

                                    });
                                    myChart1.on("mouseout",function(params){
                                        let tempNumber = +params.name;
                                        if(pluginFold && params.componentSubType === "heatmap"){
                                            colorOffFold(tempNumber,null);
                                        }else{return;}

                                    });
                                    myChart1.on("dataZoom",function(params){
                                        let len = sequenceData.length;
                                        let startloc = Math.ceil(len * params.start / 100);
                                        let endloc = Math.ceil(len * params.end / 100);
                                        // colorSequenceFold2(startloc,endloc,"pre");
                                        // colorSequenceFold2(startloc,endloc,"act");
                                        colorSequenceFold1(acid);

                                    })
                                }else{
                                    let gridData = [];
                                    let dataX = [];
                                    let dataXSeries = [];
                                    let dataY = [];
                                    let dataYSeries = [];
                                    let dataVisualMap = [];
                                    let seriesData = [];
                                    let dRMSDData = [];
                                    let preAngel_Phi = [];
                                    let preAngel_Psi = [];
                                    let actAngel_Phi = [];
                                    let actAngel_Psi = [];
                                    let sequence = [];

                                    for(let i = 0;i<sequenceData.length;i++){
                                        sequence.push([i,0,1,sequenceData[i]])
                                    }
                                    for(let i = 0;i<AngelData[0].length;i++){
                                        preAngel_Phi.push(AngelData[0][i][0]);
                                        preAngel_Psi.push(AngelData[0][i][1]);
                                        actAngel_Phi.push(AngelData[1][i][0]);
                                        actAngel_Psi.push(AngelData[1][i][1]);
                                    }
                                    // console.log(AngelData)
                                    //处理grid数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'10px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                            case 1:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'130px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                        formatter(params){
                                                            console.log(params)

                                                        }
                                                    },
                                                });
                                                break;
                                            case 2:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'250px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                            case 3:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'30px',
                                                    width:'800px',
                                                    top:'380px',
                                                    tooltip:{
                                                        trigger: 'item',
                                                        formatter(params){
                                                            // console.log(params)
                                                            return "seqNumber:"+(params.data[0]+1)+"<br/>"+"Adid:  "+params.data[3];
                                                            // return params.data[3]
                                                        }

                                                    },
                                                });
                                                break;
                                            case 4:
                                                gridData.push({
                                                    left:'30',
                                                    right:'20%',
                                                    height:'100px',
                                                    width:'800px',
                                                    top:'420px',
                                                    tooltip:{
                                                        trigger: 'axis',
                                                    },
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("grid数据");
                                    // console.log(gridData);
                                    //处理dataX数据
                                    for(let i = 0;i < sequenceData.length;i++){
                                        dataX.push(i+1);
                                    }
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 1:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 2:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                            case 3:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                    axisLabel: {
                                                        show: false
                                                    },
                                                    axisLine: {
                                                        show: false
                                                    },
                                                    axisTick:{show:false}
                                                });
                                                break;
                                            case 4:
                                                dataXSeries.push({
                                                    type: 'category',
                                                    data:dataX,
                                                    gridIndex:i,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("X数据");
                                    // console.log(dataXSeries);
                                    //处理Y轴数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                    max:50,
                                                    min:0
                                                });
                                                break;
                                            case 1:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                            case 2:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                            case 3:
                                                dataYSeries.push({
                                                    type: 'category',

                                                    gridIndex:i,
                                                    axisLabel: {
                                                        show: false
                                                    },
                                                    axisLine: {
                                                        show: false
                                                    },
                                                    axisTick:{show:false}
                                                });
                                                break;
                                            case 4:
                                                dataYSeries.push({
                                                    type: 'value',

                                                    gridIndex:i,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("Y数据");
                                    // console.log(dataYSeries);
                                    //处理visualMap数据
                                    dataVisualMap.push({
                                        show:false,
                                        seriesIndex:3,
                                        min: 1,
                                        max: 1,
                                        // dimension:2,
                                        calculable: true,
                                        orient: 'horizontal',
                                        left: 'center',
                                        bottom: '40%',
                                        color:["blue","red"]
                                    });
                                    // console.log("VisualMap数据");
                                    // console.log(dataVisualMap);
                                    //处理series数据
                                    for(let i = 0;i<5;i++){
                                        switch(i){
                                            case 0:
                                                seriesData.push({
                                                    name: '误差',
                                                    data: data,
                                                    type:'line',
                                                    xAxisIndex: i,
                                                    yAxisIndex: i,
                                                    areaStyle: {},
                                                });
                                                break;
                                            case 1:
                                                seriesData.push({
                                                        // name: 'predicted-phi',
                                                        name: 'predict',
                                                        type: 'line',
                                                        data: preAngel_Phi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,

                                                        lineStyle:{
                                                            color:'blue'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'blue',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#F58080"
                                                            }
                                                        },
                                                        // smooth: true
                                                    },
                                                    {
                                                        // name: 'actual-phi',
                                                        name: 'actual',
                                                        type: 'line',
                                                        data: actAngel_Phi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'red'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'red',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#AAF487"
                                                            }
                                                        },
                                                        // smooth: true
                                                    });
                                                break;
                                            case 2:
                                                seriesData.push({
                                                        // name: 'predicted-psi',
                                                        name: 'predict',
                                                        type: 'line',
                                                        data: preAngel_Psi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'blue'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'blue',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#F58080"
                                                            }
                                                        },
                                                        // smooth: true
                                                    },
                                                    {
                                                        // name: 'actual-psi',
                                                        name: 'actual',
                                                        type: 'line',
                                                        data: actAngel_Psi,
                                                        xAxisIndex: i,
                                                        yAxisIndex: i,
                                                        lineStyle:{
                                                            color:'red'
                                                        },
                                                        itemStyle: {
                                                            normal: {
                                                                color: 'red',
                                                                borderWidth: 1,
                                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                                 shadowBlur: 100,*/
                                                                borderColor: "#AAF487"
                                                            }
                                                        },
                                                        // smooth: true
                                                    });
                                                break;
                                            case 3:
                                                seriesData.push({
                                                    name: 'Acid',
                                                    data: sequence,
                                                    type:'heatmap',
                                                    xAxisIndex: i,
                                                    yAxisIndex: i,

                                                    label: {
                                                        show: true,
                                                        formatter: function(params) {
                                                            //根据params的data不同设置返回不同的数据
                                                            return params.data[3]
                                                            // console.log(params)
                                                        }
                                                    },
                                                    emphasis: {
                                                        itemStyle: {
                                                            shadowBlur: 10,
                                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                        },

                                                    }
                                                });
                                                break;
                                            case 4:
                                                seriesData.push({
                                                    name: 'dRMSD',
                                                    type: 'line',
                                                    animation: false,

                                                    xAxisIndex: i,
                                                    yAxisIndex: i,
                                                    lineStyle: {
                                                        width: 1
                                                    },
                                                    data: RMSDData,
                                                });
                                                break;
                                        }
                                    }
                                    // console.log("series数据");
                                    // console.log(seriesData);
                                    var myChart1 = echarts.init(document.getElementById(chartID));
                                    var option1 = {
                                        backgroundColor:'#f4f7fa',
                                        title:[{
                                            text:'Error',
                                            right:'0',
                                            top:'0',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Angle-φ',
                                            right:'0',
                                            top:'32%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Angle-ψ',
                                            right:'0',
                                            top:'45%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'Seq',
                                            right:'0',
                                            top:'62%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        },{
                                            text:'dRMSD',
                                            right:'0',
                                            top:'70%',
                                            textStyle:{
                                                color:'#388852',
                                                fontWeight:'lighter',
                                                fontSize:16
                                            }
                                        }],
                                        tooltip:{
                                            trigger: 'axis',
                                        },
                                        legend: {
                                            // color: ["#F58080", "#47D8BE"],
                                            // color: ["blue", "red"],
                                            data: ["predict","actual"],
                                            right: '0',
                                            bottom: '55%',
                                            orient:'vertical',
                                            itemGap:20
                                        },
                                        grid:gridData,
                                        xAxis: dataXSeries,
                                        yAxis:dataYSeries,
                                        axisPointer: {
                                            // show:'true',
                                            link: {xAxisIndex: [1, 2]},
                                            // label: {
                                            //     backgroundColor: 'red'
                                            // }
                                        },
                                        dataZoom:{
                                            type:'slider',
                                            xAxisIndex: [0, 1,2,3,4],
                                            start:0,
                                            end:30,
                                            bottom:"11%",
                                            throttle:1000
                                        },
                                        series: seriesData,
                                        visualMap:dataVisualMap,
                                    };
                                    // 使用刚指定的配置项和数据显示图表。
                                    myChart1.setOption(option1);
                                    myChart1.on("mouseover",function(params){
                                        // console.log(params);
                                        let tempNumber = +params.name;
                                        // console.log(tempNumber);
                                        if(pluginFold && params.componentSubType === "heatmap"){
                                            colorSequenceFold(tempNumber,null);
                                        }else{
                                            console.log("hover时没找到插件");
                                        }

                                    });
                                    myChart1.on("mouseout",function(params){
                                        let tempNumber = +params.name;
                                        // console.log(tempNumber);
                                        if(pluginFold && params.componentSubType === "heatmap"){
                                            colorOffFold(tempNumber,null);
                                        }else{console.log("没找到插件");}

                                    });
                                    myChart1.on("dataZoom",function(params){
                                        let len = sequenceData.length;
                                        let startloc = Math.ceil(len * params.start / 100);
                                        let endloc = Math.ceil(len * params.end / 100);
                                        colorSequenceFold2(startloc,endloc,"pre");
                                        resetFold();
                                        colorSequenceFold3(startloc,endloc,"pre");
                                        chart_Distance_Matrix(fileName,"predistance","actdistance","disdistance",startloc,endloc);
                                        // $(".colorChain2").click(function () {
                                        //     resetFold();
                                        //     colorSequenceFold3(startloc,endloc,"pre")
                                        // });
                                        // colorSequenceFold2(startloc,endloc,"act");
                                    })
                                }
                            });
                        });
                    });

                },
                error:function(e){
                    console.log(e);
                }
            });
        }
        // 距离矩阵自定义可视化
        function chart_Distance_Matrix(proteinId,chartId1,chartId2,chartId3,startLoc,endLoc) {
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
                for(let axis=startLoc;axis<=endLoc;axis++){//data.length = 3
                    xData.push(axis);//序列长度
                    yData.push(axis);//序列长度
                }
                for(let m=startLoc,i = 0;m<endLoc;m++,i++){
                    for(let n=startLoc,j = 0;n<endLoc;n++,j++){
                        PreDisData.push([i,j,data[0][m][n]]);
                        ActDisData.push([i,j,data[1][m][n]]);
                        DividedDisData.push([i,j,data[2][m][n]]);
                    }
                }

                var option1 = {
                    backgroundColor:"#F4F7FA",
                    tooltip: {},
                    grid:{
                        top:"10px",
                        left:"20px",
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
                    backgroundColor:"#F4F7FA",
                    tooltip: {},
                    grid:{
                        top:"10px",
                        left:"20px",
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
                    backgroundColor:"#F4F7FA",
                    tooltip: {
                        // trigger:'item',
                        // formatter:function (params) {
                        //     console.log(params);
                        // }
                    },
                    grid:{
                        top:"10px",
                        left:"20px",
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
        //拉式图可视化
        function Ramachandran(proteinId,chartId) {
            var myChart = echarts.init(document.getElementById(chartId));
            $.get('./data/TorsionAngel/'+proteinId+'/'+proteinId+'_NEW_Angel.json').done(function (data) {
                // console.log(data[0]);
                // console.log(data[1]);
                let predicted_data=[];
                let actual_data=[];
                for(let i=0;i<data[0].length;i++){
                    predicted_data.push([data[0][i][0],data[0][i][1]]);
                }
                for(let i=0;i<data[1].length;i++){
                    actual_data.push([data[1][i][0],data[1][i][1]]);
                }

                // console.log(predicted_data);
                // console.log(actual_data);
                var fSize = 12;
                var color = "black";
                option = {
                    color: ['blue','purple'],
                    /*backgroundColor: {
                     type: "pattern",
                     repeat: "repeat",
                     image:img
                     },*/
                    brush:{
                        //brushType:'lineX',
                        throttleType:'debounce',
                        throttleDelay:2000,
                        //brushMode:'single',
                        transformable:false,
                        toolbox:['rect','lineX','clear'],
                        xAxisIndex: 'all',
                        yAxisIndex: 'all',

                    },
                    tooltip: {
                        formatter: function(params) {
                            // console.log(params);
                            return proteinId+"<br>"+params.seriesName + '<br>phi : ' + params.data[0] +"°"+ '<br>psi : ' + params.data[1]+"°";
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
                        //data: ["Predicted"]
                        /*data:[{
                         name:"Predicted",
                         textStyle: {
                         color: 'blue'
                         }
                         },{
                         name:"Actual",
                         textStyle: {
                         color: 'purple'
                         }
                         }]*/
                    },
                    grid: {
                        left: '0%',
                        right: '0%',
                        bottom: '0%',
                        top: "0%",
                        //containLabel: true
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
                        symbol:'rect',
                        data:predicted_data
                    },
                        {
                            name: 'Actual',
                            type: 'scatter',
                            symbol:'rect',
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
                    //console.log(params.batch[0].areas[0].coordRange);
                    if(params.batch[0].areas[0]!==undefined){
                        // console.log(params.batch[0].areas[0].coordRange);
                        /*console.log(params.batch[0].selected[0].seriesName);
                         console.log(params.batch[0].selected[0].dataIndex);
                         console.log(params.batch[0].selected[1].seriesName);
                         console.log(params.batch[0].selected[1].dataIndex);*/
                    }
                    // $("#cancel").click(function(){
                    //     myChart.dispatchAction({
                    //         type: 'brush',//选择action行为
                    //         areas:[]//areas表示选框的集合，此时为空即可。
                    //     });
                    // });
                    //console.log(params.batch[0].areas[0].coordRanges);
                });
            });

        }
        //拉式区域的可视化
        function Ramachandran_region(proteinId,chartId) {
            $.get("data/TorsionAngel/"+proteinId+"/"+proteinId+"_NEW_Angel.json").done(function(AngelData){
                $.get("data/file/"+proteinId+"/"+proteinId+"_sequence.txt").done(function(sequenceData){
                    //处理数据
                    //看看能分成几段
                    let splitNum = 100;
                    let row = splitArray(splitNum,sequenceData).length;
                    //将数据填入每一段
                    //处理grid
                    let dataGrid = [];
                    let dataX = [];
                    for(let i = 0;i<sequenceData.length;i++){
                        dataX.push(sequenceData[i]);
                    }
                    dataX = splitArray(splitNum,dataX);
                    for(let i = 0;i<row;i++){
                        if(i !== row -1){
                            dataGrid.push({
                                top:`${(i*50)+10}px`,
                                width:'800px',
                                left:'5%',
                                right:'5%',
                                height:'20px',
                            });
                        }else{
                            let endLength = dataX[row-1].length;
                            dataGrid.push({
                                top:`${(i*50)+10}px`,
                                width:`${endLength*8}px`,
                                left:'5%',
                                right:'5%',
                                height:'20px',
                            });
                        }
                    }
                    for(let i = row;i<2*row;i++){
                        if(i !== 2*row - 1){
                            dataGrid.push({
                                top:`${(i*50)+10}px`,
                                width:'800px',
                                left:'5%',
                                right:'5%',
                                height:'20px',
                            });
                        }else{
                            let endLength = dataX[row-1].length;
                            dataGrid.push({
                                top:`${(i*50)+10}px`,
                                width:`${endLength*8}px`,
                                left:'5%',
                                right:'5%',
                                height:'20px',
                            });
                        }
                    }
                    // console.log("dataGrid");
                    // console.log(dataGrid);
                    //处理扭转角等级
                    let AngelGradePre = [];
                    let AngelGradeAct = [];
                    let grade = 0;
                    let grade2 = 0;
                    for(let i = 0;i<AngelData[0].length;i++){
                        switch(AngelData[0][i][2]){
                            case "favoured":
                                grade = 4;
                                break;
                            case "allowed":
                                grade = 3;
                                break;
                            case "generously":
                                grade = 2;
                                break;
                            case "disallowed":
                                grade = 1;
                                break;
                            default:
                                grade = 0;
                                break;
                        }
                        switch(AngelData[1][i][2]){
                            case "favoured":
                                grade2 = 4;
                                break;
                            case "allowed":
                                grade2 = 3;
                                break;
                            case "generously":
                                grade2 = 2;
                                break;
                            case "disallowed":
                                grade2 = 1;
                                break;
                            default:
                                grade2 = 0;
                                break;
                        }
                        AngelGradePre.push(grade);
                        AngelGradeAct.push(grade2);
                    }

                    //根据各自的扭转角等级转换为各自的图形
                    let dataGradePrePlot = [];
                    let dataGradeActPlot = [];
                    let symbol = ["rect","circle","roundRect","triangle","diamond"];
                    let color = ["red","green","pink","purple"];
                    for(let i = 0;i<AngelGradePre.length;i++){
                        let index = AngelGradePre[i];
                        switch(index){
                            case 4:
                                dataGradePrePlot.push({ value: 1,symbol:"triangle",symbolPosition:'start',itemStyle:{color:"red"},symbolSize: ['50%', '70%']});
                                break;
                            case 3:
                                dataGradePrePlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"#ffff00"},symbolSize: ['50%', '70%']});
                                break;
                            case 2:
                                dataGradePrePlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"#f2f4a8"},symbolSize: ['50%', '100%']});
                                break;
                            case 1:
                                dataGradePrePlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"blue"},symbolSize: ['50%', '100%']});
                                break;
                            case 0:
                                dataGradePrePlot.push({value:1,symbol:"diamond",symbolPosition:'start',itemStyle:{color:"transparent"},symbolSize: ['0%', '60%']});
                                break;
                        }
                    }
                    for(let i = 0;i<AngelGradeAct.length;i++){
                        let index = AngelGradeAct[i];
                        switch(index){
                            case 4:
                                dataGradeActPlot.push({ value: 1,symbol:"triangle",symbolPosition:'start',itemStyle:{color:"red"},symbolSize: ['50%', '70%']});
                                break;
                            case 3:
                                dataGradeActPlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"#ffff00"},symbolSize: ['50%', '70%']});
                                break;
                            case 2:
                                dataGradeActPlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"#f4f3a8"},symbolSize: ['50%', '100%']});
                                break;
                            case 1:
                                dataGradeActPlot.push({value:1,symbol:"rect",symbolPosition:'start',itemStyle:{color:"blue"},symbolSize: ['50%', '100%']});
                                break;
                            case 0:
                                dataGradeActPlot.push({value:1,symbol:"diamond",symbolPosition:'start',itemStyle:{color:"transparent"},symbolSize: ['0%', '60%']});
                                break;
                        }
                    }

                    dataGradeActPlot = splitArray(splitNum,dataGradeActPlot);
                    dataGradePrePlot = splitArray(splitNum,dataGradePrePlot);
                    // console.log(dataGradeActPlot);

                    //处理x轴,y轴,series
                    let XSeries = [];
                    let YSeries = [];
                    let Series = [];
                    for(let i = 0;i<row;i++){
                        XSeries.push({
                            axisLabel: {show: true, interval: 1},
                            axisTick: {show: true, interval: 5},
                            data: dataX[i],
                            gridIndex: i,
                            type: "category"
                        });
                        YSeries.push({
                            splitLine: {show: false},
                            axisLabel: {show: false},
                            axisLine: {show: false},
                            axisTick: {show: false},
                            gridIndex: i,
                            name: `${i*100+1}`,
                            nameGap: 20,
                            nameLocation: "middle",
                            nameRotate: 0,
                            nameTextStyle: {fontWeight: "bold", verticalAlign: "bottom"},
                            position: "top",
                            splitNumber: 1,
                            // type: "category",
                        });
                        Series.push({
                            symbolPosition: "start",
                            type: "pictorialBar",
                            data:dataGradePrePlot[i],
                            z: 10,
                            xAxisIndex: i,
                            yAxisIndex: i
                        });
                    }
                    for(let i = row;i<2*row;i++){
                        XSeries.push({
                            axisLabel: {show: true, interval: 1},
                            axisTick: {show: true, interval: 5},
                            data: dataX[i%row],
                            gridIndex: i,
                            type: "category"
                        });
                        YSeries.push({
                            splitLine: {show: false},
                            axisLabel: {show: false},
                            axisLine: {show: false},
                            axisTick: {show: false},
                            gridIndex: i,
                            name: `${(i%row)*100+1}`,
                            nameGap: 20,
                            nameLocation: "middle",
                            nameRotate: 0,
                            nameTextStyle: {fontWeight: "bold", verticalAlign: "bottom"},
                            position: "top",
                            splitNumber: 1,
                            // type: "category",
                        });
                        Series.push({
                            symbolPosition: "start",
                            type: "pictorialBar",
                            data:dataGradeActPlot[i%row],
                            z: 10,
                            xAxisIndex: i,
                            yAxisIndex: i
                        });
                    }

                    // console.log("X数据")
                    // console.log(XSeries)
                    // console.log("Y数据")
                    // console.log(YSeries)
                    // console.log("series数据")
                    // console.log(Series)
                    let myChart = echarts.init(document.getElementById(chartId));
                    // let option = {
                    //              	grid: {
                    //              		top:'10px',
                    //              		height:'20px',
                    //              		width:'800px',
                    //
                    //              	},
                    //                  tooltip: {
                    //                  },
                    //                  xAxis:{
                    //                  	axisLabel: {show: true, interval: 0},
                    // axisTick: {show: true, interval: 5},
                    // data: dataX[0],
                    // // gridIndex: 0
                    // type: "category"
                    //                  },
                    //                  yAxis: {
                    //                  	axisLabel: {show: false},
                    // axisLine: {show: false},
                    // axisTick: {show: false},
                    // // gridIndex: 0,
                    // name: "1",
                    // nameGap: 20,
                    // nameLocation: "middle",
                    // nameRotate: 0,
                    // nameTextStyle: {fontWeight: "bold", verticalAlign: "bottom"},
                    // position: "bottom",
                    // splitNumber: 1,
                    // type: "category",
                    //                  },
                    //                  series:{
                    //                  	label: {show: true},
                    // symbolPosition: "start",
                    // type: "pictorialBar",
                    // data:myAngelActGrade[0]
                    //                  }
                    //            };

                    let option = {
                        backgroundColor:"#f4f7fa",
                        tooltip:{
                            trigger:'item',
                            formatter:function (params) {
                                // console.log(params);
                                let color = ["blue","green","pink","red"];
                                let grade = ["favoured","allowed","generous","disallowed"]
                                let tempColor = params.color;
                                for(let i = 0;i<color.length;i++){
                                    if(tempColor === color[i]){
                                        return "item："+params.dataIndex+"<br/>"+"Grade："+grade[i]
                                    }
                                }

                            }
                        },
                        grid:dataGrid,
                        xAxis: XSeries,
                        yAxis: YSeries
                        ,series: Series
                    };
                    myChart.setOption(option);

                });
            });

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
    function loadMoleculeFold(fileName,flag1,flag2,flag3) {
        var URL="";
        if(flag3 === "preSplice"){
            if(flag1 === "act" && flag2 === "init" ){URL=`file/${fileName}/${fileName}_Actual.cif`}else if(flag1 === "pre" && flag2 === "init"){URL = `file/${fileName}/${fileName}_Predicted.cif`}
            if(flag1 === "act" && flag2 === "rotate" ){URL=`RotatePDB/${fileName}/${fileName}_BackActual.cif`}else if(flag1 === "pre" && flag2 === "rotate"){URL = `RotatePDB/${fileName}/${fileName}_BackPredicted.cif`}

        }else{
            if(flag1 === "act"){URL = `Process_spliceCif/${fileName}/${fileName}_test${flag3}_BackActual.pdb.cif`}
            if(flag1 === "pre"){URL = `Process_spliceCif/${fileName}/${fileName}_test${flag3}_BackPredicted.pdb.cif`}

        }
        resetModelFold();
        var id=moleculeId;
        var action = Transform.build()
            .add(pluginFold.context.tree.root, Transformer.Data.Download, { url: "./data/"+URL, type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransformsFold(action);
        setTimeout(function(){colorChainFold()}, 1300);

    }
    //给某一个氨基酸添加颜色
    function colorSequenceFold1(acid){
        resetFold();

        let model1 = pluginFold.selectEntities('model')[0];
        let model2 = pluginFold.selectEntities('model')[1];
        let colorseq1 = [];
        let colorseq2 = [];

        let sequenceDic = [{"acid": "A", "acidName": "Ala"}, {"acid": "C", "acidName": "Cys"}, {"acid": "D", "acidName": "Asp"},
            {"acid": "E", "acidName": "Glu"}, {"acid": "F", "acidName": "Phe"}, {"acid": "G", "acidName": "Gly"},
            {"acid": "H", "acidName": "His"}, {"acid": "I", "acidName": "Ile"}, {"acid": "K", "acidName": "Lys"},
            {"acid": "L", "acidName": "Leu"}, {"acid": "M", "acidName": "Met"}, {"acid": "N", "acidName": "Asn"},
            {"acid": "P", "acidName": "Pro"}, {"acid": "Q", "acidName": "Gln"}, {"acid": "R", "acidName": "Arg"},
            {"acid": "S", "acidName": "Ser"}, {"acid": "T", "acidName": "Thr"}, {"acid": "V", "acidName": "Val"},
            {"acid": "W", "acidName": "Trp"}, {"acid": "Y", "acidName": "Tyr"}];
        for(let i = 0;i<sequenceDic.length;i++){
            if(acid === sequenceDic[i]["acid"]){
                let AcidName = sequenceDic[i]["acidName"].toUpperCase();
                let authData = model1.props.model.data.residues.name;
                for(let j = 0;j<authData.length;j++){
                    if(AcidName === authData[j]){
                        colorseq1.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 0, g: 0, b: 0}});
                        colorseq2.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 0, g: 255, b: 0}});
                    }
                }
            }
        }
        // console.log(colorseq1);
        // console.log(colorseq2);
        if (!model1 && !model2)
            return;
        let coloring1 = {
            base: { r: 255, g: 255, b: 255 },
            entries:colorseq1
        };
        let coloring2 = {
            base: { r: 255, g: 255, b: 255 },
            entries:colorseq2
        };
        let theme1 = LiteMolPluginInstance.CustomTheme.createTheme(model1.props.model, coloring1);
        // let theme2 = LiteMolPluginInstance.CustomTheme.createTheme(model2.props.model, coloring2);
        // instead of "polymer-visual", "model" or any valid ref can be used: all "child" visuals will be colored.
        LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme1);
        // LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme2);
    }
    //给某一段添加颜色
    function colorSequenceFold2(startLoc,endLoc,flag){
        resetFold();
        if(flag === "act"){
            let model1 = pluginFold.selectEntities('model')[0];
            // console.log("真实model,MODEL1");
            // console.log(model1);
            let colorseq1 = [];


            let sequenceDic = [{"acid": "A", "acidName": "Ala"}, {"acid": "C", "acidName": "Cys"}, {"acid": "D", "acidName": "Asp"},
                {"acid": "E", "acidName": "Glu"}, {"acid": "F", "acidName": "Phe"}, {"acid": "G", "acidName": "Gly"},
                {"acid": "H", "acidName": "His"}, {"acid": "I", "acidName": "Ile"}, {"acid": "K", "acidName": "Lys"},
                {"acid": "L", "acidName": "Leu"}, {"acid": "M", "acidName": "Met"}, {"acid": "N", "acidName": "Asn"},
                {"acid": "P", "acidName": "Pro"}, {"acid": "Q", "acidName": "Gln"}, {"acid": "R", "acidName": "Arg"},
                {"acid": "S", "acidName": "Ser"}, {"acid": "T", "acidName": "Thr"}, {"acid": "V", "acidName": "Val"},
                {"acid": "W", "acidName": "Trp"}, {"acid": "Y", "acidName": "Tyr"}];
            for(let j = startLoc;j<endLoc;j++){
                colorseq1.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 0, g: 0, b: 255}});
                // colorseq2.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 0, g: 255, b: 0}});

            }
            if (!model1)
                return;
            let coloring1 = {
                base: { r: 255, g: 255, b: 255 ,a:0},
                entries:colorseq1
            };
            let theme1 = LiteMolPluginInstance.CustomTheme.createTheme(model1.props.model, coloring1);
            // let theme2 = LiteMolPluginInstance.CustomTheme.createTheme(model2.props.model, coloring2);
            // instead of "polymer-visual", "model" or any valid ref can be used: all "child" visuals will be colored.
            LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme1);


            // LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme2);
        }
        else if(flag === "pre"){

            let model2 = pluginFold.selectEntities('model')[1];
            // console.log("预测model,model2");
            // console.log(model2);
            let colorseq2 = [];

            let sequenceDic = [{"acid": "A", "acidName": "Ala"}, {"acid": "C", "acidName": "Cys"}, {"acid": "D", "acidName": "Asp"},
                {"acid": "E", "acidName": "Glu"}, {"acid": "F", "acidName": "Phe"}, {"acid": "G", "acidName": "Gly"},
                {"acid": "H", "acidName": "His"}, {"acid": "I", "acidName": "Ile"}, {"acid": "K", "acidName": "Lys"},
                {"acid": "L", "acidName": "Leu"}, {"acid": "M", "acidName": "Met"}, {"acid": "N", "acidName": "Asn"},
                {"acid": "P", "acidName": "Pro"}, {"acid": "Q", "acidName": "Gln"}, {"acid": "R", "acidName": "Arg"},
                {"acid": "S", "acidName": "Ser"}, {"acid": "T", "acidName": "Thr"}, {"acid": "V", "acidName": "Val"},
                {"acid": "W", "acidName": "Trp"}, {"acid": "Y", "acidName": "Tyr"}];

            for(let j = startLoc;j<endLoc;j++){
                // colorseq1.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 255, g: 0, b: 0}});
                colorseq2.push({entity_id: '1', struct_asym_id: 'A', start_residue_number: (j), end_residue_number: (j+1), color: {r: 0, g: 0, b: 255}});

            }
            if (!model2)
                return;
            let coloring2 = {
                base: { r: 255, g: 255, b: 255 ,a:0},
                entries:colorseq2
            };
            // let theme1 = LiteMolPluginInstance.CustomTheme.createTheme(model1.props.model, coloring1);
            let theme2 = LiteMolPluginInstance.CustomTheme.createTheme(model2.props.model, coloring2);
            // instead of "polymer-visual", "model" or any valid ref can be used: all "child" visuals will be colored.
            // LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme1);
            LiteMolPluginInstance.CustomTheme.applyTheme(pluginFold, 'polymer-visual', theme2);


        }

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
        // console.log(model1);
        // console.log(model2);
        if (!model1 || !model2){

            return;
        }
        var query = Query.sequence('1', 'A', { seqNumber: reNumber }, { seqNumber: reNumber+1 });
        if(flag===null){
            // console.log(1);
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: true });
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: true });
        }else if(flag === "pre"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model1, query: query, isOn: true });
        }else if(flag === "act"){
            Command.Molecule.Highlight.dispatch(pluginFold.context, { model: model2, query: query, isOn: true });
        }

    }
    function colorSequenceFold3(reNumber1,reNumber2,flag){
        var model1 = selectNodesFold('model')[0];
        var model2 = selectNodesFold('model')[1];
        // console.log(model1);
        // console.log(model2);
        if (!model1 || !model2){

            return;
        }
        var query = Query.sequence('1', 'A', { seqNumber: reNumber1 }, { seqNumber: reNumber2 });
        if(flag===null){
            // console.log(1);
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
        var visual1 = selectNodesFold('polymer-visual')[2];
        // var visual2 = selectNodesFold('polymer-visual')[2];
        var model1 = selectNodesFold('model')[0];
        // var model2 = selectNodesFold('model')[1];
        if (!model1 || !visual1)
            return;
        var colors1 = new Map();
        // var colors2 = new Map();
        colors1.set('A', CoreVis.Color.fromRgb(255, 0, 0));
        // colors2.set('A', CoreVis.Color.fromRgb(0, 255, 0));
        // etc.
        var theme1 = Visualization.Molecule.createColorMapThemeProvider(
            // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
            // you can also get more creative and use "composite properties"
            // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
            //
            // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
            function (m) { return ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }); }, colors1,
            // this a fallback color used for elements not in the set
            CoreVis.Color.fromRgb(0, 0, 123))(model1);

        Command.Visual.UpdateBasicTheme.dispatch(pluginFold.context, { visual: visual1, theme: theme1 });
        // Command.Visual.UpdateBasicTheme.dispatch(pluginFold.context, { visual: visual2, theme: theme2 });
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
    //给链上颜色
    function colorChainActual() {
        var visual = selectNodesActual('polymer-visual')[0];
        var model = selectNodesActual('model')[0];
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
        Command.Visual.UpdateBasicTheme.dispatch(pluginActual.context, { visual: visual, theme: theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.
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


