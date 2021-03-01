<template>
  <div class="main-blog-container">
    <div class="main-header">
      <img src="./../../assets/images/banner.png" alt class="banner" />
      <div class="caption">
        <h4>our latest blogs</h4>
        <h2>Diesel Diaries</h2>
      </div>
    </div>

    <div class="content-container">
      <div class="blog-container">
        <div
          class="container"
          v-for="(blog, index) in context.blogs"
          :key="index"
        >
          <fdk-link :link="/blog/ + blog.slug">
            <div class="column">
              <div class="post-module">
                <div class="thumbnail">
                  <div class="date">
                    <div class="day">{{ getDate(blog.created_at) }}</div>
                    <div class="month">{{ getMonth(blog.created_at) }}</div>
                  </div>
                  <img :src="getFeatureImage(blog.feature_image.secure_url)" />
                </div>
                <div class="post-content">
                  <h1 class="title">{{ blog.title }}</h1>
                  <div class="post-meta">
                    <span class="timestamp" :title="getTime(blog.updated_at)">
                      <i class="fa fa-clock-o"></i> Last updated on {{getDate(blog.updated_at)}} {{ getMonth(blog.updated_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </fdk-link>
        </div>
      </div>
      <div class="latest-blogs">
        <p>Recent Blogs</p>
        <div class="blog-list">
          <fdk-link
            class="blog-list-item"
            v-for="(blog, index) in context.blogs"
            :key="index"
            :link="'/blog/' + blog.slug"
          >
            <div class="list-img">
              <img :src="blog.feature_image.secure_url" alt />
            </div>
            <div class="list-details">
              <p class="list-title">{{ blog.title }}</p>
            </div>
          </fdk-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "blog",
  props: {
    context: {}
  },
  methods: {
    getFeatureImage(item){
      let image_url = item.replace('/upload', '/upload/w_375,h_250,c_scale/q_auto');
      return image_url;
      
    },
    getDate(date) {
      let d = new Date(date);
      return d.getDate();
    },
    getMonth(date) {
      var d = new Date(date);
      return d.toLocaleString("default", { month: "short" });
    },
    getTime(date){
      var d = new Date(date);
      return d.toLocaleString("default", { time: "short" });
    }
  }
};
</script>

<style lang="less" scoped>
.main-blog-container {
  .main-header {
    position: relative;
    .banner {
      max-width: 100%;
      height: auto;
      border: 0;
      vertical-align: middle;
    }
    .caption {
      position: absolute;
      top: 35%;
      left: 8%;
      & > h4 {
        font-family: "Open Sans", sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 3px;
      }
      & > h2 {
        font-size: 42px;
        font-weight: 700;
        color: #ffffff;
        margin-top: 5px;
      }
    }
  }
  .content-container {
    display: flex;
    max-width: 1280px;
    margin: 0 auto;
    margin-top: 5em;
    width: 100%;
  }
  .blog-container {
    width: 75%;
    display: flex;
    flex-wrap: wrap;
    display: flex;
  }
  .latest-blogs {
    width: 25%;
  }
}

.post-module {
  position: relative;
  z-index: 1;
  display: block;
  background: #ffffff;
  height: 330px;
  -webkit-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
  -moz-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
}
.post-module:hover,
.hover {
  -webkit-box-shadow: 0px 1px 35px 0px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0px 1px 35px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 1px 35px 0px rgba(0, 0, 0, 0.3);
}
.post-module .thumbnail {
  overflow: hidden;
}
.post-module .thumbnail .date {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  background: black;
  width: 55px;
  height: 55px;
  padding: 12.5px 0;
  -webkit-border-radius: 100%;
  -moz-border-radius: 100%;
  border-radius: 100%;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  -webkti-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.post-module .thumbnail .date .day {
  font-size: 18px;
}
.post-module .thumbnail .date .month {
  font-size: 12px;
  text-transform: uppercase;
}
.post-module .thumbnail img {
  display: block;
  width: 375px;
  height: 250px;
}
.post-module .post-content {
  bottom: 0;
  background: #ffffff;
  width: 100%;
  padding: 15px;
  -webkti-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.post-module .post-content .category {
  position: absolute;
  top: -34px;
  left: 0;
  background: black;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}
.post-module .post-content .title {
  margin: 0;
  padding: 0 0 10px;
  color: #333333;
  font-size: 18px;
  font-weight: 700;
}
.post-module .post-content .sub_title {
  margin: 0;
  padding: 0 0 20px;
  color: black;
  font-size: 20px;
  font-weight: 400;
}
.post-module .post-content .description {
  display: none;
  color: #666666;
  font-size: 14px;
  line-height: 1.8em;
}
.post-module .post-content .post-meta {
  color: #999999;
}
.post-module .post-content .post-meta .timestamp {
  margin: 0 16px 0 0;
}
.post-module .post-content .post-meta a {
  color: #999999;
  text-decoration: none;
}
.hover .post-content .description {
  display: block !important;
  height: auto !important;
  opacity: 1 !important;
}
.container:before,
.container:after {
  content: "";
  display: block;
  clear: both;
}
.container .column {
  padding: 0 25px;
  -webkti-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  margin-bottom: 2em;
}
.container .column .demo-title {
  margin: 0 0 15px;
  color: #666666;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
}
.info {
  width: 300px;
  margin: 50px auto;
  text-align: center;
}
.info h1 {
  margin: 0 0 15px;
  padding: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333333;
}
.info span {
  color: #666666;
  font-size: 12px;
}
.info span a {
  color: #000000;
  text-decoration: none;
}
.info span .fa {
  color: black;
}

.blog-list-item {
  display: flex;
  flex-direction: row;
  margin: 0 0.5em;
  padding: 1em 0;
  border-bottom: 1px solid #dad6d6;
}

.list-img > img {
  width: 120px;
  min-height: 90px;
}
.list-details {
  padding: 0 1em;
  width: 100%;
}

@media (max-width: 768px) {
  .post-module .thumbnail .date {
    display: none;
  }
  .main-blog-container .main-header .caption > h2 {
    font-size: 28px;
  }
  .latest-blogs {
    display: none;
  }
  .post-module .post-content .title {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .main-blog-container .main-header .caption > h4 {
    font-size: 9px;
  }
  .main-blog-container .content-container {
    margin-top: 2em;
  }
  .main-blog-container .blog-container {
    width: 100%;
    display: block;
  }
  .container {
    width: 100%;
  }
  .post-module .post-content .title {
    font-size: 16px;
  }
  .post-module .post-content .post-meta {
    margin: 0;
  }
  .post-module .post-content {
    padding: 0 15px;
  }
  .post-module .thumbnail {
    height: 268px;
  }
  .post-module {
    height: 330px;
  }
}
</style>
