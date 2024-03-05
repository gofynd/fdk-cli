<template>
    <div class="qty-control">
        <button
            @click="incrQuantity"
            class="operator"
            :disabled="isdisabled"
        >
        <svg-wrapper :svg_src="'dec'" class="operation"></svg-wrapper>
        </button>
        <div class="qty-amount">
            <input
                type="text"
                name="qty"
                class="light-xs"
                @input="onInput"
                @blur="onQtyLostFocus"
                @keydown.enter="onQtyLostFocus"
                :disabled="isdisabled"
                autocomplete="off"
                :value="quantity"
                ref="qtyInput"
            />
        </div>
        <button
            @click="decrQuantity"
            class="operator"
            :disabled="isdisabled"
        >
            <svg-wrapper :svg_src="'inc'" class="operation"></svg-wrapper>
        </button>
    </div>
</template>

<style lang="less" scoped>
.qty-control {
    .flex-center();
    border: 1px solid @LightGray;
    border-radius: @border-radius;
    .operator {
        cursor: pointer;

        background: @White;
        .flex-center();
        border: none;

        cursor: pointer;
        padding: 2px;
        .operation {
            .flex-center();
        }
    }
    button {
        &:hover {
            background: @LightGray;
        }
        &:disabled {
            background-color: @Alabaster2;
            cursor: default;
        }
    }
    .qty-amount {
        // padding: 3px;
        width: 38px;
        height: 25px;
        border-radius: @border-radius;
        border-left: 1px solid @LightGray;
        border-right: 1px solid @LightGray;
        margin: 0px;
        background-color: @Alabaster2;
        input {
            border: none;
            width: 100%;

            vertical-align: middle;
            text-align: center;
            background-color: @Alabaster2;
            color: #00abaa;
            padding: 2px 0px;
            &:focus {
                outline: none;
            }
        }
    }
}
</style>

<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';

export default {
    name: 'quantity-ctrl',
    components: {
        "svg-wrapper": SvgWrapper
    },
    props: {
        currquantity: {},
        isdisabled: false,
        total: 0,
    },
    data() {
        return {
            quantity: this.currquantity
        };
    },
    watch: {
        currquantity() {
            this.quantity = this.currquantity;
        }
    },
    methods: {
        incrQuantity() {
            this.$emit('inc-quantity', this.quantity);
        },
        decrQuantity() {
            this.$emit('dec-quantity', this.quantity);
        },
        onInput(evt) {
            let regex = /^\d+$/;
            let textNumber = regex.test(this.$refs?.qtyInput?.value);
            if ( textNumber || !this.$refs?.qtyInput?.value ) {
                this.quantity = this.$refs?.qtyInput?.value
                if (this.total < Number(this.quantity)) {
                    this.resetQuantity(this.currquantity)
                    this.$emit('update-quantity-error');
                    evt.preventDefault()
                    return;
                }
            } else {
                this.$refs.qtyInput.value = this.quantity
            }
        },
        onQtyLostFocus(evt) {
            let val = Number(evt.target.value);
            if (val !== this.currquantity) {
                this.$emit('change-qty', val);
                //this.changeQuantity(val);
            }
        },
        resetQuantity(value) {
            this.quantity = value;
        }
    }
};
</script>
