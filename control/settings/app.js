let currentUser = {};

// Get current user
authManager.getCurrentUser().then((user) => {
  currentUser = user;
});

Settings.load().then(() => {
  initMaterialComponents();
  // Use element id and assign the new data to it's value
  showSummary.checked = Settings.showSummary;
  if (Settings.dataPolicyType === "public") {
    document.getElementById("dataPublicType").checked = true;
    document.getElementById("dataPrivateType").checked = false;
  }
  if (Settings.dataPolicyType === "private") {
    document.getElementById("dataPrivateType").checked = true;
    document.getElementById("dataPublicType").checked = false;
  }
  renderTags();
});

const onFieldChange = (field) => {
  if (field === "showSummary") {
    Settings[field] = document.getElementById(field).checked;
  } else if (field === "dataPolicyType") {
    let publicRadio = document.getElementById("dataPublicType").checked;
    if (publicRadio) Settings[field] = "public";
    else Settings[field] = "private";
  }
  updateSettings();
};

const setTags = () => {
  return new Promise((resolve, reject) => {
    buildfire.auth.showTagsSearchDialog({}, (err, tags) => {
      if (err) reject(err);
      if (tags) {
        let currentTags = {};
        Settings.tags.forEach((tag) => {
          currentTags[tag.id] = tag.id;
        });

        tags.forEach((tag) => {
          if (!currentTags[tag.id]) Settings.tags.push(tag);
        });

        renderTags();
        resolve(updateSettings());
      }
    });
  });
};

const deleteTag = (index, name) => {
  return new Promise((resolve, reject) => {
    buildfire.notifications.confirm(
      {
        message: `Are you sure you want to delete the ${name} tag?`,
        confirmButton: { text: "Delete", key: "y", type: "danger" },
        cancelButton: { text: "Cancel", key: "n", type: "default" },
      },
      (err, data) => {
        if (err) reject(err);
        if (data && data.selectedButton.key == "y") {
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
    Settings.save(
      currentUser && currentUser.username ? currentUser.username : null
    )
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
    let chip = `<p class="info">No tags are selected</p>`;

    document.getElementById("tag-chips").innerHTML = chip;
  }
};

const initMaterialComponents = () => {
  document.querySelectorAll(".mdc-button").forEach((btn) => {
    mdc.ripple.MDCRipple.attachTo(btn);
  });

  document.querySelectorAll(".mdc-checkbox").forEach((checkbox) => {
    mdc.checkbox.MDCCheckbox.attachTo(checkbox);
  });

  document.querySelectorAll(".mdc-chip-set").forEach((chip) => {
    mdc.chips.MDCChip.attachTo(chip);
  });
};
