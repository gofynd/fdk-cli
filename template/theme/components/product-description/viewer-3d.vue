<template>
    <model-viewer :src="src"  :interaction-prompt="prompt" camera-controls class="viewer-3d">
        <div id="loading-poster" slot="poster" v-if="prompt==='auto'">
            <fdk-loader />
        </div>
    </model-viewer>
</template>
<style lang="less" scoped >
.viewer-3d {
    position: relative;
    background: #ffffff;
    #loading-poster {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        /deep/ .loader {
            top: 0;
            left: 0;
        }
    }
}
</style>
<script>
import '@google/model-viewer';

export default {
    name: "viewer-3d",
    props: {
        src: {
            type: String,
            required: true
        },
        prompt: {
            type: String,
            default: 'auto'
        }
    }
}
</script>
