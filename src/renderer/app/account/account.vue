<template>
    <div>
        <el-row class="container-fluid">
            <el-col :xs="20" :sm="20" :md="12">
            <div class="h2">地址：</div>
            <p>{{ $route.params.name }}</p>
            </el-col>
            <el-col :xs="4" :sm="4" :md="12">
            <el-button type="danger" size="mini" class="floatRight delButton" @click="delAccount();">删除账户</el-button>
            </el-col>
        </el-row>
        <el-row class="contentBox">
            <el-col :xs="24" :sm="12" :md="8">
                <el-row class="widget">
                    <div>
                        <el-col :xs="15" :sm="15">
                            <div class="h3">ETH</div>
                            <p>0</p>
                        </el-col>
                        <el-col :xs="9" :sm="9" class="bottomBox">
                            <el-button type="primary" size="mini" @click="oneToOneSelect();">一对一转账</el-button><br>
                            <el-button type="primary" size="mini" @click="oneToManySelect();">一对多转账</el-button><br>
                            <el-button type="primary" size="mini" @click="manyToOneSelect();">多对一转账</el-button>
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
    methods: {
        delAccount(key) {
            this.$confirm('确定要删除账户吗？账户删除是不可逆的。', '警告确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // this.$message({
                //     type: 'success',
                //     message: '你的邮箱是: ' + value
                // });
            })
        },
        oneToOneSelect(key) {
            this.$router.push({name: 'one-to-one', params: {fromAddr: this.$route.params.name, money: 0.01 }});
        },
        oneToManySelect(key) {
            this.$router.push({name: 'one-to-many', params: {fromAddr: this.$route.params.name, money: 0.01 }});
        },
        manyToOneSelect(key) {
            this.$router.push({name: 'many-to-one', params: {toAddr: this.$route.params.name, money: 0.01 }});
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
