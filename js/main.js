/*
Name: David Ho
Date: 02/06/2025 
Purpose: Manipulates HTML DOM in response to user events, encodes the game 
*/ 

window.addEventListener("load",function(event){ 

    //Input fields
    let nameField = document.getElementById("nameInp");         //Name input field
    let ageField= document.getElementById("ageInp");            //Age input field
    let favCField = document.getElementById("colourInp");       //Colour input field
    let checkField =document.getElementById("confirm");         //Checkbox input field
    let checkTxt = document.getElementById("confText");         //Checkbox label input field
    let introInp = document.getElementById("introInp");         //Intro input fields

    //HTML DOM elements
    let introField = document.getElementById("intro");          //Intro Page
    let contentField = document.getElementById("content");      //Content field, has main page
    let gameBoard = document.getElementById("board");           //Get game board
    let scoreField = document.getElementById("score");          //Score HTML div
    let infoField = document.getElementById("userInfo");        //userInfo HTML div
    let finalPage = document.getElementById("final");           //Quit page
    let restart  = document.getElementById("restart");          //Restart page

    //Buttons
    let helpButton = document.getElementById("helpB");          //Help button
    let restartButton = document.getElementById("restartB");    //Restart button (back to input)
    let refreshButton = document.getElementById("refreshB");    //Refresh button, user can refresh board 
    let quitButton = document.getElementById("quitB");          //Quit button


    //Leaderbaord DOM ELEMENTS
    let leaderboardPage = document.getElementById("leaderboardPage");
    let leaderboardField = document.getElementById("leaderboard");

    //User input information
    let name, age, fc;

    let valid = true;   //Used to check if input is valid

    //Store array of all input objects
    let fields = document.querySelectorAll(".userInp");
    //Get submit button
    let submit = document.getElementById("submitB");       

    //Add event listener to all input fields
    for(let e of fields){ 
        e.addEventListener("focus",fieldClicked);
        e.addEventListener("blur",fieldUnClicked);
        e.addEventListener("keydown",subField);
    }

    submit.addEventListener("click",subField);                  //Submit page
    quitButton.addEventListener("click",quit);                  //Quit page
    restartButton.addEventListener("click",introPage);          //Back to intro  
    refreshButton.addEventListener("click",resetBoard);         //Refresh board
    helpButton.addEventListener("click",helpPage);              //Help 

   

     /**
     * Take you back to input stage
     * Refreshes all input fields and user variables
     */
     function introPage(){ 
        //Make intro visible and game hidden
        introField.style.display = "inline";        //Make intro page visible
        contentField.style.display = "none";        //Hide board
        restart.style.display = "none";             //Hide "restart" button
        finalPage.style.visibility = "hidden";      //Hide quit page 
        finalPage.innerHTML = "";                   //Clear result page data
        leaderboardPage.style.display = "none";     //Hide leaderboard

        //Enable input fields
        ageField.disabled = false;
        nameField.disabled = false;
        favCField.disabled = false;
        checkField.disabled = false;
        submit.disabled = false;

        //Refresh fields
        nameField.value = "";
        ageField.value = "";
        favCField.value = "#FFB6C1";
        checkField.checked = false;

        //Refresh user variables
        name = undefined;
        age = undefined;
        fc = undefined;

    }


    /** 
     * Gives input field focus when clicked
     * Changes background to light grey
     */
    function fieldClicked(){ 
        this.style["background-color"] = "lightgrey";
    }

    /**
     * Removes focus from input field once you leave it
     * Changes background to white
     */
    function fieldUnClicked() { 
        this.style["background-color"] = "white"; 
    }

    /**
     * Handles submitting the input fields, checks if all inputs are valid
     * @param {Event} event 
     */
    function subField(event){ 
      
        if(event.key === "Enter" || event.pointerType === "mouse"){ 
            name = nameField.value.trim();      //Remove whitespace
            age = parseInt(ageField.value);     //Convert to int 
            fc = favCField.value;               //Get favourite colour hexcode (#e6e6fa)
            
            //Refresh inputs
            nameField.classList.remove("invalidInp");
            ageField.classList.remove("invalidInp");
            checkTxt.style["color"] = "black";

            nameField.placeholder = "User Name (12 char max)";
            ageField.placeholder = "Age";
            checkTxt.innerHTML = "I agree to the rules";

            valid = true;
            

            //Invalid userName
            if(name == "" || name.length > 12){ 
                nameField.value = "";
                nameField.placeholder = "Please enter valid name (12 char max)"
                nameField.classList.add("invalidInp");
                valid = false;

            }
            
            //Invalid age
            if(isNaN(age) || age <=0){ 
                ageField.value = "";
                ageField.placeholder = "Please enter a valid age"
                ageField.classList.add("invalidInp");
                valid = false;
            }

            //Didn't click checkbox
            if(!checkField.checked){ 
                checkTxt.style["color"] = "red";
                checkTxt.innerHTML = "Please accept the rules!";
                valid = false;
                
            }

            //Valid input
            else if(valid){
                //Disable all input fields
                ageField.disabled = true;
                nameField.disabled = true;
                favCField.disabled = true;
                checkField.disabled = true;
                submit.disabled = true;

                //Call Game function 
                game();
            }
        }
       
    }

    //Get tile DOM elements
    let tileArr = Array.from(document.querySelectorAll(".tile"));   //Gets all elements belonging to class tile
    let seq = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];              //Used for indices, will shuffle this
    
    //Used for tiles
    let symbols = ["banana.jpg", "strawberry.jpg","kiwi.jpg","watermelon.jpg",  
        "dragonfruit.jpg","apple.jpg","pineapple.jpg","grapes.png"];                


    let pairs = {};                 //Store tile pair indices (matching tiles)
    let id = new Map();             //Store each tile object and it's tile pair
    let symbolMap = new Map();      //Store each tile object and it's symbol
   

    /**
     * Shuffles index array, used to generate random pairings of tiles
     * @param {Array} arr 
     * @returns shuffled array
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    function shuffle(arr){ 
        let currInd = arr.length; 
        //Shuffle
        while(currInd !=0){ 
            let randInd = Math.floor(Math.random() * currInd);
            currInd --;
            let x = arr[currInd];
            arr[currInd] = arr[randInd];
            arr[randInd] = x;
        }
        return arr;
    }

    /**
     * Create a pairing of tile indices based on input array
     * @param {Array} arr 
     * @returns pairings b/w tiles (e.x {0:2 , 1: 6 , 2:0 ...})
     */
    function generatePairs(arr){ 

        let d = {}; 
        //Generate pairs
        for(let i = 0; i < 15; i +=2){
             d[arr[i]] = arr[i+1];
            d[arr[i+1]] = arr[i];
        }
        return d;
    }


    /**
     * Creates mapping of tile objects based on generate pairs array
     * @param {Array} pairs 
     * @returns tile => tile mapping
     */
    function createMap(pairs){ 
        let map = new Map();
        for(let i = 0; i < 16; i++){ 
            let t1 = tileArr[i];
            let t2 = tileArr[pairs[i]];
            
            map.set(t1,t2);
            
        }
        return map

    }

    /**
     * Creates symbol mapping based on mapping of tile objects
     * Ensures pairs get same image
     * @param {Map} idMap 
     * @returns tile => symbol mapping
     */
    function createSymbolMap(idMap){ 
        let ind = 0;
        let symbolMap = new Map();
        for(e of idMap){ 

            //Set pairs to have same symbol
            if(symbolMap.get(e[0]) == undefined){ 
                symbolMap.set(e[0],symbols[ind]); 
                symbolMap.set(e[1], symbols[ind]);
                ind++;
            }

        } 

        return symbolMap;
    }

    //Game state variables
    let openTiles =[];  //Store tiles that have been revealed
    let openCount = 0;  //Store # of open tiles (must be <=2)
    let totalCount = 0; //Store total # of open tiles

    let mult = 5;       //Score multiplier
    let cScore = 0;     //Store current score
    let scoreArr = [];  //Store player scores
    let consBonus = 2;  //Another multplier for consecutive correct guesses
    let cons = false;   //Flag for consecutive correct guesses
    let timeId;         //Used to decrement score multiplier


    /**
     * Main game function, handles starting a new game session
     */
    function game(){ 

        introField.style.display = "none";                  //Hide intro page
        contentField.style.display = "flex";                //Make content visible
        
        //Write current user info to page
        infoField.innerHTML = "<h1>Name: " + name + "</h1>" + 
        "<h1>Age: "  + age + "</h1>";

        //Add tile event listeners
        for(e of tileArr){ 
            e.addEventListener("click",tileHandler);
            e.style["border-color"] = fc;            //Change border colour based on users fc
        }

        resetBoard();   //Reset board 
    }

    
    /**
    * Resets game board; state variables, and tile pairings are refreshed
    */
    function resetBoard(){ 
       
        //Close all tiles, and remove images
        for(let e of tileArr){ 
            e.classList.remove("open");
            e.innerHTML = "";        

        }

        //Hide game board
        gameBoard.style["visibility"] = "hidden";

        //Make visible after some time, meant to give effect that board was refreshed
        setTimeout(function(){ 
            //Close all tiles
            gameBoard.style["visibility"] = "visible";
            
        },50);

        //Finished a game
        if(cScore != 0 && totalCount == 16){ 
            scoreArr.push(cScore);  //Keep track of player scores
        }
        
        
        //Reset state variables
        cScore = 0;
        mult = 5;
        openTiles = []; 
        openCount = 0;
        totalCount = 0;
        cons = false;
        consBonus = 2;
        clearInterval(timeId);

        //Shuffles tiles and generate mappings
        symbols = shuffle(symbols);
        seq = shuffle(seq); 
        pairs = generatePairs(seq); 
        id = createMap(pairs);
        symbolMap = createSymbolMap(id);

        //Decrement point multiplier every 30s
        timeId = setInterval(scoreHandler,30000);

        scoreField.innerHTML = "Score: " + cScore;
    }

    /**
     * Handle score multiplier decrement
     * Decreases multiplier by 1 every 30s
     */
    function scoreHandler(){ 
        if(mult<=1){ 
            clearInterval(timeId); 
            mult =1;
            return;
        }
        mult-=1;
    }
    

    /**
     * Handles tile click events
     * Passes to revealTile function if valid
     * @param {event} event
     */
    function tileHandler(event){ 

        //Don't do anything if 2 tiles open or if tile is already open
        //Or if you clicked something besides main div
        if(openCount >=2 || event.target.matches(".open") || event.target != this){ 
            return;
        }

        openCount++;

        //Open tile
        revealTile(event.target);

        //2 tiles are open
        if(openCount == 2){ 

            //Check for a match
            tileMatch();


            //Wait 1.15 seconds before resetting tile count
            //Adds slight delay to when you can click new tiles
            setTimeout(function(){ 
                openCount = 0;
            },1150);
       
        }
    }


    /**
     * Reveals a tile after being clicked
     * @param {HTML element} tile 
     */
    function revealTile(tile){ 
        tile.classList.add("open");                 //Tile is open
        let temp = document.createElement("img");   //Create img element
        temp.src = "images/" + symbolMap.get(tile); //Change src to symbol
        tile.appendChild(temp);                     //Add img element to tile
        openTiles.push(tile);                       //Add tile to open tiles array
    }   

    /**
     * Checks if the 2 open tiles match
     */
    function tileMatch(){ 

        t1 = openTiles[0];
        t2 = openTiles[1];

        //Tile match
        if(t1 == id.get(t2)){

            if(cons){ 
                cScore += (100 * consBonus);
                consBonus +=1;
            }
            else if(!cons){
                consBonus = 2;  //Reset consecutive bonus
            }
            cons = true;        //Got a tile match
            

            //100 points per match * score multiplier
            cScore += (100 * mult);
            scoreField.innerHTML = "Score: " + cScore;
            totalCount += 2;     //Increment number of tiles revealed

            //All tiles revealed, reset board
            if(totalCount == 16){  

                //Reset board after 1s
                setTimeout(resetBoard,1000);
            }
        }
        else { 
            let closeTiles = openTiles;     //Store copy of openTiles
            hideTiles(closeTiles);          //Pass to hideTile function
            cons = false;                   //No match
        }

        openTiles = [];     //Reset openTiles array
    }

    /**
     * Hides the 2 open tiles if they don't match
     * @param {Array} arr 
     */
    function hideTiles(arr){ 

        //Wait 1 second before hiding tile
        setTimeout(function(){ 
            let t1 = arr[0];
            let t2 = arr[1];
            t1.classList.remove("open");
            t2.classList.remove("open");
            t1.innerHTML = "";
            t2.innerHTML = "";           
        },1000);
    }

    let rulesOpen = false;
    /**
     * Opens help page in response to clicking help button
     */
    function helpPage(){ 
        if(rulesOpen){ 
            introField.style.display = "none";
            introInp.style.display = "flex";
            rulesOpen = false;
        }else{ 
            introField.style.display = "block";
            introInp.style.display = "none";
            rulesOpen = true;
        }
    }


    /**
     * Ends the game, returns scores from all games
     */
    function quit(){ 
        introField.style.display = "none";            //Hide intro page (hides rules if open)
        introInp.style.display = "flex";              //Make buttons visible
        contentField.style.display = "none";          //Hide content 
        finalPage.style.visibility = "visible";       //Make final page visible
        restart.style.display = "flex"                //Make reset button visible
        leaderboardField.innerHTML = "";              //Reset leaderboard
        leaderboardPage.style.display = "flex";       //Make leaderboard visible

        rulesOpen = false;                            //Refresh rules open flag

        clearInterval(timeId);                        //End score decrement

        let str = "<h1>Thank you for playing " + name + "!</h1>";
        
        let i = 1;  //Used to label score

        let numGames = scoreArr.length;

        //If they played a game
        if(numGames > 0){ 

            let hs = Math.max(...scoreArr);

            str += "<p>You played a total of " +  numGames + " game(s)!</p>" ;
            for(let s of scoreArr){ 
                str += "<p>Round " + i + ") " + s + " points</p>";
                i++;
            }
            str += "<p>High score: " + hs + " points!</p>"

        }
        
        finalPage.innerHTML = str;                      //Write player results
        finalPage.style["background-color"] = "white";
    
        //Leaderboard creation
        //Kind of roundabout, but it works
        let players = storePlayers(scoreArr);          //Create array of players (object array)
        players = format(players);                     //Make array [username,score] pairs
        players = insertionSort(players);              //Sort players array
        leaderboard(players);                          //Display leaderboard

        scoreArr = [];                                 //Reset scores
    } 

    //Leaderboard code

    /**
     * Store player object for leaderboard
     * userName: players name
     * age     : players age
     * fc      : players favourite colour
     * scores  : array of all players scores
     */
    class Player { 
        constructor(userName,age,fc,scores){ 
            this.userName = userName;
            this.age = age; 
            this.fc = fc;
            this.scores = scores;
        }

    }

    /**
     * Creates a player object for current player and stores inside localStorage
     * @param {Array} scores
     * @returns array of all player objects from local storage plus new player
     */
    function storePlayers(scores){ 
        let players = [];                       //Store array of Player objects
        let p = new Player(name,age,fc,scores);
        
        //If not empty 
        if(localStorage.myIDPlayers){ 
            let player_data = JSON.parse(localStorage.myIDPlayers);
            for(let player of player_data){ 
                players.push(new Player(player.userName,player.age,player.fc,player.scores));
            }
        }
        //Add current session if played a game
        if(p.scores.length!=0){ 
            players.push(p);
        }
        localStorage.myIDPlayers = JSON.stringify(players);      //Save players to local storage
        return players;
    }

    /**
     * Returns an array of [username,score] pairs 
     * Goes through each player object, creating [username, score] pairs from 
     * each player objects scores array
     * Makes sorting easier 
     * @param {Array} players 
     * @returns array of form [ [username,score] , [username,score] ...] 
     */
    function format(players){ 
        let n = players.length;
        result = []
        for(let i = 0; i < n; i++){
            //Push entire scores array for each player
            for(let j = 0 ; j < players[i].scores.length; j++){ 
                result.push([players[i].userName,players[i].scores[j]])
            }   
        }
        return result;
    }

    /**
     * Sorts array of [username,score] pairs with respect to largest score
     * Uses insertion sort since it is easy to implement and not expecting
     * a lot of data
     * @param {Array} players 
     * @returns sorted array where larger scores are first
     */
    function insertionSort(players){
        let n = players.length;
        for(let i = 1 ; i < n ; i++){ 
            while(i > 0 && parseInt(players[i][1]) > parseInt(players[i-1][1])){ 
                let temp = players[i]; 
                players[i] = players[i-1]; 
                players[i-1] = temp;
                i--;
            }   
        }
        return players
    }
     /**
     * Creates leaderboard based on formatted players array
     * Only displays top 10
     * @param {Array} players 
     */
    function leaderboard(players){
        let i = 0; 
        //Only render first 10 
        while(i < players.length && i < 10){ 
            render(players[i]);
            i++;
        }
    }

     /**
     * Creates HTML element that is then added to leaderboard div
     * @param {Array} player 
     * player[0]: username
     * player[1]: score
     */
    function render(player){
        let li = document.createElement("li");
        let text = player[0] +  " " + player[1] + " points";
        li.innerHTML = text;
        leaderboardField.appendChild(li);

    }
});