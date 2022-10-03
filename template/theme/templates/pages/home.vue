<template>
  <div class="home-cont" :style="global_config ? 'color:' + global_config.props.text_body_color : ''">
    <sections page="home" />
  </div>
</template>
<style scoped lang="less">

.content,
.view {
  max-width: none !important;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 !important;
}
</style>

<script>
export default {
  data() {
    return {};
  },
  components: {},
};
</script>
