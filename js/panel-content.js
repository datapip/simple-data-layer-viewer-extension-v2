const createLoader = () => {
  return `
      <button
        style="border: none"
        class="button is-size-1 is-large is-loading is-fullwidth"
      ></button>
    `;
};

const createRefreshButtons = () => {
  return `
    <button
      id="pause"
      class="button is-success is-light is-radiusless is-fullwidth"
    >
      Pause auto-refresh
    </button>
    <button
      id="resume"
      class="button is-hidden is-success is-radiusless is-fullwidth"
    >
      Resume auto-refresh
    </button>
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

const createTabsHeader = (data) => {
  const result = [];
  for (let key of Object.keys(data)) {
    result.push(`
      <li data-name="${key}">
        <a data-name="${key}">${key}<span class="is-circle"></span></a>
      </li>
    `);
  }
  return result.join("");
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
