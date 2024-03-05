<template>
    <span class="inline-svg">
        <Component :is="require(`../../assets/images/${svg_src}.svg`)" />
    </span>
</template>

<script>
export default {
    name: 'SvgWrapper',
    props: ['svg_src'],
};
</script>

<style lang="less" scoped>
.inline-svg {
    display: flex;
    align-items: center;
    justify-content: center;
//     ::v-deep svg {
//     width: 100%;
//     height: 100%;
//   }
}
</style>