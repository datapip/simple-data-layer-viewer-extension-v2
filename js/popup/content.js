const createNotification = () => {
  return `
    <div id="modal" class="modal is-active">
      <div class="modal-background notification-close"></div>
      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>Update</p>
            <button class="delete notification-close"></button>
          </div>
          <div class="message-body">
            <p>Hey there :) I just wanted to inform you that the Simple Data Layer Viewer 
            is now also available in the Developer tools. Just press F12 and try it.</p>
            </br>
            <p>Lastly, I would be very happy about a review or any feedback via the
            <a href="https://chrome.google.com/webstore/detail/simple-data-layer-viewer/mkdjegdakgimmckobdnfiimhgmabbido" target="_blank">Chrome Web Store</a>
            or just <a href="mailto:p.a.jaeckle@gmail.com">contact me</a> directly.</p>
            </br>
            <p>That's it, thanks and have an awesome day.</p>
            </br> 
            <div class="buttons is-centered">
              <button class="button is-info is-flex-grow-0 notification-close">Got it</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  `;
};

const createContainer = () => {
  return `
    <div class="card">
      <header class="card-header has-background-info is-radiusless">
        <p class="card-header-title has-text-light">
          Simple Data Layer Viewer
        </p>
        <a id="options">
          <img src="/img/gear.png" />
        </a>
      </header>
      <div class="card-content px-3 pt-3 pb-0">     
      </div>
      <footer id="footer" class="card-footer">
      </footer>
    </div>
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
        <input class="input search is-radiusless is-borderless pr-0" type="text" placeholder="Search key or value" autofocus>
        <span id="results" class="has-text-grey"></span>
      </div>
      <div class="control">
        <button id="search" class="button is-outlined is-radiusless has-text-info">▼</button>
      </div>
    </div>
    <button id="collapse" class="button is-info is-radiusless">Collapse</button>
    <button id="expand" class="button is-info is-radiusless">Expand</button>
    <button id="copy" class="button is-info is-radiusless">Copy</button>
    <button id="tab" class="button is-info is-radiusless"><div class="expand"></div></button>
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
