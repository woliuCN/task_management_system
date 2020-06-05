// 时间戳转换为具体日期
export const time = timestamp => {
  const dateObj = new Date(timestamp)
  const year = dateObj.getFullYear()
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const whatDate = dateObj.getDate()
  const hour = dateObj
    .getHours()
    .toString()
    .padStart(2, '0')
  const minute = dateObj
    .getMinutes()
    .toString()
    .padStart(2, '0')
  const second = dateObj
    .getSeconds()
    .toString()
    .padStart(2, '0')
  const date = `${year}/${month}/${whatDate}`
  const time = `${hour}:${minute}:${second}`
  const dateTime = `${date} ${time}`
  return dateTime
}
