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
                        :rules="[
                            { required: true, message: '转账金额不能为空'},
                            { type: 'number', message: '转账金额必须为数字值'}
                        ]"
                    >
                        <el-input type="amount" v-model.number="form.amount"></el-input>
                        {{ $route.params.money - amount }}
                    </el-form-item>
                    <el-form-item
                        label="矿工费用"
                        prop="gasEther"
                        :rules="[
                            { required: true, message: '矿工费用不能为空'},
                            { type: 'number', message: '矿工费用必须为数字值'}
                        ]"
                        v-if="!checked"
                    >
                        <el-input type="gasEther" placeholder="ether" v-model.number="form.gasEther"></el-input>
                    </el-form-item>
                    <el-form-item 
                        label="自定义 Gas Price"
                        prop="gasGwei"
                        :rules="[
                            { required: true, message: 'Gas Price不能为空'},
                            { type: 'number', message: 'Gas Price必须为数字值'}
                        ]"
                        v-if="checked"
                    >
                        <el-input type="gasGwei" placeholder="gwei" v-model.number="form.gasGwei"></el-input>
                    </el-form-item>
                    <el-form-item
                        label="自定义 Gas Limit"
                        prop="gasLimit"
                        :rules="[
                            { required: true, message: 'Gas Limit不能为空'},
                            { type: 'number', message: 'Gas Limit必须为数字值'}
                        ]"
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
        }
      };
    },
    mounted(){
        this.$http.post('/getGasEther').then(function (data) {
            console.log(data)
            if(data && data.data.result === 'success'){
                this.gasEther = data.data.data;
            }
        })
    },
    methods: {
        sendOneToOne(key){
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if(this.checked){
                        var ops = {
                            fromAddr: this.$route.params.fromAddr,
                            toAddr: this.toAddr,
                            amount: this.amount,
                            gasGwei: this.gasGwei,
                            gasLimit: this.gasLimit
                        }
                    }else{
                        var ops = {
                            fromAddr: this.$route.params.fromAddr,
                            toAddr: this.toAddr,
                            amount: this.amount,
                            gasEther: this.gasEther
                        }
                    }
                    this.$http.post('/sendOneToOne', ops).then(function (data) {
                        console.log(data)
                        if(data && data.data.result === 'success'){
                            this.$message({
                                type: 'success',
                                message: '交易成功'
                            });
                        }else{
                            this.$message({
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
