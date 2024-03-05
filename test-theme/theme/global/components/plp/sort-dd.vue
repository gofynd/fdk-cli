<template>
  <div class="items sort-list regular-sm">
    <span class="dd-label">Sort by:</span>
    <div class="selected" v-on:click="sortOpen = !sortOpen">
      <span class="selectedSort"> {{ selectedsort }} </span>
      <svg-wrapper :svg_src="'arrow-dropdown-black'"></svg-wrapper>
      <ul
        v-if="sortOpen && checkMobile"
        class="menu"
        id="sortopt"
        v-click-outside="closeSortOption"
      >
        <li
          v-for="(sorttype, index) in filteredsorts"
          :key="sorttype.value + index"
          v-on:click="updateSelection(sorttype.value)"
        >
          <svg-wrapper
            v-if="!sorttype.is_selected"
            :svg_src="'regular'"
          ></svg-wrapper>
          <svg-wrapper
            :svg_src="'radio-selected'"
            v-if="sorttype.is_selected"
          ></svg-wrapper>
          <span>{{ sorttype.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { isBrowser, isNode } from "browser-or-node";
import SvgWrapper from './../../../components/common/svg-wrapper.vue';

export default {
  name: "sort-dd",
  props: {
    filteredsorts: [],
    updateSelection: {},
  },
  components: {
    'svg-wrapper' : SvgWrapper
  },
  data() {
    return {
      sortOpen: false,
    };
  },

  computed: {
    selectedsort() {
      let selectedFilter = this.filteredsorts.filter((x) => x.is_selected);
      if (selectedFilter.length > 0) {
        return selectedFilter[0].name;
      }
      if (selectedFilter.length === 0) {
        return this.filteredsorts[1].name;
      }
    },
    checkMobile() {
      if (isBrowser) {
        return window.innerWidth > 480;
      } else {
        return false;
      }
    },
  },
  methods: {
    closeSortOption(event) {
      if (event && event.target.id !== "sortopt") {
        this.sortOpen = false;
      }
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .svgbox {
  color: @PrimaryColor;
  svg {
    fill: currentColor;
    stroke: currentColor;
  }
}

.items {
  .dd-label {
    width: 100px;
  }
  .flex-center();
  margin: auto;
  width: 60%;
  border-right: 1px solid @Gray;
  position: relative;
  padding: 0 10px;
  .user-select-none();
  .selected {
    cursor: pointer;
    margin-left: 10px;
    width: 280px;
    align-items: center;
    justify-content: flex-start;
    display: flex;
    .user-select-none();
  }
  &:last-child {
    border-right: none;
  }
  &:nth-last-child(2) {
    border-right: none;
  }
  .menu {
    box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.1);
    background-color: @White;
    position: absolute;
    top: 32px;
    z-index: @menu;
    margin: auto;
    left: 30%;
    width: 280px;

    @media @mobile {
      left: 0px;
    }
    li {
      display: flex;
      align-items: center;
      padding: 5px 15px;
    }
    .share-meta {
      color: @Gray;
      padding: 5px 0px;
    }
    .share-links {
      border: none;
      margin: 10px 0px;
    }
  }
  &.sort-list {
    .sort-icon {
      display: none;
      @media @mobile {
        display: flex;
      }
    }
    #sortopt {
      @media @mobile {
        display: none;
      }
    }
    @media @mobile {
      .selected {
        .selectedSort {
          display: none;
        }
      }
      .menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        li {
          padding: 18px;
          border-bottom: 1px solid @Gray;
          justify-content: center;
          .inline-svg {
            display: none;
          }
        }
      }
    }
  }
}
</style>
