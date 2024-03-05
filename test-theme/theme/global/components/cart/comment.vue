<template>
    <div>
        <div class="list">
            <div class="icons">
                <svg-wrapper :svg_src="'request'"></svg-wrapper>
            </div>
            <div class="input">
                <div class="label bold-sm">{{comment_title || 'Comment'}}</div>
                <div>
                    <input
                        type="text"
                        v-model="value"
                        @change="$emit('onInput', cart, $event.target.value)"
                        placeholder="Add any comments"
                    />
                </div>
                <div v-if="showCommentError" class="error-msg regular-sm">
                     {{ errorCommentMessage || 'Please add any comments' }}
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
    .error-msg {
        color: @Required;
        padding: 10px 0;
        text-align: center;
    }
}
</style>

<script>
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
export default {
    name: 'cart-commment',
    props: {
        value: {},
        placeholder: "",
        cart: {},
        comment_title: "",
        showCommentError:"",
        errorCommentMessage:""
    },
    components: {
        "svg-wrapper": SvgWrapper
    },
};
</script>
