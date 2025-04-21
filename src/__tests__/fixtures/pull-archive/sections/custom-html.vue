<template> 
  <div class="full-width-section" v-html="settings.props.code.value">
  </div>
</template>
<settings>
{
  "name": "custom_html",
  "label": "Custom HTML",
  "props": [
    {
      "type": "code",
      "id": "code",
      "label": "Custom HTML",
      "info": "Add Your custom HTML Code below. You can also use the full screen icon to open a code editor and add your code"
    }
  ]
}
</settings>

<script>
export default {
  props: ['settings']
};
</script>

<style></style>
