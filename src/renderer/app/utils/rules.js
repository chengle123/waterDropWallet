function isvalidNum(str) {
  const reg = /^\d+(\.\d+)?$/
  return reg.test(str)
}
var validGasEther=(rule, value,callback)=>{
    if (!value){
        callback(new Error('请输入矿工费用'))
    }else  if (!isvalidNum(value)){
    callback(new Error('矿工费用必须为数字值'))
    }else {
        callback()
    }
}
var validAmount=(rule, value,callback)=>{
    if (!value){
        callback(new Error('转账金额不能为空'))
    }else  if (!isvalidNum(value)){
    callback(new Error('转账金额必须为数字值'))
    }else {
        callback()
    }
}
var validGasGwei=(rule, value,callback)=>{
    if (!value){
        callback(new Error('Gas Price不能为空'))
    }else  if (!isvalidNum(value)){
    callback(new Error('Gas Price必须为数字值'))
    }else {
        callback()
    }
}
var validGasLimit=(rule, value,callback)=>{
    if (!value){
        callback(new Error('Gas Limit不能为空'))
    }else  if (!isvalidNum(value)){
    callback(new Error('Gas Limit必须为数字值'))
    }else {
        callback()
    }
}

export default {
    gasEther: [
        { required: true, trigger: 'blur', validator: validGasEther }//这里需要用到全局变量
    ],
    amount: [
        { required: true, trigger: 'blur', validator: validAmount }//这里需要用到全局变量
    ],
    gasGwei: [
        { required: true, trigger: 'blur', validator: validGasGwei }//这里需要用到全局变量
    ],
    gasLimit: [
        { required: true, trigger: 'blur', validator: validGasLimit }//这里需要用到全局变量
    ]
}
