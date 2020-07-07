import Excel from 'exceljs';
import { Task } from '../models/task';
const path = require('path');
const fs = require('fs');
const config = require('../config/index');
const TASK_STATE = config.TASK_STATE;
/*-----------------------------------------------------------------*/
type column = {
    header: string,
    key: string,
    width: number
}

/**
    * @description: 导出绩效表函数
    * @param {string} sheetName 表名
    * @param {Array<column>} columns 头部字段名称
    * @param {Array<object>} data 数据
**/
const exportPerformanceExcel = async (sheetName: string, columns: Array<column>, data: Array<object>) => {
    const workBook = new Excel.Workbook();
    workBook.creator = 'cn';
    workBook.lastModifiedBy = 'cn';
    workBook.created = new Date();
    workBook.modified = new Date();
    const sheet = workBook.addWorksheet(sheetName);
    sheet.columns = columns;
    sheet.addRows(data);
    // 设置每一列样式
    const row = sheet.getRow(1);
    row.eachCell((cell, rowNumber) => {
        sheet.getColumn(rowNumber).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        sheet.getColumn(rowNumber).font = { size: 10, family: 2 }
        sheet.getColumn(rowNumber).border = {
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    })

    //额外设置头部的样式
    row.eachCell((cell, rowNumber) => {
        row.getCell(rowNumber).font = { bold: true };
    })
    if (sheetName === '个人绩效') {
        let currentValue = sheet.getRow(2).getCell(1).value; //当前的值，比较得出是否要切换背景色跟合并cell
        let flag: boolean = false;  //是否要切换背景色
        // let mergeIndex = 2; //合并的起始下标
        for (let i = 0; i < data.length; i++) {
            const row = sheet.getRow(i + 2);
            let value = row.getCell(1).value;
            if (value != currentValue) {
                flag = !flag;
                currentValue = value;
                // sheet.mergeCells(`A${mergeIndex}:A${i + 1}`);
                // mergeIndex = i + 2;
            }
            if (flag) {
                row.eachCell((cell, rowNumber) => {
                    row.getCell(rowNumber).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFDDDDDD' },
                    };

                })
            }
        }
        // sheet.mergeCells(`A${mergeIndex}:A${data.length + 1}`);
    } else {
        sheet.autoFilter = "B1:E1"; //给月绩效添加过滤条件的选择
    }
    return workBook.xlsx.writeFile(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
}





/**
    * @description: 导出周报表函数
    * @param {string} sheetName 表名
    * @param {any} taskList task表数据
    * @param {number} startTime 开始时间
    * @param {number} endTime 结束时间
    * 
**/
const exportWeeklyExcel = async (sheetName: string, taskList: any, startTime: number, endTime: number) => {
    // 初始化 建立工作区
    const workBook = new Excel.Workbook();
    workBook.creator = 'chm';
    workBook.lastModifiedBy = 'chm';
    workBook.created = new Date();
    workBook.modified = new Date();

    // 新建sheet表
    let sheet = workBook.addWorksheet(sheetName, { properties: { defaultColWidth: 20 } });

    // 初始化第一行数据
    sheet.getCell('A1').value = '开始时间：';
    sheet.getCell('B1').value = new Date(startTime).toLocaleDateString().replace(/\//g, '-');
    sheet.getCell('C1').value = '结束时间：';
    sheet.getCell('D1').value = new Date(endTime).toLocaleDateString().replace(/\//g, '-');;

    // 统计各类型任务总数,键名为任务状态
    const taskCount: object = {
        0: 0,
        1: 0,
        2: 0,
        3: 0
    }

    // 各状态对应的颜色
    const colors: object = {
        0: '8797ae',
        1: 'a2c2e3',
        2: 'b1ce94',
        3: '757271',
    }
    const status: object = {
        0: '未启动',
        1: '进行中',
        2: '完成',
        3: '挂起'
    }

    // 各状态对应的位置
    const map: object = {
        0: 'F',
        1: 'G',
        2: 'H',
        3: 'I'
    }

    // 由于第一行已经有数据了，所以在插入任务的时候从第二行开始插入
    let rowIndex: number = 2;

    // 每一行的第一列都是任务负责人
    let columnIndex: number = 1;

    // 记录当前任务的负责人
    let user: string = '';

    taskList.forEach((task: any) => {
        // 数据格式化
        task.belonger = JSON.parse(task.belonger);
        task.project = JSON.parse(task.project);

        // 如果任务负责人发生变化，则另起新行
        if (task.belonger.userId != user) {
            user = task.belonger.userId;

            // 第一列的数据为任务负责人，并合以当前行为开始的三行
            sheet.getRow(rowIndex).getCell(1).value = task.belonger.userName;
            sheet.mergeCells(sheet.getRow(rowIndex).getCell(1).$col$row, sheet.getRow(rowIndex + 2).getCell(1).$col$row);
            columnIndex = 2;
            rowIndex += 3;
        }

        // 依次在当前列插入任务编号、任务所属项目、任务内容，然后转入下一列
        sheet.getRow(rowIndex - 3).getCell(columnIndex).value = task.taskId;
        sheet.getRow(rowIndex - 2).getCell(columnIndex).value = task.project.projectName;
        const taskContent = sheet.getRow(rowIndex - 1).getCell(columnIndex)

        // 插入任务内容时根据任务的状态分配不同的背景颜色
        const state = task.state;
        taskContent.value = task.content;
        taskContent.fill = {
            type: 'pattern',
            pattern: 'darkTrellis',
            fgColor: { argb: colors[state] },
            bgColor: { argb: colors[state] }
        };
        taskCount[state] = taskCount[state] + 1;

        // 可通过内容将宽度撑起，若需要使用取消注释即可
        // sheet.getColumn(columnIndex).width = Math.max(task.project.projectName.length * 2, task.content.length * 2, sheet.getColumn(columnIndex).width || 0);

        // 插入完成之后跳转到下一列
        columnIndex += 1;
    })


    // 显示各状态下的任务情况
    for (let i in map) {
        const cell = sheet.getCell(`${map[i]}1`);
        cell.value = `${status[i]}:${taskCount[i]}`;
        cell.fill = {
            type: 'pattern',
            pattern: 'darkTrellis',
            fgColor: { argb: colors[i] },
            bgColor: { argb: colors[i] }
        };
        cell.alignment = { 'horizontal': 'center', vertical: 'middle' };
    }

    // 记录总任务数
    let totalCount: number = taskList.length;
    const cell = sheet.getCell(`J1`);
    cell.value = `总计:${totalCount}`;
    cell.alignment = { 'horizontal': 'center', vertical: 'middle' };

    // 将显示名字这一列的数据进行样式格式化，方便查看 !是为了让ts编译器不报错，因为是可选属性得用类型断言保证调用的不是null 、underfined
    sheet.getColumn(1).width = 14;
    sheet.getColumn(1).eachCell!((cell, rowNumber) => {
        if (rowNumber === 1) return -1;
        sheet.getCell(cell.$col$row).alignment = { 'horizontal': 'center', vertical: 'middle' };
        sheet.getCell(cell.$col$row).font = { size: 14, family: 2 };
    })

    return workBook.xlsx.writeFile(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));
}






/**
    * @description: 导出周计划函数
    * @param {string} sheetName 表名
    * @param {string} deptName 部门名称
    * @param {any} taskList task表数据
    * @param {number} startTime 开始时间
    * @param {number} endTime 结束时间
    * 
**/
const exportWeekPlanExcel = async (sheetName: string, deptName: string, taskList: any, startTime: number, endTime: number) => {
    // 初始化 建立工作区
    const workBook = new Excel.Workbook();
    workBook.creator = 'cn';
    workBook.lastModifiedBy = 'cn';
    workBook.created = new Date();
    workBook.modified = new Date();


    //颜色
    const color = {
        "blue": "5ACAFA",
        "green": "75FA4C"
    }
    // 新建sheet表
    const sheet = workBook.addWorksheet(sheetName, { properties: { defaultColWidth: 20 } });
    const DAY: number = 24 * 3600 * 1000; //一天的毫秒值
    const WEEKEN: number = 7;
    const durationDay: number = Math.round((endTime - startTime) / DAY); //相差的天数
    let week_num: number = Math.round((startTime - new Date(`${new Date().getFullYear()}/1/1`).getTime()) / DAY / WEEKEN); //计算第几周
    let week_days: Array<string> = []; //日期时间数组
    for (let i = 0; i < durationDay; i++) {
        let time: string = new Date(startTime + DAY * i).toLocaleDateString();
        week_days.push(time);
    }

    //初始化第一行
    const serial: string = String.fromCharCode(66 + durationDay); //计算合并的列号，66是B的ASCII
    sheet.getCell('A1').value = deptName;
    sheet.getCell('C1').value = `第${week_num}周`;
    sheet.mergeCells('A1:B1');
    sheet.mergeCells(`C1:${serial}1`);

    //初始化第二行
    sheet.getCell('A2').value = "序号";
    sheet.getCell('B2').value = "成员";
    week_days.map((day: string, idx: number) => {
        let startLetter: string = `${String.fromCharCode(67 + idx)}2`; //67是C的ASCII
        sheet.getCell(startLetter).value = day; //遍历渲染日期

    })

    let mergeIndex: number = 3; //合并的起始下标
    let index = 1; //序号
    let columIndex: number = 3; //填入task数据的列的开始下标
    let curBelongerId: string = ""; //当前的负责人的id
    let extraTaks: Array<Task> = []; //新增的任务列表
    //第一次先写第一列第二列的数据
    taskList.map((task: any) => {
        if (curBelongerId !== task.belongerId) {
            let oldMergeIndex: number = mergeIndex;
            sheet.getRow(mergeIndex).getCell(1).value = index; //序号
            sheet.getRow(mergeIndex).getCell(2).value = task.belongerName; //人员
            index++;
            mergeIndex = 3 * index;  //三行一个轮回
            sheet.mergeCells(`A${oldMergeIndex}:A${mergeIndex - 1}`); //A列为序号
            sheet.mergeCells(`B${oldMergeIndex}:B${mergeIndex - 1}`); //B列为人员
            curBelongerId = task.belongerId;
        }
    })

    index = 1;
    mergeIndex = 3;
    curBelongerId = taskList[0].belongerId;
    for (let task of taskList) {
        if (curBelongerId !== task.belongerId) {
            curBelongerId = task.belongerId;
            if (extraTaks.length > 0) {
                extraTaks.forEach((task: Task) => {
                    sheet.getRow(mergeIndex).getCell(columIndex).value = '新增';  //新增任务统一叫新增
                    sheet.getRow(mergeIndex + 1).getCell(columIndex).value = task.projectName;  //任务所属项目
                    sheet.getRow(mergeIndex + 2).getCell(columIndex).value = task.content;  //任务内容
                    if (task.state === TASK_STATE.COMPLETE) { //如果任务是完成的就设置为绿色
                        sheet.getRow(mergeIndex + 2).getCell(columIndex).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: color["green"] },
                        };
                    }
                    columIndex++;
                })
                extraTaks = [];
            }
            index++;
            columIndex = 3; //负责人不一样的时候需要重置到第三列开始写
            mergeIndex = 3 * index;  //三行一个轮回
        }

        //如果是新增的计划的话
        if (task.taskType === 1) {
            extraTaks.push(task);
            continue;
        }
        else {
            sheet.getRow(mergeIndex).getCell(columIndex).value = task.taskId;  //任务id的行
            sheet.getRow(mergeIndex).getCell(columIndex).fill = {           //任务id加颜色
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: color["blue"] },
            };
            sheet.getRow(mergeIndex + 1).getCell(columIndex).value = task.projectName;  //任务所属项目
            sheet.getRow(mergeIndex + 2).getCell(columIndex).value = task.content;  //任务内容

        }
        if (task.state === TASK_STATE.COMPLETE) { //如果任务是完成的就设置为绿色
            sheet.getRow(mergeIndex + 2).getCell(columIndex).fill = {           //任务id加颜色
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: color["green"] },
            };
        }
        columIndex++;

    }
    //如果是一个人或者是最后一个人有新增任务的话。需要写加趋
    if (extraTaks.length > 0) {
        extraTaks.forEach((task: Task) => {
            sheet.getRow(mergeIndex).getCell(columIndex).value = '新增';  //新增任务统一叫新增
            sheet.getRow(mergeIndex + 1).getCell(columIndex).value = task.projectName;  //任务所属项目
            sheet.getRow(mergeIndex + 2).getCell(columIndex).value = task.content;  //任务内容
            if (task.state === TASK_STATE.COMPLETE) { //如果任务是完成的就设置为绿色
                sheet.getRow(mergeIndex + 2).getCell(columIndex).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: color["green"] },
                };
            }
            columIndex++;
        })
        extraTaks = [];
    }

    // 设置每一列样式
    sheet.eachRow((row, rowNumber) => {
        sheet.getRow(rowNumber).height = 60;
        sheet.getRow(rowNumber).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        sheet.getRow(rowNumber).font = { size: 9, family: 2 };

    })
    const row = sheet.getRow(1);
    row.eachCell((cell, colNumber) => {
        if (colNumber <= 2) {
            sheet.getColumn(colNumber).width = 10;
        }
    })




    return workBook.xlsx.writeFile(path.resolve(__dirname, `../attachement/${sheetName}.xlsx`));


}


/**
    * @description: 导入excel数据处理函数
    * @param {string} filePath 导入的表的路径
    * @param {Array<string>} fileds excel表对应的字段
    * @param {Array<object>} userMap user对照表
    * @param {Array<object>} projectMap project对照表
    * 
**/
const importTaskExcel = async (filePath: string, fileds: Array<string>, userMap: Array<object>, projectMap: Array<object>) => {
    const workBook = new Excel.Workbook();
    const rs = fs.createReadStream(filePath); //创建可读流读取上传的文件
    const map: object = {}; //map用来存每个成员的对应的每天的任务 {'蔡楠':{}}
    const timeArray: Array<number> = []; //每周的时间
    let data: Array<any> = []; //返回的数据 
    await workBook.xlsx.read(rs).then(workbook => {
        const sheet = workbook.getWorksheet(1);
        let fieldIndex: number = 0;
        sheet.eachRow((row, number) => {
            if (number <= 2) {  //排除第一行的表头
                if (number === 2) { //第二行的第二列开始就是时间了,因为excel的时间转换会变成不是从0点开始的,所以需要转换
                    row.eachCell((cell, colNumber) => {
                        if (colNumber > 2) {
                            let time: number = new Date(new Date(cell.value as string).toLocaleDateString()).getTime(); //时间转换为当天的00:00:00
                            timeArray.push(time);
                        }
                    })
                }
                return;
            }
            let nameKey: string = ''; //以userName 作为map的key
            row.eachCell((cell, colNumber) => {
                if (colNumber <= 2) {
                    if (colNumber === 2) {
                        //遍历每行寻找nameKey
                        let value: string = cell.value as string;
                        if (!map[value]) {
                            map[value] = {};
                            fieldIndex = 0; //这里如果不存在map[value]则表示对应的人员是还没遍历到的，这时候需要让字段名称的下标置0，否则就下面的自增
                        }
                        nameKey = value;
                    }
                    return;
                }
                let timeKey = timeArray[colNumber - 3]; //时间作为map的第二层的key
                let fieldKey = fileds[fieldIndex]; //字段名称作为map的第二层的key
                if (!map[nameKey][timeKey]) {
                    map[nameKey][timeKey] = {};
                }
                map[nameKey][timeKey][fieldKey] = cell.value;
            })
            fieldIndex++;
        })
    });
    for (const name in map) {
        let belongerName: string = name;
        let task: object = map[name]
        for (const time in task) {
            let startTime: number = parseInt(time);
            let endTime: number = parseInt(time);
            data.push({
                ...task[time],
                belongerName,
                startTime,
                endTime,
                state: 0,
            })

        }
    }
    data = data.map((item: any) => {
        let project: any = projectMap.find((project: any) => { return project.projectName === item.projectName });
        let belonger: any = userMap.find((user: any) => { return user.userName === item.belongerName });
        item.projectName = project.projectName;
        item.projectId = project.projectId;
        item.belongerId = belonger.userId;
        item.belongerName = belonger.userName;
        item.createTime = new Date().getTime();
        item.updateTime = new Date().getTime();
        return item;
    })
    return data;

}



/*-----------------------------------------------------------------*/

type week = {
    startTime: string,
    endTime: string,
    weeks: number //第几周
}
/**
    * @description: 根据时间间隔求出所含有的周数组
    * @param {number} startTime 开始时间时间戳
    * @param {number} endTime 结束时间时间戳
    * @returns{Array<week>} data 数据
**/
const getWeeksByTime = (startTime: number, endTime: number): Array<week> => {
    const WEEKEN: number = 7; //一周七天
    const DAY: number = 24 * 3600 * 1000;
    let res: Array<week> = [];
    while (startTime <= endTime) {
        let weekday: number = new Date(startTime).getDay();
        let distanceDay: number = WEEKEN - (weekday % WEEKEN);
        let weeks = Math.round((startTime - new Date(`${new Date().getFullYear()}/1/1`).getTime()) / DAY / WEEKEN);
        if (startTime + distanceDay * DAY < endTime) {
            res.push({
                startTime: new Date(startTime).toLocaleDateString().replace(/\//g, '-'),
                endTime: new Date(startTime + distanceDay * DAY).toLocaleDateString().replace(/\//g, '-'),
                weeks
            });
        } else {
            res.push({
                startTime: new Date(startTime).toLocaleDateString().replace(/\//g, '-'),
                endTime: new Date(endTime).toLocaleDateString().replace(/\//g, '-'),
                weeks
            });
        }
        startTime += (distanceDay + 1) * DAY;
    }
    return res;
}


export {
    exportPerformanceExcel,
    getWeeksByTime,
    exportWeeklyExcel,
    exportWeekPlanExcel,
    importTaskExcel
}