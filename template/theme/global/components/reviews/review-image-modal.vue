<template>
  <div>
    <!-- <review-modal
      v-if="viewFullMedia"
      :reviewitem="reviewitem"
      :isOpen="viewFullMedia"
      @closereviewdialog="viewFullMedia = false"
      :enableOutsideClick="false"
    /> -->
    <modal :isOpen="isOpen" @closedialog="closeDialog" title="User Images">
      <div class="review-modal-body">
        <review-more-media-list
          :activeImageIndex="activeImageIndex"
          :media="media"
          :max_limit="media.length"
          @click="showReviewModal"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import modal from '../modal';
import reviewmoremedialist from './review-more-media-list.vue';
import reviewmodal from './review-modal';

export default {
  name: 'review-image-modal',
  components: {
    'review-more-media-list': reviewmoremedialist,
    'review-modal': reviewmodal,
    modal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    media: {
      type: Object,
      default: {},
    },
    activeImageIndex:{
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      viewFullMedia: false,
      reviewitem: {},
    };
  },
  computed: {},

  methods: {
    closeDialog() {
      this.$emit('closedialog');
    },
    showReviewModal(index) {
      this.reviewitem = this.media[index]._review;
      this.viewFullMedia = true;
    },
  },
};
</script>

<style lang="less" scoped>
.review-modal-body {
  min-height: 500px;
  max-width: 500px;
}
/deep/.review__media {
  div {
    width: 100px;
    cursor: pointer;
  }
  iframe {
    width: 100%;
    height: 155px;
  }
}
</style>
