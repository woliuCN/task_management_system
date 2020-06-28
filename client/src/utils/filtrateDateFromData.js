const now = new Date();
const nowYear = now.getFullYear();
const nowMonth = now.getMonth() + 1;

// 下个月的时间戳
const nextMonth = (date) => {
  const dateTemp = new Date(date);
  let thisYear = dateTemp.getFullYear();
  let thisMon = dateTemp.getMonth() + 1;
  if (thisMon + 1 > 12) {
    thisMon = 1;
    thisYear = thisYear + 1;
  } else {
    thisMon += 1;
  };
  return new Date(`${thisYear}-${thisMon}-01 00:00:00`).getTime();
};

/**
 * @description 过去一年的月时间戳范围
 * @returns [[monthStart,monthEnd],...]
 */
const lastYearOfMonthList = () => {
  const thisMonthOfLastYear = new Date(`${nowYear - 1}-${nowMonth}-01 00:00:00`).getTime();
  const filterDateList = [];
  let temp = thisMonthOfLastYear;
  for (let i = 0; i < 13; i++) {
    filterDateList.push([temp, nextMonth(temp)]);
    temp = nextMonth(temp);
  }
  return filterDateList;
};
/**
 * @description 本周的时间戳范围
 * @returns
 */
const currentWeek = () => {
  // const date = now.getDate();
  const weekDay = now.getDay();
  let firstWeekDay;
  if (weekDay === 1) {
    firstWeekDay = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00`).getTime();
  } else {
    firstWeekDay = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() - weekDay + 1} 00:00:00`).getTime();
  };
  const lastWeekDay = firstWeekDay + 7 * 24 * 60 * 60 * 1000;
  return [firstWeekDay, lastWeekDay];
};

/**
 * @description 本月每周的时间戳范围
 * @returns []
 */
const currentMonthOfWeekList = () => {
  let firstDayOfWeekInCurrentMonth = new Date(`${nowYear}-${nowMonth}-01 00:00:00`).getTime();
  let lastDayOfWeekInCurrentMonth;
  const firstDayOfNextMonth = nextMonth(firstDayOfWeekInCurrentMonth);
  const filterDateList = [];
  while (true) {
    // 本周还剩多少时间
    const dd = (8 - (new Date(firstDayOfWeekInCurrentMonth)).getDay()) * 24 * 60 * 60 * 1000;
    lastDayOfWeekInCurrentMonth = new Date(firstDayOfWeekInCurrentMonth + dd).getTime();
    if (lastDayOfWeekInCurrentMonth >= firstDayOfNextMonth) {
      lastDayOfWeekInCurrentMonth = firstDayOfNextMonth;
      filterDateList.push([firstDayOfWeekInCurrentMonth, lastDayOfWeekInCurrentMonth]);
      break;
    }
    filterDateList.push([firstDayOfWeekInCurrentMonth, lastDayOfWeekInCurrentMonth]);
    firstDayOfWeekInCurrentMonth = lastDayOfWeekInCurrentMonth;
  }
  return filterDateList;
};
/**
 * @description 获取本年所有周的时间戳范围
 * @returns []
 */
const weekListInThisYear = () => {
  let firstDayOfWeekInThisYear = new Date(`${nowYear}-01-01 00:00:00`).getTime();
  const nextYear = new Date(`${nowYear + 1}-01-01 00:00:00`).getTime();
  let lastDayOfWeekInThisYear;
  const filterDateList = [];
  while (true) {
    // 本周还剩多少时间
    const dd = (8 - (new Date(firstDayOfWeekInThisYear)).getDay()) * 24 * 60 * 60 * 1000;
    lastDayOfWeekInThisYear = new Date(firstDayOfWeekInThisYear + dd).getTime();
    if (lastDayOfWeekInThisYear >= nextYear) {
      lastDayOfWeekInThisYear = nextYear;
      filterDateList.push([firstDayOfWeekInThisYear, lastDayOfWeekInThisYear]);
      break;
    }
    filterDateList.push([firstDayOfWeekInThisYear, lastDayOfWeekInThisYear]);
    firstDayOfWeekInThisYear = lastDayOfWeekInThisYear;
  };
  return filterDateList;
};
/**
 * @description 过去一年月任务
 * @param {*} data
 * @returns
 */
export const filtrateDateFromTasks = (data) => {
  const filterDateList = lastYearOfMonthList();
  const result = [];
  const resultX = [];
  filterDateList.map((item) => {
    const fil = data.filter((dataItem) => {
      return dataItem.createTime >= item[0] && dataItem.createTime < item[1];
    });
    resultX.push(`${new Date(item[0]).getFullYear()}-${new Date(item[0]).getMonth() + 1}`);
    result.push(fil.length);
  });
  return { taskListOfMonth: result, taskListOfMonthX: resultX };
};

/**
 * @description 过去一年月项目
 * @param {*} data
 * @returns []
 */
export const filtrateDateFromProjects = (data) => {
  const filterDateList = lastYearOfMonthList();
  const result = [];
  const resultX = [];
  filterDateList.map((item) => {
    const fil = data.filter((dataItem) => {
      return dataItem.createTime >= item[0] && dataItem.createTime < item[1];
    });
    resultX.push(`${new Date(item[0]).getFullYear()}-${new Date(item[0]).getMonth() + 1}`);
    result.push(fil.length);
  });
  return { projectListOfMonth: result, projectListOfMonthX: resultX };
};

/**
 * @description 本月周任务数量
 * @param {*} data
 * @returns []
 */
export const filtrateDateFromTasksInCurrentMonth = (data) => {
  const filterDateList = currentMonthOfWeekList();
  const result = [];
  filterDateList.map((item) => {
    const fil = data.filter((dataItem) => {
      return dataItem.createTime >= item[0] && dataItem.createTime < item[1];
    });
    result.push(fil.length);
  });
  return result;
};
/**
 * @description 本年周任务
 * @param {*} data
 * @returns
 */
export const weekTasksInThisYear = (data) => {
  const filterDateList = weekListInThisYear();
  const result = [];
  filterDateList.map((item) => {
    const fil = data.filter((dataItem) => {
      return dataItem.createTime >= item[0] && dataItem.createTime < item[1];
    });
    result.push(fil.length);
  });
  return result;
};
/**
 * @description 本周任务数
 * @param {*} data
 * @returns Number
 */
export const getCurrentWeekTaskNum = ({ data }) => {
  const filterDateArr = currentWeek();
  const filterList = data.filter((dataItem) => {
    return dataItem.createTime >= filterDateArr[0] && dataItem.createTime < filterDateArr[1];
  });
  return filterList.length;
};

// 获取过去一年每月的在职人数
export const getOnJobOfMonthInlastYear = (data) => {
  const filterDateArr = lastYearOfMonthList();
  const result = [];
  const resultX = [];

  // 获取过去一年第一个月之前的在职人数
  const OnJobSumOfFirst = (data.filter((dataItem) => {
    return dataItem.createTime < filterDateArr[0][0] && dataItem.state === 1;
  })).length;
  filterDateArr.reduce((onJob, month) => {
    // 本月新入职人数
    const newOnJobSumInThisMonth = (data.filter((dataItem) => {
      return (dataItem.createTime >= month[0] && dataItem.createTime < month[1]);
    })).length;

    // 本月离职人数
    const newDimissionSumInThisMonth = (data.filter((dataItem) => {
      return (dataItem.deleteTime >= month[0] && dataItem.deleteTime < month[1]) && dataItem.state === 0;
    })).length;
    const onJobSumInThisMonth = onJob + newOnJobSumInThisMonth - newDimissionSumInThisMonth;
    resultX.push(`${new Date(month[0]).getFullYear()}-${new Date(month[0]).getMonth() + 1}`);
    result.push(onJobSumInThisMonth);
    return onJobSumInThisMonth;
  }, OnJobSumOfFirst);
  return { onJob: result, obJobX: resultX };
};
