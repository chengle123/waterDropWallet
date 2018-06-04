<template>
    <el-row class="app">
        <el-row class="header">
            <el-col :span="6">
                <div class="logo"></div>
            </el-col>
            <el-col :span="18" @refreshAccountList="getAccountList">
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
                <ul class="sidebar-nav">
                    <li class="sidebar-nav-link" v-for="(item, index) in accountList">
                        <span :class="{active : item.name == activeAccount.name}" @click="select(item)">
                            <span>序号：{{ index+1 }}</span>
                            <p class="am-text-truncate">{{ item.name }}</p>
                        </span>
                    </li>
                </ul>
            </el-col>
            <el-col :span="isCollapse?18:24" class="right">
                <div>
                    <router-view></router-view>
                </div>
            </el-col>
        </el-row>
    </el-row>  
    
</template>

<script>
  export default {
    data() {
      return {
        isCollapse: true,
        searchText:'',
        accountList:[
            { name: '0x5b22a90DFD4d5789f78C36408Ad2AD6F51c2a4D5'},
            { name: '0x9bFed376f0D3fbCD68422171bE1545Bb467D64C6'},
            { name: '0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9'},
            { name: '0xbA3e56DF740749cDD4507d854987C1Bc4D4835E3'}
        ],
        activeAccount:{}
      };
    },
    mounted(){
        this.$http.post('/validate').then(function (data) {
            if(data && data.data.result === 'success'){
                this.getAccountList();
            }else{
                this.$router.push('/login');
            }
        })
    },
    methods: {
        getAccountList(){
            $http({
                url: '/getAccountsList',
                method: 'post',
            }).then(function(data){
                if(data && data.data.result === 'success'){
                    this.accountList = data.data.data;
                    this.activeAccount = this.accountList[0];
                    this.$router.push({name: 'account',params:{name:this.activeAccount.name}});
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
            this.$http.post('/exportAccount', {
                type: key
            }).then(function (data) {
                console.log(data)
                if(data && data.data.result === 'success'){
                    this.$message({
                        type: 'success',
                        message: '导出成功'
                    });
                }
            })
        },
        addAccount(key) {
            this.$prompt('ps：账户默认用登录密码加密。', '添加账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[0-9]*[1-9][0-9]*$/,
                inputErrorMessage: '请填写0以上的整数'
            }).then(({ value }) => {
                this.$http.post('/addAccount', {
                    num: value
                }).then(function (data) {
                    console.log(data)
                    if(data && data.data.result === 'success'){
                        this.accountList = data.data.data;
                        this.activeAccount = this.accountList[0];
                        this.$message({
                            type: 'success',
                            message: '账户添加成功'
                        });
                    }
                })
            })
        },
        importAccount(key) {
            this.$prompt('请输入账户秘钥：', '导入账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                this.$http.post('/importAccount', {
                    key: value
                }).then(function (data) {
                    console.log(data)
                    if(data && data.data.result === 'success'){
                        this.accountList = data.data.data;
                        this.activeAccount = this.accountList[0];
                        this.$message({
                            type: 'success',
                            message: '账户添加成功'
                        });
                    }
                })
            })
        }
    }
  }
</script>