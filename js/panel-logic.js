const initiate = () => {
  /**
   * Main
   */

  const state = {
    tab: null,
    index: 0,
    data: null,
    error: null,
    updateIndex(index) {
      this.index = index;
      setTabsClass();
    },
    updateData(data) {
      this.data = data;
      loadContent();
    },
    updateError(error) {
      this.error = error;
      insertContainer();
      loadError();
    },
  };

  chrome.storage.sync.get(["textSize"], ({ textSize }) => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      createStyling(textSize);
    }
  });

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (
      request.message === "found-data-layers-devtools" &&
      sender.tab.id === state.tab
    ) {
      state.updateData(request.data);
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;
    state.tab = tab.id;
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["/js/content-devtools.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          state.updateError(chrome.runtime.lastError);
        }
      }
    );
  });

  /**
   * Functions
   */

  const createStyling = (textSize) => {
    const size = !textSize ? `0.9em` : `${textSize / 10}em`;
    const style = document.createElement("style");
    style.innerHTML = `
        #layers pre {
          font-size: ${size} !important;
        }`;
    document.head.appendChild(style);
  };

  const loadContent = () => {
    if (state.data.length) {
      loadLayerContent();
    } else {
      insertFailureContent();
    }
  };

  const loadError = () => {
    insertErrorContent();
  };

  const loadLayerContent = () => {
    insertTabsContainer();
    insertTabsHeader();
    insertTabsContent();
    insertTabsFooter();
  };

  const insertTabsContainer = () => {
    document.querySelector("div.card-content").innerHTML =
      createTabsContainer();
  };

  const insertTabsHeader = () => {
    document.querySelector("#tabs").innerHTML = createTabsHeader(state.data);
    loadTabsHeaderEventListeners();
  };

  const insertTabsContent = () => {
    state.data.map((data, index) => {
      const node = createTabContentNode(data.layer, index);
      document.querySelector("#layers").appendChild(node);
    });
    setTabsClass();
  };

  const createTabContentNode = (layer, index, scope = "all") => {
    const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
      JSON.parse(layer)
    );
    node.dataset.id = index;
    return node;
  };

  const setTabsClass = () => {
    document.querySelectorAll(`[data-id]`).forEach((element) => {
      if (parseInt(element.dataset.id) === state.index) {
        element.classList.add("is-active");
      } else {
        element.classList.remove("is-active");
      }
    });
  };

  // const setSearchFocus = () => {
  //   document.querySelector("input.search").focus();
  // };

  const insertTabsFooter = () => {
    document.querySelector("#footer").innerHTML = createFooter();
    loadTabsFooterEventListeners();
  };

  const insertFailureContent = () => {
    document.querySelector("div.card-content").innerHTML = createFailure();
  };

  const insertErrorContent = () => {
    document.querySelector("div.card-content").innerHTML = createError(
      state.error.message
    );
  };

  const collapseTabsContent = (collapse) => {
    const currentNode = document.querySelector("pre.is-active");
    const nodeContainer = document.querySelector("#layers");
    const newNode = createTabContentNode(
      state.data[state.index].layer,
      currentNode.dataset.id,
      collapse
    );
    newNode.classList.add("is-active");
    nodeContainer.insertBefore(newNode, currentNode);
    currentNode.remove();
  };

  /**
   * Event Listeners
   */

  const loadTabsHeaderEventListeners = () => {
    document.querySelectorAll(".tabs li").forEach((li) => {
      li.onclick = (element) => {
        const index = parseInt(element.target.parentElement.dataset.id);
        state.updateIndex(index);
      };
    });
  };

  const loadTabsFooterEventListeners = () => {
    loadSearchEventListeners();

    document.querySelector("#collapse").onclick = () => {
      collapseTabsContent(0);
    };

    document.querySelector("#expand").onclick = () => {
      collapseTabsContent("all");
    };

    document.querySelector("#copy").onclick = () => {
      let textarea = document.createElement("textarea");
      textarea.textContent = state.data[state.index].layer;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.blur();
      document.body.removeChild(textarea);
    };
  };
};
initiate();

const setLoader = () => {
  document.querySelector(".card-content").innerHTML = createLoader();
};

chrome.devtools.network.onNavigated.addListener(() => {
  setLoader();
  setTimeout(initiate, 100);
});

const loadContainerEventListeners = () => {
  document.querySelector("#options").onclick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };
  document.querySelector("#refresh").onclick = () => {
    setLoader();
    setTimeout(initiate, 100);
  };
};
loadContainerEventListeners();
