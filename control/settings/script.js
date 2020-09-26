let settings;

const initSettingsFields = () => {
  Settings.get().then((data) => {
    console.log("Settings", data);
    settings = {
      sortBy: data.data.sortBy || "",
      showSummary:
        data.data.showSummary === false ? data.data.showSummary : true,
      tags: data.data.tags || [],
    };

    console.log("Settings", settings.tags);

    document.getElementById("showSummary").checked = settings.showSummary;
    sortBy.value = settings.sortBy;
  });
};

const onFieldChange = (field) => {
  if (field === "showSummary")
    settings[field] = document.getElementById(field).checked;
  else settings[field] = document.getElementById(field).value;

  updateSettings();
};

const saveTag = () => {
  let tag = document.getElementById("tag").value.trim();
  settings.tags.push(tag);
  updateSettings().then(() => {
    tag.value = "";
  });
};

const updateSettings = () => {
  return new Promise((resolve, reject) => {
    Settings.set(settings);
    Settings.save()
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
};

initSettingsFields();
