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
    loadSuccessContent();
  },
  setError(error) {
    this.error = error;
    loadFailureModal();
  },
};

(() => {
  try {
    chrome.storage.sync.get(
      ["dataLayerNames", "windowWidth", "textSize"],
      ({ dataLayerNames, windowWidth, textSize }) => {
        state.updateData(dataLayerNames, windowWidth, textSize);
      }
    );
  } catch (error) {
    state.setError(error);
  }
})();

/**
 * Functions
 */

const loadSuccessContent = () => {
  document.querySelector("#inputs").innerHTML = createInputs(state.names);
  document.querySelector("select#width").value = state.width;
  document.querySelector("select#size").value = state.size;
  loadEventListeners();
};

const loadFailureModal = () => {
  document.querySelector(".modal-content").innerHTML = createModal(
    state.error.message
  );
  document.querySelector("#close").onclick = () => {
    location.reload();
  };
  document.querySelector(".modal").classList.add("is-active");
};

const loadEventListeners = () => {
  const getDataLayerNamesFromInputs = () => {
    const inputs = [...document.querySelectorAll("input")];
    return inputs.map((input) => input.value);
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

  const syncElementsWithStorage = (object) => {
    try {
      chrome.storage.sync.set(object, () => {
        location.reload();
      });
    } catch (error) {
      state.setError(error);
    }
  };

  const saveButton = document.querySelector("#save");
  saveButton.onclick = () => {
    const dataLayerNames = getDataLayerNamesFromInputs();
    const windowWidth = getWindowWidthFromSelect();
    const textSize = getTextSizeFromSelect();
    setLoadingThenExecute(saveButton, () =>
      syncElementsWithStorage({ dataLayerNames, windowWidth, textSize })
    );
  };

  const defaultsButton = document.querySelector("#defaults");
  defaultsButton.onclick = () => {
    try {
      const dataLayerNames = [
        "dataLayer",
        "digitalData",
        "utag_data",
        "tc_vars",
        "udo",
      ];
      const windowWidth = 500;
      const textSize = 8;
      setLoadingThenExecute(defaultsButton, () =>
        syncElementsWithStorage({ dataLayerNames, windowWidth, textSize })
      );
    } catch (error) {
      state.setError(error);
    }
  };

  const updateSaveButtonStatus = () => {
    if (document.querySelectorAll("input.is-danger").length) {
      document.querySelector("#save").setAttribute("disabled", "");
    } else {
      document.querySelector("#save").removeAttribute("disabled");
    }
  };

  document.querySelectorAll("#inputs input").forEach((input) => {
    input.onkeyup = (event) => {
      if (event.target.checkValidity()) {
        event.target.classList.remove("is-danger", "has-text-danger");
      } else {
        event.target.classList.add("is-danger", "has-text-danger");
      }
      updateSaveButtonStatus();
    };
  });
};
