<template>
    <div class="tpl-login">
        <div class="tpl-login-content">
            <div class="tpl-login-logo">
            </div>
            <el-form ref="form" :model="form">
                <el-input placeholder="请输入Key密码" v-model="password"></el-input>
                <p style="color:#fff;">（Key密码用于账户加解密）</p>
                <el-button type="primary" @click="login" size="small">提交</el-button>
            </el-form>
            <span id="version">版本：V {{ version }}</span>
        </div>
    </div>
</template>
<script>
import pkg from '../../../../package.json';
export default {
    name: 'login',
    data(){
        return {
            version: pkg.version
        };
    },
    methods: {
        login(key){
            if(!this.password){
                this.$message({
                    type: 'error',
                    message: '请填写Key密码'
                });
                return;
            }
            var _this = this;
            this.$http.post('http://localhost:8989/login',{
                password: _this.password
            }).then(function (data) {
                if(data && data.data.result === 'success'){
                    _this.$router.push('index');
                }
            })
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
    margin-top:-205px;
}
.tpl-login-logo {
    max-width: 200px;
    height: 250px;
    margin: 0 auto;
    margin-bottom: 30px;
    background: url('../images/logob.svg') no-repeat 0 0;
    background-size: cover;
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
#version{
    color:#fff;
    font-size:12px;
    position: fixed;
    bottom:10px;
    left:10px;
}
</style>
