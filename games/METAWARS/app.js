const network = "mumbai";
const etherscanUrl = "https://mumbai.etherscan.io";
const contractAddress = "0x9125531bCd55cF69C0187445E6ff5198bFD05E43";
const abi = [
  "function addPlayer() public",
  "function getPlayerCount() public view returns (uint256)",
  "function getPlayerScore(address playerAddress) public view returns (uint256)",
  "function setPlayerScore(address playerAddress, uint256 score) public",
  "function setWinner(address winner) public",
];
const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today");
const contract = new ethers.Contract(contractAddress, abi, provider);

async function getScores() {
  const count = await contract.getPlayerCount();
  let html = "<ul>";
  for (let i = 0; i < count; i++) {
    const address = await contract.playerAddresses(i);
    const score = await contract.getPlayerScore(address);
    html += `<li>${address}: ${score}</li>`;
  }
  html += "</ul>";
  document.getElementById("scores").innerHTML = html;
}

async function addPlayer() {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  await contract.addPlayer();
  await getScores();
}

async function setScore() {
  const score = document.getElementById("scoreInput").value;
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  await contract.setPlayerScore(address, score);
  await getScores();
}

async function setWinner() {
  const winner = document.getElementById("winnerInput").value;
  await contract.setWinner(winner);
}

document.getElementById("addPlayerButton").addEventListener("click", addPlayer);
document.getElementById("setScoreButton").addEventListener("click", setScore);
document.getElementById("setWinnerButton").addEventListener("click", setWinner);

getScores();
