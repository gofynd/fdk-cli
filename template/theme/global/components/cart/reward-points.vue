<template>
    <div class="list" @click="clickIcon">
        <div class="icons">
            <img src="../../../assets/images/kycdetails.svg" />
        </div>
        <div class="offer">
            <div class="desc bold-sm">{{ getTitle }}</div>
            <div class="sub-desc regular-xxxs">{{ getSubtitle }}</div>
        </div>
        <div class="icons">
            <img src="../../../assets/images/check-box-selected.svg" v-if="this.rewards_data.is_applied"/>
            <img src="../../../assets/images/regular.svg" v-if="!this.rewards_data.is_applied"/>
        </div>
    </div>
</template>

<style lang="less" scoped>
.list {
    display: flex;
    cursor: pointer;
    padding: 5px 10px;
    border-bottom: 1px solid @LightGray;
    .icons {
        .flex-center();
        padding: 10px;
    }
    .offer {
        display: block;
        width: 100%;
        color: @Mako;
        padding: 10px;
        .desc {
            text-transform: uppercase;
        }
        .sub-desc {
            margin-top: 5px;
        }
        .couponapplied {
            color: @Profit;
        }
    }
    &:hover {
        background-color: @LightGray;
    }
}
</style>

<script>

export default {
    name: 'reward-points',
    props: {
        rewards_data: {},
    },
    components: {
    },
    computed: {
        getTitle() {
            if (this.rewards_data && this.rewards_data.title) {
                return this.rewards_data.title;
            }
            return 'Reward Points';
        },
        getSubtitle() {
            if (this.rewards_data && this.rewards_data.subtitle) {
                return this.rewards_data.subtitle;
            }
            return `Apply ${this.rewards_data.applicable} points of ${this.rewards_data.total} points`;
            return 'asdfsdfas';
        }
    },
    methods: {
        clickIcon(event) {
            this.$emit('change-rewards');
            event.stopPropagation();
            event.preventDefault();
        }
    }
};
</script>
