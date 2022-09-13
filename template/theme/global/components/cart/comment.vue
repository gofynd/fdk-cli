<template>
    <div>
        <div class="list">
            <div class="icons">
                <fdk-inline-svg :src="'request'"></fdk-inline-svg>
            </div>
            <div class="input">
                <div class="label bold-sm">Comment</div>
                <div>
                    <input
                        type="text"
                        v-model="value"
                        @change="$emit('input', $event.target.value)"
                        placeholder="Add any comments"
                    />
                </div>
            </div>
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
    .input {
        padding: 10px;
        color: @Mako;
        width: 100%;

        input {
            border: none;
            border-bottom: 1px solid @Gray;
            margin-top: 5px;
            width: 100%;
            padding: 5px 0px;
            &::placeholder {
                color: @DustyGray;
                text-transform: none;
            }
        }
    }
}
</style>

<script>

export default {
    name: 'cart-commment',
    props: {
        value: {},
        placeholder: ""
    },
    components: {
    },
    data() {
        return {};
    },
    computed: {},
    methods: {}
};
</script>
