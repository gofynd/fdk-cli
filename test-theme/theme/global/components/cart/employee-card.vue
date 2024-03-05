<template>
  <fdk-employee ref="employeeData">
    <template slot-scope="employee">
      <div class="main">
        <div class="icon">
          <svg-wrapper :svg_src="'profile_black'"></svg-wrapper>
        </div>
        <div class="employee-block">
          <div class="label bold-sm">Assign Employee</div>
          <div v-if="!selected && !is_selected">
            <input
              class="employee-input"
              type="text"
              placeholder="Employee name"
              v-on:input="debounceInput"
              id="search"
              @focus="showemployeeList"
              v-model="searchText"
              autocomplete="off"
            />
          </div>
          <div v-else>
            <div class="selected-employee">
              <span class="employee-name dark-xxs">{{
                searchText || displayText
              }}</span>
              <div class="cross" @click="openInputbox(employee)">
                <svg-wrapper :svg_src="'red_cross'"></svg-wrapper>
              </div>
            </div>
          </div>
          <div
            class="searchautocomplete"
            v-if="isSearchOpen()"
            v-click-outside="clickOutside"
          >
            <ul>
              <li
                class="regular-xs"
                v-for="(item, index) in filteredData"
                :key="index"
                @click="selectEmployee(item, employee)"
              >
                <div>
                  <span class="regular-xxs"
                    >{{ item.first_name }} {{ item.last_name }}
                    {{
                      item.employee_code ? `(${item.employee_code})` : ""
                    }}</span
                  >
                </div>
              </li>
            </ul>
          </div>
          <div class="helper light-xxxxs">
            Explain the benefit of assigning employee
          </div>
        </div>
      </div>
    </template>
  </fdk-employee>
</template>

<script>
import { debounce } from "./../../../helper/utils";
import SvgWrapper from './../../../components/common/svg-wrapper.vue';
const MAX_LIST_SHOW = 5;
export default {
  name: "employee-card",
  components: {
    "svg-wrapper": SvgWrapper
  },
  props: {
    displayText: {
      type: String,
      default: "",
    },
    is_selected: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object,
    },
  },
  data() {
    return {
      searchText: "",
      showList: false,
      selected: false,
      filteredData: "",
    };
  },
  mounted() {
    let employee = this.context.employee_list.find((item) => {
      return this.context.selected_employee._id === item._id;
    });
    if (employee) this.selectEmployee(employee, this.$refs?.employeeData);
  },
  methods: {
    showemployeeList() {
      this.showList = true;
      this.filteredData = this.context.employee_list.slice(
        0,
        this.context.employee_list.length
      );
    },
    selectEmployee(item, employee) {
      this.showList = false;
      this.selected = true;
      this.searchText = `${item.first_name} ${
        item.last_name ? item.last_name : ""
      }`;
      if (employee) {
        employee.saveEmployee(item);
      }
    },
    debounceInput: debounce(function (e) {
      this.filteredData = this.context.employee_list.filter((elem) => {
        if (this.searchText.length > 0) this.showList = true;
        let fullName = `${elem.first_name} ${elem.last_name}`;
        if (fullName.toLowerCase().startsWith(this.searchText.toLowerCase()))
          return true;
      });
    }, 200),
    isSearchOpen() {
      return this.showList;
    },
    resetText(event) {
      this.searchText = "";
      this.showList = false;
      this.search = null;
    },
    clickOutside(event) {
      if (event && event.target.id !== "search") {
        this.showList = false;
      }
    },
    openInputbox(employee) {
      this.selected = false;
      this.searchText = "";
      employee.removeEmployee();
    },
  },
};
</script>

<style lang="less" scoped>
.main {
  display: flex;
  cursor: pointer;
  padding: 5px 10px;
  border-bottom: 1px solid @LightGray;

  .icon {
    .flex-center();
    padding: 10px;
    width: 30px;
  }
  .employee-block {
    position: relative;
    width: 70%;
    color: @Mako;
    width: 100%;
    padding: 10px;

    .employee-input {
      margin: 5px 0px;
      height: 25px;
      width: 80%;
      border: none;
      border-bottom: 1px solid @LightGray;
      width: 100%;
      background-position: 10px;
    }
    .selected-employee {
      display: flex;
      margin: 5px 0px;
      padding: 1px 0px;
      .employee-name {
        display: block;
        margin-right: auto;
        margin-top: 7px;
        height: 15px;
      }
      .cross {
        margin-top: 3px;
        margin-right: 10px;
      }
    }
  }
  .helper {
    margin-top: 5px;
    color: @Profit;
  }
  .searchautocomplete {
    position: absolute;
    background: @White;
    width: 100%;
    border-top: 0;
    padding: 0;
    max-height: 250px;
    overflow: auto;
    top: 59px;
    z-index: @menu;
    border-radius: 2px;
    box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.1);

    ul {
      li {
        line-height: 20px;
        padding-left: 10px;
        padding: 5px;
        @media @mobile {
          padding: 10px;
        }
        &:hover {
          background-color: @Gray;
          cursor: pointer;
        }
        a {
          display: inline-block;
          width: 100%;
        }
      }
    }
  }
}
</style>
