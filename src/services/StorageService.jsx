const _fakeDb = [
  {
    name: "Selene Default",
    k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
  },
  {
    name: "Selene Test",
    k: "0,139,37,23,41,12,197,140,201,25,78,42,88,40,169,182,200,34,204,193,125,7,99,180,138,12,174,158,128,225,172,61",
  },
];

function StorageService() {
  return {
    getWalletByName,
  };

  function getWalletByName(name) {
    const result = _fakeDb.find((item) => item.name == name);
    //console.log("getWalletByName", name, result);
    return result || null;
  }
}

export default StorageService;
