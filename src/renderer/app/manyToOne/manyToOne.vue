<template>
    <div class="contentBox">
        <div class="widget">
            <el-row class="widget-head">
                <el-col :xs="12" :sm="12" :md="12">
                    <div class="h3">{{ $route.params.name }} 多对一转账</div>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12">
                    <span class="floatRight">余额：{{ $route.params.money }}</span>
                </el-col>
            </el-row>
            <el-row class="widget-body">
                <el-form ref="form" :model="form">
                    <el-col :xs="24" :sm="24" :xl="12">
                        <el-form-item label="发送账户">
                            <el-transfer
                                class="floatLeft"
                                filterable
                                :titles="['未选', '已选']"
                                v-model="accountMarked"
                                :data="form.selectAccountList"
                            >
                            </el-transfer>
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :xl="12">
                        <el-form-item label="接收账户">
                            <span class="tpl_form_line_small_title">{{ $route.params.toAddr }}</span>
                        </el-form-item>
                        <el-form-item
                            label="转账金额"
                            prop="amount"
                            :rules="rules.amount"
                        >
                            <el-input type="amount" v-model.number="form.amount"></el-input>
                        </el-form-item>
                        <el-form-item
                            label="矿工费用"
                            prop="gasEther"
                            :rules="rules.gasEther"
                            v-if="!checked"
                        >
                            <el-input type="gasEther" placeholder="ether" v-model="form.gasEther"></el-input>
                        </el-form-item>
                        <el-form-item 
                            label="自定义 Gas Price"
                            prop="gasGwei"
                            :rules="rules.gasGwei"
                            v-if="checked"
                        >
                            <el-input type="gasGwei" placeholder="gwei" v-model.number="form.gasGwei"></el-input>
                        </el-form-item>
                        <el-form-item
                            label="自定义 Gas Limit"
                            prop="gasLimit"
                            :rules="rules.gasLimit"
                            v-if="checked"
                        >
                            <el-input type="gasLimit" v-model.number="form.gasLimit"></el-input>
                        </el-form-item>
                        <el-form-item label="高级选项">
                            <el-switch v-model="checked" @click="checked ? checked = false : checked = true;"></el-switch>
                        </el-form-item>
                        <el-form-item size="large">
                            <el-button type="primary" @click="sendManyToOne">立即创建</el-button>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
        </div>
    </div>
</template>
<script>
import rules from '../utils/rules'

export default {
    name: 'many-to-one',
    data() {
      return {
        checked: false,
        accountMarked:[],
        form: {
            gasLimit: '',
            selectAccountList:[],
            toAddr: '',
            amount: '',
            gasEther: '',
            gasGwei: '',
        },
        rules:rules,
        load:''
      };
    },
    mounted(){
        var _this = this;
        this.$http.post('http://localhost:8989/getAccountsList').then(function(data){
            if(data && data.data.result === 'success'){
                _this.form.selectAccountList = data.data.data.map(function(item,i){
                    return {
                        key: i,
                        label: item.name,
                        disabled: item.name === _this.$route.params.toAddr ? true : false
                    }
                });
            }
        });
        this.$http.post('http://localhost:8989/getGasEther').then(function (data) {
            if(data && data.data.result === 'success'){
                _this.form.gasEther = data.data.data;
            }
        })
    },
    methods: {
        loading(text){
            this.load = this.$loading({
                lock: true,
                text: text,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
        },
        sendManyToOne(key){
            var _this = this;
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if(this.accountMarked.length==0){
                        _this.$message({
                            type: 'error',
                            message: '请选择发款账户'
                        });
                        return;
                    }
                    var arr = [];
                    for(var i=0;i<this.accountMarked.length;i++){
                        arr.push({
                            name: this.form.selectAccountList[this.accountMarked[i]].label
                        });
                    }
                    if(this.checked){
                        var ops = {
                                toAddr: this.$route.params.toAddr,
                                accountMarked: arr,
                                amount: this.form.amount,
                                gasGwei: this.form.gasGwei,
                                gasLimit: this.form.gasLimit,
                                name: this.$route.params.name,
                                token: this.$route.params.token
                            }
                    }else{
                        var ops = {
                                toAddr: this.$route.params.toAddr,
                                accountMarked: arr,
                                amount: this.form.amount,
                                gasEther: this.form.gasEther,
                                name: this.$route.params.name,
                                token: this.$route.params.token
                            }
                    }
                    this.loading('交易发送中...');
                    this.$http.post('http://localhost:8989/sendManyToOne', ops).then(function (data) {
                        _this.load.close();
                        if(data && data.data.result === 'success'){
                            _this.$message({
                                type: 'success',
                                message: '交易发送成功'
                            });
                            _this.$router.push({name: 'account',params:{name:_this.$route.params.toAddr}});
                        }else{
                            _this.$message({
                                type: 'error',
                                message: '交易发送失败'
                            });
                        }
                    })
                } else {
                    return false;
                }
            });
        }
    }
};
</script>