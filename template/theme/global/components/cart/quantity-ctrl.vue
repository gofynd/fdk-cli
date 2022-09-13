<template>
    <div class="qty-control">
        <button
            @click="incrQuantity"
            class="operator"
            :disabled="isdisabled"
        >
            <fdk-inline-svg :src="'dec'" class="operation"></fdk-inline-svg>
        </button>
        <div class="qty-amount">
            <input
                type="text"
                name="qty"
                class="light-xs"
                @keydown="onQtyKeyDown"
                @blur="onQtyLostFocus"
                v-model="quantity"
                :disabled="isdisabled"
                autocomplete="off"
            />
        </div>
        <button
            @click="decrQuantity"
            class="operator"
            :disabled="isdisabled"
        >
            <fdk-inline-svg :src="'inc'" class="operation"></fdk-inline-svg>
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

import formHelper from './../../../helper/form.helper';
export default {
    name: 'quantity-ctrl',
    components: {
    },
    props: {
        currquantity: {},
        isdisabled: false
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
        onQtyKeyDown(evt) {
            //handle enter
            if (evt.keyCode === 13) {
                //emit event
                this.$emit('change-qty', Number(evt.target.value));
                // this.changeQuantity(Number(e.target.value));
                //Only number and free-navigation allowed
            } else if (
                !formHelper.isNumberKey(evt) &&
                !formHelper.isFreeNavigation(evt)
            ) {
                return event.preventDefault();
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
