const initSettingsFields = () => {
  Settings.load().then(() => {
    // Use element id and assign the new data to it's value
    showSummary.checked = Settings.showSummary;
    sortBy.value = Settings.sortBy;

    renderTags();
  });
};

const onFieldChange = (field) => {
  if (field === "showSummary") {
    Settings[field] = document.getElementById(field).checked;
  } else if (field === "sortBy") {
    Settings[field] = document.getElementById(field).value;
  }

  updateSettings();
};

const setTags = () => {
  return new Promise((resolve, reject) => {
    buildfire.auth.showTagsSearchDialog({}, (err, tags) => {
      if (err) reject(err);

      let currentTags = {};
      Settings.tags.forEach((tag) => {
        currentTags[tag.id] = tag.id;
      });

      tags.forEach((tag) => {
        if (!currentTags[tag.id]) Settings.tags.push(tag);
      });

      renderTags();
      resolve(updateSettings());
    });
  });
};

const deleteTag = (index, name) => {
  return new Promise((resolve, reject) => {
    buildfire.notifications.confirm(
      {
        message: `Are you sure you want to delete ${name}?`,
        confirmButton: { text: "Delete", key: "y", type: "danger" },
        cancelButton: { text: "Cancel", key: "n", type: "default" },
      },
      (err, data) => {
        if (err) reject(err);
        if (data.selectedButton.key == "y") {
          Settings.tags.splice(index, 1);
          renderTags();
          resolve(updateSettings());
        }
      }
    );
  });
};

const updateSettings = () => {
  return new Promise((resolve, reject) => {
    Settings.save()
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
};

const renderTags = () => {
  document.getElementById("tag-chips").innerHTML = "";
  if (Settings.tags.length > 0) {
    Settings.tags.forEach((tag, i) => {
      let chip = `
    <div class="mdc-chip mdc-chip--selected" role="row">
      <div class="mdc-chip__ripple"></div>
      <span role="gridcell">
        <span role="radio" tabindex="${i}" aria-checked="true" class="mdc-chip__primary-action">
          <span class="mdc-chip__text">${tag.tagName}</span>
        </span>
        <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button" onclick="deleteTag(${i}, '${tag.tagName}')">cancel</i>
      </span>
    </div>
    `;
      document.getElementById("tag-chips").innerHTML += chip;
    });
  } else {
    let chip = `
    <div class="mdc-chip mdc-chip--selected" role="row">
      <div class="mdc-chip__ripple"></div>
      <span role="gridcell">
        <span role="radio" tabindex="0" aria-checked="true" class="mdc-chip__primary-action">
          <span class="mdc-chip__text">No tags are selected</span>
        </span>
      </span>
    </div>
        `;

    document.getElementById("tag-chips").innerHTML += chip;
  }
};

initSettingsFields();
