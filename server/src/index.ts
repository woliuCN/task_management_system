const cluster = require('cluster');
//主进程
if (cluster.isMaster) {
    // const cpuNum = require('os').cpus().length;
    for (let i = 0; i < 4; i++) {
        cluster.fork()
    }

    //创建完子进程后输出信息
    cluster.on('online', (worker: any) => {
        console.log('create worker-' + worker.process.pid);
    });

    //任何子进程被关闭都触发这个事件，监听用来实时重启
    cluster.on('exit', (worker: any, code: any, signal: any) => {
        console.log('worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        // cluster.fork();
    });
}
//子进程的操作....
else {
    require('./app');
}