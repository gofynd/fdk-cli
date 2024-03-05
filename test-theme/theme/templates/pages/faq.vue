<template>
  <div class="faqs-container">
    <h2 class="title">FAQ</h2>
    <div class="faqs mt-5">
      <h2 class="mb-3">Questions & Answers</h2>
      <ul class="faqs__list">
        <li
          class="faqs__list--item mb-5"
          v-for="(faq, index) in getFaqs"
          :key="index"
        >
        
          <div class="question">{{ `${index + 1}. ${faq.question}` }}</div>
          <div class="answer">{{ faq.answer }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    context: {},
  },
  computed: {
    getFaqs() {
      let faqs = [];
      if ( 
        this.context?.category_faqs?.length > 0
      ) {
        this.context.category_faqs.forEach((item) => {
          if (item?.child_faqs?.length > 0) {
            item.child_faqs.forEach((faq) => {
              faqs.push(faq);
            });
          }
        });
      }
     
      return faqs;
    },
  },
};
</script>
<style lang="less" scoped>
.faqs-container {
  padding-top: 1.5rem;
  .title {
    text-align: center;
  }
  .faqs {
    h2 {
      text-transform: uppercase;
    }
    &__list {
      color: @color-gray;

      &--item {
        .question {
          font-weight: bold;
        }
        .answer {
          line-height: 1.875rem;
        }
      }
    }
  }
}
</style>