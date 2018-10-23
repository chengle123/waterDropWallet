<template>
    <div>
        <el-row class="container-fluid">
            <el-col :xs="20" :sm="20" :md="12">
            <div class="h2">地址：</div>
            <p>{{ accountDetails.name }}</p>
            </el-col>
            <el-col :xs="4" :sm="4" :md="12">
            <el-button type="danger" size="mini" class="floatRight delButton" @click="delAccount();">删除账户</el-button>
            </el-col>
        </el-row>
        <el-row class="contentBox">
            <el-col :xs="24" :sm="12" :md="12" :lg="8" v-for="item in accountDetails.variety">
                <el-row class="widget">
                    <div>
                        <el-col :xs="15" :sm="15">
                            <div class="h3">{{item.name}}</div>
                            <p v-show="item.num">{{item.num}}</p>
                            <p v-show="!item.num">
                                <el-button type="primary" size="mini" @click="getTokenNum(item);" :loading="false">查看余额</el-button>
                            </p>
                        </el-col>
                        <el-col :xs="9" :sm="9" class="bottomBox">
                            <el-button type="primary" size="mini" @click="oneToOneSelect(item);">一对一转账</el-button><br>
                            <el-button type="primary" size="mini" @click="oneToManySelect(item);">一对多转账</el-button><br>
                            <el-button type="primary" size="mini" @click="manyToOneSelect(item);">多对一转账</el-button>
                        </el-col>
                    </div>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { bus } from '../bus.js'

export default {
    name: 'access',
    data(){
        return {
            accountDetails: {},
            load:''
        };
    },
    watch: {
        '$route' (to, from) {
            this.init();
        }
    },
    mounted(){
        this.init();
    },
    methods: {
        init(){
            var _this = this;
            this.loading('正在加载...');
            this.$http.post('http://localhost:8989/getAccountsMoney', {
                addr: this.$route.params.name
            }).then(function (data) {
                _this.load.close();
                if(data && data.data.result === 'success'){
                    _this.accountDetails = data.data.data;
                    _this.$http.post('http://localhost:8989/getTokenList').then(function (d) {
                        if(d && d.data.result === 'success'){
                            _this.tokenList = d.data.data;
                            for(var i = 0;i<d.data.data.length;i++){
                                _this.accountDetails.variety.push({
                                    name: d.data.data[i].name,
                                    num:'',
                                    token: d.data.data[i].token
                                });
                            }
                        }
                    })

                }else{
                    _this.$message({
                        type: 'error',
                        message: data.data.msg
                    });
                    _this.$router.push('/home');
                }
            })
        },
        loading(text){
            this.load = this.$loading({
                lock: true,
                text: text,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
        },
        delAccount(key) {
            var _this = this;
            this.$confirm('确定要删除账户吗？账户删除是不可逆的。', '警告确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                _this.$http.post('http://localhost:8989/delAccount', {
                    addr: _this.$route.params.name
                }).then(function (data) {
                    if(data && data.data.result === 'success'){
                        _this.$message({
                            type: 'success',
                            message: '删除成功'
                        });
                        bus.$emit('refresh-account-list');
                    }
                })
            }).catch(() => {});
        },
        oneToOneSelect(item) {
            this.$router.push({name: 'one-to-one', params: {fromAddr: this.$route.params.name, money: item.num, name: item.name , token: item.token  }});
        },
        oneToManySelect(item) {
            this.$router.push({name: 'one-to-many', params: {fromAddr: this.$route.params.name, money: item.num, name: item.name , token: item.token }});
        },
        manyToOneSelect(item) {
            this.$router.push({name: 'many-to-one', params: {toAddr: this.$route.params.name, money: item.num, name: item.name , token: item.token }});
        },
        getTokenNum(item){
            var _this = this;
            this.$http.post('http://localhost:8989/getTokenNum', {
                token: item.token,
                address: _this.accountDetails.name
            }).then(function (data) {
                if(data && data.data.result === 'success'){
                    item.num = data.data.data.num;
                    _this.$message({
                        type: 'success',
                        message: '查询'+item.name+'余额成功'
                    });
                }else{
                    _this.$message({
                        type: 'erroe',
                        message: '查询'+item.name+'余额失败'
                    });
                }
            })
        }
    }
};
</script>
<style>
.container-fluid {
    margin-top: 0px;
    margin-bottom: 0px;
    padding: 40px 20px;
    border-bottom: 0px;
    background: rgb(66, 75, 79);
}
.contentBox > .el-col {
    margin-bottom: 10px;
    padding: 0 5px;
}

.contentBox .el-button{
    margin: 2px 0;
}
.contentBox .bottomBox{
    text-align: right;
}
.contentBox p{
    padding:20px 0;
}
.delButton{
    margin-top:20px;
}
</style>
