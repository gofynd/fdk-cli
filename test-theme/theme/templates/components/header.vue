<template>
  <div
    :class="{
      'header-wrap': true,
      'header-wrap-menu-below': global_config.props.menu_position == 'bottom',
    }"
    :style="`--header_nav_hover_color:${global_config.props.header_nav_hover_color};--header_icon_color:${global_config.props.header_icon_color};`"
  >
    <div
      class="header"
      :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
    >
      <div
        :class="`desktop nav-${global_config.props.menu_position}`"
        :style="`border-bottom: 1px solid ${global_config.props.header_border_color};background-color: ${global_config.props.header_bg_color};`"
      >
        <div
          class="spaced"
          v-if="global_config.props.menu_position == 'bottom'"
        ></div>
        <div class="nav">
          <ul
            class="l1-navigation-list"
            v-if="
              global_config.props.menu_position == 'bottom' ||
              (context.navigation &&
                context.navigation.length <= MAX_MENU_LENGHT)
            "
          >
            <li
              class="l1-navigation-list__item mr-5"
              v-for="(nav, index) in context.navigation"
              :key="index"
            >
              <fdk-link :link="nav.link">
                <span class="u-df-align-center">
                  <p class="mr-2">{{ nav.display }}</p>
                  <svg-wrapper
                    v-if="nav.sub_navigation && nav.sub_navigation.length > 0"
                    class="dropdown-icon header-icon"
                    :svg_src="'arrow-down'"
                  ></svg-wrapper>
                </span>
              </fdk-link>

              <ul
                class="l2-navigation-list"
                v-if="nav.sub_navigation && nav.sub_navigation.length > 0"
                :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
              >
                <li
                  class="l2-navigation-list__item"
                  v-for="(subnav, index) in nav.sub_navigation"
                  :key="index"
                >
                  <fdk-link :link="subnav.link">
                    <span class="u-df-align-center flex-justify-between">
                      <p class="mr-2">{{ subnav.display }}</p>
                      <svg-wrapper
                        v-if="subnav.sub_navigation && subnav.sub_navigation.length > 0"
                        class="dropdown-icon header-icon"
                        :svg_src="'arrow-down'"
                      ></svg-wrapper>
                    </span>
                  </fdk-link>

                  <ul
                    class="l3-navigation-list"
                    v-if="subnav.sub_navigation && subnav.sub_navigation.length > 0"
                    :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
                  >
                    <li
                      class="l3-navigation-list__item"
                      v-for="(subnav, index) in subnav.sub_navigation"
                      :key="index"
                    >
                      <fdk-link :link="subnav.link"
                        ><p>{{ subnav.display }}</p>
                      </fdk-link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <div class="icon" v-else @click="showHamburgerMenu">
            <svg-wrapper
              class="hamburger-icon header-icon"
              :svg_src="'hamburger'"
            ></svg-wrapper>
          </div>
        </div>
        <div class="logo">
          <div class="center-cont">
            <fdk-link link="/" class="center-cont__logo">
              <img :src="context.logo.secure_url" alt="Brand Logo" />
            </fdk-link>
          </div>
        </div>
        <div class="profile-icon right-nav">
          <div class="right u-df-align-center">
            <fdk-accounts class="right__icons">
              <template slot-scope="accountsData">
                <div
                  class="icon right__icons--profile mr-5 py-5"
                  v-if="isMounted"
                  @click="checkLogin(accountsData, 'profile')"
                >
                  <svg-wrapper
                    class="user header-icon"
                    :svg_src="'user'"
                  ></svg-wrapper>
                </div>
                <div
                  class="icon right__icons--search mr-5 py-5"
                  @click="callSearch"
                >
                  <svg-wrapper
                    v-if="!showSearch"
                    class="search-icon header-icon"
                    :svg_src="'search'"
                  ></svg-wrapper>
                  <svg-wrapper
                    v-else
                    class="close header-icon"
                    :svg_src="'close'"
                  ></svg-wrapper>
                </div>
                <div
                  class="icon right__icons--wishlist mr-5 py-5"
                  v-if="isMounted"
                  @click="checkLogin(accountsData, 'wishlist')"
                >
                  <svg-wrapper
                    class="wishlist header-icon"
                    :svg_src="'wishlist-active'"
                  ></svg-wrapper>
                </div>
                <div
                  class="icon right__icons--bag mr-5 py-5"
                  v-if="isMounted && !global_config.props.disable_cart"
                  @click="checkLogin(accountsData, 'cart')"
                >
                  <svg-wrapper
                    class="cart header-icon"
                    :svg_src="'cart'"
                  ></svg-wrapper>
                  <p
                    class="cart-count u-df-align-center"
                    :style="`background-color: ${global_config.props.header_cart_notification_bg_color};color: ${global_config.props.header_cart_notification_text_color};`"
                  >
                    {{ context.cart_item_count }}
                  </p>
                </div>
                <transition name="slide-fade">
                  <fdk-search
                    class="search"
                    v-if="showSearch"
                    :has_products="true"
                  >
                    <template slot-scope="searchData">
                      <input
                        class="search__input"
                        type="text"
                        id="searchInput"
                        autocomplete="off"
                        @keyup.enter="
                          selectedIndex === null
                            ? getEnterSearchData(searchData)
                            : getSearchData()
                        "
                        @keydown="onArrowKey"
                        v-click-outside="hideList"
                        v-on:focus="showSearch = true"
                        @input="
                          fetchSuggestions($event, searchData.fetchSuggestions)
                        "
                      />
                      <div
                        @click="
                          searchData.executeQuery(searchtext);
                          showSearch = false;
                          searchtext = '';
                        "
                      >
                        <svg-wrapper
                          class="arrow-icon dropdown-icon header-icon"
                          :svg_src="'arrow-down'"
                        ></svg-wrapper>
                      </div>

                      <div
                        class="suggestions"
                        :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
                        v-if="
                          showSearch &&
                          ((searchData.suggestions &&
                            searchData.suggestions.length > 0) ||
                            (searchData.product_suggestions &&
                              searchData.product_suggestions.length > 0) ||
                            searchData.no_results)
                        "
                      >
                        <ul
                          class="suggestions__products"
                          v-if="
                            searchData.product_suggestions &&
                            searchData.product_suggestions.length > 0
                          "
                        >
                          <li
                            class="suggestions__products--item"
                            v-for="(data, index) in getProductSearchSuggestions(
                              searchData.product_suggestions
                            )"
                            :key="index"
                            @click.stop.prevent="
                              showSearch = false;
                              redirectToProduct(data.url);
                              searchtext = '';
                            "
                            v-bind:class="{
                              focus: isFocusedItem(data),
                            }"
                          >
                            <img :src="data.image.url" />
                            <div class="product-details">
                              <div>{{ data.name }}</div>
                              <div v-if="data.subtitle" class="subtitle">
                                {{ data.subtitle }}
                              </div>
                            </div>
                          </li>
                        </ul>

                        <ul
                          class="suggestions__products"
                          v-if="
                            searchData.suggestions &&
                            searchData.suggestions.length > 0
                          "
                        >
                          <li
                            class="suggestions__products--item"
                            v-for="(data, index) in getSearchResults(
                              searchData.suggestions
                            )"
                            :key="index"
                            @click.stop.prevent="
                              redirectToProduct(data.url);
                              searchtext = '';
                            "
                            v-bind:class="{
                              focus: isFocusedItem(data),
                            }"
                          >
                            <img :src="data.logo.url" />
                            <div class="product-details">
                              <div>{{ data.display }}</div>
                              <div v-if="data.subtitle" class="subtitle">
                                {{ data.subtitle }}
                              </div>
                            </div>
                          </li>
                        </ul>
                        <ul
                          v-if="
                            searchData.product_suggestions &&
                            searchData.product_suggestions.length === 0 &&
                            searchData.suggestions &&
                            searchData.suggestions.length === 0 &&
                            searchData.no_results &&
                            showSearch
                          "
                        >
                          <div
                            class="suggestions__products"
                            @click="
                              redirectToProduct('/products/?q=' + searchtext)
                            "
                          >
                            <li class="suggestions__products--item">
                              No match found
                            </li>
                          </div>
                        </ul>
                      </div>
                    </template>
                  </fdk-search>
                </transition>
              </template>
            </fdk-accounts>
          </div>
        </div>
      </div>
      <div
        class="mobile"
        :style="`border-bottom: 1px solid ${global_config.props.header_border_color};background-color: ${global_config.props.header_bg_color};`"
      >
        <div class="left" @click="showHamburgerMenu">
          <svg-wrapper
            class="hamburger-icon mobile-icon header-icon"
            :svg_src="'hamburger'"
          ></svg-wrapper>
        </div>
        <fdk-link link="/" class="center-mobile">
          <img :src="context.logo.secure_url" alt />
        </fdk-link>
        <fdk-accounts class="right">
          <template slot-scope="accountsData">
            <div
              class="icon right__icons--wishlist"
              @click.stop="checkLogin(accountsData, 'wishlist')"
            > 
              <svg-wrapper
                class="wishlist mobile-icon header-icon"
                :svg_src="'wishlist-active'"
              ></svg-wrapper>
            </div>
            <div
              v-if="isMounted && !global_config.props.disable_cart"
              class="icon right__icons--bag"
              @click.stop="checkLogin(accountsData, 'cart')"
            >
              <svg-wrapper
                class="cart mobile-icon header-icon"
                :svg_src="'cart'"
              ></svg-wrapper>
              <p
                class="cart-count u-df-align-center"
                :style="`background-color: ${global_config.props.header_cart_notification_bg_color};color: ${global_config.props.header_cart_notification_text_color};`"
              >
                {{ context.cart_item_count }}
              </p>
            </div>
          </template>
        </fdk-accounts>
      </div>
      <transition name="slide">
        <div
          class="hamburger"
          v-if="showHamburger"
          :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
        >
          <div class="close-icon" @click.stop="showHamburger = false">
            <svg-wrapper
              class="cross-icon mobile-icon header-icon"
              :svg_src="'close'"
            ></svg-wrapper>
          </div>

          <ul class="hamburger__navigation">
            <li
              class="hamburger__navigation--item"
              v-for="(nav, index) in navs"
              :key="index"
              @click.stop="redirectToMenu(nav)"
            >
              <fdk-link v-if="!hasSubNavigation(nav)" :link="nav.link">
                <p>{{ nav.display }}</p>
              </fdk-link>
              <p v-else @click.stop="redirectToMenu(nav)">
                {{ nav.display }}
              </p>
              <div
                @click.stop="redirectToMenu(nav)"
                v-if="hasSubNavigation(nav)"
              >
                <svg-wrapper
                  class="arrow-icon mobile-icon header-icon"
                  :svg_src="'arrow-down'"
                ></svg-wrapper>
              </div>

              <transition name="slide">
                <div
                  class="hamburger mobile__subnav"
                  v-if="nav.sub_navigation && nav.sub_navigation.showSubMenu"
                  :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
                >
                  <ul class="hamburger__navigation">
                    <li
                      class="hamburger__navigation--item back"
                      @click.stop="hideSubmenu(nav)"
                    >
                      <svg-wrapper
                        class="back__icon mobile-icon header-icon"
                        :svg_src="'arrow-down'"
                      ></svg-wrapper>
                      <p class="">Go Back</p>
                    </li>
                    <li
                      class="hamburger__navigation--item"
                      v-for="(subnav, idx) in nav.sub_navigation"
                      :key="idx"
                      @click.stop="redirectToMenu(subnav)"
                    >
                      <fdk-link v-if="!hasSubNavigation(subnav)" :link="subnav.link">
                        <p>{{ subnav.display }}</p>
                      </fdk-link>
                      <p v-else @click.stop="redirectToMenu(subnav)">
                        {{ subnav.display }}
                      </p>
                      <div
                        @click.stop="redirectToMenu(subnav)"
                        v-if="hasSubNavigation(subnav)"
                      >
                        <svg-wrapper
                          class="arrow-icon mobile-icon header-icon"
                          :svg_src="'arrow-down'"
                        ></svg-wrapper>
                      </div>
                      <transition name="slide">
                        <div
                          class="hamburger mobile__subnav"
                          v-if="subnav.sub_navigation && subnav.sub_navigation.showSubMenu"
                          :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
                        >
                          <ul class="hamburger__navigation">
                            <li
                              class="hamburger__navigation--item back"
                              @click.stop="hideSubmenu(subnav)"
                            >
                              <svg-wrapper
                                class="back__icon mobile-icon header-icon"
                                :svg_src="'arrow-down'"
                              ></svg-wrapper>
                              <p class="">Go Back</p>
                            </li>
                            <li
                              class="hamburger__navigation--item"
                              v-for="(subnavl3, idx) in subnav.sub_navigation"
                              :key="idx"
                            >
                              <fdk-link :link="subnavl3.link">
                                <p>{{ subnavl3.display }}</p>
                              </fdk-link>
                            </li>
                          </ul>
                        </div>
                      </transition>
                    </li>
                  </ul>
                </div>
              </transition>
            </li>
          </ul>
          <fdk-accounts class="hamburder__navigation user">
            <template slot-scope="accountsData">
              <div
                class="hamburger__navigation--item"
                @click="
                  checkLogin(accountsData, 'profile_mobile');
                  showHamburger = false;
                "
              >
                <p>Profile</p>
              </div>
            </template>
          </fdk-accounts>

          <div class="mt-5">
            <div class="hamburger__navigation--item">
              <fdk-search class="hamburger__search" :has_products="true">
                <template slot-scope="searchData">
                  <input
                    class="search__input mobile"
                    type="text"
                    v-model="searchtext"
                    placeholder="Search Products"
                    @keyup.enter="getEnterSearchDataMobile(searchData)"
                  />
                  <div
                    class="icon"
                    @click="
                      searchData.executeQuery(searchtext);
                      searchtext = '';
                      showHamburger = false;
                    "
                  >
                    <svg-wrapper
                      class="search-icon mobile-icon header-icon"
                      :svg_src="'search'"
                    ></svg-wrapper>
                  </div>
                </template>
              </fdk-search>
            </div>
          </div>
        </div>
      </transition>
      <div
        class="overlay"
        :class="{ show: showHamburger }"
        @click.stop="showHamburger = false"
      >
        &nbsp;
      </div>
    </div>
  </div>
</template>

<script>
import { detectMobileWidth } from "../../helper/utils";
import SvgWrapper from "../../components/common/svg-wrapper.vue";
export default {
  props: {
    context: {},
  },
  components: {
    "svg-wrapper": SvgWrapper,
  },
  data() {
    return {
      MAX_MENU_LENGHT: 4,
      showSearch: false,
      searchtext: "",
      showHamburger: false,
      showSubMenu: false,
      selectedIndex: null,
      suggestion: [],
      product_suggestions: [],
      isMounted: false,
      navs: [],
    };
  },
  watch: {
    $route(to, from) {
      this.hideHamburgerMenu();
    },
  },
  mounted() {
    this.isMounted = true;
    this.navs = this.getNavs();
  },
  computed: {
    accessibleItems() {
      return this.product_suggestions.concat(this.suggestion);
    },
  },
  methods: {
    showHamburgerMenu() {
      this.navs.map((nav) => {
        if (nav.sub_navigation) {
          nav.sub_navigation.showSubMenu = false;
        }
      });
      this.showHamburger = true;
    },
    hideHamburgerMenu() {
      this.navs.map((nav) => {
        if (nav.sub_navigation) {
          nav.sub_navigation.showSubMenu = false;
        }
      });
      this.showHamburger = false;
    },
    getNavs() {
      if (this.context.navigation) {
        let navigations = this.context.navigation.map((nav) => {
          if (nav.sub_navigation) {
            nav.showSubMenu = false;
          }
          return nav;
        });
        return Object.assign([], navigations);
      }
    },
    callSearch() {
      this.selectedIndex = null;
      this.showSearch = !this.showSearch;
      if (this.showSearch) {
        setTimeout(function () {
          document.getElementById("searchInput").focus();
        }, 1500);
      }
    },
    getSearchData() {
      let path = this.accessibleItems[this.selectedIndex].url;
      this.$router.push({ path: path });
      this.showlist = false;
    },
    getEnterSearchData: function getEnterSearchData(searchData) {
      if (this.searchtext.trim()) {
        this.showSearch = false;
        this.showlist = false;
        searchData.executeQuery(this.searchtext);
      }
    },
    getEnterSearchDataMobile(searchData) {
      if (this.searchtext.trim()) {
        searchData.executeQuery(this.searchtext);
        this.searchtext = "";
        this.showHamburger = false;
      }
    },
    isFocusedItem(item) {
      const selectedItem = this.accessibleItems[this.selectedIndex];
      if (selectedItem && item.display) {
        return item.display === selectedItem.display;
      } else if (selectedItem && item.name) {
        return item.name === selectedItem.name;
      }
      return false;
    },
    getSearchResults(item) {
      this.suggestion = item;
      return item;
    },
    getProductSearchSuggestions(item) {
      this.product_suggestions = item;
      return item;
    },
    onArrowKey: function (event) {
      const KEY_UP = 38;
      const KEY_DOWN = 40;
      switch (event.keyCode) {
        case KEY_UP:
          if (this.selectedIndex === null) {
            this.selectedIndex = 0;
          } else if (this.selectedIndex > 0) {
            this.selectedIndex--;
          }
          break;
        case KEY_DOWN:
          if (this.selectedIndex === null) {
            this.selectedIndex = 0;
          } else if (this.selectedIndex < this.accessibleItems.length - 1) {
            this.selectedIndex++;
          }
          break;
      }
    },
    checkLogin(accountsData, type) {
      if (type === "cart") {
        this.$router.push("/cart/bag/");
      } else if (!accountsData.is_logged_in) {
        accountsData.openLogin();
      } else {
        if (type === "profile") this.$router.push("/profile/details");
        else if (type === "profile_mobile") this.$router.push("/profile");
        else if (type === "wishlist") this.$router.push("/wishlist");
      }
    },
    redirectToPage(nav) {
      this.$router.push("/");
    },
    redirectToProduct(link) {
      this.$router.push(link);
      this.showSearch = false;
    },
    redirectToMenu(menu) {
      if (!menu.sub_navigation.length) {
        this.showHamburger = false;
        this.navs = this.getNavs();
      } else {
        menu.sub_navigation.showSubMenu = true;
        this.navs = [...this.navs];
      }
    },
    hideSubmenu(menu) {
      menu.sub_navigation.showSubMenu = false;
      this.navs = [...this.navs];
    },
    hideList: function hideList(event) {
      setTimeout(() => {
        this.showSearch = false;
        this.searchtext = "";
      }, 200);
    },
    fetchSuggestions(evt, fetchSuggestionsAction) {
      this.selectedIndex = null;
      this.showSearch = true;
      this.searchtext = evt.target.value;
      fetchSuggestionsAction(this.searchtext);
    },
    hasSubNavigation(nav, p) {
      return nav?.sub_navigation?.length > 0;
    },
  },
};
</script>

<style lang="less" scoped>
.header-wrap {
  position: relative;
  z-index: 10 !important;
  height: 114px;

  @media @tablet {
    height: 68px;
  }

  @media @mobile {
    height: 68px;
  }

  @media screen and (max-width: 1120px) {
    height: 68px;
  }
  .header-icon {
    fill: var(--header_icon_color);
    width:  30px;
    height: 30px;
    ::v-deep svg {
      width: 100%;
      height: 100%;
    }
  }
  .header {
    position: fixed;
    top: 0;
    width: 100%;

    .desktop {
      display: none;

      @media screen and (min-width: 1121px) {
        display: flex;
        box-sizing: border-box;
        // padding: 0.625rem @header-padding-desktop;
        padding: 0.625rem 2rem;
        min-height: 4.375rem;
        align-items: center;
        position: relative;
        .nav,
        .profile-icon,
        .spaced {
          flex: 1;
        }

        &.nav-bottom {
          flex-wrap: wrap;
          .nav {
            order: 1;
            flex-basis: 100%;
            justify-content: center;
          }
        }
        .nav {
          display: flex;
          justify-content: flex-start;
          .l1-navigation-list {
            display: flex;
            flex-wrap: wrap;
            text-transform: uppercase;
            &__item {
              padding: 32px 0;
              position: relative;
              cursor: pointer;
              font-size: 1rem;
              line-height: 1rem;
              white-space: nowrap;
            }
          }
        }
        .profile-icon {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      }
    }
  }
  .center-cont {
    width: auto;
    max-height: 82px;
    &__logo {
      img {
        max-height: 82px;
      }
    }
  }

  //navigation
  .l2-navigation-list, .l3-navigation-list {
    position: absolute;
    width: 250px;
    box-sizing: border-box;
    border: 1px solid @border-color;
    background-color: @color-white;
    white-space: normal;
    padding: 0.5rem;
    font-size: 1rem;
    line-height: 1.5rem;
    z-index: 999;
    color: @color-gray;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
    &__item {
      position: relative;
      p {
        padding: 0.5rem 1rem;
        display: block;
      }
      .dropdown-icon{
        transform: rotate(-90deg);
      }
      &:hover {
        color: var(--header_nav_hover_color);
        .dropdown-icon {
          fill: var(--header_nav_hover_color);
        }
        .l3-navigation-list {
          visibility: visible;
          opacity: 1;
        }
      }
    }
  }
  .l3-navigation-list {
    top: 0;
    left: 100%;
  }
  //right
  .right {
    &__icons {
      display: flex;
      position: relative;
      .icon {
        cursor: pointer;
        min-width: 30px;
      }
      &--bag {
        position: relative;
        .cart-count {
          position: absolute;
          height: 1.25rem;
          width: 1.25rem;
          background-color: @primary-color;
          border-radius: 50%;
          justify-content: center;
          font-weight: bold;
          color: white;
          top: 22px;
          left: 15px;
          font-size: 10px;
        }
      }
    }
    .setting {
      text-align: center;
      height: 30px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      @media @tablet {
        height: 24px;
      }
      svg {
        cursor: pointer;
        fill: var(--header_icon_color, @color-black);
        width: 24px;
        height: 24px;
        @media @tablet {
          width: 22px;
          height: 22px;
        }
      }
    }
  }

  //search-input
  .search {
    position: absolute;
    width: 25rem;
    top: 105px;
    left: -100%;
    z-index: 10;
    &__input {
      width: 100%;
      padding: 0.625rem;
      font-size: 0.875rem;
      height: 3.125rem;
      padding-right: 1.875rem;
      box-sizing: border-box;
    }
    .arrow-icon {
      cursor: pointer;
      position: absolute;
      top: 12px;
      right: 2%;
    }
  }

  //suggestions
  .suggestions__products {
    background: @color-white;
    border: 1px solid @border-color;
    border-top: none;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    color: @color-black;
    &--item {
      cursor: pointer;
      display: flex;
      padding: 0.625rem;
      height: 3.75rem;
      align-items: center;
      box-sizing: border-box;
      font-size: 0.875rem;
      &:not(:last-child) {
        border-bottom: 1px solid @border-color;
      }
      img {
        width: 1.875rem;
        margin-right: 1.25rem;
      }
      &:hover {
        background: @color-gray-1;
      }
    }
    .focus {
      background: @color-gray-1;
    }
  }

  //animations
  .l1-navigation-list__item {
    .dropdown-icon {
      width: 14px;
      height: 14px;
      flex: 0 0 14px;
    }
    &:hover {
      color: var(--header_nav_hover_color);
      .dropdown-icon {
        fill: var(--header_nav_hover_color);
      }
      .l2-navigation-list {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  //mobile-styles
  .mobile {
    display: none;
    padding: 1.25rem;
    position: relative;

    @media screen and (max-width: 1120px) {
      display: flex;
      border-bottom: 1px solid @border-color;
      align-items: center;
      justify-content: space-between;
    }
    .left {
      cursor: pointer;
    }
    .mobile-icon {
      width: 24px;
      height: 24px;
      &.setting {
        width: 20px;
        height: 20px; 
      }
    }
    .center-mobile {
      cursor: pointer;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      width: 100px;

      @media @tablet {
        width: 30%;
      }
      @media @mobile {
        width: 35%;
      }
      @media @xsm-mobile {
        width: 25%;
      }
      img {
        display: inline-block;
        vertical-align: middle;
        max-width: 100%;
        max-height: 65px;
        @media @tablet {
          max-height: 65px;
        }
        @media @mobile {
          max-height: 45px;
        }
      }
    }
    .right {
      display: flex;
      align-items: center;
      column-gap: 10px;
      .cart-count {
        top: -5px;
        left: 14px;
        width: 16px;
        height: 16px;
      }
    }
  }
  .icon {
    cursor: pointer;
  }
  .hamburger {
    position: fixed;
    top: 0;
    left: 0;
    width: 25rem;
    height: 100%;
    z-index: 4;
    font-size: 1rem;
    font-weight: 500;
    color: @color-gray;
    text-transform: uppercase;
    box-sizing: border-box;
    padding: 0.625rem;
    box-shadow: 0 2.5rem 3.125rem rgba(0, 0, 0, 0.4);
    @media @mobile {
      width: 21.875rem;
    }
    .close-icon {
      padding: 1.25rem 1.25rem 1.25rem 1.475rem;
      width: 2.1875rem;
      padding-bottom: 0;
      cursor: pointer;
      .cross-icon {
        width: 35px;
        height: 35px;
      }
    }
    &__navigation {
      border-bottom: 1px solid @color-gray;
      padding-bottom: 1.25rem;
      margin-bottom: 1.25rem;
      &--item {
        padding-left: 1.875rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.4s;
        cursor: pointer;
        .arrow-icon {
          transform: rotate(-90deg);
          transition: all 0.4s;
          width: 16px;
          height: 16px;
        }

        &:hover {
          color: var(--header_nav_hover_color);
          // text-decoration: underline;
          .arrow-icon {
            fill: var(--header_nav_hover_color) !important;
          }
        }
        & > a, & > p {
          padding: 0.625rem 0;
          flex-grow: 1;
        }
      }
    }
    &__search {
      width: 17.5rem;
      position: relative;
      .icon {
        position: absolute;
        top: 9px;
        right: 10px;
        transition: all 0.4s;
        opacity: 0.5;
      }
      .mobile {
        padding: 0 3.125rem 0 1.25rem;
        transition: all 0.4s;
        border: 1px solid @color-black;
      }
      .mobile:placeholder-shown {
        border: 1px solid @border-color;
      }
    }
  }
  .overlay {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: @color-black;
    opacity: 0;
    transition: all 0.4s;
    z-index: 2;
    visibility: hidden;
    cursor: pointer;
  }
  .show {
    opacity: 0.5;
    visibility: visible;
  }
  .back {
    justify-content: flex-start;
    padding: 0;
    margin-left: -5px;
    p {
      padding: 0 0 0 3px;
    }
    &__icon {
      transform: rotate(90deg);
      transition: all 0.4s;
      width: 20px;
      height: 20px;
    }
  }
  &__subnav {
    box-shadow: none !important ;
    .hamburger__navigation--item:nth-child(2) {
      padding-top: 16px;
    }
    .hamburger__navigation--item {
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }
}
.header-wrap-menu-below {
  height: 192px;
  @media screen and (max-width: 1120px) {
    height: 68px;
  }
}
</style>
