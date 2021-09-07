<template>
<div :class="{'header-wrap': true, 'header-wrap-menu-below': global_config.props.menu_position == 'bottom'}" :style="`--header_nav_hover_color:${global_config.props.header_nav_hover_color};--header_icon_color:${global_config.props.header_icon_color};`">
  <div class="header" :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`">
    <div class="desktop desktop-nav" :style="`border-bottom: 1px solid ${global_config.props.header_border_color};background-color: ${global_config.props.header_bg_color};`">
      <div class="left bottom-menu">
        <div class="left__navigation">
          <ul class="l1-navigation-list">
            <li
              class="l1-navigation-list__item mr-5"
              v-for="(nav, index) in context.navigation"
              :key="index"
            >
              <fdk-link :link="nav.link" >
                <span class="u-df-align-center">
                  <p class="mr-2">{{ nav.display }}</p>
                  <span class="dropdown-icon"  >
                    <!-- <IosArrowDownIcon
                      class="u-df-align-center"
                      v-if="nav.sub_navigation"
                    /> -->
                    <svg  v-if="nav.sub_navigation && nav.sub_navigation.length>0" class="u-df-align-center" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="14px" :style="`fill:${global_config.props.header_icon_color}`"
                      viewBox="0 0 512 512"  xml:space="preserve">
                    <path  d="M256,294.1L383,167c9.4-9.4,24.6-9.4,33.9,0s9.3,24.6,0,34L273,345c-9.1,9.1-23.7,9.3-33.1,0.7L95,201.1
                      c-4.7-4.7-7-10.9-7-17c0-6.1,2.3-12.3,7-17c9.4-9.4,24.6-9.4,33.9,0L256,294.1z"/>
                    </svg>
                  </span>
                </span>
              </fdk-link>

              <ul class="l2-navigation-list" v-if="nav.sub_navigation && nav.sub_navigation.length>0" :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`">
                <li
                  class="l2-navigation-list__item"
                  v-for="(subnav, index) in nav.sub_navigation"
                  :key="index"
                >
                  <fdk-link :link="subnav.link"><p>{{ subnav.display }}</p></fdk-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    <div class="right-nav">
      <div class="center-cont">
        <fdk-link link="/" class="center-cont__logo">
          <img :src="context.logo.secure_url" alt />
        </fdk-link>
      </div>
      <div class="right u-df-align-center">
        <fdk-accounts class="right__icons" >
          <template slot-scope="accountsData">
            <div
              class="icon right__icons--profile mr-5 py-5"
              v-if="isMounted"
              @click="checkLogin(accountsData, 'profile')"
            >
              <!-- <IosPersonIcon title="Profile" w="1.875rem" h="1.875rem" rootClass="header-icons"/> -->
              <svg version="1.1" id="Layer_1"  class="header-icons"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              width="1.875rem" height="1.875rem"
                viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve" >
              <path d="M447.8,438.3c-7.2-31.8-48.3-47.3-62.5-52.3c-15.6-5.5-37.8-6.8-52.1-10c-8.2-1.8-20.1-6.3-24.1-11.1
                c-4-4.8-1.6-49.3-1.6-49.3s7.4-11.5,11.4-21.7c4-10.1,8.4-37.9,8.4-37.9s8.2,0,11.1-14.4c3.1-15.7,8-21.8,7.4-33.5
                c-0.6-11.5-6.9-11.2-6.9-11.2s6.1-16.7,6.8-51.3c0.9-41.1-31.3-81.6-89.6-81.6c-59.1,0-90.6,40.5-89.7,81.6
                c0.8,34.6,6.7,51.3,6.7,51.3s-6.3-0.3-6.9,11.2c-0.6,11.7,4.3,17.8,7.4,33.5c2.8,14.4,11.1,14.4,11.1,14.4s4.4,27.8,8.4,37.9
                c4,10.2,11.4,21.7,11.4,21.7s2.4,44.5-1.6,49.3c-4,4.8-15.9,9.3-24.1,11.1c-14.3,3.2-36.5,4.5-52.1,10c-14.2,5-55.3,20.5-62.5,52.3
                c-1.1,5,2.7,9.7,7.9,9.7h367.9C445.1,448,448.9,443.3,447.8,438.3z"/>
              </svg>
            </div>
            <div
              class="icon right__icons--search mr-5 py-5"
              @click="callSearch"
            >
              <!-- <IosSearchIcon
                title="Search"
                w="1.875rem"
                h="1.875rem"
                v-if="!showSearch"
                rootClass="header-icons"
              /> -->
              <svg v-if="!showSearch" class="header-icons" width="1.875rem" height="1.875rem" title="Search"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
              <path d="M443.5,420.2L336.7,312.4c20.9-26.2,33.5-59.4,33.5-95.5c0-84.5-68.5-153-153.1-153S64,132.5,64,217s68.5,153,153.1,153
                c36.6,0,70.1-12.8,96.5-34.2l106.1,107.1c3.2,3.4,7.6,5.1,11.9,5.1c4.1,0,8.2-1.5,11.3-4.5C449.5,437.2,449.7,426.8,443.5,420.2z
                M217.1,337.1c-32.1,0-62.3-12.5-85-35.2c-22.7-22.7-35.2-52.9-35.2-84.9c0-32.1,12.5-62.3,35.2-84.9c22.7-22.7,52.9-35.2,85-35.2
                c32.1,0,62.3,12.5,85,35.2c22.7,22.7,35.2,52.9,35.2,84.9c0,32.1-12.5,62.3-35.2,84.9C279.4,324.6,249.2,337.1,217.1,337.1z"/>
              </svg>

              <!-- <MdCloseIcon title="Close Search" w="1.875rem" h="1.875rem" rootClass="header-icons" v-else /> -->
              <svg width="1.875rem" height="1.875rem" class="header-icons" title="Close Search" v-else
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                   viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" :style="`fill:${global_config.props.header_icon_color}`">
                <g id="Icon_5_">
                  <g>
                    <polygon  points="405,136.798 375.202,107 256,226.202 136.798,107 107,136.798 226.202,256 107,375.202 136.798,405 256,285.798
                      375.202,405 405,375.202 285.798,256 		"/>
                  </g>
                </g>
              </svg>
            </div>
            <div
              class="icon right__icons--wishlist mr-5 py-5"
              v-if="isMounted"
              @click="checkLogin(accountsData, 'wishlist')"
            >
              <!-- <MdHeartIcon title="Wishlist" w="1.875rem" h="1.875rem" rootClass="header-icons" /> -->
              <svg class="header-icons" width="1.875rem" height="1.875rem" title="Wishlist"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" :style="`fill:${global_config.props.header_icon_color}`">
                <g>
                  <path  d="M256,448l-30.164-27.211C118.718,322.442,48,258.61,48,179.095C48,114.221,97.918,64,162.4,64
                    c36.399,0,70.717,16.742,93.6,43.947C278.882,80.742,313.199,64,349.6,64C414.082,64,464,114.221,464,179.095
                    c0,79.516-70.719,143.348-177.836,241.694L256,448z"/>
                </g>
              </svg>
            </div>
            <div
              class="icon right__icons--bag mr-5 py-5"
              v-if="isMounted && !global_config.props.disable_cart"
              @click="checkLogin(accountsData, 'cart')"
            >
              <!-- <IosCartIcon title="Cart" w="1.875rem" h="1.875rem"  rootClass="header-icons"/> -->
              <svg width="1.875rem" height="1.875rem" class="header-icons" title="Cart"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                <g>
                  <ellipse transform="matrix(0.9998 -1.842767e-02 1.842767e-02 0.9998 -7.7858 3.0205)" cx="160" cy="424" rx="24" ry="24"/>
                  <ellipse transform="matrix(2.381651e-02 -0.9997 0.9997 2.381651e-02 -48.5107 798.282)" cx="384.5" cy="424" rx="24" ry="24"/>
                  <path d="M463.8,132.2c-0.7-2.4-2.8-4-5.2-4.2L132.9,96.5c-2.8-0.3-6.2-2.1-7.5-4.7c-3.8-7.1-6.2-11.1-12.2-18.6
                    c-7.7-9.4-22.2-9.1-48.8-9.3c-9-0.1-16.3,5.2-16.3,14.1c0,8.7,6.9,14.1,15.6,14.1c8.7,0,21.3,0.5,26,1.9c4.7,1.4,8.5,9.1,9.9,15.8
                    c0,0.1,0,0.2,0.1,0.3c0.2,1.2,2,10.2,2,10.3l40,211.6c2.4,14.5,7.3,26.5,14.5,35.7c8.4,10.8,19.5,16.2,32.9,16.2h236.6
                    c7.6,0,14.1-5.8,14.4-13.4c0.4-8-6-14.6-14-14.6H189h-0.1c-2,0-4.9,0-8.3-2.8c-3.5-3-8.3-9.9-11.5-26l-4.3-23.7
                    c0-0.3,0.1-0.5,0.4-0.6l277.7-47c2.6-0.4,4.6-2.5,4.9-5.2l16-115.8C464,134,464,133.1,463.8,132.2z"/>
                </g>
              </svg>
              <p class="cart-count u-df-align-center" :style="`background-color: ${global_config.props.header_cart_notification_bg_color};color: ${global_config.props.header_cart_notification_text_color};`">
                {{ context.cart_item_count }}
              </p>
            </div>
            <div
              class="icon right__icons--bag py-5">
              <a @click="routetoSettingPage" class="setting light-sm">
                  <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><path style="fill='#fff'"  d="M22.88,10.76l-1.75-.32h0a8.73,8.73,0,0,0-.44-1.62h0L22,7.63a.2.2,0,0,0,0-.25l-1-1.8a.21.21,0,0,0-.24-.09l-1.65.59,0,0a9.24,9.24,0,0,0-1.17-1.17l0,0,.59-1.65A.21.21,0,0,0,18.42,3l-1.8-1a.2.2,0,0,0-.25,0L15.23,3.29l0,0a7.32,7.32,0,0,0-1.64-.42l-.33-1.77A.19.19,0,0,0,13,1H11a.21.21,0,0,0-.2.16l-.3,1.75a7.93,7.93,0,0,0-1.66.44L7.63,2a.2.2,0,0,0-.25,0L5.58,3a.2.2,0,0,0-.09.24l.59,1.65,0,0A9.24,9.24,0,0,0,4.89,6.06l0,0L3.2,5.49A.2.2,0,0,0,3,5.58l-1,1.8a.2.2,0,0,0,0,.25L3.29,8.77v0a9.2,9.2,0,0,0-.43,1.64l-1.75.32A.21.21,0,0,0,1,11V13a.2.2,0,0,0,.16.2l1.74.3A9.38,9.38,0,0,0,3.3,15.2L2,16.37a.2.2,0,0,0,0,.25l1,1.8a.2.2,0,0,0,.24.09l1.65-.59,0,0a9.24,9.24,0,0,0,1.17,1.17l0,0L5.49,20.8a.19.19,0,0,0,.09.24l1.8,1a.2.2,0,0,0,.25,0l1.14-1.33h0a7.9,7.9,0,0,0,1.64.42l.32,1.76A.2.2,0,0,0,11,23H13a.2.2,0,0,0,.2-.16l.3-1.74a9.93,9.93,0,0,0,1.66-.44L16.37,22a.2.2,0,0,0,.25,0l1.8-1a.21.21,0,0,0,.09-.24l-.59-1.65,0,0a9.24,9.24,0,0,0,1.17-1.17l0,0,1.65.59a.19.19,0,0,0,.24-.09l1-1.8a.2.2,0,0,0,0-.25l-1.33-1.14v0a7.88,7.88,0,0,0,.41-1.64l1.77-.32A.21.21,0,0,0,23,13V11A.2.2,0,0,0,22.88,10.76ZM5.93,3.23h0Zm0,17.55ZM20.78,5.93ZM16.56,2.35h0Zm-5.43-1h0Zm-3.7,1h0ZM3.22,5.93h0ZM2.35,7.44h0Zm-1,5.43Zm0-1.74Zm1,5.44Zm8.78,6.07Zm9.65-4.57Zm.87-1.5Zm.63-4L21,12.81a.73.73,0,0,0-.58.61A10.31,10.31,0,0,1,20,15l0,.23a.76.76,0,0,0,.26.56l1,.86-.57,1-1.28-.45-.22,0a.71.71,0,0,0-.56.27,10.23,10.23,0,0,1-1.14,1.14.73.73,0,0,0-.27.6l0,.21.45,1.25-1,.57-.85-1a.75.75,0,0,0-.59-.25h0L15,20a8.57,8.57,0,0,1-1.56.42.75.75,0,0,0-.6.59l-.24,1.3H11.43L11.19,21a.75.75,0,0,0-.61-.59A8.44,8.44,0,0,1,9,20l-.23,0a.77.77,0,0,0-.56.25l-.85,1-1-.57.46-1.29,0-.21a.71.71,0,0,0-.27-.56,10.23,10.23,0,0,1-1.14-1.14.71.71,0,0,0-.6-.26l-.21,0-1.25.44-.57-1,1-.86a.74.74,0,0,0,.25-.6L4,15a8.23,8.23,0,0,1-.41-1.55.76.76,0,0,0-.6-.61l-1.3-.24V11.43L3,11.19a.73.73,0,0,0,.59-.61A8.87,8.87,0,0,1,4,9l0-.22a.78.78,0,0,0-.26-.57l-1-.85.57-1,1.29.45.21,0a.71.71,0,0,0,.56-.27A9.36,9.36,0,0,1,6.58,5.45a.76.76,0,0,0,.27-.6l0-.21L6.36,3.38l1-.57.86,1a.75.75,0,0,0,.58.25h0L9,4a8.23,8.23,0,0,1,1.55-.41A.75.75,0,0,0,11.19,3l.24-1.31h1.14L12.81,3a.75.75,0,0,0,.61.59A9.75,9.75,0,0,1,15,4l.22,0h0a.76.76,0,0,0,.56-.26l.85-1,1,.57-.46,1.28,0,.22a.74.74,0,0,0,.27.57,8.62,8.62,0,0,1,1.13,1.13.76.76,0,0,0,.6.27h0l.21,0,1.25-.44.57,1-1,.85a.76.76,0,0,0-.25.6L20,9a8.65,8.65,0,0,1,.41,1.55.76.76,0,0,0,.6.61l1.3.24Z"/><path class="cls-1" d="M12,8.07h0A3.94,3.94,0,1,0,15.94,12,3.95,3.95,0,0,0,12,8.07Zm2.22,6.17v0A3.17,3.17,0,0,1,8.83,12a3.2,3.2,0,0,1,.93-2.24A3.14,3.14,0,0,1,12,8.83h0A3.18,3.18,0,0,1,15.17,12,3.14,3.14,0,0,1,14.24,14.24Z"/></svg>
              </a>
            </div>
            <transition name="slide-fade">
              <fdk-search class="search" v-if="showSearch" :has_products="true">
                <template slot-scope="searchData">
                  <input
                    class="search__input"
                    type="text"
                    id="searchInput"
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
                    <!-- <IosArrowRoundForwardIcon
                      w="1.875rem"
                      h="1.875rem"
                      class="arrow-icon"
                    /> -->
                    <svg width="1.875rem" height="1.875rem" class="arrow-icon"
                    version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                      viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                    <path d="M295.6,163.7c-5.1,5-5.1,13.3-0.1,18.4l60.8,60.9H124.9c-7.1,0-12.9,5.8-12.9,13s5.8,13,12.9,13h231.3l-60.8,60.9
                      c-5,5.1-4.9,13.3,0.1,18.4c5.1,5,13.2,5,18.3-0.1l82.4-83c0,0,0,0,0,0c1.1-1.2,2-2.5,2.7-4.1c0.7-1.6,1-3.3,1-5
                      c0-3.4-1.3-6.6-3.7-9.1l-82.4-83C308.9,158.8,300.7,158.7,295.6,163.7z"/>
                    </svg>
                  </div>

                  <div
                    class="suggestions"
                    :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`"
                    v-if="
                      showSearch &&
                        (searchData.suggestions && searchData.suggestions.length > 0 ||
                         searchData.productSuggestions && searchData.productSuggestions.length > 0 ||
                          searchData.noResults)
                    "
                  >
                    <ul
                      class="suggestions__products"

                      v-if="searchData.productSuggestions && searchData.productSuggestions.length > 0"
                    >
                      <li
                        class="suggestions__products--item"
                        v-for="(data, index) in getProductSearchSuggestions(
                          searchData.productSuggestions
                        )"
                        :key="index"
                        @click.stop.prevent="
                          showSearch=false;
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
                      v-if="searchData.suggestions && searchData.suggestions.length > 0"
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
                      searchData.productSuggestions &&  searchData.productSuggestions.length === 0 &&
                     searchData.suggestions &&      searchData.suggestions.length === 0 &&
                          searchData.noResults &&
                          showSearch
                      "
                    >
                      <div
                        class="suggestions__products"
                        @click="redirectToProduct('/products/?q=' + searchtext)"
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
    <div class="mobile" :style="`border-bottom: 1px solid ${global_config.props.header_border_color};background-color: ${global_config.props.header_bg_color};`">
      <div
        class="left"
        @click="
          showHamburgerMenu
        "
      >
        <!-- <IosMenuIcon w="1.875rem" h="1.875rem" /> -->
        <svg width="24px" height="24px"
        
        version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
          <g>
            <path d="M432,176H80c-8.8,0-16-7.2-16-16l0,0c0-8.8,7.2-16,16-16h352c8.8,0,16,7.2,16,16l0,0C448,168.8,440.8,176,432,176z"/>
            <path d="M432,272H80c-8.8,0-16-7.2-16-16l0,0c0-8.8,7.2-16,16-16h352c8.8,0,16,7.2,16,16l0,0C448,264.8,440.8,272,432,272z"/>
            <path d="M432,368H80c-8.8,0-16-7.2-16-16l0,0c0-8.8,7.2-16,16-16h352c8.8,0,16,7.2,16,16l0,0C448,360.8,440.8,368,432,368z"/>
          </g>
        </svg>
      </div>
      <fdk-link link="/" class="center-mobile">
        <img :src="context.logo.secure_url" alt />
      </fdk-link>
      <fdk-accounts class="right">
        <template slot-scope="accountsData">
          <div
            class="icon right__icons--wishlist mr-5"
            @click.stop="checkLogin(accountsData, 'wishlist')"
          >
            <!-- <MdHeartIcon w="1.875rem" h="1.875rem" /> -->
            <svg class="header-icons" width="24px" height="24px" title="Wishlist"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" :style="`fill:${global_config.props.header_icon_color}`">
                <g >
                  <path d="M256,448l-30.164-27.211C118.718,322.442,48,258.61,48,179.095C48,114.221,97.918,64,162.4,64
                    c36.399,0,70.717,16.742,93.6,43.947C278.882,80.742,313.199,64,349.6,64C414.082,64,464,114.221,464,179.095
                    c0,79.516-70.719,143.348-177.836,241.694L256,448z"/>
                </g>
            </svg>
          </div>
          <div
            v-if="isMounted && !global_config.props.disable_cart"
            class="icon right__icons--bag"
            @click.stop="checkLogin(accountsData, 'cart')"
          >
            <!-- <IosCartIcon w="1.875rem" h="1.875rem" /> -->
            <svg width="24px" height="24px" title="Cart"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                <g>
                  <ellipse transform="matrix(0.9998 -1.842767e-02 1.842767e-02 0.9998 -7.7858 3.0205)" cx="160" cy="424" rx="24" ry="24"/>
                  <ellipse transform="matrix(2.381651e-02 -0.9997 0.9997 2.381651e-02 -48.5107 798.282)" cx="384.5" cy="424" rx="24" ry="24"/>
                  <path d="M463.8,132.2c-0.7-2.4-2.8-4-5.2-4.2L132.9,96.5c-2.8-0.3-6.2-2.1-7.5-4.7c-3.8-7.1-6.2-11.1-12.2-18.6
                    c-7.7-9.4-22.2-9.1-48.8-9.3c-9-0.1-16.3,5.2-16.3,14.1c0,8.7,6.9,14.1,15.6,14.1c8.7,0,21.3,0.5,26,1.9c4.7,1.4,8.5,9.1,9.9,15.8
                    c0,0.1,0,0.2,0.1,0.3c0.2,1.2,2,10.2,2,10.3l40,211.6c2.4,14.5,7.3,26.5,14.5,35.7c8.4,10.8,19.5,16.2,32.9,16.2h236.6
                    c7.6,0,14.1-5.8,14.4-13.4c0.4-8-6-14.6-14-14.6H189h-0.1c-2,0-4.9,0-8.3-2.8c-3.5-3-8.3-9.9-11.5-26l-4.3-23.7
                    c0-0.3,0.1-0.5,0.4-0.6l277.7-47c2.6-0.4,4.6-2.5,4.9-5.2l16-115.8C464,134,464,133.1,463.8,132.2z"/>
                </g>
            </svg>
            <p class="cart-count u-df-align-center"
            :style="`background-color: ${global_config.props.header_cart_notification_bg_color};color: ${global_config.props.header_cart_notification_text_color};`">
              {{ context.cart_item_count }}
            </p>
          </div>
          <div @click="routetoSettingPage" class="icon right__icons--bag setting">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><path style="fill='#fff'"  d="M22.88,10.76l-1.75-.32h0a8.73,8.73,0,0,0-.44-1.62h0L22,7.63a.2.2,0,0,0,0-.25l-1-1.8a.21.21,0,0,0-.24-.09l-1.65.59,0,0a9.24,9.24,0,0,0-1.17-1.17l0,0,.59-1.65A.21.21,0,0,0,18.42,3l-1.8-1a.2.2,0,0,0-.25,0L15.23,3.29l0,0a7.32,7.32,0,0,0-1.64-.42l-.33-1.77A.19.19,0,0,0,13,1H11a.21.21,0,0,0-.2.16l-.3,1.75a7.93,7.93,0,0,0-1.66.44L7.63,2a.2.2,0,0,0-.25,0L5.58,3a.2.2,0,0,0-.09.24l.59,1.65,0,0A9.24,9.24,0,0,0,4.89,6.06l0,0L3.2,5.49A.2.2,0,0,0,3,5.58l-1,1.8a.2.2,0,0,0,0,.25L3.29,8.77v0a9.2,9.2,0,0,0-.43,1.64l-1.75.32A.21.21,0,0,0,1,11V13a.2.2,0,0,0,.16.2l1.74.3A9.38,9.38,0,0,0,3.3,15.2L2,16.37a.2.2,0,0,0,0,.25l1,1.8a.2.2,0,0,0,.24.09l1.65-.59,0,0a9.24,9.24,0,0,0,1.17,1.17l0,0L5.49,20.8a.19.19,0,0,0,.09.24l1.8,1a.2.2,0,0,0,.25,0l1.14-1.33h0a7.9,7.9,0,0,0,1.64.42l.32,1.76A.2.2,0,0,0,11,23H13a.2.2,0,0,0,.2-.16l.3-1.74a9.93,9.93,0,0,0,1.66-.44L16.37,22a.2.2,0,0,0,.25,0l1.8-1a.21.21,0,0,0,.09-.24l-.59-1.65,0,0a9.24,9.24,0,0,0,1.17-1.17l0,0,1.65.59a.19.19,0,0,0,.24-.09l1-1.8a.2.2,0,0,0,0-.25l-1.33-1.14v0a7.88,7.88,0,0,0,.41-1.64l1.77-.32A.21.21,0,0,0,23,13V11A.2.2,0,0,0,22.88,10.76ZM5.93,3.23h0Zm0,17.55ZM20.78,5.93ZM16.56,2.35h0Zm-5.43-1h0Zm-3.7,1h0ZM3.22,5.93h0ZM2.35,7.44h0Zm-1,5.43Zm0-1.74Zm1,5.44Zm8.78,6.07Zm9.65-4.57Zm.87-1.5Zm.63-4L21,12.81a.73.73,0,0,0-.58.61A10.31,10.31,0,0,1,20,15l0,.23a.76.76,0,0,0,.26.56l1,.86-.57,1-1.28-.45-.22,0a.71.71,0,0,0-.56.27,10.23,10.23,0,0,1-1.14,1.14.73.73,0,0,0-.27.6l0,.21.45,1.25-1,.57-.85-1a.75.75,0,0,0-.59-.25h0L15,20a8.57,8.57,0,0,1-1.56.42.75.75,0,0,0-.6.59l-.24,1.3H11.43L11.19,21a.75.75,0,0,0-.61-.59A8.44,8.44,0,0,1,9,20l-.23,0a.77.77,0,0,0-.56.25l-.85,1-1-.57.46-1.29,0-.21a.71.71,0,0,0-.27-.56,10.23,10.23,0,0,1-1.14-1.14.71.71,0,0,0-.6-.26l-.21,0-1.25.44-.57-1,1-.86a.74.74,0,0,0,.25-.6L4,15a8.23,8.23,0,0,1-.41-1.55.76.76,0,0,0-.6-.61l-1.3-.24V11.43L3,11.19a.73.73,0,0,0,.59-.61A8.87,8.87,0,0,1,4,9l0-.22a.78.78,0,0,0-.26-.57l-1-.85.57-1,1.29.45.21,0a.71.71,0,0,0,.56-.27A9.36,9.36,0,0,1,6.58,5.45a.76.76,0,0,0,.27-.6l0-.21L6.36,3.38l1-.57.86,1a.75.75,0,0,0,.58.25h0L9,4a8.23,8.23,0,0,1,1.55-.41A.75.75,0,0,0,11.19,3l.24-1.31h1.14L12.81,3a.75.75,0,0,0,.61.59A9.75,9.75,0,0,1,15,4l.22,0h0a.76.76,0,0,0,.56-.26l.85-1,1,.57-.46,1.28,0,.22a.74.74,0,0,0,.27.57,8.62,8.62,0,0,1,1.13,1.13.76.76,0,0,0,.6.27h0l.21,0,1.25-.44.57,1-1,.85a.76.76,0,0,0-.25.6L20,9a8.65,8.65,0,0,1,.41,1.55.76.76,0,0,0,.6.61l1.3.24Z"/><path class="cls-1" d="M12,8.07h0A3.94,3.94,0,1,0,15.94,12,3.95,3.95,0,0,0,12,8.07Zm2.22,6.17v0A3.17,3.17,0,0,1,8.83,12a3.2,3.2,0,0,1,.93-2.24A3.14,3.14,0,0,1,12,8.83h0A3.18,3.18,0,0,1,15.17,12,3.14,3.14,0,0,1,14.24,14.24Z"/></svg>
          </div>
        </template>
      </fdk-accounts>
      <transition name="slide">
        <div class="hamburger" v-if="showHamburger" :style="`background-color: ${global_config.props.header_bg_color};color: ${global_config.props.header_text_color}`">
          <div class="close-icon" @click.stop="showHamburger = false">
            <!-- <MdCloseIcon w="3.5rem" h="3.5rem" /> -->
            <svg width="3.5rem" height="3.5rem" title="Close menu"
              version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                   viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" :style="`fill:${global_config.props.header_icon_color}`">
                <g id="Icon_5_" >
                  <g>
                    <polygon points="405,136.798 375.202,107 256,226.202 136.798,107 107,136.798 226.202,256 107,375.202 136.798,405 256,285.798
                      375.202,405 405,375.202 285.798,256 		"/>
                  </g>
                </g>
            </svg>
          </div>

          <ul class="hamburger__navigation">
            <li
              class="hamburger__navigation--item"
              v-for="(nav, index) in navs"
              :key="index"
              @click.stop="redirectToMenu(nav)"
            >
              <fdk-link v-if="!nav.sub_navigation" :link="nav.link">
                <p>{{ nav.display }}</p>
              </fdk-link>
              <p v-else @click.stop="redirectToMenu(nav)">{{ nav.display }}</p>
              <div @click.stop="redirectToMenu(nav)" v-if="nav.sub_navigation && nav.sub_navigation.length>0" >
                <svg class="arrow-icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1.875rem" height="1.875rem"
                  viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                <path
                d="M256,294.1L383,167c9.4-9.4,24.6-9.4,33.9,0s9.3,24.6,0,34L273,345c-9.1,9.1-23.7,9.3-33.1,0.7L95,201.1
                  c-4.7-4.7-7-10.9-7-17c0-6.1,2.3-12.3,7-17c9.4-9.4,24.6-9.4,33.9,0L256,294.1z"/>
                </svg>
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
                      <svg  class="back__icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1.875rem" height="1.875rem"
                        viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                      <path
                      d="M256,294.1L383,167c9.4-9.4,24.6-9.4,33.9,0s9.3,24.6,0,34L273,345c-9.1,9.1-23.7,9.3-33.1,0.7L95,201.1
                        c-4.7-4.7-7-10.9-7-17c0-6.1,2.3-12.3,7-17c9.4-9.4,24.6-9.4,33.9,0L256,294.1z"/>
                      </svg>
                      <p class="">Go Back</p>
                    </li>
                    <li
                      class="hamburger__navigation--item"
                      v-for="(subnav, idx) in nav.sub_navigation"
                      :key="idx"

                    >
                      <fdk-link :link="subnav.link">
                        <p>{{ subnav.display }}</p>
                      </fdk-link>
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
                    @keyup.enter="
                      searchData.executeQuery(searchtext);
                      searchtext = '';
                      showHamburger = false;
                    "
                  />
                  <div
                    class="icon"
                    @click="
                      searchData.executeQuery(searchtext);
                      searchtext = '';
                      showHamburger = false;
                    "
                  >
                    <!-- <IosSearchIcon w="1.875rem" h="1.875rem" /> -->
                    <svg version="1.1" id="Layer_1" width="1.875rem" height="1.875rem"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                      viewBox="0 0 512 512" :style="`fill:${global_config.props.header_icon_color}`" xml:space="preserve">
                    <path d="M443.5,420.2L336.7,312.4c20.9-26.2,33.5-59.4,33.5-95.5c0-84.5-68.5-153-153.1-153S64,132.5,64,217s68.5,153,153.1,153
                      c36.6,0,70.1-12.8,96.5-34.2l106.1,107.1c3.2,3.4,7.6,5.1,11.9,5.1c4.1,0,8.2-1.5,11.3-4.5C449.5,437.2,449.7,426.8,443.5,420.2z
                      M217.1,337.1c-32.1,0-62.3-12.5-85-35.2c-22.7-22.7-35.2-52.9-35.2-84.9c0-32.1,12.5-62.3,35.2-84.9c22.7-22.7,52.9-35.2,85-35.2
                      c32.1,0,62.3,12.5,85,35.2c22.7,22.7,35.2,52.9,35.2,84.9c0,32.1-12.5,62.3-35.2,84.9C279.4,324.6,249.2,337.1,217.1,337.1z"/>
                    </svg>

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
</div>
</template>

<script>
import { detectMobileWidth } from "../../helper/utils";
export default {
  props: {
    context: {},
  },
  data() {
    return {
      showSearch: false,
      searchtext: "",
      showHamburger: false,
      showSubMenu: false,
      selectedIndex: null,
      suggestion: [],
      productSuggestions: [],
      isMounted: false,
      navs: []
    };
  },
  watch:{
    $route (to, from) {
        this.hideHamburgerMenu()
    }
  },
  mounted()  {
    this.isMounted = true
    this.navs = this.getNavs();
  },
  computed: {
    accessibleItems() {
      return this.productSuggestions.concat(this.suggestion);
    },

  },
  methods: {
    showHamburgerMenu() {
      this.navs.map(nav => {
        if( nav.sub_navigation) {
            nav.sub_navigation.showSubMenu = false
        }
      })
      this.showHamburger = true;
    },
    hideHamburgerMenu() {
      this.navs.map(nav => {
        if( nav.sub_navigation) {
            nav.sub_navigation.showSubMenu = false
        }
      })
      this.showHamburger = false;
    },
    getNavs() {
      if(this.context.navigation) {
        let navigations =  this.context.navigation.map(nav => {
          if (nav.sub_navigation) {
            nav.showSubMenu = false
          }
          return nav;
        })
        return Object.assign([], navigations);
      }
    },
    callSearch() {
      this.selectedIndex = null;
      this.showSearch = !this.showSearch;
      if (this.showSearch) {
        setTimeout(function() {
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
        this.$router.push(menu.link);
      } else {
        let navigatons = Object.assign([],this.navs)
        navigatons.map(nav => {
          if( nav.sub_navigation) {
            if(nav.display == menu.display) {
              nav.sub_navigation.showSubMenu = true
            } else {
              nav.sub_navigation.showSubMenu = false
            }
          }
        })
        this.navs = navigatons;
      }
    },
    hideSubmenu(menu) {
      let navigatons = Object.assign([],this.navs)
        navigatons.map(nav => {
          if( nav.sub_navigation) {
            if(nav.display == menu.display) {
              nav.sub_navigation.showSubMenu = false
            }
          }
        })
        this.navs = navigatons;
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
    routetoSettingPage() {
      if (detectMobileWidth()) {
        this.$router.push("/setting");
      } else {
        this.$router.push("/setting/currency");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.header-wrap {
  margin-bottom: 114px;
  position: relative;
  z-index: 10 !important;
  @media @tablet {
    margin-bottom: 74px;
  }
  &.isPreview {
    margin-bottom: 0;
  }
  .header {
    position: fixed;
    top: 0;
    width: 100%;

    .desktop {
      display: flex;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 0.625rem @header-padding-desktop;
      // background-color: @color-white;
      min-height: 4.375rem;
      align-items: center;
      // border-bottom: 1px solid @border-color;
      position: relative;

      @media screen and (max-width: 1400px) {
        padding: 0.625rem 5rem;
      }
      @media screen and (max-width: 1120px) {
        display: none;
      }
    }
  }
  //left
  .left {
    display: flex;
    align-items: flex-start;
  }
  .center-cont {
    width: auto;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    max-height: 82px;
    &__logo {
      img {
        max-height: 82px;
      }
    }
  }

  //navigation
  .l1-navigation-list {
    display: flex;
    // font-size: 1.4rem;
    text-transform: uppercase;
    &__item {
      padding: 32px 0;
      position: relative;
      cursor: pointer;
      font-size: 14px;
      &:hover {
        color: var(--header_nav_hover_color);
      }
    }
  }

  .l2-navigation-list {
    position: absolute;
    min-width: 23rem;
    border: 1px solid @border-color;
    background-color: @color-white;
    z-index: 999;
    top: 110px;
    left: -100%;
    color: @color-gray;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
    &__item {
      p {
        padding: 18px 30px;
        display: block;
      }
      &:hover {
        color: var(--header_nav_hover_color);
      }
    }
  }
  //right
  .right {
    &__icons {
      display: flex;
      position: relative;
      .icon {
        cursor: pointer;
      }
      &--bag {
        position: relative;
        .cart-count {
          position: absolute;
          height: 1.25rem ;
          width: 1.25rem ;
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
    box-shadow: 0 5px 20px rgba(0,0,0,.2);
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
        margin-right: 1.25rem ;
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
  .l1-navigation-list__item:hover {
    .dropdown-icon {
      svg {
        fill: var(--header_nav_hover_color) !important;
      }
    }
    .l2-navigation-list {
      visibility: visible;
      opacity: 1;
      top: 95px;
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
    }

    align-items: center;
    justify-content: space-between;
    .left {
      cursor: pointer;
    }
    .icon {
      svg {
        width: 24px;
        height: 24px;
      }
      &.mr-5 {
        margin-right: 0 !important;
      }
      margin-left: 10px;
      &.setting {
        margin-left: 15px;//offsetting for cart count space;
        svg {
          width: 20px;
          height: 20px;
        }
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
        max-width: 100%;
        max-height: 75px;
        @media @tablet {
          max-height: 70px;
        }
        @media @mobile {
          max-height: 45px;
        }
      }
    }
    .right {
      display: flex;
      .cart-count {
        top: -5px;
        left: 14px;
        width: 16px;
        height: 16px;
      }
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
        svg {
          width: 35px;
          height: 35px;
        }
      }
      &__navigation {
        border-bottom: 1px solid @color-gray;
        padding-bottom: 1.25rem ;
        margin-bottom: 1.25rem ;
        &--item {
          padding: 0.625rem 0 0.625rem 1.875rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s;
          cursor: pointer;
          .arrow-icon {
            transform: rotate(-90deg);
            // opacity: 0.5;
            transition: all 0.4s;
          }

          &:hover {
            color: var(--header_nav_hover_color);
            // text-decoration: underline;
            .arrow-icon {

                fill: var(--header_nav_hover_color) !important;

            }
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
          padding: 0 3.125rem 0 1.25rem ;
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
      padding: 0 0 0 0;
      margin-left: -5px;
      p {
        padding: 0 0 0 3px;
      }
      &__icon {
        transform: rotate(90deg);
        transition: all 0.4s;
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
  .icon {
    cursor: pointer;
  }
}
.header-wrap-menu-below {
  @media @desktop {
    margin-bottom: 190px;
  }
  .desktop-nav {
    flex-direction: column-reverse;
    .right-nav {
      flex-direction: row;
      display: flex;
      width: 100%;
      justify-content: flex-end;
    }
  }
}

</style>
