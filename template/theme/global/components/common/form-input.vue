<template>
    <div class="form-row">
        <label class="dark-xs cl-DustyGray2" v-if="label">{{ label }}</label>
        <input
            v-if="!custom"
            :type="type"
            :placeholder="placeholder"
            :disabled="inputInfo.disabled"
            class="common-input input-text"
            v-model="inputInfo.value"
            @keydown.enter="keydownEnter"
            @keydown.tab="keydownTab"
        />
        <template v-if="custom">
            <slot />
        </template>
        <div
            v-bind:class="[{ visible: inputInfo.showerror }, 'form-error']"
            class="light-xxxxs"
        >
            {{ inputInfo.errortext }}
        </div>
    </div>
</template>

<style lang="less" scoped>
.form {
    .form-row {
        margin: 10px 0px 10px;
        label {
            margin-bottom: 5px;
            display: inline-block;
        }
        .input-text {
            padding: 8px 0px 5px 10px;
            border: 1px solid @Iron;
            border-radius: @border-radius;
            width: calc(100% - 12px);
        }
        .form-error {
            padding: 5px 0px 7px;
            margin-bottom: 7px;
            visibility: hidden;
            color: @rd-red;
        }
    }
}
.visible {
    visibility: visible !important;
}
</style>

<script>

export default {
    name: 'form-input',
    components: {
    },
    props: {
        item: {
            type: Object,
            default: function() {
                return {};
            }
        },
        type: {
            type: String,
            default: 'text'
        },
        label: {
            type: String,
            default: ''
        },
        custom: {
            type: Boolean,
            default: false
        },
        tooltip: {
            type: Object,
            default: function() {
                return {};
            }
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            inputInfo: this.item
        };
    },
    methods: {
        getText() {
            return this.inputInfo.value;
        },
        isEmpty(obj) {
            return _.isEmpty(obj);
        },
        keydownEnter(event) {
            this.$emit('keydownEnter', event);
        },
        keydownTab(event) {
            this.$emit('keydownTab', event);
        }
    }
};
</script>
