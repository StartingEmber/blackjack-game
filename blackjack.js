//login system added when clicking start
function initializeLogin() {
    document.getElementById("login-btn").addEventListener("click", function() {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        
        if (username && password) {
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            document.getElementById("player-name").textContent = username;
            
            // Initialize game after login
            document.getElementById("place-bet").addEventListener("click", placeBet);
            document.getElementById("new-round").addEventListener("click", newRound);
        } else {
            alert("Please enter both username and password!");
        }
    });
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    initializeLogin();
});


let dealerSum = 0;
let yourSum = 0;
let dealerAceCount = 0;
let yourAceCount = 0; 
let hidden;
let deck;
let canHit = true;
let bank = 1000;
let currentBet = 0;

//added confetti because we love gambling!
function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    });
}

//card animation to make it look nice, we want people to have dopamine rush
function createCardElement(card, isHidden = false) {
    let cardImg = document.createElement("img");
    cardImg.src = "./cards/" + (isHidden ? "BACK.png" : card + ".png");
    cardImg.className = "playing-card";
    if (!isHidden) {
        cardImg.style.animation = "flipInY 0.5s ease-out forwards";
    }
    return cardImg;
}
//commenting out redundent code to see if it helps
window.onload = function() {
    //document.getElementById("place-bet").addEventListener("click", placeBet);
    //document.getElementById("new-round").addEventListener("click", newRound);
}

function placeBet() {
    currentBet = parseInt(document.getElementById("bet-amount").value);
    
    if (isNaN(currentBet) || currentBet < 10) {
        alert("Minimum bet is $10");
        return;
    }
    
    if (currentBet > bank) {
        alert("You don't have enough money!");
        return;
    }
    
    bank -= currentBet;
    updateBank();
    
    document.getElementById("betting-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    
    buildDeck();
    shuffleDeck();
    startGame();
}

function newRound() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;
    currentBet = 0;
    
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';
    document.getElementById("results").innerText = '';
    document.getElementById("dealer-sum").innerText = '';
    document.getElementById("your-sum").innerText = '';
    document.getElementById("new-round").style.display = "none";
    
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
    
    document.getElementById("betting-section").style.display = "block";
    document.getElementById("game-section").style.display = "none";
}

function updateBank() {
    document.getElementById("bank").innerText = bank;
}

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function startGame() {
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);
    //modified how the cards looked when being presented
    while (dealerSum < 17) {
        let cardImg = createCardElement(card);
        let card = deck.pop();
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
}

function hit() {
    if (!canHit) {
        return;
    }
    //easier implementation and looking card animation when played
    let cardImg = createCardElement(card);
    let card = deck.pop();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
    }
}

function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    let message = "";
    let winnings = 0;
    
    if (yourSum > 21) {
        message = "You Bust! Lose $" + currentBet;
    }
        //also triggers confetti because you WIN
    else if (dealerSum > 21) {
        winnings = currentBet * 2;
        bank += winnings;
        message = "Dealer Busts! You win $" + winnings;
        triggerConfetti();
    }
    else if (yourSum == dealerSum) {
        bank += currentBet;
        message = "Tie! You get your $" + currentBet + " back";
    }
    //this else if statment triggers confetti now that when you win for extra dopamine
    else if (yourSum > dealerSum) {
        winnings = currentBet * 2;
        bank += winnings;
        message = "You Win $" + winnings + "!";
        triggerConfetti();
    }
    else if (yourSum < dealerSum) {
        message = "You Lose $" + currentBet;
    }

    updateBank();
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;
    document.getElementById("new-round").style.display = "inline-block";
}

function getValue(card) {
    let data = card.split("-");
    let value = data[0];

    if (isNaN(value)) {
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}
