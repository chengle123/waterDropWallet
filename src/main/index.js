import { app, BrowserWindow, dialog, webContents, Menu } from 'electron'
const opn = require('opn');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// mac 快捷键
var template = [{
  label: "Application",
  submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]}, {
  label: "Edit",
  submenu: [
      { label: "Undo", accelerator: "CommandOrControl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CommandOrControl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CommandOrControl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CommandOrControl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CommandOrControl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CommandOrControl+A", selector: "selectAll:" }
  ]}
];

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
  
function createWindow () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minHeight: 563,
    minWidth: 767,
    width:900,
    useContentSize: true,
    webPreferences: {webSecurity: false}
  })
  mainWindow.setMenu(null)
  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('new-window', (event,url) => {
    opn(url)
    event.preventDefault()
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
require('electron-context-menu')();
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';//debug
log.info('App starting...');

autoUpdater.autoDownload = false;

function sendStatusToWindow(msg) {
  log.info(msg);
  const webContentList = webContents.getAllWebContents();
  webContentList.map(w => {
    w.send('update-download-progress', msg);
  });
}

// 发现一个可用更新
autoUpdater.on('update-available', info => {
  dialog.showMessageBox({
    type: 'info',
    title: '更新提示',
    message: `发现可用更新: v${info.version}，点击更新下载?`,
    buttons: ['更新', '忽略']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

// 更新下载完成
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '安装更新',
    message: '更新包下载完成，确认重启软件并安装...',
    buttons: ['确认']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      log.info('update-downloaded');
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  });
});

// 下载进度
autoUpdater.on('download-progress', (progressObj) => {
  const log_message = [
    'Download speed:' + progressObj.bytesPerSecond,
    'Downloaded:' + progressObj.percent + '%',
    progressObj.transferred +' / '+ progressObj.total,
  ];
  log.info(`download-progress: ${progressObj.percent}`);
  mainWindow.setProgressBar(progressObj.percent/100)
  sendStatusToWindow(log_message.join('\n'));
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});


/**
 * 本地服务，用于与本地数据库交互
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const nedb = require('nedb');
const USERDATA_PATH = app.getPath('userData');
const db = new nedb({
  filename: path.join(USERDATA_PATH, `keyDatas.db`),
  autoload: true
});
const ERCdb = new nedb({
  filename: path.join(USERDATA_PATH, `ERCData.db`),
  autoload: true
});

import {abi} from './abi';

var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODE_ENV === 'development' ? "https://ropsten.infura.io/7GJLSGo2mDCi2e9BK3dj" : "https://mainnet.infura.io/7GJLSGo2mDCi2e9BK3dj"));
}

var accList = [];
var passwordKey;

function init(){
    web3.eth.accounts.wallet.create();
}
init();
// 搜索代币token
function getToken(token,resJson){
    ERCdb.find({
        token: token
    }, function (err, docs) {
        if(docs.length>0){
            docs[0].exist = true;
            resJson.json({
                result: 'success',
                data: docs,
                msg: '查询成功'
            })
        }else{
            try{
                let metacoin = new web3.eth.Contract(abi, token);
                metacoin.methods.name().call().then((result,error)=>{
                    var ops = [];
                    try{
                        if(result){
                            ops.push(
                                {
                                    token: token,
                                    name: result,
                                    exist: false
                                }
                            );
                            resJson.json({
                                result: 'success',
                                data: ops,
                                msg: '查询成功'
                            })
                        }else{
                            resJson.json({
                                result: 'error',
                                data: '',
                                msg: '查询失败，E001'
                            })
                        }
                    }catch(e){
                        console.log(e);
                        resJson.json({
                            result: 'error',
                            data: '',
                            msg: '查询失败，E002'
                        })
                    }
                })
            }catch(e){
                resJson.json({
                    result: 'error',
                    data: '',
                    msg: '查询失败，E003'
                })
            }
        }
    });
    
}

// 查询账户列表与余额
function getAccountsList(res){
    accList = [];
    var data = web3.eth.accounts.wallet;
    if(data.length>0){
        for(var i in data){
            if(data[i]){
                accList.push({
                    name:data[i].address
                });
            }
        }
        accList = accList.slice(0,data.length);
        if(res){
            return res.json({
                result: 'success',
                data: accList,
                msg: '账户列表获取成功'
            });
        }
    }else{
        db.find({}, function (err, docs) {
            console.log(docs)
            if(docs.length>0){
                for(var i=0;i<docs.length;i++){
                    web3.eth.accounts.wallet.add(docs[i].privateKey);
                    accList.push({
                        name:docs[i].address
                    });
                    if(i == docs.length-1 && res){
                        return res.json({
                            result: 'success',
                            data: accList,
                            msg: '账户列表获取成功'
                        });
                    }
                }
            }else{
                if(res){
                    return res.json({
                        result: 'success',
                        data: accList,
                        msg: '账户列表获取成功'
                    });
                }
            }
        });
    }
}
// 查询账户余额
function getAccountsMoney(addr,res){
    web3.eth.getBalance(addr,(error, result)=>{
        if(result){
            return res.json({
                result: 'success',
                data: {
                    name: addr,
                    variety:[
                        {
                            name:'ETH',
                            num: web3.utils.fromWei(result)
                        }
                    ]
                },
                msg: '账户余额获取成功'
            });
        }
    })
}

// 删除一个账户 ps:不可恢复
function delAccount(key,res){
    if(web3.eth.accounts.wallet.remove(key)){
        db.remove({
            address: key
        },{}, (err, ret) => {
            if(ret){
                getAccountsList();
                if(res){
                    return res.json({
                        result: 'success',
                        data: [],
                        msg: '账户删除成功'
                    });
                }
            }
        })
    }else{
        if(res){
            return res.json({
                result: 'error',
                data: [],
                msg: '没有这个账户'
            });
        }
    }
}

// 导入新账户
function importAccount(key,res){
    var account = web3.eth.accounts.wallet.add(key);
    db.findOne({
        address: account.address
    }, (err, ret) => {
        if(ret){
            if(res){
                return res.json({
                    result: 'error',
                    data: [],
                    msg: '账户已存在'
                });
            }
        }else{
            db.insert({
                address: account.address,
                privateKey: account.privateKey
            }, (err, ret) => {
                if(ret){
                    getAccountsList();
                    if(res){
                        return res.json({
                            result: 'success',
                            data: accList,
                            msg: '账户导入成功'
                        });
                    }
                }
            });
        }
    });
}
// 批量导入新账户
function importAccountBatch(type,url,res){
    var datas = '';
    fs.readFile(url, {flag: 'r+', encoding: 'utf8'}, function (err, data) {
        if(err) {
                if(res){
                    return res.json({
                        result: 'error',
                        data: accList,
                        msg: '账户导入失败'
                    });
                }
            return;
        }
        if(type === 'json'){
            datas = JSON.parse(data).map(item => {
                return item.privateKey;
            });
        }else{
            datas = data.split('\n');
        }
        importAccountBatchInsert(datas);
    });
    function importAccountBatchInsert (arr){
        if(arr.length == 0){
            if(res){
                return res.json({
                    result: 'success',
                    data: accList,
                    msg: '账户导入成功'
                });
            }
            return;
        }
        var account = web3.eth.accounts.wallet.add(arr[0]);
        db.findOne({
            address: account.address
        }, (err, ret) => {
            if(!ret){
                db.insert({
                    address: account.address,
                    privateKey: account.privateKey
                }, (err, ret) => {
                    if(ret){
                        getAccountsList();
                        arr.splice(0, 1);
                        importAccountBatchInsert(arr);
                    }
                });
            }else{
                arr.splice(0, 1);
                importAccountBatchInsert(arr);
            }
        });
    }
}

// 创建新账户
function addAccount(num,res){
    var newAccount = web3.eth.accounts.wallet.create(num || 1);
    var arr = [];
    var start = accList.length;
    for(var i=start;i<newAccount.length;i++){
        arr.push({
            address: newAccount[i].address,
            privateKey: newAccount[i].privateKey
        });
    }
    var end = arr.length;
    arr.slice(start,end)
    db.insert(arr, (err, ret) => {
        if(ret){
            getAccountsList();
            if(res){
                return res.json({
                    result: 'success',
                    data: accList,
                    msg: '账户添加成功'
                });
            }
        }
    });
}

// 导出所有
function exportAccount(url,type,res){
    if(type == 'keystores'){
        var keystores = web3.eth.accounts.wallet.encrypt(passwordKey);
        fs.exists(url+'/keystore/', function(exists){
            if(!exists){
                fs.mkdir(url+'/keystore',function(err){
                    console.log(err)
                    if(!err){
                        for(var i = 0;i<keystores.length;i++){
                            writeFile(url+'/keystore/',`0x${keystores[i].address}`,JSON.stringify(keystores[i]));
                        }
                        url += '/keystore/';
                        return res.json({
                            result: 'success',
                            data: {
                                url: url
                            },
                            msg: '导出成功'
                        });
                    }
                }); 
            }else{
                for(var i = 0;i<keystores.length;i++){
                    writeFile(url+'/keystore/',`0x${keystores[i].address}`,JSON.stringify(keystores[i]));
                }
                url += '/keystore/';
                return res.json({
                    result: 'success',
                    data: {
                        url: url
                    },
                    msg: '导出成功'
                });
            }
        });
    }
    if(type == 'privatekey'){
        var data = web3.eth.accounts.wallet;
        var arr = [];
        for(var i=0;i<data.length;i++){
            arr.push({
                privateKey: data[i].privateKey,
                address: data[i].address
            });
        }
        writeFile(url,'/privateKeys.json',JSON.stringify(arr));
        url += '/privateKeys.json';
        return res.json({
            result: 'success',
            data: {
                url: url
            },
            msg: '导出成功'
        });
    }
    if(type == 'text'){
        var data = web3.eth.accounts.wallet;
        var arr = [];
        for(var i=0;i<data.length;i++){
            arr.push(data[i].privateKey);
        }
        writeFile(url,'/privateKeys.txt',arr.join('\n'));
        url += '/privateKeys.txt';
        return res.json({
            result: 'success',
            data: {
                url: url
            },
            msg: '导出成功'
        });
    }
    
}

function writeFile(url,name,data) {
    fs.writeFile(url+name, data, function() {
        console.log(url+name)
        console.log(`打包${name}`);
    });
}

// 交易
function execute_contract(type,fromAddr, fromAddrKey, contractAddr, gasPrice, gasLimit,value,res){

    // 创建合同
    // var contract = new web3.eth.Contract(abi, contractAddress, {
    //     from: fromAddr, // default from address
    // });
    if(type == 2){
        if(contractAddr.length<=0){
            return;
        }
    }
    // 构建 Tx
    web3.eth.getTransactionCount(fromAddr).then(function(nonce){
        if(type == 2){
            var rawTx = {
                "from": fromAddr,
                "nonce": web3.utils.numberToHex(parseInt(nonce)),
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "to": contractAddr[0].name,
                "value": value,//"0x100", // ether value, usually 0
                "data": '',//contract.methods.transfer(toAddr, transferAmount).encodeABI(),
                // "chainId": 0x01  // mainnet chain
            };
            contractAddr.splice(0, 1);
        }else{
            var rawTx = {
                "from": fromAddr,
                "nonce": web3.utils.numberToHex(parseInt(nonce)),
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "to": contractAddr,
                "value": value,//"0x100", // ether value, usually 0
                "data": '',//contract.methods.transfer(toAddr, transferAmount).encodeABI(),
                // "chainId": 0x01  // mainnet chain
            };
        }

        // 签名
        var privateKey = new Buffer(fromAddrKey, 'hex');
        var tx = new Tx(rawTx);
        tx.sign(privateKey);
        var serializedTx = tx.serialize();
        console.log(serializedTx)
        // 发送
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash', function(hash){
            console.log('Txn:' + hash);
        }).on('receipt', function(receipt){
            console.log('Receipt:' + receipt);
            if(type == 2){
                execute_contract(type,fromAddr, fromAddrKey, contractAddr, gasPrice, gasLimit,value,res);
            }
            if(res){
                return res.json({
                            result: 'success',
                            data: {},
                            msg: '交易发送成功'
                        });
            }
        })
    });
};

function execute_contract_token(type,fromAddr, fromAddrKey, contractAddr, gasPrice, gasLimit,value,token,res){

    // 创建合同
    // var contract = new web3.eth.Contract(abi, contractAddress, {
    //     from: fromAddr, // default from address
    // });
    if(type == 2){
        if(contractAddr.length<=0){
            return;
        }
    }
    
    var contract = new web3.eth.Contract(abi, token, {
        from: fromAddr, // default from address
    });
    // 构建 Tx
    web3.eth.getTransactionCount(fromAddr).then(function(nonce){
        if(type == 2){
            var rawTx = {
                "nonce": web3.utils.numberToHex(parseInt(nonce)),
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "from": fromAddr,
                "to": token,
                "value": "0x00",//"0x100", // ether value, usually 0
                "data": contract.methods.transfer(contractAddr, value).encodeABI(),
            };
            contractAddr.splice(0, 1);
        }else{
            var rawTx = {
                "nonce": web3.utils.numberToHex(parseInt(nonce)),
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "from": fromAddr,
                "to": token,
                "value": "0x00",//"0x100", // ether value, usually 0
                "data": contract.methods.transfer(contractAddr, value).encodeABI(),
            };
        }

        // 签名
        var privateKey = new Buffer(fromAddrKey, 'hex');
        var tx = new Tx(rawTx);
        tx.sign(privateKey);
        var serializedTx = tx.serialize();
        console.log(serializedTx)
        // 发送
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash', function(hash){
            console.log('Txn:' + hash);
        }).on('receipt', function(receipt){
            console.log('Receipt:' + receipt);
            if(type == 2){
                execute_contract_token(type,fromAddr, fromAddrKey, contractAddr, gasPrice, gasLimit,value,token,res);
            }
            if(res){
                return res.json({
                            result: 'success',
                            data: {},
                            msg: '交易发送成功'
                        });
            }
        })
    });
};

// 服务===========================================================
var appServer = express();
const bodyParser = require('body-parser');
appServer.use(bodyParser.json({limit:'50mb'}));
appServer.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
var server = appServer.listen(8989, function() {
    console.log('服务启动...');
});

router.post('/login', function(req, res) {
    passwordKey = req.body.password;
    try{
        return res.json({
            result: 'success',
            data: [],
            msg: '账户登录成功'
        });
    }catch(e) {
        return res.json({
            result: 'error',
            data: [],
            msg: '账户登录失败'
        });
    }
})

router.post('/validate', function(req, res) {
    try{
        if(passwordKey){
            return res.json({
                result: 'success',
                data: [],
                msg: '账户已登录'
            });
        }else{
            return res.json({
                result: 'error',
                data: [],
                msg: '账户未登录'
            });
        }
    }catch(e) {
        return res.json({
            result: 'error',
            data: [],
            msg: '账户未登录'
        });
    }
})

router.post('/getAccountsList', function(req, res) {
    try{
        getAccountsList(res)
    }catch(e) {
        return res.json({
            result: 'error',
            data: [],
            msg: '账户列表获取失败'
        });
    }
})

router.post('/getAccountsMoney', function(req, res) {
    try{
        getAccountsMoney(req.body.addr,res)
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '账户余额获取失败'
        });
    }
})

router.post('/addAccount', function(req, res) {
    try{
        addAccount(req.body.num,res)
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '账户添加失败'
        });
    }
})

router.post('/importAccount', function(req, res) {
    try{
        if(!req.body.type){
            importAccount(req.body.key,res);
        }else{
            if(req.body.type === 'json'){
                var obj = {name:'Json',extensions:['json']};
            }else{
                var obj = {name:'Text',extensions:['txt']};
            }
            dialog.showOpenDialog({
                properties: ['openFile'],
                title: '请选择导入文件',
                defaultPath : app.getPath('desktop'),
                filters: [obj]
            },function(filePaths){
                if(filePaths){
                    importAccountBatch(req.body.type,filePaths[0].replace(/\\/g, "/"),res);
                }
            });
        }
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '账户导入失败'
        });
    }
})

router.post('/delAccount', function(req, res) {
    try{
        delAccount(req.body.addr,res)
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '账户删除失败'
        });
    }
})

router.post('/getSearch', function(req, res) {
    try{
        getToken(req.body.token, res);
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '搜索失败'
        });
    }
})

router.post('/setNewToken', function(req, res) {
    try{
        delete req.body.exist;
        ERCdb.find(req.body, function (err, docs) {
            if(docs.length>0){
                return res.json({
                    result: 'error',
                    data: [],
                    msg: 'token已存在'
                });
            }else{
                ERCdb.insert(req.body, (err, ret) => {
                if(ret){
                        return res.json({
                            result: 'success',
                            data: [],
                            msg: 'token添加成功'
                        });
                    }
                });
            }
        });
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '添加token失败'
        });
    }
})

router.post('/delToken', function(req, res) {
    try{
        ERCdb.find({
            token: req.body.token
        }, function (err, docs) {
            if(docs.length>0){
                ERCdb.remove({
                    token: req.body.token
                },{}, (err, ret) => {
                    if(ret){
                        return res.json({
                            result: 'success',
                            data: [],
                            msg: 'token已删除'
                        });
                    }
                })
            }else{
                return res.json({
                    result: 'error',
                    data: [],
                    msg: 'token删除失败，E001'
                });
            }
        });
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: 'token删除失败，E002'
        });
    }
})

router.post('/getTokenList', function(req, res) {
    try{
        ERCdb.find({}, function (err, docs) {
            return res.json({
                result: 'success',
                data: docs,
                msg: '查询token列表成功'
            });
        });
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '查询token列表失败'
        });
    }
})

router.post('/getTokenNum', function(req, res) {
    try{
        let token = req.body.token;
        let metacoin = new web3.eth.Contract(abi, token);
        metacoin.methods.balanceOf(req.body.address).call().then(v => {
            console.log(v)
            return res.json({
                result: 'success',
                data: {
                    num: v
                },
                msg: '查询token余额成功'
            });
            // let ret = new BigNumber(v);
            // return parseFloat(ret.dividedBy(Ether)).toFixed(2);
        })
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '查询token余额失败'
        });
    }
})

router.post('/getGasEther', function(req, res) {
    try{
        web3.eth.getGasPrice((error, result)=>{
            try{
                return res.json({
                    result: 'success',
                    data: web3.utils.fromWei(result),
                    msg: 'GasEther获取成功'
                });
            }catch(e) {
                return res.json({
                    result: 'error',
                    data: {},
                    msg: 'GasEther获取失败'
                });
            }
        })
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: 'GasEther获取失败'
        });
    }
})

router.post('/sendOneToOne', function(req, res) {
    var ops = req.body;
    try{
        var data = web3.eth.accounts.wallet;
        if(ops.name==='ETH'&& !ops.token){
            for(var i = 0;i<data.length;i++){
                if(ops.fromAddr === data[i].address){
                    if(ops.gasEther){
                        execute_contract(1, ops.fromAddr, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), res);
                    }else{
                        execute_contract(1, ops.fromAddr, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), res);
                    }
                    break;
                }
            }
        }else{
            for(var i = 0;i<data.length;i++){
                if(ops.fromAddr === data[i].address){
                    if(ops.gasEther){
                        execute_contract_token(1, ops.fromAddr, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token, res);
                    }else{
                        execute_contract_token(1, ops.fromAddr, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token, res);
                    }
                    break;
                }
            }
        }
        
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '交易发送失败'
        });
    }
})

router.post('/sendOneToMany', function(req, res) {
    var ops = req.body;
    try{
        var data = web3.eth.accounts.wallet;
        var privateKey;
        
        if(ops.name==='ETH'&& !ops.token){
            for(var i = 0;i<data.length;i++){
                if(ops.fromAddr === data[i].address){
                    privateKey = data[i].privateKey.slice(2);
                    break;
                }
            }
            if(ops.gasEther){
                execute_contract(2, ops.fromAddr, privateKey, ops.accountMarked, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')));
            }else{
                execute_contract(2, ops.fromAddr, privateKey, ops.accountMarked, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')));
            }
            return res.json({
                        result: 'success',
                        data: {},
                        msg: '交易已发送'
                    });
        }else{
            for(var i = 0;i<data.length;i++){
                if(ops.fromAddr === data[i].address){
                    privateKey = data[i].privateKey.slice(2);
                    break;
                }
            }
            if(ops.gasEther){
                execute_contract_token(2, ops.fromAddr, privateKey, ops.accountMarked, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token);
            }else{
                execute_contract_token(2, ops.fromAddr, privateKey, ops.accountMarked, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token);
            }
            return res.json({
                        result: 'success',
                        data: {},
                        msg: '交易已发送'
                    });
        }
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '交易发送失败'
        });
    }
})

router.post('/sendManyToOne', function(req, res) {
    var ops = req.body;
    try{
        var data = web3.eth.accounts.wallet;
        
        if(ops.name==='ETH'&& !ops.token){
           for(var j = 0;j<ops.accountMarked.length;j++){
                for(var i = 0;i<data.length;i++){
                    if(ops.accountMarked[j].name === data[i].address){
                        if(ops.gasEther){
                            execute_contract(3, ops.accountMarked[j].name, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')));
                        }else{
                            execute_contract(3, ops.accountMarked[j].name, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')));
                        }
                    }
                }
                if(j+1 == ops.accountMarked.length){
                    return res.json({
                                result: 'success',
                                data: {},
                                msg: '交易发送成功'
                            });
                }
            }
        }else{
            for(var j = 0;j<ops.accountMarked.length;j++){
                for(var i = 0;i<data.length;i++){
                    if(ops.accountMarked[j].name === data[i].address){
                        if(ops.gasEther){
                            execute_contract_token(3, ops.accountMarked[j].name, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasEther)), web3.utils.toHex(43000), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token);
                        }else{
                            execute_contract_token(3, ops.accountMarked[j].name, data[i].privateKey.slice(2), ops.toAddr, web3.utils.toHex(web3.utils.toWei(ops.gasGwei,'Gwei')), web3.utils.toHex(gasLimit), web3.utils.toHex(web3.utils.toWei(ops.amount+'')), ops.token);
                        }
                    }
                }
                if(j+1 == ops.accountMarked.length){
                    return res.json({
                                result: 'success',
                                data: {},
                                msg: '交易发送成功'
                            });
                }
            }
        }
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '交易发送失败'
        });
    }
})

router.post('/exportAccount', function(req, res) {
    try{
        var url = dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory'],
            title: '请选择导出位置',
            defaultPath : app.getPath('desktop')
        },function(filePaths){
            if(filePaths){
                exportAccount(filePaths[0].replace(/\\/g, "/"),req.body.type,res);
            }
        });
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '导出失败'
        });
    }
})
appServer.use('/', router);