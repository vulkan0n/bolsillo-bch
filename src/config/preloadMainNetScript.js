// https://mainnet.cash/tutorial/#let-s-get-programming
// https://cdn.mainnet.cash/mainnet-0.5.4.js
// Retrieved 7th Aug 2022
const mainNetScript = <script src="mainNetScript.txt"></script>;

// TODO: Figure out how to load locally
// Maybe using https://github.com/IgorBelyayev/React-Native-Local-Resource

// To load from a live URL
// CAUTION: This is a big security risk
// If remote url gets hacked and fake code inserted, we get hacked too!!!!
const preloadMainNetScript = `      
  console.log('Loading up the Mainnet.cash script...')

  async function loadScript(url) {
    let response = await fetch(url);
    let script = await response.text();
    eval(script);
  }

  let scriptUrl = "https://cdn.mainnet.cash/mainnet-0.1.7.js";
  loadScript(scriptUrl);
  true; // note: this is required, or you'll sometimes get silent failures
`;

// async function loadScript(url) {
//   let response = await fetch(url);
//   let script = await response.text();
//   eval(script);
// }

// let scriptUrl = "https://cdn.mainnet.cash/mainnet-0.1.7.js";
// loadScript(scriptUrl);

export default preloadMainNetScript;
