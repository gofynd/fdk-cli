<template>
  <div>
    <review-modal
      v-if="viewFullMedia"
      :reviewitem="reviewitem"
      :isOpen="viewFullMedia"
      @closereviewdialog="viewFullMedia = false"
      :enableOutsideClick="false"
    />
    <modal :isOpen="isOpen" @closedialog="closeDialog" title="User Images">
      <div class="review-modal-body">
        <review-media-list
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
import reviewmedialist from './review-media-list';
import reviewmodal from './review-modal';

export default {
  name: 'review-image-modal',
  components: {
    'review-media-list': reviewmedialist,
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
    showReviewModal(item) {
      this.reviewitem = item._review;
      this.viewFullMedia = true;
    },
  },
};
</script>

<style lang="less" scoped>
.review-modal-body {
  min-height: 500px;
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
