import mainNetScript from "./mainNetScript";

// https://cdn.mainnet.cash/mainnet-0.1.7.js
// Retrieved 7th Aug 2022
const preloadMainNetScript = `      
  console.log('Loading up the Mainnet.cash script...')

  eval(${mainNetScript});
  true; // note: this is required, or you'll sometimes get silent failures
`;

// To load from a live URL
// CAUTION: This is a big security risk
// If remote url gets hacked and fake code inserted, we get hacked too!!!!

// async function loadScript(url) {
//   let response = await fetch(url);
//   let script = await response.text();
//   eval(script);
// }

// let scriptUrl = "https://cdn.mainnet.cash/mainnet-0.1.7.js";
// loadScript(scriptUrl);

export default preloadMainNetScript;
