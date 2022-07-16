const createLoader = () => {
  return `
      <button
        style="border: none"
        class="button is-size-1 is-large is-loading is-fullwidth"
      ></button>
    `;
};

const createTabsContainer = () => {
  return `
      <div class="tabs is-boxed mb-0">
        <ul id="tabs">
        </ul>
      </div>
      <div class="content">
        <div id="layers">
        </div>
      </div>  
    `;
};

const createTabsHeader = (tabs) => {
  return tabs
    .map(
      (tab, index) =>
        `<li data-id="${index}">
            <a>${tab.name}</a>
          </li>`
    )
    .join("");
};

const createFooter = () => {
  return `
      <div class="field has-addons m-0">
        <div class="control">
          <input class="input search is-radiusless is-borderless pr-0" type="text" placeholder="Search key or value">
          <span id="results" class="has-text-grey"></span>
        </div>
        <div class="control">
          <button id="search" class="button is-outlined is-radiusless has-text-info">▼</button>
        </div>
      </div>
      <button id="collapse" class="button is-info is-radiusless">Collapse</button>
      <button id="expand" class="button is-info is-radiusless">Expand</button>
      <button id="copy" class="button is-info is-radiusless">Copy</button>
    `;
};

const createError = (message) => {
  return `
      <div class="content mb-4">
        <blockquote>${message}</blockquote>
      </div>      
    `;
};

const createFailure = () => {
  const message = `
      Sorry, none of the <strong>declared</strong> data layers 
      could be found on this <strong>website</strong>.`;
  return createError(message);
};
