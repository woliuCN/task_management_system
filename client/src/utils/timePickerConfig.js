export const initTimePicker = function(shortcutsList = ['today', 'week', 'month'], options) {
  const shortcuts = {
    today: {
      text: '今天',
      onClick(picker) {
        const start = new Date();
        const end = new Date();

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        picker.$emit('pick', [start, end]);
      }
    },
    week: {
      text: '本周',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        // 通过今天的时间减去本周已过天数，得出本周周一的日期
        start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() - 1));

        // 今天的时间加上6天可得到本周最后一天的日期
        end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        picker.$emit('pick', [start, end]);
      }
    },
    lastWeek: {
      text: '上周',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        // 通过今天的时间减去本周已过天数，得出本周周一的日期
        start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() + 6));

        // 今天的时间加上6天可得到本周最后一天的日期
        end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        picker.$emit('pick', [start, end]);
      }
    },
    month: {
      text: '本月',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        // 获取本月1号的时间戳
        start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1));

        // 获取当前月份
        const month = end.getMonth();

        // 生成实际的月份: 由于curMonth会比实际月份小1, 故需加1
        end.setMonth(month + 1);

        // 将日期设置为0, 再通过getDate()就可以获取本月天数
        end.setDate(0);

        // 获取本月最后一天的时间戳
        end.setTime(start.getTime() + 3600 * 1000 * 24 * (end.getDate() - 1));

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        picker.$emit('pick', [start, end]);
      }
    },
    lastMonth: {
      text: '上月',
      onClick(picker) {
        const start = new Date();
        const lastMonth = start.getMonth() === 0 ? 11 : start.getMonth() - 1;
        start.setMonth(lastMonth);

        // 获取本月1号的时间戳
        start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1));

        const end = new Date(start);

        // 获取当前月份
        const month = end.getMonth();

        // 生成实际的月份: 由于curMonth会比实际月份小1, 故需加1
        end.setMonth(month + 1);

        // 将日期设置为0, 再通过getDate()就可以获取本月天数
        end.setDate(0);

        // 获取本月最后一天的时间戳
        end.setTime(start.getTime() + 3600 * 1000 * 24 * (end.getDate() - 1));

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        picker.$emit('pick', [start, end]);
      }
    },
    all: {
      text: '全部',
      onClick(picker) {
        const start = new Date(0);
        const end = undefined;

        picker.$emit('pick', [start, end]);
      }
    }
  };
  const shortcutsOptions = [];
  shortcutsList.forEach(shortcut => {
    if (shortcut in shortcuts) {
      shortcutsOptions.push(shortcuts[shortcut]);
    }
  });

  options = typeof options === 'object' ? options : {};

  const onPick = (date) => {
    const start = date.minDate || new Date();
    const end = date.maxDate || new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  };
  return {
    shortcuts: shortcutsOptions,
    ...options,
    onPick
  };
};
