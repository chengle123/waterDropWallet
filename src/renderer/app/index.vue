<template>
    <el-row class="app">
        <el-row class="header">
            <el-col :span="6">
                <router-link to="/home"><div class="logo"></div></router-link>
            </el-col>
            <el-col :span="18">
                <el-row>
                    <el-button type="text" class="el-icon-menu floatLeft home" v-model="isCollapse" @click="menuLeft" style="color:rgb(207, 207, 207);font-size: 34px;"></el-button>
                    <el-col :xs="13" :sm="13" :md="13">
                        <el-input placeholder="请输入内容" v-model="searchText" class="input-with-select">
                            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
                        </el-input>
                    </el-col >
                    <el-dropdown class="floatRight" trigger="click">
                        <el-button type="text" class="el-dropdown-link">
                            <i class="el-icon-download"></i> 导出钱包
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>
                                <a @click="exportAccount('keystores')">
                                    <i class="el-icon-download"></i>
                                    导出 KeyStores
                                </a>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <a @click="exportAccount('privatekey')">
                                    <i class="el-icon-download"></i>
                                    导出 privateKey
                                </a>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-row>
            </el-col>
        </el-row>
        <el-row class="content">
            <el-col :span="6" class="left" :class="!isCollapse ? 'collapse' : '' ">
                <el-row class="buttonBox">
                    <el-col :xs="24" :md="12">
                        <el-button type="success" icon="el-icon-plus" round @click="addAccount">添加账户</el-button>
                    </el-col>
                    <el-col :xs="24" :md="12">
                        <el-button icon="el-icon-upload2" round @click="importAccount">导入账户</el-button>
                    </el-col>
                </el-row>
                <ul class="sidebar-nav" >
                    <li class="sidebar-nav-link" v-for="(item, index) in accountList">
                        <span :class="{active : item.name == activeAccount.name}" @click="select(item)">
                            <span>序号：{{ index+1 }}</span>
                            <p class="am-text-truncate">{{ item.name }}</p>
                        </span>
                    </li>
                </ul>
            </el-col>
            <el-col :span="isCollapse?18:24" class="right">
                <router-view></router-view>
            </el-col>
        </el-row>
    </el-row>  
    
</template>

<script>
import $ from 'jquery'
import { bus } from './bus.js'

  export default {
    data() {
      return {
        isCollapse: true,
        searchText:'',
        accountList:[],
        activeAccount:{}
      };
    },
    mounted(){
        var _this = this;
        this.$http.post('http://localhost:8989/validate').then(function (data) {
            if(data && data.data.result === 'success'){
                _this.getAccountList();
                _this.$router.push('home');
            }else{
                _this.$router.push('login');
            }
        })
        this.init();
        $(window).resize(function() {
            _this.init();
        });
        bus.$on('refresh-account-list',function(){
            _this.getAccountList();
        })
    },
    methods: {
        init(){
            var leftH = $('.left').height();
            var buttonBoxH = $('.left .buttonBox').height();
            $('.left .sidebar-nav').css({height:(leftH-buttonBoxH-32)+'px',overflow:'auto'});
        },
        getAccountList(){
            var _this = this;
            this.$http.post('http://localhost:8989/getAccountsList').then(function(data){
                if(data && data.data.result === 'success'){
                    _this.accountList = data.data.data;
                }
            });
        },
        select(item){
            this.activeAccount = item;
            this.$router.push({name: 'account',params:{name:item.name}});
        },
        menuLeft(key){
            this.isCollapse = this.isCollapse ? false : true;
        },
        search(key) {
            if(this.searchText){
                this.$router.push({name: 'search', params: {searchtext: this.searchtext }});
            }
        },
        exportAccount(key) {
            var _this = this;
            this.$http.post('http://localhost:8989/exportAccount', {
                type: key
            }).then(function (data) {
                if(data && data.data.result === 'success'){
                    _this.$alert('前往以下地址查看！' + data.data.data.url, '导出成功', {
                        confirmButtonText: '确定'
                    });
                }else{
                    _this.$message({
                        type: 'error',
                        message: '导出失败或KEY密码错误'
                    });
                }
            })
        },
        addAccount(key) {
            var _this = this;
            this.$prompt('ps：账户默认用登录密码加密。', '添加账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[0-9]*[1-9][0-9]*$/,
                inputErrorMessage: '请填写0以上的整数'
            }).then(({ value }) => {
                _this.$http.post('http://localhost:8989/addAccount', {
                    num: value
                }).then(function (data) {
                    if(data && data.data.result === 'success'){
                        _this.accountList = data.data.data;
                        _this.$message({
                            type: 'success',
                            message: '账户添加成功'
                        });
                    }else{
                        _this.$message({
                            type: 'error',
                            message: data.data.msg
                        });
                    }
                })
            }).catch(() => {});
        },
        importAccount(key) {
            var _this = this;
            this.$prompt('请输入账户秘钥：', '导入账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                _this.$http.post('http://localhost:8989/importAccount', {
                    key: value
                }).then(function (data) {
                    if(data && data.data.result === 'success'){
                        _this.accountList = data.data.data;
                        _this.$message({
                            type: 'success',
                            message: '账户添加成功'
                        });
                    }else{
                        _this.$message({
                            type: 'error',
                            message: data.data.msg
                        });
                    }
                })
            }).catch(() => {});
        }
    }
  }
</script>
<style>
    .el-dropdown-menu__item{
        padding:0 0;
    }
    .el-dropdown-menu__item a{
        display: block;
        height: 100%;
        padding: 0 20px;
    }
</style>
