const state = {
  init: false,
  refresh: true,
  tab: null,
  index: null,
  data: {},
  error: null,
  updateIndex(index) {
    this.index = index;
    setTabsClass();
  },
  updateData(data) {
    if (this.init) {
      this.data = Object.assign(this.data, data);
      this.refresh && updateLayerContent(data);
    } else {
      this.data = data;
      this.index = Object.keys(data)[0];
      this.refresh && initialLayerContent();
    }
  },
  updateError(error) {
    this.error = error;
    insertErrorContent();
  },
};

chrome.storage.sync.get(["textSize"], ({ textSize }) => {
  if (chrome.runtime.lastError) {
    state.updateError(chrome.runtime.lastError);
  } else {
    createStyling(textSize);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "update-data-layers" && sender.tab.id === state.tab) {
    state.updateData(request.data);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const [tab] = tabs;
  state.tab = tab.id;
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["/js/panel/content_script.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        state.updateError(chrome.runtime.lastError);
      }
    }
  );
});

chrome.devtools.network.onNavigated.addListener(() => {
  location.reload();
});

const createStyling = (textSize) => {
  const size = !textSize ? `0.9em` : `${textSize / 10}em`;
  const style = document.createElement("style");
  style.innerHTML = `
        #layers pre {
          font-size: ${size} !important;
        }`;
  document.head.appendChild(style);
};

const initialLayerContent = () => {
  insertRefreshButtons();
  insertTabsContainer();
  insertTabsHeader();
  insertTabsContent();
  insertTabsFooter();
  state.init = true;
};

const updateLayerContent = (data = state.data) => {
  for (let [name, layer] of Object.entries(data)) {
    const current = document.querySelector(`pre[data-name='${name}']`);
    if (!current) return createSpecificLayerContent(name, layer);
    const scope = current.dataset.scope === "0" ? 0 : "all";
    const updated = createTabContentNode(name, layer, scope);
    updated.classList = current.classList;
    document.querySelector("#layers").replaceChild(updated, current);
    const circle = document.querySelector(`a[data-name="${name}"] span`);
    circle.classList.add("updated");
    setTimeout(() => {
      circle.classList.remove("updated");
    }, 250);
  }
};

const createSpecificLayerContent = (name, layer) => {
  insertTabHeader(name);
  insertTabContent(name, layer);
  loadTabsHeaderEventListeners();
};

const insertRefreshButtons = () => {
  document.querySelector("#refresh").innerHTML = createRefreshButtons();
  loadAutoRefreshEventListeners();
};

const insertTabsContainer = () => {
  document.querySelector("#main").innerHTML = createTabsContainer();
};

const insertTabsHeader = () => {
  for (let name of Object.keys(state.data)) {
    insertTabHeader(name);
  }
  loadTabsHeaderEventListeners();
};

const insertTabHeader = (name) => {
  const node = createTabHeaderNode(name);
  document.querySelector("#tabs").appendChild(node);
};

const createTabHeaderNode = (name) => {
  const node = document.createElement("li");
  node.innerHTML = `<a data-name="${name}">${name}<span class="is-circle"></span></a>`;
  node.dataset.name = name;
  return node;
};

const insertTabsContent = () => {
  for (let [name, data] of Object.entries(state.data)) {
    insertTabContent(name, data);
  }
  setTabsClass();
};

const insertTabContent = (name, data) => {
  const node = createTabContentNode(name, data);
  document.querySelector("#layers").appendChild(node);
};

const createTabContentNode = (name, data, scope = "all") => {
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
    JSON.parse(data)
  );
  node.dataset.name = name;
  node.dataset.scope = scope;
  return node;
};

const setTabsClass = () => {
  document.querySelectorAll(`li[data-name],pre[data-name]`).forEach((tab) => {
    if (tab.dataset.name === state.index) {
      tab.classList.add("is-active");
    } else {
      tab.classList.remove("is-active");
    }
  });
};

const insertTabsFooter = () => {
  document.querySelector("#footer").innerHTML = createFooter();
  loadTabsFooterEventListeners();
};

const insertErrorContent = () => {
  document.querySelector("#main").innerHTML = createError(state.error.message);
};

const loadAutoRefreshEventListeners = () => {
  const pause = document.querySelector("#pause");
  const resume = document.querySelector("#resume");
  pause.onclick = () => {
    state.refresh = false;
    pause.classList.add("is-hidden");
    resume.classList.remove("is-hidden");
  };
  resume.onclick = () => {
    state.refresh = true;
    updateLayerContent();
    resume.classList.add("is-hidden");
    pause.classList.remove("is-hidden");
  };
};

const loadTabsHeaderEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onclick = (element) => {
      const index = element.target.parentNode.dataset.name;
      state.updateIndex(index);
    };
  });
};

const loadTabsFooterEventListeners = () => {
  loadSearchEventListeners();

  const collapseTabsContent = (collapse) => {
    const currentNode = document.querySelector("pre.is-active");
    const newNode = createTabContentNode(
      state.index,
      state.data[state.index],
      collapse
    );
    newNode.classList.add("is-active");
    document.querySelector("#layers").replaceChild(newNode, currentNode);
  };

  document.querySelector("#collapse").onclick = () => {
    collapseTabsContent(0);
  };

  document.querySelector("#expand").onclick = () => {
    collapseTabsContent("all");
  };

  document.querySelector("#copy").onclick = () => {
    let textarea = document.createElement("textarea");
    textarea.textContent = state.data[state.index];
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.blur();
    document.body.removeChild(textarea);
  };
};

(() => {
  document.querySelector("#options").onclick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };
})();
