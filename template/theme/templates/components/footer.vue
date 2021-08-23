<template>
  <div>
    <div class="footer-main">
      <div class="footer">
        <div class="left">
          <img :src="context.mobile_logo && context.mobile_logo.secure_url" class="footer__logo" />
          <p class="footer__desc">
            {{ context.description }}
          </p>
        </div>
        <div class="right" v-if="context.social_links ">
          <p class="footer__connect">Connect with us on social media</p>
          <ul class="footer__social">
            <li
              v-for="(link, index) in context.social_links"
              :key="index"
              class="footer__social--icon"
            >
              <fdk-link :link="link.link"  :class="getIconClass(link.title)" target="_blank">
                
              </fdk-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-links-main">
      <ul class="footer-links desc">
        <li
          class="link-item"
          v-for="(item, index) in navs"
          :key="index"
        >
          <div class="nav-item">
            <fdk-link :link="item.link"><span>{{ item.display }}</span></fdk-link>
           
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
            >
              <fdk-link :link="subnav.link">{{ subnav.display }}</fdk-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="footer-copyright-main">
      <div class="footer__copyrightText">
        <div v-if="context.app_info.copyright_text">
          {{ context.app_info.copyright_text }}
        </div>
      </div>
    </div>
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
      if (title === 'Pinterest') return 'icon-pinterest';
      if(title === 'Google+') return 'icon-google';
      if(title === 'LinkedIn') return 'icon-linkedin';
      if(title === 'Blog') return 'icon-blog';
      if(title === 'Vimeo') return 'icon-vimeo';
    },
    openDropDown(navigation) {
      if (navigation.sub_navigation) {
        navigation.isOpen = !navigation.isOpen;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.icon-vimeo{
  width: 20px;
  height: 20px;
  content: url('./../../assets/images/vimeo.png');
}
.icon-blog{
  width: 20px;
  height: 20px;
  content: url('./../../assets/images/blog.png');
}
.icon-linkedin{
  width: 20px;
  height: 20px;
  content: url('./../../assets/images/linkedin.png');
}
.icon-google{
  width: 20px;
  height: 20px;
  content: url('./../../assets/images/google-plus.png');
}
.icon-pinterest{
  width: 20px;
  height: 20px;
  content: url('./../../assets/images/pinterest.png');
}
.footer-main {
  width: 100%;
  background-color: #ffffff;
  margin-top: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  border-top: 1px solid #eee;
}
.footer-links-main {
  width: 100%;
  background-color: #ffffff;
}
.footer-copyright-main {
  width: 100%;
  background: #ffffff;
}

.footer {
  display: flex;
  align-items: center;
  color: @Black;
  max-width: 1200px;
  padding: 20px 0;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  @media @mobile {
    padding: 20px 10px;
    flex-direction: column;
    justify-content: center;
  }
  .left {
    width: 75%;
    @media @mobile {
      width: 100%;
    }
  }
  .right {
    width: 25%;
    @media @mobile {
      width: 100%;
      text-align: center;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    @media @mobile {
      margin-top: 20px;
    }
  }
  &__logo {
    margin-bottom: 10px;
    max-width: 100%;
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
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    @media @mobile{
      width: 300px;
    }
  }
  &__social--icon{
    display: flex;
    align-items: center;
  }
  &__copyrightText {
    border-top: 1px solid hsla(0, 0%, 100%, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: @Black;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    padding: 20px 0;
    text-align: center;
  }
}
.footer-links {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  padding: 20px 0;
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
  justify-content: space-between;
  background-color: #ffffff;
  color: @Black;
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
        padding: 10px 10px;
        border-bottom: 1px solid @ds-light-border-color;
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
        text-transform: capitalize;
        &:hover {
          text-decoration: underline;
        }
        @media @mobile {
          padding: 10px 20px;
          &:last-child {
            border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
          }
        }
      }
    }
    .toggle-dropdown {
      opacity: 1;
      max-height: 360px;
      padding-top: 10px;
    }
  }
}
</style>
