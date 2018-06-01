<template>
    <div class="tpl-login">
        <div class="tpl-login-content">
            <div class="tpl-login-logo">
                <img src="../images/logob.png">
            </div>
            <el-form ref="form" :model="form">
                <el-input placeholder="请输入Key密码" v-model="password"></el-input>
                <p style="color:#fff;">（Key密码用于账户加解密）</p>
                <el-button type="primary" @click="login" size="small">提交</el-button>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    name: 'login',
    methods: {
        login(key){

        }
    }
};
</script>
<style>
.tpl-login {
    width: 100%;
}
.tpl-login-content {
    width: 300px;
    position: absolute;
    top:50%;
    left:50%;
    margin-left:-150px;
    margin-top:-183px;
}
.tpl-login-logo {
    max-width: 159px;
    height: 205px;
    margin: 0 auto;
    margin-bottom: 30px;
}
.tpl-login-logo img{
    width:100%;
}
.tpl-login input{
    background-color: rgb(40, 45, 47);
    border: 0;
    border-bottom: 1px solid;
    border-radius: 0;
    color:#fff;
}
.tpl-login .el-button{
    width:100%;
}
.tpl-login p{
    padding:20px 0;
}
</style>
