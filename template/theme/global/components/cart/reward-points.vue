<template>
    <div class="list" @click="clickIcon">
        <!-- <div class="icons">
            <img src="../../../assets/images/kycdetails.svg" />
        </div> -->
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
    padding: 5px 0px;
    border-bottom: 1px solid #eeeeee;
    .icons {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
    .offer {
        display: block;
        width: 100%;
        color:#000000;
        padding: 10px 5px;
        .desc {
            text-transform: uppercase;
        }
        .sub-desc {
            margin-top: 5px;
        }
        .couponapplied {
            color: #20ce81;
        }
    }
    &:hover {
        background-color: #eeeeee;
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
