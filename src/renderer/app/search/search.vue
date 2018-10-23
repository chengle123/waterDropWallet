<template>
    <div>
        <el-row class="contentBox">
            <el-col :xs="24" :sm="12" :md="8" v-if="searchDetails && searchDetails.length>0" v-for="item in searchDetails">
                <el-row class="widget">
                    <div>
                        <el-col :xs="17" :sm="17">
                            <div class="h3">{{item.name}}</div>
                            <p class="am-text-truncate">{{item.token}}</p>
                        </el-col>
                        <el-col :xs="7" :sm="7" class="bottomBox">
                            <el-button type="primary" size="mini" @click="addToken(item)">添加</el-button>
                            <el-button type="danger" size="mini" @click="delToken(item)" v-if="item.exist">删除</el-button>
                        </el-col>
                    </div>
                </el-row>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" v-if="!searchDetails || searchDetails.length<=0">
                <el-row class="widget-body">
                    <div class="tpl-page-state">
                        <div class="tpl-error-title-info">没有搜索到数据</div>
                    </div>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { bus } from '../bus.js'
export default {
    name: 'search',
    data() {
      return {
        searchDetails: []
      };
    },
    mounted(){
        var _this = this;
        this.getToken(this.$route.params.searchtext);
        bus.$on('selectToken',function(data){
            if(data){
                _this.getToken(data);
            }
        })
    },
    methods: {
        loading(text){
            this.load = this.$loading({
                lock: true,
                text: text,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
        },
        addToken:function(item){
            var _this = this;
            this.$http.post('http://localhost:8989/setNewToken',item).then(data=>{
                if(data && data.data.result === 'success'){
                    _this.getToken(_this.$route.params.searchtext);
                    _this.$message({
                        type: 'success',
                        message: data.data.msg
                    });
                }else{
                    _this.$message({
                        type: 'error',
                        message: data.data.msg
                    });
                }
            });
        },
        delToken:function(item){
            var _this = this;
            this.$http.post('http://localhost:8989/delToken',item).then(data=>{
                if(data && data.data.result === 'success'){
                    _this.getToken(_this.$route.params.searchtext);
                    _this.$message({
                        type: 'success',
                        message: data.data.msg
                    });
                }else{
                    _this.$message({
                        type: 'error',
                        message: data.data.msg
                    });
                }
            });
        },
        getToken:function(searchText){
            this.loading('正在查询...');
            var _this = this;
            this.$http.post('http://localhost:8989/getSearch', {
                token: searchText
            }).then(function (data) {
                _this.load.close();
                if(data && data.data.result === 'success'){
                    _this.searchDetails = data.data.data;
                }else{
                    _this.searchDetails = [];
                }
            });
        }
    },
    beforeDestroy() {
        bus.$off('selectToken');
    }
};
</script>
<style>
.tpl-error-title-info{
    line-height: 30px;
    font-size: 21px;
    margin-top: 20px;
    text-align: center;
    color: #868E8E;
}
</style>
