<template>
    <div class="container">
        <input type="file" @change="getFile">
        <button @click="handleData">切片</button>
        <button @click="renderChart">绘图</button>
        <div class="echarts" ref="myChart" id="myChart"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            myURL: '',
            readData: '9.772089271823585221e-01 5.059646829061861251e-01',
            routeX: [],
            routeY: [],
            routeData: [],
            routeLineData: [],
            fitnessX: [],
            fitnessY: [],
            borderhover: false,
            fileObjs: [],
            chunkList: [],
            chunkListLength: 0,
            hash: [],
            fileType: [],
            percent: 0,
            isUpload: true,  //是否上传
            percentCount: 0
        }
    },

    methods: {
        getFile(e) {
            const that = this
            console.log("选择的文件", e.target.files[0])
            const fs = new FileReader()
            fs.readAsText(e.target.files[0])
            fs.onload = function (e) {
                that.readData = this.result
            }
        },
        handleData() {
            const rawRes = this.readData.split('\r\n')
            rawRes.forEach((item, index) => {
                // console.log("x轴", item.split(' ')[0])
                // console.log("y轴",item.split(' ')[1])
                this.routeX.push(Number(item.split(' ')[0]))
                this.routeY.push(Number(item.split(' ')[1]))
                var nodeName = ''
                if (index === 15) {
                    nodeName = "起点"
                }
                else {
                    if (index !== 0)
                        nodeName = "城市" + (index + 1).toString()
                }
                var newArr = [Number(item.split(' ')[0]), Number(item.split(' ')[1]), nodeName]
                this.routeData.push(newArr)
            })
            // 构建routeData需要使用的三个原始数据，仅供参考
            console.log("routeData", this.routeData)
            console.log("routeX", this.routeX)
            console.log("routeY", this.routeY)
            // routeLineData的创建
            this.routeData.forEach((item, index) => {
                var newLineArr = []
                // if else 是用来区分出起点和终点，这两个点设置特殊的样式
                if (index != this.routeData.length - 1) {
                    // 计算两相邻点之间的距离
                    const distance = Math.sqrt(Math.pow(this.routeX[index] - this.routeX[index + 1], 2) + Math.pow(this.routeY[index] - this.routeY[index + 1], 2)).toFixed(2)
                    newLineArr = [
                        {
                            coord: [this.routeX[index], this.routeY[index]],
                            label: {
                                show: true,
                                distance: 0,
                                formatter: function (params) {
                                    return `${distance}`
                                },
                                position: "insideMiddleBottom",
                                fontSize: 8
                            },
                            lineStyle: {
                                width: 1,
                                type: 'solid',
                                color: '#3E3E3E',
                            },
                        },
                        {
                            coord: [this.routeX[index + 1], this.routeY[index + 1]],
                            lineStyle: {
                                width: 1,
                                type: 'solid',
                                color: '#3E3E3E',
                            },
                        }
                    ]
                }
                else {
                    newLineArr = [
                        {
                            coord: [this.routeX[0], this.routeY[0], 0],
                            lineStyle: {
                                width: 1,
                                type: 'solid',
                                color: '#3E3E3E',
                            },
                        },
                        {
                            coord: [this.routeX[index], this.routeY[index], 1],
                            lineStyle: {
                                width: 1,
                                type: 'solid',
                                color: '#3E3E3E',
                            },
                        }
                    ]
                }
                this.routeLineData.push(newLineArr)
            })
            console.log("连线数据", this.routeLineData)

        },
        renderChart() {
            // console.log("传入的数据", this.inputValue)
            this.setMyEchart()
        },
        setMyEchart() {
            const myChart = this.$refs.myChart;  //通过ref获取到DOM节点
            if (myChart) {
                const thisChart = this.$echarts.init(myChart);  //利用原型调取Echarts的初始化方法
                //{}内写需要图表的各种配置，可以在官方案例中修改完毕后复制过来
                console.log("绘图数据", this.routeData)
                const option = {
                    title: {
                        text: "路线图"
                    },
                    tooltip: {
                        trigger: "axis",
                        formatter: function (params) {
                            let x = params[0].value[0].toFixed(2)
                            let y = params[0].value[1].toFixed(2)
                            let city = params[0].value[2]
                            return `<div style="color:blue">坐标:</div>
                      <div>x:${x}</div>
                      <div>y:${y}</div>
                      <div>${city}</div>`
                        }
                    },
                    xAxis: {
                    },
                    yAxis: {
                    },
                    series: [
                        {
                            data: this.routeData,
                            type: 'line',
                            // smooth:true,
                            label: {
                                distance: 5,
                                show: true,
                                position: "left",
                                formatter: '{@[2]}',
                                fontSize: 10
                            },
                            itemStyle: {
                                color: function (node) {
                                    if (node.dataIndex === 0 || node.dataIndex === 15) {
                                        return 'red'
                                    }
                                    else {
                                        return 'blue'
                                    }
                                }
                            },
                            markLine: {
                                silent: false,
                                symbol: 'none',
                                data: this.routeLineData,
                                lineStyle: {
                                    type: 'dotted'
                                }
                            }
                        }
                    ]
                };
                thisChart.setOption(option);  //将编写好的配置项挂载到Echarts上
                window.addEventListener("resize", function () {
                    thisChart.resize();  //页面大小变化后Echarts也更改大小
                });
            }
        },
    },
}
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .active {
        width: 50px;
        height: 50px;
        background-color: cadetblue;
    }

    .Web {
        width: 200px;
        height: 200px;
        background-color: cyan;
    }

    .Mobile {
        width: 100px;
        height: 100px;
        background-color: brown;
    }

    .Pad {
        width: 50px;
        height: 50px;
        background-color: burlywood;
    }

    .textbox {
        width: 50px;
        height: 50px;
        background-color: aqua;
    }

    .textbox-min {}
}

.echarts {
    width: 500px;
    height: 500px;
    background-color: whitesmoke;

}

.dragUpload {
    width: 400px;
    height: 200px;

    .drag_area {
        width: 100%;
        height: 100%;
        border: 2px dashed lightgray;
        background-color: white;
        overflow-y: auto;

        .uploadTips {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-y: auto;

            .hitUpload {
                input {
                    width: 0;
                    height: 0;
                }
            }

            .hitUpload:hover {
                cursor: pointer;
            }
        }

        .areaItem {
            width: calc(100% - 20px);
            display: flex;
            justify-content: space-between;
            padding-left: 10px;
            padding-right: 10px;
            margin-bottom: 10px;

            .deleteButton:hover {
                cursor: pointer;
            }
        }
    }

    .dragButton {
        width: 100%;
        height: 25px;
        text-align: center;
        border: 2px solid lightgray;
        background-color: #04BE02;
        color: white;
        margin-top: 10px;
    }

    .dragButton:hover {
        cursor: pointer;
    }

    .pauseButton {
        width: 100%;
        height: 25px;
        text-align: center;
        border: 2px solid black;
        background-color: red;
        color: black;
        margin-top: 10px;
    }
}




@import "../style/style1.css" screen and(max-width:768px);
</style>



