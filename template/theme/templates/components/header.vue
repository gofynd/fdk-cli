<template>
  <section class="header">
    <section class="navigation">
      <ul class="nav" ref="nav-ul">
        <div class="left-cont">
          <li class="logo-wrap">
            <fdk-link class="header-nav-menu" link="/">
              <img :src="context.logo.secure_url" />
            </fdk-link>
          </li>
          <li class="menu">
            <ul style="display:flex">
              <li
                class="item l1"
                v-for="(menu, index) in context.navigation"
                :key="'nav_' + index"
                :class="{
                  selected: selectedNav && selectedNav.l1 === menu.link,
                }"
              >
                <fdk-link
                  class="header-nav-menu"
                  :link="menu.link"
                  v-if="!menu.tags"
                  @click="selectedNav = { l1: menu.link }"
                  >{{ menu.display }}</fdk-link
                >
                <section v-if="menu.sub_navigation">
                  <div class="line"></div>
                  <ul class="submenu">
                    <li
                      class="item l2"
                      v-for="(submenu, index) in menu.sub_navigation"
                      :key="'sub-nav-' + index"
                      :class="{
                        selected:
                          selectedNav && selectedNav.l2 === submenu.link,
                      }"
                    >
                      <fdk-link
                        class="header-nav-menu"
                        :link="submenu.link"
                        @click="
                          selectedNav = { l1: menu.link, l2: submenu.link }
                        "
                        >{{ submenu.display }}</fdk-link
                      >
                      <section v-if="submenu.sub_navigation">
                        <ul
                          class="submenu"
                          :data-blocks="
                            getBlocks(submenu.sub_navigation.length)
                          "
                        >
                          <li
                            class="item l3"
                            v-for="(smenu, index) in submenu.sub_navigation"
                            :key="'l3-menu-' + index"
                          >
                            <fdk-link
                              class="header-nav-menu"
                              :link="smenu.link"
                              v-if="!smenu.tags"
                              >{{ smenu.display }}</fdk-link
                            >
                          </li>
                        </ul>
                      </section>
                    </li>
                  </ul>
                </section>
              </li>
            </ul>
          </li>
        </div>

        <li class="search-wrap">
          <div :class="{ opacity: showSearch }">
            <button class="button-no-defaults" @click="openSearch">
              SEARCH
            </button>
          </div>
          <div class="auth-menu">
            <fdk-accounts>
              <template slot-scope="accountsData">
                <div v-if="accountsData.isLoggedIn && isMounted">
                  <div class="auth-menu-text">
                    {{ accountsData.userData.user.firstName }}'s Account
                    <ul
                      class="hover-menu"
                      :class="{ 'hover-selected': showprofile }"
                    >
                      <li class="hover-item">
                        <a class="hover-link" @click="routeToProfilePage()"
                          >My Profile</a
                        >
                      </li>
                      <li
                        v-for="(item, index) in accounts"
                        :key="index + '-profile'"
                        class="hover-item"
                      >
                        <a
                          @click="redirectToPage({ ...item })"
                          class="hover-link"
                          >{{ item.display }}
                        </a>
                      </li>
                      <li class="hover-item">
                        <a
                          class="hover-link"
                          title="Logout"
                          @click="accountsData.signOut"
                          >Logout</a
                        >
                      </li>
                    </ul>
                  </div>
                </div>
                <div
                  v-else
                  @click="accountsData.openLogin"
                  class="auth-menu-text"
                >
                  Login
                </div>
              </template>
            </fdk-accounts>
          </div>
          <div>
            <fdk-link
              :link="'/cart/bag'"
              class="minicart-link"
              :class="{ 'not-empty': context.cartItemCount }"
            >
              <i class="minicart-icon shopping-bag"></i>
              <span v-if="context.cartItemCount" class="minicart-quantity">
                {{ context.cartItemCount }}
              </span>
            </fdk-link>
          </div>
        </li>
      </ul>
    </section>
    <transition name="slide-fade">
      <fdk-search class="search" v-if="showSearch" :has_products="true">
        <template slot-scope="searchData">
          <div class="line"></div>
          <input
            class="search__input"
            type="text"
            id="searchInput"
            placeholder="Search for products"
            autocomplete="off"
            @keyup.enter="
              showSearch = false;
              selectedIndex === null
                ? getEnterSearchData(searchData)
                : getSearchData();
            "
            @keydown="onArrowKey"
            v-click-outside="hideList"
            v-on:focus="showSearch = true"
            @input="fetchSuggestions($event, searchData.fetchSuggestions)"
          />
          <div
            @click="
              searchData.executeQuery(searchtext);
              showSearch = false;
              searchtext = '';
            "
          ></div>

          <div
            class="suggestions"
            v-if="
              showSearch &&
                (searchData.suggestions.length > 0 ||
                  searchData.productSuggestions.length > 0 ||
                  searchData.noResults)
            "
          >
            <ul
              class="suggestions__products"
              v-if="searchData.productSuggestions.length > 0"
            >
              <li
                class="suggestions__products--item"
                v-for="(data, index) in getProductSearchSuggestions(
                  searchData.productSuggestions
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
              v-if="searchData.suggestions.length > 0"
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
                searchData.productSuggestions.length === 0 &&
                  searchData.suggestions.length === 0 &&
                  searchData.noResults &&
                  showSearch
              "
            >
              <div
                class="suggestions__products"
                @click="redirectToProduct('/products/?q=' + searchtext)"
              >
                <li class="suggestions__products--item">
                  Search for {{ searchtext }}
                </li>
              </div>
            </ul>
          </div>
        </template>
      </fdk-search>
    </transition>
    <div class="search-overlay" v-if="showSearch"></div>
    <section class="mobile-navigation">
      <section class="mobile-header">
        <span @click="showHamburger = !showHamburger">
          <img
            v-if="!showHamburger"
            src="./../../assets/images/hamburger.svg"
            style="margin-right:6.5px"
          />
          <img
            v-else-if="showHamburger"
            src="./../../assets/images/cross-black.svg"
          />
        </span>
        <span @click="showSearch = true">
          <span class="search-field-icon"></span>
        </span>
        <span class="logo-box">
          <fdk-link :link="'/'">
            <img :src="context.logo.secure_url" />
          </fdk-link>
        </span>
        <span class="mnav-right">
          <div class="mnav-r-cont">
            <div>
              <fdk-accounts>
                <template slot-scope="accountsData">
                  <div v-if="accountsData.isLoggedIn && isMounted">
                    <a
                      class="mobile-account"
                      @click="routeToProfilePage()"
                      alt="Profile"
                    ></a>
                  </div>
                  <div v-else @click="accountsData.openLogin">
                    <a
                      class="mobile-account"
                      @click="accountsData.openLogin"
                      alt="Login"
                    ></a>
                  </div>
                </template>
              </fdk-accounts>
            </div>
            <div>
              <fdk-link
                :link="'/cart/bag'"
                class="minicart-link"
                :class="{ 'not-empty': context.cartItemCount }"
              >
                <i class="minicart-icon shopping-bag"></i>
                <span v-if="context.cartItemCount" class="minicart-quantity">
                  {{ context.cartItemCount }}
                </span>
              </fdk-link>
            </div>
          </div>
        </span>
      </section>

      <transition name="slide">
        <ul class="hamburger-menu" v-if="showHamburger">
          <li
            v-for="(menu, index) in navs"
            :key="'mobile-' + index"
            class="hamburger-li nav"
            @click.stop="shouldRedirect(menu)"
          >
            <span class="l1-item">
              {{ menu.display }}
              <span
                class="dropdown-arrow"
                :class="{ 'rotate-arrow': menu.isOpen }"
                v-if="menu.sub_navigation"
              >
              </span>
            </span>

            <div
              v-if="menu.sub_navigation"
              class="l2-sub-nav"
              :class="{ 'toggle-dropdown': menu.isOpen }"
            >
              <div>
                <ul
                  v-for="(submenu, index) in menu.sub_navigation"
                  :key="index"
                >
                  <li
                    class="l2-sub-nav-item"
                    @click="
                      (selectedNav = submenu.link), (showHamburger = false)
                    "
                  >
                    <fdk-link :link="submenu.link">
                      <span
                        :class="{
                          selectedNav: selectedNav === submenu.display,
                        }"
                        >{{ submenu.display }}</span
                      >
                      <span>
                        <div>
                          <span class="dropdown-arrow"> </span>
                        </div>
                      </span>
                    </fdk-link>

                    <ul v-if="submenu.sub_navigation" class="l3-sub-nav">
                      <li
                        v-for="(smenu, index) in submenu.sub_navigation"
                        :key="index"
                        @click="showHamburger = false"
                      >
                        <fdk-link :link="smenu.link">{{
                          smenu.display
                        }}</fdk-link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </transition>
      <div
        class="overlay"
        v-if="showHamburger"
        @click="showHamburger = false"
      ></div>
    </section>
  </section>
</template>

<script>
import { detectMobileWidth } from './../../helper/utils';
export default {
  props: {
    context: {},
  },
  data() {
    return {
      showlist: false,
      showprofile: false,
      currentHovered: '',
      isMounted: false,
      focus: null,
      showHamburger: false,
      items: [],
      accounts: [
        {
          icon: require('./../../assets/images/profile-wishlist.svg'),
          display: 'Wishlist',
          link: '/wishlist/',
        },
        {
          icon: require('./../../assets/images/profile-order.svg'),
          display: 'Orders',
          link: '/profile/orders',
        },
        {
          icon: require('./../../assets/images/profile-address.svg'),
          display: 'Addresses',
          link: '/profile/address',
        },
      ],
      taggedNavigation: [],
      selectedNav: {},
      showMobileSearch: 'close',
      showSearch: false,
      searchtext: '',
      selectedIndex: null,
      suggestion: [],
      productSuggestions: [],
      navs: [],
    };
  },
  computed: {
    accessibleItems() {
      return this.productSuggestions.concat(this.suggestion);
    },
  },
  methods: {
    openSearch() {
      this.showSearch = true;
      this.$nextTick(() => {
        const searchInput = this.$refs['search-input'];
        if (!searchInput) {
          return false;
        }
        searchInput.focus();
      });
    },

    redirectToProduct(link) {
      this.$router.push(link);
      this.showSearch = false;
    },
    getBlocks(length) {
      return Math.round(length / 6);
    },
    search() {
      this.showSearch = false;
      this.$router.push({
        path: '/products/?q=' + encodeURIComponent(this.searchtext),
      });
      this.$nextTick(() => {
        this.searchtext = '';
      });
    },

    routeToProfilePage: function routeToProfilePage() {
      if (detectMobileWidth()) {
        this.$router.push('/profile');
      } else {
        this.$router.push('/profile/details');
      }
    },
    redirectToPage: function redirectToPage(menu) {
      if (!menu.sub_navigation) {
        this.$router.push(menu.link);
      }
    },
    shouldRedirect(navigation) {
      if (navigation.sub_navigation) {
        navigation.isOpen = !navigation.isOpen;
        return;
      }
      this.$router.push(navigation.link);
      this.showHamburger = false;
    },
    callSearch() {
      this.selectedIndex = null;
      this.showSearch = !this.showSearch;
      if (this.showSearch) {
        setTimeout(function() {
          document.getElementById('searchInput').focus();
        }, 1500);
      }
    },
    getSearchData() {
      let path = this.accessibleItems[this.selectedIndex].url;
      this.$router.push({ path: path });
      this.showlist = false;
    },
    getEnterSearchData: function getEnterSearchData(searchData) {
      this.showlist = false;
      searchData.executeQuery(this.searchtext);
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
      this.productSuggestions = item;
      return item;
    },
    onArrowKey: function(event) {
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
    fetchSuggestions(evt, fetchSuggestionsAction) {
      this.selectedIndex = null;
      this.showSearch = true;
      this.searchtext = evt.target.value;
      fetchSuggestionsAction(this.searchtext);
    },
    hideList: function hideList(event) {
      setTimeout(() => {
        this.showSearch = false;
        this.searchtext = '';
      }, 200);
    },
  },
  watch: {
    context: function() {
      if (this.context.navigation) {
        this.taggedNavigation = [];
        this.context.navigation.map((menu) => {
          if (menu.tags) {
            menu.parent = this.context.navigation.display;
            this.taggedNavigation.push(menu);
          }
          if (menu.sub_navigation) {
            menu.sub_navigation.map((submenu) => {
              if (submenu.tags) {
                submenu.parent = menu.display;
                this.taggedNavigation.push(submenu);
              }
              if (submenu.sub_navigation) {
                submenu.sub_navigation.map((subsubmenu) => {
                  if (subsubmenu.tags) {
                    subsubmenu.parent = submenu.display;
                    this.taggedNavigation.push(subsubmenu);
                  }
                });
              }
            });
          }
        });
      }
    },
    $route(to, from) {
      this.showMobileMenu = false;
    },
  },
  mounted() {
    this.isMounted = true;
    this.selectedNav = this.$route && this.$route.path;
    let value = 0;
    this.context.navigation.forEach((item, index) => {
      item.isOpen = false;
      this.navs.push(item);
    });
    if (!detectMobileWidth()) {
      window.addEventListener('scroll', () => {
        {
          let filBox = this.$refs['nav-ul'];
          if (filBox) {
            let YOffset = filBox.offsetTop + 37;
            value = YOffset === 0 ? value : YOffset;
            if (window.pageYOffset >= value) {
              filBox.classList.add('sticky-header');
            } else {
              filBox.classList.remove('sticky-header');
            }
          }
        }
      });
    }
  },
};
</script>

<style lang="less" scoped>
.header {
  font-family: 'roboto condensed', sans-serif;
  width: 100%;
  background-color: #ffffff;
  box-sizing: border-box;
  > section {
    width: 1300px;
    margin: 0 auto;
    box-sizing: border-box;
    z-index: 4;
  }
  .minicart-link {
    position: relative;
    display: inline-block;
    .minicart-quantity {
      position: absolute;
      font-size: 11px;
      top: 10px;
      right: -10px;
      width: 10px;
    }
    &.not-empty {
      color: #ff1010;
    }
  }

  .navigation {
    width: 100%;
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    top: 24px;
    margin-bottom: 60px;
    // .nav {
    //   position: relative;
    // }
  }

  /**
    * Search box styles
    */

  //search-input
  .search {
    position: fixed;
    width: 100%;
    top: 50px;
    left: 0;
    z-index: 10;
    font-size: 10px;
    padding: 0 11.5%;
    box-sizing: border-box;
    @media @mobile {
      padding: 0;
    }
    &__input {
      width: 100%;
      padding: 1em;
      font-size: 1.4em;
      height: 3em;
      padding-right: 3em;
      box-sizing: border-box;
      border: none;
      border-top: 1px solid @Iron;
      border-bottom: 1px solid @Iron;
    }
    .arrow-icon {
      cursor: pointer;
      position: absolute;
      top: 12px;
      right: 2%;
    }
  }

  //suggestions
  .suggestions {
    box-shadow: 0 0em 3em rgba(0, 0, 0, 0.2);
  }
  .suggestions__products {
    //   background: @White;
    border: 1px solid @border-color;
    border-top: none;
    &--item {
      cursor: pointer;
      display: flex;
      padding: 1em !important;
      height: 3em;
      align-items: center;
      background: @White;
      box-sizing: border-box;
      font-size: 1.4em;
      &:not(:last-child) {
        border-bottom: 1px solid @border-color;
      }
      img {
        height: 2em;
        margin-right: 2em;
      }
      &:hover {
        background: @Iron;
      }
    }
    .focus {
      background: @Iron;
    }
  }

  /**
    *  Navigation Menu Styles
    */
  ul.nav {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 calc(100% / 8.8);
    position: absolute;
    width: 100%;
    background-color: #ffffff;
    box-sizing: border-box;
    &.sticky-header {
      position: fixed;
      top: 0;
    }
    /** 
        * moving search box to the right
        */
    li.search-wrap {
      display: flex;
      align-items: center;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.5px;
      color: #000000;
      button {
        font-family: 'roboto condensed', sans-serif !important;
      }
      > * {
        padding: 17px 14px;
      }

      .hover-menu {
        font-size: 14px;
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
        position: absolute;
        background-color: #fff;
        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
        max-height: 0;
        overflow: hidden;
        margin-top: 0;
        width: 11.5%;
        border-right: 1px solid #e9e9e9;
        padding: 0 28px;
        margin-left: -28px;
        top: 53px;
        .hover-item {
          list-style-type: none;
          padding: 10px 0;
          a {
            text-decoration: none;
            color: #000;
            cursor: pointer;
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
      .auth-menu {
        padding: 0;
        .auth-menu-text {
          padding: 17px 14px;
          &:hover {
            .hover-menu {
              z-index: 102;
              border: 1px solid #e9e9e9;
              border-top: none;
              width: 11.5%;
              max-height: 320px;
              max-height: 20rem;
              max-width: 320px;
              max-width: 20rem;
              padding: 0 28px 10px;
            }
          }
        }
      }
    }

    /** 
        * moving logo box to the center
        */
    li.logo-wrap {
      // position: absolute;
      // left: calc(50% - 89px);
      width: 200px;
      img {
        height: 60px;
      }
    }

    /**
        * Menu item styles 
        */
    li.item {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 14px;
      display: inline-block;
      max-height: 24px;
      letter-spacing: 0.5px;
      padding: 17px 14px;
      color: #000000;
      /**
            * The Full width section inside submenu with white background
            */
      > section {
        display: none;
        width: 100%;
        background: #ffffff;
        margin: 15px 0 0 0;
        box-sizing: border-box;
        position: absolute;
        left: 0;
        height: 50px;
        /** 
                * The line between l1 and l2 menu items
                */
        .line {
          width: auto;
          height: 1px;
          border-bottom: 1px solid #cacaca;
          margin: 0 calc(100% / 8.8);
        }
      }
      /**
            * submenu styles
            */
      .submenu {
        display: none;
        position: absolute;
        padding: 0 calc(100% / 8.8);
        box-sizing: border-box;
        width: 100%;
        li {
          opacity: 0.5;
        }
        li:hover {
          opacity: 1;
        }
        animation: fadeIn; /* referring directly to the animation's @keyframe declaration */
        animation-duration: 0.5s; /* don't forget to set a duration! */
      }
    }

    li:first-child {
      padding-left: 0;
    }
    /**
        * When a Menu has class selected the submenu will stay open
        */
    li.item.selected {
      font-weight: 700;
      > section {
        display: block;
      }
      .submenu {
        display: block;
      }
    }

    &:hover {
      li.item.l1 {
        opacity: 0.5;
      }
      li.search-wrap {
        > * {
          opacity: 0.5;
        }
      }
    }
    /**
        * When Menu item is hovered
        * Display Section, hide all , show the one currently is hovered
        */
    li.item.l1:hover {
      opacity: 1;
      > section {
        display: block;
      }
      .submenu {
        display: block;
      }
    }

    li.search-wrap div:hover {
      opacity: 1;
    }
    /**
        * when level2 submenu(level3) dorpdown style
        */
    li.item.l2 {
      .submenu {
        list-style-type: none;
        column-count: 1;
        li {
          display: list-item;
          font-family: Roboto, sans-serif;
          font-weight: 400;
          text-transform: capitalize;
          opacity: 1;
          padding: 10px 0;
        }
      }
      .submenu[data-blocks='2'] {
        column-count: 2;
      }
      .submenu[data-blocks='3'] {
        column-count: 3;
      }
      .submenu[data-blocks='4'] {
        column-count: 4;
      }
    }
    /**
        * when level2hover show level 3 sub menu
        */
    li.item.l2:hover {
      opacity: 1;
      > section {
        display: block;
        min-height: 200px;
        box-sizing: border-box;
        left: 0;
        right: 0;
        padding: 10px 10px 30px 0;
      }
      .submenu {
        display: block;
      }
    }
  }

  .search-overlay {
    position: fixed;
    top: 93px;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    background-color: #000000;
    height: 100%;
    z-index: 3;
    overflow: hidden;
    &:hover {
      opacity: 0.5 !important;
    }
  }
  .mobile-navigation {
    display: none;
    width: 100vw;
    .nav-placeholder {
      height: 50px;
    }
  }
  .mobile-header {
    display: flex;
    flex: 1;
    align-items: center;
    padding: 10px 14px;
    z-index: 5;
    position: fixed;
    width: 100vw;
    height: 50px;
    background: #fff;
    top: 0;
    box-sizing: border-box;
    > * {
      padding-left: 10px;
    }

    .logo-box {
      position: absolute;
      width: 115px;
      img {
        height: 50px;
      }
      left: calc(50% - 62px);
    }
    .search-field-icon {
      display: inline-block;
      position: relative;
      background: url(../../assets/images/sprite-icons.svg) no-repeat;
      margin-top: 3px;
      background-position: 5px 5px;
      width: 18px;
      height: 17px;
      padding: 6px;
    }
    .mnav-right {
      margin-left: auto;
      .mnav-r-cont {
        display: flex;
        align-items: center;
        flex: 1;
        > * {
          padding-left: 10px;
        }
      }
      .mobile-account {
        display: inline-block;
        position: relative;
        background: url(../../assets/images/sprite-icons.svg) no-repeat;
        background-position: -758px -217px;
        width: 20px;
        height: 20px;
        padding: 6px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .header {
    .navigation {
      display: none;
    }
    .mobile-navigation {
      display: block;
      box-sizing: border-box;
    }
    section.search-cont {
      width: 100%;
      position: absolute;
      top: 40px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      flex-wrap: wrap;
      margin: 0 0 14px 0;
      animation: fadeIn;
      animation-duration: 0.5s;
    }
  }
}
.opacity {
  opacity: 1 !important;
}
.subtitle {
  margin-top: 0.2em;
  font-size: 12px;
  font-weight: normal;
}

.hamburger-menu {
  position: fixed;
  top: 50px;
  min-width: 35vh;
  height: 100vh;
  overflow-y: scroll;
  left: 0;
  background: white;
  z-index: 4;
  padding: 0 2em;
  .l1-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    .dropdown-arrow {
      content: '';
      display: inline-block;
      background-image: url(../../assets/images/sprite-icons.svg);
      background-position: -586px -2px;
      background-repeat: no-repeat;
      height: 1.5rem;
      width: 1.5rem;
      margin-left: 8px;
    }
    .rotate-arrow {
      transform: rotate(180deg);
    }
  }
  .l2-sub-nav {
    margin-left: 1em;
    transition: 150ms ease-out;
    max-height: 0;
    opacity: 0;
    transition: all 0.7s ease-out;
    transition-delay: 0.3s;
    position: relative;
    overflow: hidden;

    .l2-sub-nav-item {
      // padding: 0.5em 0;
      line-height: 40px;
      & > a {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-right: 2em;
      }
    }
  }
  .toggle-dropdown {
    opacity: 1;
    max-height: 360px;
  }
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0.3;
  z-index: 3;
}

.left-cont {
  display: flex;
  align-items: center;
  .logo-wrap {
    margin-right: 50px;
  }
}
</style>
