const tarotCards = [
    {
        name: "愚者",
        image: "path/to/fool.jpg", // 替換成你的圖片路徑
        meaning: "新的開始、冒險",
        fortune: "今天適合展開新的計畫，但要小心衝動。",
        advice: "保持開放的心態，勇於嘗試。"
    },
    {
        name: "魔術師",
        image: "path/to/magician.jpg", // 替換成你的圖片路徑
        meaning: "創造力、行動力",
        fortune: "今天充滿能量，適合展現你的才華。",
        advice: "相信自己的能力，積極行動。"
    },
    // ... 其他塔羅牌
];

const cardSelection = document.getElementById("card-selection");
const resultDiv = document.getElementById("result");
const cardImage = document.getElementById("card-image");
const cardName = document.getElementById("card-name");
const cardMeaning = document.getElementById("card-meaning");
const fortuneAnalysis = document.getElementById("fortune-analysis");
const advice = document.getElementById("advice");

// 生成牌背
for (let i = 0; i < 3; i++) { // 先生成三張牌
    const cardBack = document.createElement("img");
    cardBack.src = "path/to/card_back.jpg"; // 替換成你的牌背圖片路徑
    cardBack.alt = "塔羅牌";
    cardBack.addEventListener("click", chooseCard);
    cardSelection.appendChild(cardBack);
}

function chooseCard() {
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    const selectedCard = tarotCards[randomIndex];

    cardImage.innerHTML = `<img src="${selectedCard.image}" alt="${selectedCard.name}">`;
    cardName.textContent = selectedCard.name;
    cardMeaning.textContent = selectedCard.meaning;
    fortuneAnalysis.textContent = selectedCard.fortune;
    advice.textContent = selectedCard.advice;

    resultDiv.classList.remove("hidden");
}