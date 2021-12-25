/**
 * Main
 */

const state = {
  names: null,
  width: null,
  height: null,
  size: null,
  error: null,
  updateData(names, width, height, size) {
    this.names = names;
    this.width = width;
    this.height = height;
    this.size = size;
    insertOptionsContent();
  },
  updateError(error) {
    this.error = error;
    showErrorModal();
  },
};

chrome.storage.sync.get(
  ["dataLayerNames", "windowWidth", "windowHeight", "textSize"],
  ({ dataLayerNames, windowWidth, windowHeight, textSize }) => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      state.updateData(dataLayerNames, windowWidth, windowHeight, textSize);
    }
  }
);

/**
 * Functions
 */

const insertOptionsContent = () => {
  document.querySelector("#inputs").innerHTML = createInputs(state.names);
  document.querySelector("select#width").value = state.width;
  document.querySelector("select#height").value = state.height;
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

const getWindowHeightFromSelect = () => {
  return parseInt(document.querySelector("select#height").value);
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
    const windowHeight = getWindowHeightFromSelect();
    const textSize = getTextSizeFromSelect();
    setLoadingThenExecute(saveButton, () =>
      syncWithChromeStorage({
        dataLayerNames,
        windowWidth,
        windowHeight,
        textSize,
      })
    );
  };

  const defaultsButton = document.querySelector("#defaults");
  defaultsButton.onclick = () => {
    chrome.storage.sync.get("defaults", (defaults) => {
      const {
        defaults: { dataLayerNames, windowWidth, windowHeight, textSize },
      } = defaults;
      setLoadingThenExecute(defaultsButton, () =>
        syncWithChromeStorage({
          dataLayerNames,
          windowWidth,
          windowHeight,
          textSize,
        })
      );
    });
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
