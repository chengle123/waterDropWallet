import { app, BrowserWindow, dialog, webContents } from 'electron'

const opn = require('opn');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Autoupdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';//debug
log.info('App starting...');

// autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "Personal access Token" };
// autoUpdater.autoDownload = true;
// autoUpdater.setFeedURL({
//     provider: "generic",
//     url: "https://gitlab.com/_example_repo_/-/jobs/artifacts/master/raw/dist?job=build"
// });

function sendStatusToWindow(msg) {
  log.info(msg);
  const webContentList = webContents.getAllWebContents();
  webContentList.map(w => {
    w.send('update-download-progress', msg);
  });
}

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
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '安装更新',
    message: '更新包下载完成，重启并安装...'
  }, () => {
    log.info('update-downloaded');
    setImmediate(() => autoUpdater.quitAndInstall());
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  const log_message = [
    `Download speed: ${progressObj.bytesPerSecond}`,
    `Downloaded  ${progressObj.percent}%`,
    `${progressObj.transferred}/${progressObj.total}`,
  ];
  log.info(`download-progress: ${progressObj.percent}`);
  sendStatusToWindow(log_message.join('\r'));
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
  
function createWindow () {
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

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */


const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const nedb = require('nedb');
const USERDATA_PATH = app.getPath('userData');
const db = new nedb({
  filename: path.join(USERDATA_PATH, `keyData.db`),
  autoload: true
});

var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODE_ENV === 'development' ? "https://ropsten.infura.io/7GJLSGo2mDCi2e9BK3dj" : "https://mainnet.infura.io/YORUTOKEN"));
}

var accList = [];
var passwordKey;

function init(){
    web3.eth.accounts.wallet.create();
}
init();

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
                            writeFile(url+'/keystore/',`0x${keystores[i].address}`,keystores[i]);
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
                    writeFile(url+'/keystore/',`0x${keystores[i].address}`,keystores[i]);
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
        writeFile(url,'/privateKeys.json',arr);
        url += '/privateKeys.json';
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
    fs.writeFile(url+name, JSON.stringify(data), function() {
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
        importAccount(req.body.key,res)
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
        // 暂无
        return res.json({
            result: 'success',
            data: {},
            msg: '暂无搜索功能'
        });
	}catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '搜索失败'
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
            exportAccount(filePaths[0].replace(/\\/g, "/"),req.body.type,res);
        });
        // 
    }catch(e) {
        return res.json({
            result: 'error',
            data: {},
            msg: '导出失败'
        });
    }
})
appServer.use('/', router);