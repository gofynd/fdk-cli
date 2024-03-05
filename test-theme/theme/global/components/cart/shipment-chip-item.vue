<template>
    <div>
        <div class="chip regular-xxs">
            <span class="bold-xxs">{{ item.article.size }}</span>
            <span>|</span>
            <span class="light-xxs">{{ item.quantity }} Pieces</span>
            <div
                v-if="item.coupon_message && item.coupon_message != ''"
                class="offers-container  regular-xxs"
            >
                <span class="offer-applied light-xxs">
                    {{ item.coupon_message }}
                </span>
            </div>
            <div
                v-if="item.bulk_message && item.bulk_message != ''"
                class="offers-container  regular-xxs"
            >
                <span class="offer-applied light-xxs">
                    {{ item.bulk_message }}
                </span>
            </div>
        </div>
        <div class="regular-xxs">
            <span class="effective-price">
                {{ item.price.converted.effective | currencyformat }}
            </span>
            <span
                class="marked-price"
                v-if="
                    item.price.converted.effective !==
                        item.price.converted.marked
                "
                >{{ item.price.converted.marked | currencyformat }}</span
            >
            <span class="margin" v-if="item.discount"
                >{{ item.discount }}
            </span>
        </div>
    </div>
</template>

<script>


export default {
    name: 'shipment-chip-item',
    props: {
        item: {}
    },
};
</script>

<style lang="less" scoped>
.chip {
    background-color: @LightGray;
    padding: 10px;
    border-radius: 3px;
    display: inline-block;
    margin: 10px 0px;
    span {
        margin: 0px 5px;
    }
}
.offers-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
    .offer-applied {
        color: @Profit;
    }
}
.margin {
    color: @Required;
    margin-left: 10px;
}
</style>
