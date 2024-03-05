<template>
    <div class="size-set cl-Mako">
        <div class="space bold-xs">
            {{ storeInfo.set.quantity }} Pcs |
            {{ getProductPrice('effective') }}
        </div>
        <hr class="space" />
        <div class="space regular-xs">
            {{ storeInfo.price_per_piece.effective | currencyformat }} /Pcs
        </div>
        <div class="table">
            <div class="header bold-xs">
                <div class="bar">Sizes</div>
                <div>Pieces</div>
            </div>
            <div class="sets">
                <div
                    v-for="(item, index) in storeInfo.set.size_distribution
                        .sizes"
                    :key="index"
                    class="item regular-xs"
                >
                    <div class="size">{{ item.size }}</div>
                    <div class="piece">{{ item.pieces }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'size-set-info',
    props: {
        storeInfo: {}
    },
    methods: {
        getProductPrice(key) {
            if (this.storeInfo) {
                return this.$options.filters.currencyformat(
                    this.storeInfo.price[key]
                );
            }
        }
    }
};
</script>

<style lang="less" scoped>
.size-set {
    .space {
        margin: 5px 0px;
    }
    hr {
        color: @Mako;
    }
}
.table {
    display: flex;
    margin: 10px 0px;
    .header {
        border: 1px solid @Iron;
        div {
            padding: 5px;
        }
    }
    .bar {
        background-color: @Iron;
    }
    .sets {
        display: flex;
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        border: 1px solid @Iron;
        border-left: none;
        &::-webkit-scrollbar {
            display: none;
        }
        .item {
            flex-direction: column;
            display: flex;
            align-items: center;
            flex: 1;
            .size {
                background-color: @Iron;
                padding: 5px 10px;
                width: 100%;
                display: flex;
                justify-content: center;
            }
            .piece {
                padding: 5px 10px;
            }
        }
    }
}
</style>
