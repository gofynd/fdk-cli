<template>
    <div>
        <div class="ukt-title bold-xxs">
            Pick
            <template v-if="isProductSet"
                >Set</template
            ><template v-else
                >Size</template
            >
        </div>
        <div
            class="help light-xxs"
            v-if="product_meta.size_chart && product_meta.size_chart.sizes"
        >
            Need Help?
            <a class="ukt-links" @click="showSizeGuideModal = true"
                >View Size Guide</a
            >
        </div>

        <size-guide-modal
            :isOpen="showSizeGuideModal"
            :sizeguide="product_meta.size_chart"
            v-on:closedialog="showSizeGuideModal = false"
        ></size-guide-modal>
    </div>
</template>

<style lang="less" scoped>
.help {
    line-height: 20px;
}
</style>

<script>
import sizeguidemodal from './size-guide-modal.vue';
export default {
    name: 'size-guide',
    props: {
        product_meta: {},
        product: {}
    },
    components: {
        'size-guide-modal': sizeguidemodal
    },
    computed: {
        isProductSet() {
            return this.product.is_set;
        }
    },
    data() {
        return {
            showSizeGuideModal: false
        };
    },
};
</script>
