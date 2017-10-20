<template>
    <div>
        活动列表
    </div>
</template>

<script>
export default {
    data() {
        return {
            searchForm: {
                page: 1,
                page_size: 10,
                subject: null
            }
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getEventList();
        })
    },
    methods: {
        // 获取活动列表
        getEventList() {
            this.$axios.get('/admin/event/', this.searchForm).then(res => {
                console.log(res);
            })
        }
    }
}
</script>

