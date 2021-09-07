<template>
    <div>
        <div v-for="(item, index) in breakup" :key="'break_' + index">
            <div
                class="totals sub-title regular-xs"
                v-if="index != breakup.length - 1"
                v-bind:class="{ discount: Number(item.value) < 0 }"
            >
                <div>{{ item.display }}</div>
                <div class="value effective-price">
                    <span>{{ item.value | currencyformat }}</span>
                </div>
            </div>
            <div
                class="totals title regular-lg"
                v-if="index === breakup.length - 1"
            >
                <div>{{ item.display }}</div>
                <div class="value effective-price">
                    {{ item.value | currencyformat }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.totals {
    display: flex;
    width: calc(100% - 40px);
    padding: 10px;
    align-items: center;
    .value {
        margin-left: auto;
        right: 0px;
        position: relative;
        font-weight:700;
    }
}

.sub-title {
    margin: 5px 10px;
    color: @Mako;
    padding: 5px 10px;
}
.title {
    margin: 5px 10px;
    border-top: 1px solid @LightGray;
    color: @Mako;
}

</style>

<script>

export default {
    name: 'common-breakup',
    props: {
        breakup: {
            type: Array,
            required: true,
            default: []
        }
    }
};
</script>
