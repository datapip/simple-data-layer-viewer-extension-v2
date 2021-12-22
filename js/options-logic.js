/**
 * Main
 */

const state = {
  names: null,
  width: null,
  size: null,
  error: null,
  updateData(names, width, size) {
    this.names = names;
    this.width = width;
    this.size = size;
    insertOptionsContent();
  },
  updateError(error) {
    this.error = error;
    showErrorModal();
  },
};

chrome.storage.sync.get(
  ["dataLayerNames", "windowWidth", "textSize"],
  ({ dataLayerNames, windowWidth, textSize }) => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      state.updateData(dataLayerNames, windowWidth, textSize);
    }
  }
);

/**
 * Functions
 */

const insertOptionsContent = () => {
  document.querySelector("#inputs").innerHTML = createInputs(state.names);
  document.querySelector("select#width").value = state.width;
  document.querySelector("select#size").value = state.size;
  loadOptionsEventListeners();
};

const showErrorModal = () => {
  document.querySelector(".modal-content").innerHTML = createModal(
    state.error.message
  );
  document.querySelector(".modal").classList.add("is-active");
  loadModalEventListeners();
};

const getDataLayerNamesFromInputs = () => {
  return [...document.querySelectorAll("input")].map((input) => input.value);
};

const getWindowWidthFromSelect = () => {
  return parseInt(document.querySelector("select#width").value);
};

const getTextSizeFromSelect = () => {
  return parseInt(document.querySelector("select#size").value);
};

const setLoadingThenExecute = (button, logic) => {
  button.classList.add("is-loading");
  setTimeout(() => {
    logic();
  }, 250);
};

const syncWithChromeStorage = (object) => {
  chrome.storage.sync.set(object, () => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      location.reload();
    }
  });
};

const toggleSaveButtonDisablement = () => {
  if (document.querySelectorAll("input.is-danger").length) {
    document.querySelector("#save").setAttribute("disabled", "");
  } else {
    document.querySelector("#save").removeAttribute("disabled");
  }
};

/**
 * Event Listeners
 */

const loadModalEventListeners = () => {
  document.querySelector("#close").onclick = () => {
    location.reload();
  };
};

const loadOptionsEventListeners = () => {
  const saveButton = document.querySelector("#save");
  saveButton.onclick = () => {
    const dataLayerNames = getDataLayerNamesFromInputs();
    const windowWidth = getWindowWidthFromSelect();
    const textSize = getTextSizeFromSelect();
    setLoadingThenExecute(saveButton, () =>
      syncWithChromeStorage({ dataLayerNames, windowWidth, textSize })
    );
  };

  const defaultsButton = document.querySelector("#defaults");
  defaultsButton.onclick = () => {
    const dataLayerNames = [
        "dataLayer",
        "digitalData",
        "utag_data",
        "tc_vars",
        "udo",
      ],
      windowWidth = 500,
      textSize = 8;
    setLoadingThenExecute(defaultsButton, () =>
      syncWithChromeStorage({ dataLayerNames, windowWidth, textSize })
    );
  };

  document.querySelectorAll("#inputs input").forEach((input) => {
    input.onkeyup = (event) => {
      if (event.target.checkValidity()) {
        event.target.classList.remove("is-danger", "has-text-danger");
      } else {
        event.target.classList.add("is-danger", "has-text-danger");
      }
      toggleSaveButtonDisablement();
    };
  });
};
