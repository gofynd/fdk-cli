<template>
  <div class="header-main-container">
    <section
      class="header"
      :style="{ backgroundColor: global_config.props.header_bg_color }"
    >
      <section class="navigation">
        <ul
          class="nav"
          ref="nav-ul"
          :style="{ backgroundColor: global_config.props.header_bg_color }"
        >
          <div class="nav-container-main">
            <div class="left-cont">
              <li class="logo-wrap">
                <fdk-link class="header-nav-menu" link="/">
                  <img :src="context.logo.secure_url" />
                </fdk-link>
              </li>
              <li class="menu">
                <ul style="display:flex">
                  <li
                    class="l1-item"
                    v-for="(l1, index) in context.navigation"
                    :key="'nav_' + index"
                    :class="{
                      selected: selectedNav && selectedNav.l1 === l1.link,
                    }"
                  >
                    <div v-if="l1.link" @click="selectedNav = { l1: l1.link }">
                      <fdk-link :link="l1.link"> 
                        <p>{{ l1.display }}</p>
                      </fdk-link>
                      <ul class="l2-menu" v-if="l1 && l1.sub_navigation && l1.sub_navigation.length">
                        <div
                          class="l2-menu-container"
                          :class="{
                            'center-nav': !hasSubNavs(l1),
                          }"
                        >
                          <li
                            class="l2-item"
                            v-for="(l2, index) in l1.sub_navigation"
                            :key="index"
                          >
                            <fdk-link :link="l2.link">
                              <p class="l2-nav-item">{{ l2.display }}</p>
                            </fdk-link>
                            <ul class="l3-menu" v-if="l2.sub_navigation">
                              <li
                                class="l3-item"
                                v-for="(l3, index) in l2.sub_navigation"
                                :key="index"
                              >
                                <fdk-link :link="l3.link">
                                  <p class="l3-nav-item">{{ l3.display }}</p>
                                </fdk-link>
                              </li>
                            </ul>
                          </li>
                        </div>
                      </ul>
                    </div>
                  </li>
                </ul>
              </li>
            </div>

            <li class="search-wrap">
              <div :class="{ opacity: showSearch }" @click="openSearch">
                <button class="button-no-defaults">
                  SEARCH
                </button>
              </div>
              <div class="auth-menu" :class="{ 'hover-selected': showprofile }">
                <fdk-accounts>
                  <template slot-scope="accountsData">
                    <div v-if="accountsData.is_logged_in && isMounted">
                      <div class="auth-menu-text">
                        My Account
                        <ul class="hover-menu">
                          <li class="hover-item" @click="routeToProfilePage()">
                            <a class="hover-link">My Profile</a>
                          </li>
                          <li
                            v-for="(item, index) in accounts"
                            :key="index + '-profile'"
                            class="hover-item"
                          >
                            <fdk-link class="hover-link" :link="item.link">{{ item.display }} </fdk-link>
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
              <div v-if="isMounted && !global_config.props.disable_cart">
                <fdk-link
                  :link="'/cart/bag'"
                  class="minicart-link"
                  :class="{ 'not-empty': context.cart_item_count }"
                >
                  <i class="minicart-icon shopping-bag"></i>
                  <span v-if="context.cart_item_count" class="minicart-quantity">
                    {{ context.cart_item_count }}
                  </span>
                </fdk-link>
              </div>
              <a @click="routetoSettingPage" class="setting light-sm">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><path style="fill='#fff'"  d="M22.88,10.76l-1.75-.32h0a8.73,8.73,0,0,0-.44-1.62h0L22,7.63a.2.2,0,0,0,0-.25l-1-1.8a.21.21,0,0,0-.24-.09l-1.65.59,0,0a9.24,9.24,0,0,0-1.17-1.17l0,0,.59-1.65A.21.21,0,0,0,18.42,3l-1.8-1a.2.2,0,0,0-.25,0L15.23,3.29l0,0a7.32,7.32,0,0,0-1.64-.42l-.33-1.77A.19.19,0,0,0,13,1H11a.21.21,0,0,0-.2.16l-.3,1.75a7.93,7.93,0,0,0-1.66.44L7.63,2a.2.2,0,0,0-.25,0L5.58,3a.2.2,0,0,0-.09.24l.59,1.65,0,0A9.24,9.24,0,0,0,4.89,6.06l0,0L3.2,5.49A.2.2,0,0,0,3,5.58l-1,1.8a.2.2,0,0,0,0,.25L3.29,8.77v0a9.2,9.2,0,0,0-.43,1.64l-1.75.32A.21.21,0,0,0,1,11V13a.2.2,0,0,0,.16.2l1.74.3A9.38,9.38,0,0,0,3.3,15.2L2,16.37a.2.2,0,0,0,0,.25l1,1.8a.2.2,0,0,0,.24.09l1.65-.59,0,0a9.24,9.24,0,0,0,1.17,1.17l0,0L5.49,20.8a.19.19,0,0,0,.09.24l1.8,1a.2.2,0,0,0,.25,0l1.14-1.33h0a7.9,7.9,0,0,0,1.64.42l.32,1.76A.2.2,0,0,0,11,23H13a.2.2,0,0,0,.2-.16l.3-1.74a9.93,9.93,0,0,0,1.66-.44L16.37,22a.2.2,0,0,0,.25,0l1.8-1a.21.21,0,0,0,.09-.24l-.59-1.65,0,0a9.24,9.24,0,0,0,1.17-1.17l0,0,1.65.59a.19.19,0,0,0,.24-.09l1-1.8a.2.2,0,0,0,0-.25l-1.33-1.14v0a7.88,7.88,0,0,0,.41-1.64l1.77-.32A.21.21,0,0,0,23,13V11A.2.2,0,0,0,22.88,10.76ZM5.93,3.23h0Zm0,17.55ZM20.78,5.93ZM16.56,2.35h0Zm-5.43-1h0Zm-3.7,1h0ZM3.22,5.93h0ZM2.35,7.44h0Zm-1,5.43Zm0-1.74Zm1,5.44Zm8.78,6.07Zm9.65-4.57Zm.87-1.5Zm.63-4L21,12.81a.73.73,0,0,0-.58.61A10.31,10.31,0,0,1,20,15l0,.23a.76.76,0,0,0,.26.56l1,.86-.57,1-1.28-.45-.22,0a.71.71,0,0,0-.56.27,10.23,10.23,0,0,1-1.14,1.14.73.73,0,0,0-.27.6l0,.21.45,1.25-1,.57-.85-1a.75.75,0,0,0-.59-.25h0L15,20a8.57,8.57,0,0,1-1.56.42.75.75,0,0,0-.6.59l-.24,1.3H11.43L11.19,21a.75.75,0,0,0-.61-.59A8.44,8.44,0,0,1,9,20l-.23,0a.77.77,0,0,0-.56.25l-.85,1-1-.57.46-1.29,0-.21a.71.71,0,0,0-.27-.56,10.23,10.23,0,0,1-1.14-1.14.71.71,0,0,0-.6-.26l-.21,0-1.25.44-.57-1,1-.86a.74.74,0,0,0,.25-.6L4,15a8.23,8.23,0,0,1-.41-1.55.76.76,0,0,0-.6-.61l-1.3-.24V11.43L3,11.19a.73.73,0,0,0,.59-.61A8.87,8.87,0,0,1,4,9l0-.22a.78.78,0,0,0-.26-.57l-1-.85.57-1,1.29.45.21,0a.71.71,0,0,0,.56-.27A9.36,9.36,0,0,1,6.58,5.45a.76.76,0,0,0,.27-.6l0-.21L6.36,3.38l1-.57.86,1a.75.75,0,0,0,.58.25h0L9,4a8.23,8.23,0,0,1,1.55-.41A.75.75,0,0,0,11.19,3l.24-1.31h1.14L12.81,3a.75.75,0,0,0,.61.59A9.75,9.75,0,0,1,15,4l.22,0h0a.76.76,0,0,0,.56-.26l.85-1,1,.57-.46,1.28,0,.22a.74.74,0,0,0,.27.57,8.62,8.62,0,0,1,1.13,1.13.76.76,0,0,0,.6.27h0l.21,0,1.25-.44.57,1-1,.85a.76.76,0,0,0-.25.6L20,9a8.65,8.65,0,0,1,.41,1.55.76.76,0,0,0,.6.61l1.3.24Z"/><path class="cls-1" d="M12,8.07h0A3.94,3.94,0,1,0,15.94,12,3.95,3.95,0,0,0,12,8.07Zm2.22,6.17v0A3.17,3.17,0,0,1,8.83,12a3.2,3.2,0,0,1,.93-2.24A3.14,3.14,0,0,1,12,8.83h0A3.18,3.18,0,0,1,15.17,12,3.14,3.14,0,0,1,14.24,14.24Z"/></svg>
              </a>
            </li>
          </div>
        </ul>
      </section>
      <transition name="slide-fade">
        <fdk-search class="search" v-if="showSearch" :has_products="true">
          <template slot-scope="searchData">
            <div class="line"></div>
            <input
              class="search__input"
              type="text"
              ref="searchInput"
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
                  <div class="img-cont">
                    <nm-image :src="data.image.url" :sources="[{ width: 30 }]" />
                  </div>
                  <div class="suggestions__products--product-details">
                    <div>{{ data.name }}</div>
                    <!-- <div v-if="data.subtitle" class="subtitle">
                      {{ data.subtitle }}
                    </div> -->
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
                  <div class="img-cont">
                    <nm-image :src="data.logo.url" :sources="[{ width: 100 }]" />
                  </div>
                  <div class="suggestions__products--product-details">
                    <div>{{ data.display }}</div>
                    <!-- <div v-if="data.subtitle" class="subtitle">
                      {{ data.subtitle }}
                    </div> -->
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
                    <span class="ml24">Search for {{ searchtext }}</span>
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
          <span
            @click="
              showHamburger = !showHamburger;
              showSearch = false;
            "
          >
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
          <span
            @click="
              openSearch();
              showHamburger = false;
            "
          >
            <span class="search-field-icon"></span>
          </span>
          <span class="logo-box">
            <fdk-link :link="'/'">
              <img :src="context.mobile_logo && context.mobile_logo.secure_url" />
            </fdk-link>
          </span>
          <span class="mnav-right">
            <div class="mnav-r-cont">
              <div>
                <fdk-accounts>
                  <template slot-scope="accountsData">
                    <div v-if="accountsData.is_logged_in && isMounted">
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
              <div v-if="isMounted && !global_config.props.disable_cart">
                <fdk-link
                  :link="'/cart/bag'"
                  class="minicart-link"
                  :class="{ 'not-empty': context.cart_item_count }"
                >
                  <i class="minicart-icon shopping-bag"></i>
                  <span v-if="context.cart_item_count" class="minicart-quantity">
                    {{ context.cart_item_count }}
                  </span>
               </fdk-link>
              </div>
              <a @click="routetoSettingPage" class="setting light-sm">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><path style="fill='#fff'"  d="M22.88,10.76l-1.75-.32h0a8.73,8.73,0,0,0-.44-1.62h0L22,7.63a.2.2,0,0,0,0-.25l-1-1.8a.21.21,0,0,0-.24-.09l-1.65.59,0,0a9.24,9.24,0,0,0-1.17-1.17l0,0,.59-1.65A.21.21,0,0,0,18.42,3l-1.8-1a.2.2,0,0,0-.25,0L15.23,3.29l0,0a7.32,7.32,0,0,0-1.64-.42l-.33-1.77A.19.19,0,0,0,13,1H11a.21.21,0,0,0-.2.16l-.3,1.75a7.93,7.93,0,0,0-1.66.44L7.63,2a.2.2,0,0,0-.25,0L5.58,3a.2.2,0,0,0-.09.24l.59,1.65,0,0A9.24,9.24,0,0,0,4.89,6.06l0,0L3.2,5.49A.2.2,0,0,0,3,5.58l-1,1.8a.2.2,0,0,0,0,.25L3.29,8.77v0a9.2,9.2,0,0,0-.43,1.64l-1.75.32A.21.21,0,0,0,1,11V13a.2.2,0,0,0,.16.2l1.74.3A9.38,9.38,0,0,0,3.3,15.2L2,16.37a.2.2,0,0,0,0,.25l1,1.8a.2.2,0,0,0,.24.09l1.65-.59,0,0a9.24,9.24,0,0,0,1.17,1.17l0,0L5.49,20.8a.19.19,0,0,0,.09.24l1.8,1a.2.2,0,0,0,.25,0l1.14-1.33h0a7.9,7.9,0,0,0,1.64.42l.32,1.76A.2.2,0,0,0,11,23H13a.2.2,0,0,0,.2-.16l.3-1.74a9.93,9.93,0,0,0,1.66-.44L16.37,22a.2.2,0,0,0,.25,0l1.8-1a.21.21,0,0,0,.09-.24l-.59-1.65,0,0a9.24,9.24,0,0,0,1.17-1.17l0,0,1.65.59a.19.19,0,0,0,.24-.09l1-1.8a.2.2,0,0,0,0-.25l-1.33-1.14v0a7.88,7.88,0,0,0,.41-1.64l1.77-.32A.21.21,0,0,0,23,13V11A.2.2,0,0,0,22.88,10.76ZM5.93,3.23h0Zm0,17.55ZM20.78,5.93ZM16.56,2.35h0Zm-5.43-1h0Zm-3.7,1h0ZM3.22,5.93h0ZM2.35,7.44h0Zm-1,5.43Zm0-1.74Zm1,5.44Zm8.78,6.07Zm9.65-4.57Zm.87-1.5Zm.63-4L21,12.81a.73.73,0,0,0-.58.61A10.31,10.31,0,0,1,20,15l0,.23a.76.76,0,0,0,.26.56l1,.86-.57,1-1.28-.45-.22,0a.71.71,0,0,0-.56.27,10.23,10.23,0,0,1-1.14,1.14.73.73,0,0,0-.27.6l0,.21.45,1.25-1,.57-.85-1a.75.75,0,0,0-.59-.25h0L15,20a8.57,8.57,0,0,1-1.56.42.75.75,0,0,0-.6.59l-.24,1.3H11.43L11.19,21a.75.75,0,0,0-.61-.59A8.44,8.44,0,0,1,9,20l-.23,0a.77.77,0,0,0-.56.25l-.85,1-1-.57.46-1.29,0-.21a.71.71,0,0,0-.27-.56,10.23,10.23,0,0,1-1.14-1.14.71.71,0,0,0-.6-.26l-.21,0-1.25.44-.57-1,1-.86a.74.74,0,0,0,.25-.6L4,15a8.23,8.23,0,0,1-.41-1.55.76.76,0,0,0-.6-.61l-1.3-.24V11.43L3,11.19a.73.73,0,0,0,.59-.61A8.87,8.87,0,0,1,4,9l0-.22a.78.78,0,0,0-.26-.57l-1-.85.57-1,1.29.45.21,0a.71.71,0,0,0,.56-.27A9.36,9.36,0,0,1,6.58,5.45a.76.76,0,0,0,.27-.6l0-.21L6.36,3.38l1-.57.86,1a.75.75,0,0,0,.58.25h0L9,4a8.23,8.23,0,0,1,1.55-.41A.75.75,0,0,0,11.19,3l.24-1.31h1.14L12.81,3a.75.75,0,0,0,.61.59A9.75,9.75,0,0,1,15,4l.22,0h0a.76.76,0,0,0,.56-.26l.85-1,1,.57-.46,1.28,0,.22a.74.74,0,0,0,.27.57,8.62,8.62,0,0,1,1.13,1.13.76.76,0,0,0,.6.27h0l.21,0,1.25-.44.57,1-1,.85a.76.76,0,0,0-.25.6L20,9a8.65,8.65,0,0,1,.41,1.55.76.76,0,0,0,.6.61l1.3.24Z"/><path class="cls-1" d="M12,8.07h0A3.94,3.94,0,1,0,15.94,12,3.95,3.95,0,0,0,12,8.07Zm2.22,6.17v0A3.17,3.17,0,0,1,8.83,12a3.2,3.2,0,0,1,.93-2.24A3.14,3.14,0,0,1,12,8.83h0A3.18,3.18,0,0,1,15.17,12,3.14,3.14,0,0,1,14.24,14.24Z"/></svg>
              </a>
            </div>
          </span>
        </section>

        <transition name="slide">
          <ul class="hamburger-menu" v-if="showHamburger">
            <li
              v-for="(menu, index) in navs"
              :key="'mobile-' + index"
              class="hamburger-li nav"
            >
              <span class="l1-item">
                <fdk-link :link="menu.link">
                  <p style="margin-top: 2px;">{{ menu.display }}</p>
                </fdk-link>
                <span class="l1-sub" v-if="menu.sub_navigation.length" @click.stop="shouldRedirect(menu)">
                  <span
                    class="dropdown-arrow"
                    :class="{ 'rotate-arrow': menu.isOpen }"
                    
                  >
                  </span>
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
                        <span> </span>
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
  </div>
</template>

<script>
import nmImageVue from "../../global/components/common/nm-image.vue";
import { detectMobileWidth } from "./../../helper/utils";
export default {
  props: {
    context: {},
  },
  components: {
    "nm-image": nmImageVue,
  },
  data() {
    return {
      showlist: false,
      showprofile: false,
      currentHovered: "",
      isMounted: false,
      focus: null,
      showHamburger: false,
      items: [],
      accounts: [
        {
          icon: require("./../../assets/images/profile-wishlist.svg"),
          display: "Wishlist",
          link: "/wishlist/",
          key: "wishlist"
        },
        {
          icon: require("./../../assets/images/profile-address.svg"),
          display: "Addresses",
          link: "/profile/address",
          key: "addresses"
        },
      ],
      taggedNavigation: [],
      selectedNav: {},
      showMobileSearch: "close",
      showSearch: false,
      searchtext: "",
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
    hasSubNavs(navs) {
      let res = false;
      navs.sub_navigation.forEach((nav) => {
        if (nav.sub_navigation) {
          res = true;
        }
      });
      return res;
    },
    openSearch() {
      this.showSearch = true;
      this.$nextTick(() => {
        const searchInput = this.$refs["searchInput"];
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
        path: "/products/?q=" + encodeURIComponent(this.searchtext),
      });
      this.$nextTick(() => {
        this.searchtext = "";
      });
    },

    routeToProfilePage() {
      if (detectMobileWidth()) {
        this.$router.push("/profile");
      } else {
        this.$router.push("/profile/details");
      }
    },
    redirectToPage(menu, viewport) {
      if (viewport === "desktop") {
        this.$router.push(menu.link);
        return;
      }
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
    getSearchData() {
      let path = this.accessibleItems[this.selectedIndex].url;
      this.$router.push({ path: path });
      this.showlist = false;
    },
    getEnterSearchData(searchData) {
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
        this.searchtext = "";
      }, 200);
    },
    routetoSettingPage() {
      if (detectMobileWidth()) {
        this.$router.push("/setting");
      } else {
        this.$router.push("/setting/currency");
      }
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
    global_config(n) {
      if(!this.global_config.props.disable_cart) {
        if(this.accounts.findIndex(a => a?.key === 'orders') === -1) {
          this.accounts.splice(1,0, {
            icon: require('./../../assets/images/profile-order.svg'),
            display: 'Orders',
            link: '/profile/orders',
            key: 'orders'
          })
        }
      } else {
        this.accounts = this.accounts.filter(a => a?.key !== 'orders')
      }
    },
    $route(to, from) {
      this.showHamburger = false;
    },
  },
  mounted() {
    this.isMounted = true;
    if(!this.global_config.props.disable_cart) {
      this.accounts.splice(1,0, {
          icon: require("./../../assets/images/profile-order.svg"),
          display: "Orders",
          link: "/profile/orders",
          key: 'orders'
        })
    }
    this.selectedNav = this.$route && this.$route.path;
    let value = 0;
    this.context.navigation.forEach((item, index) => {
      item.isOpen = false;
      this.navs.push(item);
    });
    if (!detectMobileWidth()) {
      window.addEventListener("scroll", () => {
        {
          let filBox = this.$refs["nav-ul"];
          if (filBox) {
            let YOffset = filBox.offsetTop + 60;
            value = YOffset === 0 ? value : YOffset;
            if (window.pageYOffset >= value) {
              filBox.classList.add("sticky-header");
            } else {
              filBox.classList.remove("sticky-header");
            }
          }
        }
      });
    }
  },
};
</script>

<style lang="less" scoped>
.ml24{
  padding-left: 1em;
}
.header-main-container {
  height: 60px;
}
.header {
  width: 100%;
  background-color: @ds-white;
  box-sizing: border-box;
  z-index: 4;
  .minicart-link {
    position: relative;
    display: inline-block;
    margin-left: 10px;
    .minicart-quantity {
      position: absolute;
      bottom: 7px;
      right: -3px;
      width: 12px;
      top: 10px;
      height: 14px;
      line-height: 15px;
      border-radius: 5px;
      font-size: 10px;
      text-align: center;
      padding: 2px;
      z-index: 1;
      vertical-align: middle;
      background-color: @ds-white;
      color: #000000;
    }
    &.not-empty {
      color: #ff1010;
    }
  }

  .navigation {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 60px;
  }

  .setting {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    @media @tablet {
      margin-left: 9px;//1px removed as cart icon has 1px gap
      height: 24px;
      align-items: flex-start;
    }
    svg {
      cursor: pointer;
      fill: #000000;
      width: 20px;
      height: 20px;
    }
  }
  /**
    * Search box styles
    */

  //search-input
  .search {
    position: fixed;
    width: 1200px;
    margin: 0 auto;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-size: 10px;
    box-sizing: border-box;
    @media @mobile {
      padding: 0;
      width: 100%;
      left: 0;
      top: 60px;
      transform: none;
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
    border-top: none;
    &--item {
      cursor: pointer;
      display: flex;
      padding: 1em 1em 1em 0 !important;
      height: 3em;
      align-items: center;
      background: @White;
      box-sizing: border-box;
      font-size: 1.4em;
      &:not(:last-child) {
        border-bottom: 1px solid @border-color;
      }
      .img-cont {
        width: 5em;
        height: 2em;
        text-align: center;
        /deep/ .nm__img {
          height: 2em;
        }
      }

      &:hover {
        background: @Iron;
      }
    }
    &--product-details {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .focus {
      background: @Iron;
    }
  }

  /**
    *  Navigation Menu Styles
    */
  .sticky-header {
    position: fixed;
  }
  ul.nav {
    list-style: none;
    height: 60px;
    box-sizing: border-box;
    box-shadow: 0px 1px 3px #0000001a;
    z-index: 10;
    width: 100%;
    background-color: @ds-white;
    .nav-container-main {
      height: 100%;
      width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .l1 {
      color: #000000;
      transition: all 0.4s;
      &:hover {
        background-color: @ds-white;
      }
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
      height: 100%;

      div {
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      button {
        //font-family: 'roboto', sans-serif !important;
      }
      > * {
        height: 100%;

        padding: 0 14px;
      }

      .hover-menu {
        font-size: 14px;
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
        position: absolute;
        background-color: @ds-white;
        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
        max-height: 0;
        overflow: hidden;
        width: 150px;
        border-right: 1px solid #e9e9e9;
        margin-left: -15px;
        top: 60px;
        .hover-item {
          list-style-type: none;
          padding: 10px 0;
          width: 100%;
          &:hover {
            background: #cecece;
          }
          a {
            text-decoration: none;
            color: #000;
            cursor: pointer;
          }
        }
      }
      .auth-menu {
        padding: 0;
        .auth-menu-text {
          padding: 0 14px;
          text-align: center;
        }
        &:hover {
          .hover-menu {
            z-index: 10;
            border: 1px solid #e9e9e9;
            border-top: none;
            width: 140px;
            max-height: 320px;
            max-height: 20rem;
            max-width: 320px;
            max-width: 20rem;
          }
        }
      }
    }

    /** 
        * moving logo box to the center
        */
    li.logo-wrap {
      width: 200px;
      img {
        height: 60px;
      }
    }
    .menu {
      color: #000000;

      .l1-item {
        font-weight: 700;
        text-transform: uppercase;
        font-size: 14px;
        display: inline-block;
        max-height: 24px;
        letter-spacing: 0.5px;
        padding: 23px 14px;
        cursor: pointer;
        .center-nav {
          align-items: center;
        }
        .l2-menu {
          position: absolute;
          background: @ds-white;
          width: 100%;
          left: 0;
          color: #000;
          top: 60px;
          box-sizing: border-box;
          display: none;
          min-height: 60px;
          box-shadow: 1px 1px 2px #0000002e;
          cursor: auto;
          .l2-menu-container {
            width: 670px;
            margin: auto;
            display: flex;
            flex-wrap: wrap;
            padding: 10px 0;
          }
          .l2-item {
            height: 100%;
            min-width: 120px;
            display: flex;
            flex-direction: column;
            max-width: 190px;
            .l2-nav-item {
              padding: 10px 0;
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            }
            .l3-menu {
              width: 100%;
              cursor: auto;
              .l3-item {
                padding: 5px 0;
                text-transform: capitalize;
                cursor: pointer;
                &:hover {
                  text-decoration: underline;
                }
              }
            }
            &:not(:last-child) {
              margin-right: 50px;
            }
          }
        }
        &:hover {
          background-color: @ds-white;
          .l2-menu {
            display: block;
          }
        }
      }
    }

    li.search-wrap div:hover {
      opacity: 1;
    }

    /**
        * when level2hover show level 3 sub menu
        */
  }

  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    background-color: #000000;
    height: 100%;
    z-index: 2;
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
    z-index: 3;
    position: fixed;
    width: 100vw;
    height: 60px;
    background: @ds-white;
    top: 0;
    box-shadow: 0px 1px 3px #0000001a;
    box-sizing: border-box;
    justify-content: center;
    > * {
      padding-left: 10px;
    }

    .logo-box {
      position: absolute;

      img {
        max-height: 50px;
      }
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
      }
      .mobile-account {
        display: inline-block;
        position: relative;
        background: url(../../assets/images/sprite-icons.svg) no-repeat;
        background-position: -758px -217px;
        width: 20px;
        height: 20px;
        padding: 6px 0px 6px 6px;
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
  top: 60px;
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
    align-items: center;
    padding: 10px 0;
    cursor: pointer;
    .l1-sub {
      display: flex;
    }
    .dropdown-arrow {
      content: "";
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
  opacity: 0.5;
  background-color: #000000;
  z-index: 2;
}

.left-cont {
  display: flex;
  align-items: center;
  .logo-wrap {
    margin-right: 50px;
  }
}
</style>
