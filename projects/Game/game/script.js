/*
    What is this game?
    
    This game has no name. If you lose, you will need to refresh
    your browser to start over. The game has 3 waves followed by a final boss. You can spend stat points
    on upgrades for your character, these upgrades include increases to health, damage and speed.
    
------------------------------------------------------
    How do I play?
    
    Use the controls WASD to move your character around the screen. Use the keys JKLI to shoot in 4
    corresponding directions.
    
-----------------------------------------------------
    Editting some code:
    
    Change cheats to false to disable the ability for the user to cheat. Set setMobile to true to
    enable the mobile gaming gui.
*/

cheats = true;
setMobile = false;

var player = {w : false,
             s : false,
             a : false,
             d : false,
             x : 304,
             y : 216,
             width : 32,
             height : 48,
             life : 1,
             mx : 0,
             my : 0,
             speed : 4,
             border : 1,
             lasers : [],
             level : 1,
             xp : 0,
             stats : {
                 life : 1,
                 dmg : 1,
                 speed : 1,
                 sp : 0
             },
             boundBreak : false
             }
var area = {x : 0,
            y : 0,
            width : 640,
            height : 480,
           background : "orange",
           enemies : [],
           lasers : [],
           wave : 1,
           remaining : 75,
           powerUps : []}
var gui = {gui : 0,
          level : 0,
          life : [0,0,0,0,0],
          statLife : 1,
          statDmg : 1,
          statSpeed : 1,
          sp : 0,
          plusa : 0,
          plusb : 0,
          plusc : 0,
          wave : 0,
          remaining : 0,
          myMobile : {
              left: 0,
              right: 0,
              up: 0,
              down: 0,
              shootLeft: 0,
              shootRight: 0,
              shootUp: 0,
              shootDown: 0
          }}

var count = 1;

var $ = function(id){
    return document.getElementById(id);
}

var start = function(){
    area.x = parseInt($("screen").style.left.slice(0, -2));
    area.y = parseInt($("screen").style.top.slice(0, -2));
    area.width = parseInt($("screen").style.width.slice(0, -2));
    area.height = parseInt($("screen").style.height.slice(0, -2));
    $("screen").style.background = area.background;
    
    player.x = area.width/2;
    player.y = area.height/2;
    $("player").style.left = player.x;
    $("player").style.top = player.y;
    $("player").style.width = player.width - 2;
    $("player").style.height = player.height - 2;
    $("player").style.borderwidth = player.border;
}

var pressed = function(e){
    if (e.key == "a"){
        player.a = true;
    }
    if (e.key == "d"){
        player.d = true;
    }
    if (e.key == "w"){
        player.w = true;
    }
    if (e.key == "s"){
        player.s = true;
    }
}

var released = function(e){
    if (e.key == "a"){
        player.a = false;
    }
    if (e.key == "d"){
        player.d = false;
    }
    if (e.key == "w"){
        player.w = false;
    }
    if (e.key == "s"){
        player.s = false;
    }
    
    if (player.life > 0){
        if (e.key == "j"){
            summonLaser(-7, 0);
        }
        if (e.key == "l"){
            summonLaser(7, 0);
        }
        if (e.key == "i"){
            summonLaser(0, -7);
        }
        if (e.key == "k"){
            summonLaser(0, 7);
        }
        
        //Cheats
        if (cheats){
            if (e.key == "4"){
                cheat(0);
            }
            if (e.key == "5"){
                cheat(1);
            }
            if (e.key == "6"){
                cheat(2);
            }
            if (e.key == "7"){
                cheat(3);
            }
            if (e.key == "0"){
                cheat(5);
            }
        }
    }
}

var time = function(){
    
    // wasd are the movement keys.
    if (player.a == true){
        player.mx -= 1;
    } else if (player.d == true){
        player.mx += 1;
    }
    if (player.w == true){
        player.my -= 1;
    } else if (player.s == true){
        player.my += 1;
    }
    
    if (player.mx != 0 || player.my != 0){
        if (player.mx != 0 && player.my != 0){
            // multiplying by .7 because at a 45% angle 1 becomes about (.7, .7)
            player.mx *= .7;
            player.my *= .7;
        }
        player.x += player.mx * player.speed;
        player.y += player.my * player.speed;
        
        // code to keep the player in the bounds of the game
        if (player.boundBreak == false){
            if (player.x > area.width - player.width){
                player.x = area.width - player.width;
            } else if (player.x < 0){
                player.x = 0;
            }
            if (player.y > area.height - player.height){
                player.y = area.height - player.height;
            } else if (player.y < 0){
                player.y = 0;
            }
        }
        
        $("player").style.left = player.x;
        $("player").style.top = player.y;
        player.mx = 0;
        player.my = 0;
    }
    
    // controls the life cycle of lasers shot by the player
    if (player.lasers.length != 0){
        for(i=0; i<player.lasers.length; i++){
            player.lasers[i].x += player.lasers[i].dx;
            player.lasers[i].y += player.lasers[i].dy;
            
            if (player.boundBreak ||
                (player.lasers[i].x < area.width - player.lasers[i].width &&
                player.lasers[i].x > 0
               && player.lasers[i].y < area.height - player.lasers[i].height && 
                player.lasers[i].y > 0)){
                player.lasers[i].laser.style.left = player.lasers[i].x;
                player.lasers[i].laser.style.top = player.lasers[i].y;
            } else {
                player.lasers[i].life = 1;
            }
            
            player.lasers[i].life -= 1;
            
            if (player.lasers[i].life <= 0){
                $("screen").removeChild(player.lasers[i].laser);
                player.lasers.splice(i, 1);
            }
        }
    }
    
    // controls the enemy
    if (area.enemies.length != 0){
        let enemy = {};
        for(i=0; i<area.enemies.length; i++){
            enemy = area.enemies[i];
            
            // logic for enemy movement
            if (count % enemy.move != 0 || (Math.random() * 3 > 1.5)){
                if (enemy.ranged <= 0 || (Math.sqrt(
                        Math.abs(enemy.x - player.x) ** 2 + 
                        Math.abs(enemy.y - player.y) ** 2) > 150)){
                    enemy.x += Math.sin(enemy.myDir) * enemy.speed;
                    enemy.y += Math.cos(enemy.myDir) * enemy.speed;
                    enemy.moving = 0;
                } else if (Math.sqrt(Math.abs(enemy.x - player.x) ** 2 + 
                        Math.abs(enemy.y - player.y) ** 2) < 75){
                    enemy.x -= Math.sin(enemy.myDir) * enemy.speed;
                    enemy.y -= Math.cos(enemy.myDir) * enemy.speed;
                    enemy.moving = 180;
                } else{
                    if (count % 75 == 3){
                        enemy.moving = Math.PI/2 * (Math.floor(Math.random() * 2) * 2 - 1);
                    }
                    enemy.x += Math.sin(enemy.myDir + enemy.moving) * enemy.speed;
                    enemy.y += Math.cos(enemy.myDir + enemy.moving) * enemy.speed;
                }
                
                if (enemy.x > area.width - enemy.width)
                    enemy.x = area.width - enemy.width;
                if (enemy.x < 0)
                    enemy.x = 0;
                if (enemy.y > area.height - enemy.height)
                    enemy.y = area.height - enemy.height;
                if (enemy.y < 0)
                    enemy.y = 0;

                enemy.enemy.style.left = enemy.x;
                enemy.enemy.style.top = enemy.y;
                
            } else{
                enemy.myDir = Math.atan2(player.y - enemy.y, enemy.x - 
                                         player.x) - Math.PI/2 - .1 + Math.random()/20;
            }
            
            // logic for shooting lasers as ranged enemies.
            if (enemy.ranged > 0 && count % enemy.ranged == 0){
                
                if (enemy.shootStyle == 0){
                    summonEnemyLaser(enemy.x + enemy.width/2, 
                                     enemy.y + enemy.height/2, 
                                     Math.atan2(player.y - enemy.y, enemy.x - 
                                            player.x) - Math.PI/2, 
                                     enemy.shootSpeed, enemy.shootSize);
                } else if (enemy.shootStyle == 1){
                    summonEnemyLaser(enemy.x + enemy.width/2, 
                                     enemy.y + enemy.height/2, 
                                     Math.atan2(player.y - enemy.y, enemy.x - 
                                            player.x) - Math.PI/2, 
                                     enemy.shootSpeed, enemy.shootSize);
                    summonEnemyLaser(enemy.x + enemy.width/2, 
                                 enemy.y + enemy.height/2, 
                                 Math.atan2(player.y - enemy.y, enemy.x - 
                                        player.x) - Math.PI/2 + Math.PI/4, 
                                 enemy.shootSpeed, enemy.shootSize);
                    summonEnemyLaser(enemy.x + enemy.width/2, 
                                 enemy.y + enemy.height/2, 
                                 Math.atan2(player.y - enemy.y, enemy.x - 
                                        player.x) - Math.PI/2 - Math.PI/4, 
                                 enemy.shootSpeed, enemy.shootSize);
                } else if (enemy.shootStyle == 2){
                    let rdir = Math.floor(Math.random() * 4);
                    for(k=0; k<8; k++){
                        summonEnemyLaser(enemy.x + enemy.width/2, 
                                 enemy.y + enemy.height/2, 
                                 (Math.PI/4*k) + (Math.PI/16 * rdir), 
                                 enemy.shootSpeed, enemy.shootSize);
                    }
                }
            }
            
            // collision with players lasers
            for(k=0; k<player.lasers.length; k++){
                if (checkCollision(player.lasers[k], enemy)){
                    enemy.life -= player.stats.dmg;
                    $("screen").removeChild(player.lasers[k].laser);
                    player.lasers.splice(k, 1);
                    break;
                }
            }
            
            // collision player
            if (checkCollision(player, enemy) && enemy.collidable){
                player.life -= 1;
                checkLifeImage();
                $("screen").removeChild(enemy.enemy);
                area.enemies.splice(i, 1);
                checkLife();
                return;
            }
            
            // enemy defeated
            if (enemy.life <= 0){
                player.xp += enemy.xp;
                if (enemy.type == 6){
                    summonPowerUp(0, enemy.x+32, enemy.y+32);
                    summonPowerUp(0, enemy.x, enemy.y+16);
                    summonPowerUp(0, enemy.x+32, enemy.y);
                    summonPowerUp(1, enemy.x+16, enemy.y+16);
                } else if (Math.floor(Math.random() * 25) == 0){
                    summonPowerUp(0, enemy.x, enemy.y);
                }
                $("screen").removeChild(enemy.enemy);
                area.enemies.splice(i, 1);
                checkLevel();
                checkWave();
            }
        }
    }
    
    // controls enemies lasers
    if (area.lasers.length != 0){
        for(i=0; i<area.lasers.length; i++){
            area.lasers[i].x += Math.sin(area.lasers[i].myDir) * area.lasers[i].speed;
            area.lasers[i].y += Math.cos(area.lasers[i].myDir) * area.lasers[i].speed;
            
            if (area.lasers[i].x < area.width - area.lasers[i].width &&
                area.lasers[i].x > 0
               && area.lasers[i].y < area.height - area.lasers[i].height && 
                area.lasers[i].y > 0){
                area.lasers[i].laser.style.left = area.lasers[i].x;
                area.lasers[i].laser.style.top = area.lasers[i].y;
            } else {
                area.lasers[i].life = 1;
            }
            
            if (checkCollision(player, area.lasers[i])){
                player.life -= 1;
                checkLifeImage();
                area.lasers[i].life = 1;
                checkLife();
            }
            
            area.lasers[i].life -= 1;
            
            if (area.lasers[i].life <= 0){
                $("screen").removeChild(area.lasers[i].laser);
                area.lasers.splice(i, 1);
            }
        }
    }
    
    // controls power ups, mostly checking for collisions and reacting
    if (area.powerUps.length != 0){
        for(i=0; i<area.powerUps.length; i++){
            if (checkCollision(player, area.powerUps[i])){
                if (area.powerUps[i].type == 0){
                    if (player.life < player.stats.life){
                        player.life += 1;
                        checkLifeImage();
                    }
                } else if (area.powerUps[i].type == 1){
                    player.stats.sp += 1;
                    gui.sp.innerText = "SP: " + player.stats.sp;
                }
                $("screen").removeChild(area.powerUps[i].powerUp);
                area.powerUps.splice(i, 1);
            }
        }
    }
    
    // logic for summoning enemies
    if (count % (170 - (area.wave * 3)) == 0){
        let type = Math.floor(Math.random() * 2);
        if (area.wave == 2){
            type = Math.floor(Math.random() * 4);
        }
        if (area.wave == 3){
            type = 2 + Math.floor(Math.random() * 4);
        }
        if (area.wave == 4){
            if (Math.floor(Math.random() * 2) == 0)
                type = 7 + Math.floor(Math.random() * 2);
            else
                type = 4 + Math.floor(Math.random() * 2);
        }
        if (area.wave == 5){
            if (Math.floor(Math.random() * 10) != 0)
                type = 7 + Math.floor(Math.random() * 5);
            else
                type = 12 + Math.floor(Math.random() * 2);
        }
        if (area.wave == 6){
                type = 9 + Math.floor(Math.random() * 5);
        }
        
        switch(Math.floor(Math.random() * 4)){
            case 0:
                summonEnemy(Math.random() * (area.width - 34), 0, type);
                break;
            case 1:
                summonEnemy(Math.random() * (area.width - 34), area.height - 34, type);
                break;
            case 2:
                summonEnemy(0, Math.random() * (area.height - 34), type);
                break;
            case 3:
                summonEnemy(area.width - 34, Math.random() * (area.height - 34), type);
                break;
        }
    }
    
    count += 1;
}

var summonEnemyLaser = function(x, y, laserDir, shootSpeed, size){
    let laser = {x : x,
                y : y,
                width : size,
                height : size,
                life : 35,
                myDir : laserDir,
                laser : document.createElement("div"),
                speed : shootSpeed
    };
    laser.laser.style.left = laser.x;
    laser.laser.style.top = laser.y;
    laser.laser.style.width = laser.width;
    laser.laser.style.height = laser.height;
    $("screen").appendChild(laser.laser);
    laser.laser.className = "enemyLaser";
    area.lasers.push(laser);
}

var summonPowerUp = function(type, x, y){
    let powerUp = {x : x,
                y : y,
                width : 32,
                height : 32,
                type : type,
                powerUp : document.createElement("div")
                };
    switch(type){
        case 0:
            powerUp.powerUp.innerHTML = "<p>+</p>";
            powerUp.powerUp.style.color = "white";
        break;
        case 1:
            powerUp.powerUp.style.backgroundColor = "blue";
            powerUp.powerUp.innerHTML = "<p>SP</p>";
        break;
    }
    
    // ensures powerups can not spawn outside of game bounds
    if (powerUp.x > area.width - powerUp.width){
        powerUp.x = area.width - powerUp.width;
    } else if (powerUp.x < 0){
        powerUp.x = 0;
    }
    if (powerUp.y > area.height - powerUp.height){
        powerUp.y = area.height - powerUp.height;
    } else if (powerUp.y < 0){
        powerUp.y = 0;
    }
    
    powerUp.powerUp.style.left = powerUp.x;
    powerUp.powerUp.style.top = powerUp.y;
    powerUp.powerUp.style.width = powerUp.width;
    powerUp.powerUp.style.height = powerUp.height;
    $("screen").appendChild(powerUp.powerUp);
    powerUp.powerUp.className = "powerUp";
    area.powerUps.push(powerUp);
}

var summonEnemy = function(x, y, type){
    let enemy = {x : x,
                y : y,
                width : 32,
                height : 32,
                life : 4,
                myDir : Math.atan2(player.y - y, x - player.x) - Math.PI/2,
                enemy : document.createElement("div"),
                type : type,
                ranged : 0,
                move : 10,
                speed : 3,
                moving : 0,
                xp : 1,
                collidable : true,
                shootSpeed : 6,
                shootStyle : 0,
                shootSize : 10
                };
    
    // change stats for different enemy types.
    switch(type){
        case 0:
            break;
        case 1:
            enemy.enemy.style.backgroundColor = "lightblue";
            enemy.ranged = 40;
            enemy.move = 20;
            enemy.speed = 2;
            enemy.life = 2;
            break;
        
        // wave 2
        case 2:
            enemy.enemy.style.backgroundColor = "darkgreen";
            enemy.move = 15;
            enemy.speed = 3;
            enemy.life = 15;
            enemy.width = 48;
            enemy.height = 48;
            enemy.xp = 2;
            break;
        case 3:
            enemy.enemy.style.backgroundColor = "darkblue";
            enemy.ranged = 60;
            enemy.move = 18;
            enemy.speed = 4;
            enemy.life = 8;
            enemy.width = 24;
            enemy.height = 24;
            enemy.xp = 2;
            break;
            
        // wave 3
        case 4:
            enemy.enemy.style.backgroundColor = "black";
            enemy.move = 10;
            enemy.speed = 5;
            enemy.life = 24;
            enemy.width = 40;
            enemy.height = 40;
            enemy.xp = 4;
            break;
        case 5:
            enemy.enemy.style.backgroundColor = "pink";
            enemy.ranged = 30;
            enemy.move = 15;
            enemy.speed = 5;
            enemy.life = 16;
            enemy.width = 32;
            enemy.height = 32;
            enemy.xp = 4;
            break;
            
        // boss
        case 6:
            enemy.enemy.style.backgroundImage = 
                "linear-gradient(30deg, white 0%, grey 50%, white 100%)";
            enemy.ranged = 90;
            enemy.move = 5;
            enemy.speed = 6;
            enemy.life = 400;
            enemy.width = 64;
            enemy.height = 64;
            enemy.xp = 200;
            enemy.shootSpeed = 8;
            enemy.shootSize = 16;
            enemy.collidable = false;
            enemy.shootStyle = 1;
            break;
            
        // wave 4
        case 7:
            enemy.enemy.style.backgroundColor = "purple";
            enemy.move = 5;
            enemy.speed = 4;
            enemy.life = 30;
            enemy.width = 42;
            enemy.height = 42;
            enemy.xp = 8;
            break;
        case 8:
            enemy.enemy.style.backgroundColor = "lightgreen";
            enemy.ranged = 25;
            enemy.move = 17;
            enemy.speed = 6;
            enemy.life = 22;
            enemy.width = 28;
            enemy.height = 28;
            enemy.xp = 8;
            enemy.shootSpeed = 7;
            break;
            
        // wave 5
        case 9:
            enemy.enemy.style.backgroundImage = "linear-gradient(90deg, black 0%, white 50%, black 100%)";
            enemy.move = 5;
            enemy.speed = 4;
            enemy.life = 40;
            enemy.width = 42;
            enemy.height = 42;
            enemy.xp = 16;
            break;
        case 10:
            enemy.enemy.style.backgroundImage = "linear-gradient(45deg, red 0%, blue 50%, black 100%)";
            enemy.ranged = 30;
            enemy.move = 12;
            enemy.speed = 7;
            enemy.life = 28;
            enemy.width = 32;
            enemy.height = 32;
            enemy.xp = 16;
            enemy.shootSpeed = 9;
            break;
        case 11:
            enemy.enemy.style.backgroundImage = "linear-gradient(120deg, purple 0%, black 50%, purple 100%)";
            enemy.ranged = 50;
            enemy.move = 25;
            enemy.speed = 6;
            enemy.life = 32;
            enemy.width = 36;
            enemy.height = 36;
            enemy.xp = 16;
            enemy.shootStyle = 2;
            enemy.shootSpeed = 5;
            break;
        case 12:
            enemy.enemy.style.backgroundImage = "linear-gradient(45deg, gray 0%, yellow 50%, lightgray 100%)";
            enemy.ranged = 40;
            enemy.move = 20;
            enemy.speed = 6;
            enemy.life = 34;
            enemy.width = 40;
            enemy.height = 40;
            enemy.xp = 20;
            enemy.shootStyle = 1;
            enemy.shootSpeed = 7;
            break;
        case 13:
            enemy.enemy.style.backgroundImage = "linear-gradient(90deg, white 0%, red 50%, purple 100%)";
            enemy.move = 5;
            enemy.speed = 8;
            enemy.life = 38;
            enemy.width = 32;
            enemy.height = 32;
            enemy.xp = 20;
            break;
    }
    
    enemy.enemy.style.left = enemy.x;
    enemy.enemy.style.top = enemy.y;
    enemy.enemy.style.width = enemy.width;
    enemy.enemy.style.height = enemy.height;
    $("screen").appendChild(enemy.enemy);
    enemy.enemy.className = "enemy";
    area.enemies.push(enemy);
}

var summonLaser = function(dx, dy){
    if (player.life > 0){
        let laser = {x : player.x + player.width/2 - 5,
                    y : player.y + player.height/2 - 5,
                    width : 10,
                    height : 10,
                    life : 45,
                    dx : dx,
                    dy : dy,
                    laser : document.createElement("div")
                    };
        laser.laser.style.left = laser.x;
        laser.laser.style.top = laser.y;
        laser.laser.style.width = laser.width;
        laser.laser.style.height = laser.height;
        $("screen").appendChild(laser.laser);
        laser.laser.className = "laser";
        player.lasers.push(laser);
    }
}

var checkLevel = function(){
    let xp = player.xp;
    let level = player.level;
    
    if (xp > 4000){
        level = 12;
    }else if (xp > 2500){
        level = 11;
    }else if (xp > 1200){
        level = 10;
    }else if (xp > 900){
        level = 9;
    }else if (xp > 650){
        level = 8;
    }else if (xp > 450){
        level = 7;
    }else if (xp > 300){
        level = 6;
    }else if (xp > 180){
        level = 5;
    }else if (xp > 100){
        level = 4;
    }else if (xp > 50){
        level = 3;
    }else if (xp > 20){
        level = 2;
    }else{
        level = 1;
    }
    
    if (player.level < level){
        player.stats.sp += level-player.level;
        gui.sp.innerText = "SP: " + player.stats.sp;
        player.level = level;
        gui.level.innerText = "Level: " + level;
    }
}

var checkWave = function(){
    let wave = area.wave;
    let remaining = area.remaining;
    remaining -= 1;
    
    if (remaining <= 0){
        if (wave == 1){
            wave = 2;
            remaining = 125;
        } else if (wave == 2){
            wave = 3;
            remaining = 200;
        } else if (wave == 3){
            wave = 4;
            remaining = 300;
            summonEnemy(area.width/2, area.height/2, 6);
        } else if (wave == 4){
            wave = 5;
            remaining = 500;
        } else if (wave == 5){
            remaining = 999;
        }
    }
    
    area.wave = wave;
    area.remaining = remaining;
    
    if (wave == 5){
        gui.wave.innerText = "Wave: END";
        gui.remaining.innerText = "Enemies remaining: ???"
    } else{
        gui.wave.innerText = "Wave: " + wave;
        gui.remaining.innerText = "Enemies remaining: " + remaining;
    }
}

var checkLife = function(){
    // checks to see if player lost.
    if (player.life <= 0){
        gui.wave.innerText = "GAME OVER";
        gui.remaining = "0";
        player.stats.sp = 0;
        player.stats.xp = 0;
        player.stats.life = 0;
        $("player").style.backgroundColor = "darkred";
    }
}

var checkCollision = function(a, b){
    // collision checking
    if (a.x > b.x - a.width && 
                    a.y > b.y - a.height
                   && a.x < b.x + b.width &&
                   a.y < b.y + b.height)
        return true;
    return false;
}

var screenClick = function(e){
    $("screen").focus();
}

var checkLifeImage = function(){
    // display up to 5 green dots representing hp
    for(j=0; j<5; j++){
        if (j >= player.life){
            gui.life[j].style.display = "none";
        } else {
            gui.life[j].style.display = "inline";
        }
    }
}

var createGUI = function(){
    gui.gui = document.createElement("div");
    $("screen").appendChild(gui.gui);
    gui.gui.setAttribute("id", "gui");
    
    // creates gui elements for the players level
    gui.level = document.createElement("h3");
    gui.gui.appendChild(gui.level);
    gui.level.className = "guiLabel";
    gui.level.innerText = "Level: " + player.level;
    
    // creates gui elements for 5 health points
    for(i=0; i<5; i++){
        gui.life[i] = document.createElement("div");
        gui.gui.appendChild(gui.life[i]);
        gui.life[i].className = "lifeImage";
        gui.life[i].style.left = 4 + (i * 16);
        
        if (i >= player.life){
            gui.life[i].style.display = "none";
        }
    }
    
    // creates gui elements for the stats
    gui.statLife = document.createElement("div");
    gui.gui.appendChild(gui.statLife);
    gui.statLife.className = "statBar";
    
    gui.statDmg = document.createElement("div");
    gui.gui.appendChild(gui.statDmg);
    gui.statDmg.className = "statBar";
    gui.statDmg.style.top = "20px";
    
    gui.statSpeed = document.createElement("div");
    gui.gui.appendChild(gui.statSpeed);
    gui.statSpeed.className = "statBar";
    gui.statSpeed.style.top = "35px";
    
    gui.sp = document.createElement("p");
    gui.gui.appendChild(gui.sp);
    gui.sp.className = "guiLabel";
    gui.sp.innerText = "SP: " + player.stats.sp;
    gui.sp.style.right = "4px";
    gui.sp.style.bottom = "4px";
    
    // creates gui elements for increasing stats
    gui.plusa = document.createElement("div");
    gui.gui.appendChild(gui.plusa);
    gui.plusa.className = "plus";
    gui.plusa.onclick = lifeIncrease;
    
    gui.plusb = document.createElement("div");
    gui.gui.appendChild(gui.plusb);
    gui.plusb.className = "plus";
    gui.plusb.onclick = dmgIncrease;
    gui.plusb.style.top = "18px";
    
    gui.plusc = document.createElement("div");
    gui.gui.appendChild(gui.plusc);
    gui.plusc.className = "plus";
    gui.plusc.onclick = speedIncrease;
    gui.plusc.style.top = "33px";
    
    // creates gui elements for the wave and remaining enemies
    gui.remaining = document.createElement("div");
    document.getElementById("screen").appendChild(gui.remaining);
    gui.remaining.className = "guiLabel";
    gui.remaining.style.top = "10px";
    gui.remaining.style.right = "20px";
    gui.remaining.innerText = "Enemies remaining: " + area.remaining;
    
    gui.wave = document.createElement("div");
    document.getElementById("screen").appendChild(gui.wave);
    gui.wave.className = "guiLabel";
    gui.wave.style.top = "32px";
    gui.wave.style.right = "70px";
    gui.wave.innerText = "Wave: " + area.wave;
}

// the following 3 functions are for increasing stats
var lifeIncrease = function(){
    if (player.stats.sp > 0 && player.stats.life < 5){
        player.life += 1;
        player.stats.life += 1;
        player.stats.sp -= 1;
        gui.statLife.style.width = player.stats.life * 16;
        gui.sp.innerText = "SP: " + player.stats.sp;
        checkLifeImage();
    }
}

var dmgIncrease = function(){
    if (player.stats.sp > 0 && player.stats.dmg < 5){
        player.stats.dmg += 1;
        player.stats.sp -= 1;
        gui.statDmg.style.width = player.stats.dmg * 16;
        gui.sp.innerText = "SP: " + player.stats.sp;
    }
}

var speedIncrease = function(){
    if (player.stats.sp > 0 && player.stats.speed < 5){
        player.stats.speed += 1;
        player.stats.sp -= 1;
        gui.statSpeed.style.width = player.stats.speed * 16;
        gui.sp.innerText = "SP: " + player.stats.sp;
        player.speed = 2 + (player.stats.speed * 2);
    }
}

// for setting up the gui for touch screen devices
var forMobile = function(e){
    gui.myMobile.left = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.left);
    gui.myMobile.left.className = "mobileButton";
    gui.myMobile.left.onmouseover = ()=>player.a = true;
    gui.myMobile.left.onmouseout = ()=>player.a = false;
    gui.myMobile.left.style.top = area.height - 114;
    gui.myMobile.left.style.left = "2px";
    
    gui.myMobile.right = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.right);
    gui.myMobile.right.className = "mobileButton";
    gui.myMobile.right.onmouseover = ()=>player.d = true;
    gui.myMobile.right.onmouseout = ()=>player.d = false;
    gui.myMobile.right.style.top = area.height - 114;
    gui.myMobile.right.style.left = "110px";
    
    gui.myMobile.up = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.up);
    gui.myMobile.up.className = "mobileButton";
    gui.myMobile.up.onmouseover = ()=>player.w = true;
    gui.myMobile.up.onmouseout = ()=>player.w = false;
    gui.myMobile.up.style.top = area.height - 168;
    gui.myMobile.up.style.left = "56px";
    
    gui.myMobile.down = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.down);
    gui.myMobile.down.className = "mobileButton";
    gui.myMobile.down.onmouseover = ()=>player.s = true;
    gui.myMobile.down.onmouseout = ()=>player.s = false;
    gui.myMobile.down.style.top = area.height - 60;
    gui.myMobile.down.style.left = "56px";
    
    gui.myMobile.shootLeft = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.shootLeft);
    gui.myMobile.shootLeft.className = "mobileButton";
    gui.myMobile.shootLeft.onmouseover = ()=>summonLaser(-7, 0);
    gui.myMobile.shootLeft.style.top = area.height - 114;
    gui.myMobile.shootLeft.style.left = area.width - 158;

    gui.myMobile.shootRight = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.shootRight);
    gui.myMobile.shootRight.className = "mobileButton";
    gui.myMobile.shootRight.onmouseover = ()=>summonLaser(7, 0);
    gui.myMobile.shootRight.style.top = area.height - 114;
    gui.myMobile.shootRight.style.left = area.width - 50;

    gui.myMobile.shootUp = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.shootUp);
    gui.myMobile.shootUp.className = "mobileButton";
    gui.myMobile.shootUp.onmouseover = ()=>summonLaser(0, -7);
    gui.myMobile.shootUp.style.top = area.height - 168;
    gui.myMobile.shootUp.style.left = area.width - 104;

    gui.myMobile.shootDown = document.createElement("div");
    gui.gui.appendChild(gui.myMobile.shootDown);
    gui.myMobile.shootDown.className = "mobileButton";
    gui.myMobile.shootDown.onmouseover = ()=>summonLaser(0, 7);
    gui.myMobile.shootDown.style.top = area.height - 60;
    gui.myMobile.shootDown.style.left = area.width - 104;
}

var onload = function(){
    createGUI();
    
    $("screen").onkeydown = pressed;
    $("screen").onkeyup = released;
    $("screen").focus();
    $("screen").onclick = screenClick;
    
    // 16.666 for 60 frames per second, 1000 = 1 second.
    setInterval(time, 17);
    start();
    
    if (setMobile == true)
        forMobile();
}

var cheat = function(type){
    switch(type){
        case 0:
            area.remaining = 1;
            checkWave();
            break;
        case 1:
            player.xp += 500;
            checkLevel();
            break;
        case 2:
            player.life += 99999;
            player.stats.life += 99999;
            checkLifeImage;
            break;
        case 3:
            player.stats.dmg += 999;
            break;
            
        case 5:
            player.boundBreak = true;
            break;
    }
}