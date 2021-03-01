<template>
  <div>
    <div class="footer">
      <div class="left">
        <img :src="context.logo.secure_url" class="footer__logo" />
        <p class="footer__desc">
          {{ context.description }}
        </p>
      </div>
      <div class="right">
        <p class="footer__connect">Connect with us on social media</p>
        <ul class="footer__social">
          <li
            v-for="(link, index) in context.socialLinks"
            :key="index"
            class="footer__social--icon"
          >
            <a :href="link.link" :class="getIconClass(link.title)"> </a>
          </li>
        </ul>
      </div>
    </div>

    <ul class="footer-links desc">
      <li
        class="link-item"
        v-for="(item, index) in navs"
        :key="index"
        @click="shouldRedirect(item)"
      >
        <div class="nav-item">
          <span>{{ item.display }}</span>
          <span
            class="dropdown-arrow"
            :class="{ 'rotate-arrow': item.isOpen }"
            v-if="item.sub_navigation"
          ></span>
        </div>
        <ul
          class="sub-navigation"
          :class="{ 'toggle-dropdown': item.isOpen }"
          v-if="item.sub_navigation"
        >
          <li
            class="subnav-item"
            v-for="(subnav, index) in item.sub_navigation"
            :key="index"
            @click="shouldRedirect(subnav)"
          >
            {{ subnav.display }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    context: {},
  },

  data() {
    return {
      navs: [],
    };
  },
  mounted() {
    this.context.navigation.forEach((item, index) => {
      item.isOpen = false;
      this.navs.push(item);
    });
  },
  computed: {},
  methods: {
    getIconClass(title) {
      if (title === 'Instagram') return 'icon-instagram';
      if (title === 'Youtube') return 'icon-youtube';
      if (title === 'Twitter') return 'icon-twitter-black-sm';
      if (title === 'Facebook') return 'icon-facebook-black';
    },
    shouldRedirect(navigation) {
      if (navigation.sub_navigation) {
        navigation.isOpen = !navigation.isOpen;
        return;
      }
      this.$router.push(navigation.link);
    },
  },
};
</script>

<style lang="less" scoped>
.footer {
  margin-top: 50px;
  background-color: #fff;
  border-top: 1px solid #ccc;
  display: flex;
  align-items: center;
  padding: 50px 200px;
  box-sizing: border-box;
  @media @mobile {
    padding: 20px 10px;
    flex-direction: column;
    justify-content: center;
  }
  .left,
  .right {
    width: 50%;
    @media @mobile {
      width: 100%;
      text-align: center;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    @media @mobile {
      margin-top: 20px;
      align-items: center;
    }
  }
  &__logo {
    margin-bottom: 10px;
    height: 60px;
    max-width: 150px;
  }
  &__desc {
    line-height: 20px;
    width: 75%;
    @media @mobile {
      width: 100%;
    }
  }
  &__connect {
    font-size: 18px;
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 10px;
    display: inline-block;
  }

  &__social {
    display: flex;
    justify-content: space-evenly;
    width: 300px;
  }
}
.footer-links {
  display: flex;
  border-top: 1px solid #ccc;
  padding: 20px 200px;
  justify-content: space-between;
  background-color: #fff;
  @media @mobile {
    padding: 0;
    flex-direction: column;
  }
  .link-item {
    cursor: pointer;
    .nav-item {
      display: flex;
      align-items: center;
      text-transform: uppercase;
      font-weight: bold;
      @media @mobile {
        padding: 10px 10px 20px;
        border-bottom: 1px solid #ccc;
        justify-content: space-between;
      }
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
    .sub-navigation {
      max-height: 0;
      opacity: 0;
      transition: all 0.7s ease-out;
      transition-delay: 0.3s;
      position: relative;
      overflow: hidden;
      .subnav-item {
        padding: 10px 0;
        &:hover {
          text-decoration: underline;
        }
        @media @mobile {
          padding: 10px 20px;
          background-color: #f1f1f1;
          &:last-child {
            border-bottom: 1px solid #ccc;
          }
        }
      }
    }
    .toggle-dropdown {
      opacity: 1;
      max-height: 360px;
    }
  }
}
</style>
