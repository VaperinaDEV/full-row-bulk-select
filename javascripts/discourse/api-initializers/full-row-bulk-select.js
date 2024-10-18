import { withPluginApi } from "discourse/lib/plugin-api";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import { schedule } from "@ember/runloop";
import { RUNTIME_OPTIONS } from "discourse-common/lib/raw-handlebars-helpers";
import { htmlSafe } from "@ember/template";

function setBulkSelectHeight() {
  const topicListItems = document.querySelectorAll('.topic-list-item');

  topicListItems.forEach(item => {
    const bulkSelect = item.querySelector('.bulk-select');
    const itemHeight = item.offsetHeight;

    bulkSelect.style.height = itemHeight + 'px';
  });
}

export default {
  name: "full-row-bulk-select",
  
  initialize() {
    withPluginApi("0.8.7", (api) => {
      api.modifyClass("component:topic-list-item", {
        pluginId: "full-row-bulk-select",

        renderTopicListItem() {
          const template = findRawTemplate("list/topic-list-item");
          if (template) {
            this.set(
              "topicListItemContents",
              htmlSafe(template(this, RUNTIME_OPTIONS))
            );
            schedule("afterRender", () => {
              if (this.isDestroyed || this.isDestroying) {
                return;
              }
              if (this.selected && this.selected.includes(this.topic)) {
                this.element.querySelector("input.bulk-select").checked = true;
                if (!this.site.mobileView) {
                  this.element.querySelector(".bulk-select.topic-list-data label").classList.add("selected");
                } else {
                  this.element.querySelector(".topic-list-data .pull-left label").classList.add("selected");
                }
              }
              if (this._shouldFocusLastVisited()) {
                const title = this._titleElement();
                if (title) {
                  title.addEventListener("focus", this._onTitleFocus);
                  title.addEventListener("blur", this._onTitleBlur);
                }
              }

              const bulkSelect = this.element.querySelector(".bulk-select.topic-list-data");
              if (bulkSelect) {
                const topicListItem = bulkSelect.parentElement;
                const itemHeight = topicListItem.offsetHeight;
                bulkSelect.style.height = itemHeight + 'px';

                setBulkSelectHeight()
              }
            });
          }
        },
      });
    });
  },
};
