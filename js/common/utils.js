const utils = {
  loadOptionsListener() {
    const options = document.querySelector("#options");
    if (options) {
      options.onclick = () => {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        } else {
          window.open(chrome.runtime.getURL("/html/options.html"));
        }
      };
    }
  },
  createLayerNode(id, data, scope = "all") {
    const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
      JSON.parse(data)
    );
    node.dataset.id = id;
    node.dataset.scope = scope;
    return node;
  },
  loadSearchFunctionality() {
    if (document.querySelector("input.search")) {
      searchFunctionality();
    }
  },
  collapseLayerContent(id, data, scope) {
    const currentNode = document.querySelector("pre.is-active");
    const newNode = this.createLayerNode(id, data, scope);
    newNode.classList.add("is-active");
    document.querySelector("#layers").replaceChild(newNode, currentNode);
  },
  copyToClipboard(content) {
    let textarea = document.createElement("textarea");
    textarea.textContent = content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.blur();
    document.body.removeChild(textarea);
  },
};

utils.loadOptionsListener();

function searchFunctionality() {
  const search = {
    result: 0,
    keyword: null,
    content: null,
    matches: null,
    timer: null,
    updateResult(result) {
      this.result = result;
      scrollResultIntoView();
      displayResultInfo();
    },
    updateKeyword(keyword) {
      this.resetVisuals();
      this.keyword = keyword;
      getContent();
      getResults();
    },
    updateMatches(matches) {
      this.matches = matches;
      addResultHighlighting();
      scrollResultIntoView();
      displayResultInfo();
    },
    resetVisuals() {
      this.result = 0;
      removeResultHighlighting();
      removeResultInfo();
    },
    resetAll() {
      this.resetVisuals();
      this.keyword = null;
      this.content = null;
      this.matches = null;
      resetSearchInput();
      scrollToLocation({
        top: 0,
        left: 0,
      });
    },
  };

  const searchFor = (keyword) => {
    if (!keyword) {
      search.resetAll();
    } else {
      checkKeyword(keyword);
    }
  };

  const debounceSearch = (keyword) => {
    clearTimeout(search.timer);
    search.timer = setTimeout(() => {
      searchFor(keyword);
    }, 250);
  };

  const getContent = () => {
    const content = document.querySelectorAll(
      ` 
            pre.is-active span.key, 
            pre.is-active span.string, 
            pre.is-active span.number, 
            pre.is-active span.boolean, 
            pre.is-active span.keyword
          `
    );
    search.content = content;
  };

  const checkKeyword = (keyword) => {
    if (search.keyword !== keyword) {
      search.updateKeyword(keyword);
    } else {
      increaseResult();
    }
  };

  const increaseResult = () => {
    if (!search.matches) return;
    if (search.result + 1 === search.matches.length) {
      search.updateResult(0);
    } else {
      search.updateResult(++search.result);
    }
  };

  const getResults = () => {
    const results = [...search.content].filter((span) => {
      return span.innerHTML.indexOf(search.keyword) != -1;
    });
    if (results.length) search.updateMatches(results);
  };

  const addResultHighlighting = () => {
    search.matches.forEach((span) => {
      span.innerHTML = span.innerHTML.replace(
        search.keyword,
        `<mark>${search.keyword}</mark>`
      );
    });
  };

  const removeResultHighlighting = () => {
    if (search.matches) {
      search.matches.forEach((span) => {
        span.innerHTML = span.innerHTML.replace(
          `<mark>${search.keyword}</mark>`,
          search.keyword
        );
      });
    }
  };

  const scrollResultIntoView = () => {
    const element = search.matches[search.result];
    const yPosition = getYPosition(element.getBoundingClientRect());
    scrollToLocation({
      top: yPosition,
      left: 0,
      behavior: "smooth",
    });
  };

  const scrollToLocation = (object) => {
    document.querySelector("#layers").scrollTo(object);
  };

  const getYPosition = (spanBounds) => {
    const preBounds = document
      .querySelector("pre.is-active")
      .getBoundingClientRect();
    return spanBounds.y - preBounds.y - 20;
  };

  const displayResultInfo = () => {
    document.querySelector("#results").innerHTML = `
          ${search.result + 1} of ${search.matches.length}
        `;
  };

  const removeResultInfo = () => {
    document.querySelector("#results").innerHTML = "";
  };

  const resetSearchInput = () => {
    document.querySelector("input.search").value = "";
  };

  const loadSearchEventListeners = () => {
    document.querySelectorAll(".tabs li, #expand, #collapse").forEach((li) => {
      li.onmouseup = () => {
        search.resetAll();
      };
    });

    document.querySelector("#search").onclick = () => {
      increaseResult();
    };

    document.querySelector("input.search").onkeyup = (event) => {
      if (event.keyCode === 13) {
        increaseResult();
      } else {
        debounceSearch(event.target.value);
      }
    };
  };
  loadSearchEventListeners();
}
