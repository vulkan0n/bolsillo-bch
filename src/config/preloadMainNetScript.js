const preloadMainNetScript = `      
  console.log('Loading up the Mainnet.cash script...')

  async function loadScript(url) {
    let response = await fetch(url);
    let script = await response.text();
    eval(script);
  }

  let scriptUrl = 'https://cdn.mainnet.cash/mainnet-0.1.7.js'
  loadScript(scriptUrl);

  true; // note: this is required, or you'll sometimes get silent failures
`;

export default preloadMainNetScript;
