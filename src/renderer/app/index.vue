<template>
    <el-row class="app">
        <el-row class="header">
            <el-col :span="6">
                <div class="logo">
                    <img src="./images/logo.png" alt="">
                </div>
            </el-col>
            <el-col :span="18">
                <el-row>
                    <el-button type="text" class="el-icon-menu floatLeft home" v-model="isCollapse" @click="menuLeft" style="color:rgb(207, 207, 207);font-size: 34px;"></el-button>
                    <el-col :xs="13" :sm="13" :md="13">
                        <el-input placeholder="请输入内容" v-model="searchText" class="input-with-select">
                            <el-button slot="append" icon="el-icon-search" @click="search(searchText);"></el-button>
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
                    <li class="sidebar-nav-link" title="0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                        <router-link to="/account/0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9" class="active">
                            <span>序号：1</span>
                            <p class="am-text-truncate">0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9</p>
                        </router-link>
                    </li>
                    <li class="sidebar-nav-link" title="0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                        <router-link to="/account/0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                            <span>序号：1</span>
                            <p class="am-text-truncate">0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9</p>
                        </router-link>
                    </li>
                    <li class="sidebar-nav-link" title="0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                        <router-link to="/account/0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                            <span>序号：1</span>
                            <p class="am-text-truncate">0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9</p>
                        </router-link>
                    </li>
                    <li class="sidebar-nav-link" title="0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                        <router-link to="/account/0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9">
                            <span>序号：1</span>
                            <p class="am-text-truncate">0x33734985A4389eFB7Ab8d852cd5bFcFCD9c2eDc9</p>
                        </router-link>
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
        searchText:''
      };
    },
    methods: {
        menuLeft(key){
            this.isCollapse = this.isCollapse ? false : true;
        },
        search(key) {
            console.log(key);
        },
        exportAccount(key) {
            console.log(key);
        },
        addAccount(key) {
            this.$prompt('ps：账户默认用登录密码加密。', '添加账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[0-9]*[1-9][0-9]*$/,
                inputErrorMessage: '请填写0以上的整数'
            }).then(({ value }) => {
                // this.$message({
                //     type: 'success',
                //     message: '你的邮箱是: ' + value
                // });
            })
        },
        importAccount(key) {
            this.$prompt('请输入账户秘钥：', '导入账户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                // this.$message({
                //     type: 'success',
                //     message: '你的邮箱是: ' + value
                // });
            })
        }
    }
  }
</script>