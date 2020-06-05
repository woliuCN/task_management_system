import json

url = './data.txt'
file = open(url, 'r')
data = file.read().split('\n')[0]
file.close()

data = json.loads(data)['rows']
url = 'memberInfo.txt'
file = open(url, "w", encoding="utf-8")
for item in data:
    ### taskData ###
    # del item['deleted']
    # item['id'] = item['taskSeries']
    # del item['taskSeries']
    # item['name'] = item['taskName']
    # del item['taskName']
    # item['projectInfo'] = {'id': item['project']['id'], 'name': item['project']['projectName']}
    # del item['project']
    # item['belonger'] = {'id': item['member']['id'], 'name': item['member']['memberName']}
    # del item['member']
    # item['state'] = item['taskStatus']
    # del item['taskStatus']
    # item['workingHours'] = item['taskHour']
    # del item['taskHour']
    # item['startTime'] = item['taskStartDate']
    # del item['taskStartDate']
    # item['endTime'] = item['taskEndDate']
    # del item['taskEndDate']
    # del item['taskActualStartDate']
    # del item['taskActualEndDate']
    # item['createTime'] = item['gmtCreate']
    # del item['gmtCreate']
    # item['updateTime'] = item['gmtModify']
    # del item['gmtModify']
    # item['remarks'] = '无'
    # del item['remark']
    # del item['group']

    ### projectData ###
    # item['name'] = item['projectName']
    # del item['projectName']
    # item['state'] = item['projectStatus']
    # del item['projectStatus']
    # del item['projectId']
    # del item['deleted']
    # item['createTime'] = item['gmtCreate']
    # del item['gmtCreate']
    # item['updateTime'] = item['gmtModify']
    # del item['gmtModify']
    # item['remarks'] = item['remark']
    # del item['remark']
    # item['apartment'] = {'id': 1, 'name': '预研'}

    ### memberData ###
    item['name'] = item['memberName']
    del item['memberName']
    item['jobNo'] = item['memberSeries']
    del item['memberSeries']

    item['state'] = 1
    del item['memberId']
    del item['deleted']
    item['createTime'] = item['gmtCreate']
    del item['gmtCreate']
    item['updateTime'] = item['gmtModify']
    del item['gmtModify']
    item['remarks'] = item['remark']
    del item['remark']
    item['apartment'] = {'id': 1, 'name': '预研'}
    del item['group']
 
file.write(str(data))

file.close()