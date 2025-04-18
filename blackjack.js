let dealerSum = 0;
let yourSum = 0;
let dealerAceCount = 0;
let yourAceCount = 0; 
let hidden;
let deck;
let canHit = true;
let bank = 1000;
let currentBet = 0;

window.onload = function() {
    document.getElementById("place-bet").addEventListener("click", placeBet);
    document.getElementById("new-round").addEventListener("click", newRound);
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

    //BEGINNING OF NEW EDIT
    // Dealer needs to deal themselves only one visible card to the dealer
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    //END OF NEW EDIT
    
    //Old code
    /*
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    */

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }
    //Added blackjack feature *you get dealt a 21 without having to do shit*
    //START OF NEW CODE
    if (yourSum == 21) {
        canHit = false;
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;

        // Reveal the dealer's hidden card
        document.getElementById("hidden").src = "./cards/" + hidden + ".png";

        //Calculate blackjack payout
        let blackjackWinnings = currentBet * 1.5;
        bank += currentBet + blackjackWinnings;

        document.getElementById("results").innerText = "BLACKJACK! You win $" + blackjackWinnings;
        document.getElementById("dealer-sum").innerText = dealerSum;
        document.getElementById("your-sum").innerText = yourSum;
        document.getElementById("new-round").style.display = "inline-block";
        updateBank();
        return;
        //END OF NEW CODE
    }
    
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
}

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
    }
}

//Adding a 'delay' function to the 'stay' function for when the dealer deals themselves cards
//Improves comprehension and makes things more smooth

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function stay() {
    //START OF NEW CODE
    //reveal hidden card
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    //dealer draws until 17 or higher
     while (reduceAce(dealerSum, dealerAceCount) < 17) {
        await delay(500); //PART ADDED FOR DELAY FUNCTION
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    //END OF NEW CODE
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    //not needed
    //document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    let message = "";
    let winnings = 0;
    
    if (yourSum > 21) {
        message = "You Bust! Lose $" + currentBet;
    }
    else if (dealerSum > 21) {
        winnings = currentBet * 2;
        bank += winnings;
        message = "Dealer Busts! You win $" + winnings;
    }
    else if (yourSum == dealerSum) {
        bank += currentBet;
        message = "Tie! You get your $" + currentBet + " back";
    }
    else if (yourSum > dealerSum) {
        winnings = currentBet * 2;
        bank += winnings;
        message = "You Win $" + winnings + "!";
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
let currentUser = null;

window.onload = function() {
    document.getElementById("login-btn").addEventListener("click", loginUser);
    document.getElementById("place-bet").addEventListener("click", placeBet);
    document.getElementById("new-round").addEventListener("click", newRound);
};

function loginUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Enter both username and password.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("blackjack_users") || "{}");

    if (!users[username]) {
        // New user signup
        users[username] = { password: password, bank: 1000 };
        localStorage.setItem("blackjack_users", JSON.stringify(users));
        alert("Account created! Logged in.");
    } else if (users[username].password !== password) {
        alert("Incorrect password.");
        return;
    }

    currentUser = username;
    bank = users[username].bank;
    updateBank();

    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
}

function updateBank() {
    document.getElementById("bank").innerText = bank;
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem("blackjack_users"));
        users[currentUser].bank = bank;
        localStorage.setItem("blackjack_users", JSON.stringify(users));
    }
}
