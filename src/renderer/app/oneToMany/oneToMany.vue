<template>
    <div class="contentBox">
        <div class="widget">
            <el-row class="widget-head">
                <el-col :xs="12" :sm="12" :md="12">
                    <div class="h3">一对多转账</div>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12">
                    <span class="floatRight">余额：{{ $route.params.money }}</span>
                </el-col>
            </el-row>
            <el-row class="widget-body">
                <el-form ref="form" :model="form">
                    <el-col :xs="24" :sm="24" :xl="12">
                        <el-form-item label="发送账户">
                            <span class="tpl_form_line_small_title">{{ $route.params.fromAddr }}</span>
                        </el-form-item>
                        <el-form-item label="接收账户">
                            <el-transfer
                                class="floatLeft"
                                filterable
                                :titles="['未选', '已选']"
                                :filter-method="filterMethod"
                                filter-placeholder=""
                                v-model="accountMarked"
                                :data="selectAccountList"
                            >
                            </el-transfer>
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :xl="12">
                        <el-form-item
                            label="转账金额"
                            prop="amount"
                            :rules="[
                                { required: true, message: '转账金额不能为空'},
                                { type: 'number', message: '转账金额必须为数字值'}
                            ]"
                        >
                            <el-input type="amount" v-model.number="form.amount"></el-input>
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
                            <el-button type="primary" @click="sendOneToMany">立即创建</el-button>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
        </div>
    </div>
</template>
<script>
export default {
    name: 'one-to-many',
    data() {
      return {
        checked: false,
        form: {
            gasLimit: '',
            selectAccountList:[],
            accountMarked: [],
            amount: '',
            gasEther: '',
            gasGwei: '',
        }
      };
    },
    mounted(){
        var _this = this;
        $http({
            url: 'http://localhost:8989/getAccountsList',
            method: 'post',
        }).then(function(data){
            if(data && data.data.result === 'success'){
                _this.selectAccountList = data.data.data;
            }
        });
        this.$http.post('http://localhost:8989/getGasEther').then(function (data) {
            if(data && data.data.result === 'success'){
                _this.gasEther = data.data.data;
            }
        })
    },
    methods: {
        sendOneToMany(key){
            var _this = this;
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if(this.checked){
                        var ops = {
                                fromAddr: this.$route.params.fromAddr,
                                accountMarked: this.accountMarked,
                                amount: this.amount,
                                gasGwei: this.gasGwei,
                                gasLimit: this.gasLimit
                            }
                    }else{
                        var ops = {
                                fromAddr: this.$route.params.fromAddr,
                                accountMarked: this.accountMarked,
                                amount: this.amount,
                                gasEther: this.gasEther
                            }
                    }
                    this.$confirm('一对多转账速度缓慢，所以请保持耐心!', '提醒', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消'
                    }).then(({ value }) => {
                        _this.$http.post('http://localhost:8989/sendOneToMany', ops).then(function (data) {
                            if(data && data.data.result === 'success'){
                                _this.$message({
                                    type: 'success',
                                    message: '交易发送成功'
                                });
                            }else{
                                _this.$message({
                                    type: 'error',
                                    message: '交易发送失败'
                                });
                            }
                        })
                    })
                } else {
                    return false;
                }
            }); 
        }
    }
};
</script>
