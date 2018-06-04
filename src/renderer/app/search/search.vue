<template>
    <div>
        <el-row class="contentBox">
            <el-col :xs="24" :sm="12" :md="8" v-if="searchDetails && searchDetails.length>0" v-for="item in searchDetails">
                <el-row class="widget">
                    <div>
                        <el-col :xs="15" :sm="15">
                            <div class="h3">{{item.name}}</div>
                            <p>{{item.key}}</p>
                        </el-col>
                        <el-col :xs="9" :sm="9" class="bottomBox">
                            <el-button type="primary" size="mini" @click="addToken">添加</el-button>
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
export default {
    name: 'search',
    data() {
      return {
        searchDetails: []
      };
    },
    mounted(){
        this.$http.post('/getSearch', {
            text: search
        }).then(function (data) {
            console.log(data)
            if(data && data.data.result === 'success'){
                this.searchDetails = data.data.data;
            }else{
                this.searchDetails = [];
            }
        })
    },
    methods: {
        addToken:function(){

        }
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
