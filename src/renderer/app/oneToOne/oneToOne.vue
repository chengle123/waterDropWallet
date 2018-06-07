<template>
    <div class="contentBox">
        <div class="widget">
            <el-row class="widget-head">
                <el-col :xs="12" :sm="12" :md="12">
                    <div class="h3">一对一转账</div>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12">
                    <span class="floatRight">余额：{{ $route.params.money }}</span>
                </el-col>
            </el-row>
            <el-row class="widget-body">
                <el-form ref="form" :model="form">
                    <el-form-item label="发送账户">
                        <span class="tpl_form_line_small_title">{{ $route.params.fromAddr }}</span>
                    </el-form-item>
                    <el-form-item label="接收账户">
                        <el-input v-model="form.toAddr"></el-input>
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
                        <el-input type="gasEther" placeholder="ether" v-model.number="form.gasEther"></el-input>
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
                        <el-button type="primary" @click="sendOneToOne">立即创建</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
        </div>
    </div>
</template>
<script>
import rules from '../utils/rules'

export default {
    name: 'one-to-one',
    data() {
      return {
        checked: false,
        form: {
            gasLimit: '',
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
        sendOneToOne(key){
            var _this = this;
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if(!this.form.toAddr){
                        _this.$message({
                            type: 'error',
                            message: '请填写收款账户'
                        });
                        return;
                    }
                    if(this.$route.params.money <= this.form.amount){
                        _this.$message({
                            type: 'error',
                            message: '账户余额不足'
                        });
                        return;
                    }
                    if(this.checked){
                        var ops = {
                            fromAddr: this.$route.params.fromAddr,
                            toAddr: this.form.toAddr,
                            amount: this.form.amount,
                            gasGwei: this.form.gasGwei,
                            gasLimit: this.form.gasLimit
                        }
                    }else{
                        var ops = {
                            fromAddr: this.$route.params.fromAddr,
                            toAddr: this.form.toAddr,
                            amount: this.form.amount,
                            gasEther: this.form.gasEther
                        }
                    }
                    this.loading('正在交易中...');
                    this.$http.post('http://localhost:8989/sendOneToOne', ops).then(function (data) {
                        _this.load.close();
                        if(data && data.data.result === 'success'){
                            _this.$message({
                                type: 'success',
                                message: '交易成功'
                            });
                            _this.$router.push({name: 'account',params:{name:_this.$route.params.fromAddr}});
                        }else{
                            _this.$message({
                                type: 'error',
                                message: '交易失败'
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
