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
            <el-col :xs="24" :sm="12" :md="8" v-for="item in accountDetails.variety">
                <el-row class="widget">
                    <div>
                        <el-col :xs="15" :sm="15">
                            <div class="h3">{{item.name}}</div>
                            <p>{{item.num}}</p>
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
export default {
    name: 'access',
    data(){
        return {
            accountDetails: []
        };
    },
    mounted(){
        this.$http.post('/getAccountsMoney', {
            addr: this.$route.params.name
        }).then(function (data) {
            console.log(data)
            if(data && data.data.result === 'success'){
                this.accountDetails = data.data.data;
            }
        })
    },
    methods: {
        delAccount(key) {
            this.$confirm('确定要删除账户吗？账户删除是不可逆的。', '警告确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http.post('/delAccount', {
                    addr: this.$route.params.name
                }).then(function (data) {
                    console.log(data)
                    if(data && data.data.result === 'success'){
                        this.$emit('refreshAccountList');
                        this.$message({
                            type: 'success',
                            message: '删除成功'
                        });
                    }
                })
                
            })
        },
        oneToOneSelect(item) {
            this.$router.push({name: 'one-to-one', params: {fromAddr: this.$route.params.name, money: item.num }});
        },
        oneToManySelect(item) {
            this.$router.push({name: 'one-to-many', params: {fromAddr: this.$route.params.name, money: item.num }});
        },
        manyToOneSelect(item) {
            this.$router.push({name: 'many-to-one', params: {toAddr: this.$route.params.name, money: item.num }});
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
