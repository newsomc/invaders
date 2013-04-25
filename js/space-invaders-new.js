//file:///Users/hcnewsom/Sites/games/space_invaders/index.html

/**
 * Bugs: 
 *  1. Cant move and shoot at the same time.
 */
(function(){

   var stats = new Stats();
   stats.setMode(0); // 0: fps, 1: ms
   
   // Align top-left
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.left = '1215px';
   stats.domElement.style.top = '0px';
   document.body.appendChild( stats.domElement );

   var canvasWidth = 780, canvasHeight = 620,
   c = document.getElementById("space-invaders");

   var ctx = c.getContext("2d"),
   fps = 60, interval = 1000 / fps, 
   bullets = [], aliens = [], 
   cWidth = 0.5, cHeight = 0.5, 
   stars = [];

   var User = function(){
     this.color = "#00A";
     this.x = 25;
     this.y = 125;
     this.velocityX = 0;
     this.speed = 2;
     this.width = 15;
     this.height = 5;
     this.maxSpeed = 10;
     this.friction = 0.93;
     this.score = 0;
     this.lives = 3;
   };

   User.prototype.shoot = function(){
     this.midpoint = {
         x : this.x + this.width / 2,
         y : this.y + this.height / 2
       };

     console.log(this.midpoint);
     bullets.push(
       Amo({
              speed : 5,
              x : this.midpoint.x,
              y : this.midpoint.y
       }));
   };

   User.prototype.move = function (dir) {
     this.dir = dir;
     if (this.dir === "moveLeft") {
       if (this.velocityX > -this.speed) {
         this.velocityX--;
       }
     } 
     else {
       this.velocityX++;         
     }
   };

   User.prototype.event = function(a, e){
     if (a == "shoot") {
       this.shoot();
     }
     else {
       this.move(a);
     }
   };
   
   User.prototype.draw = function(){
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   User.prototype.explode = function(){
     //some code.
   };

   User.prototype.incrementScore = function(){
       this.score ++;
   };

   var Amo = function (bullet) {
     bullet.active = true;
     bullet.xVelocity = 0;
     bullet.yVelocity = -bullet.speed;
     bullet.width = 3;
     bullet.height = 3;
     bullet.color = "#3366FF";
     
     bullet.inBounds = function() {
       return bullet.x >= 0 && bullet.x <= canvasWidth && 
         bullet.y >= 0 && bullet.y <= canvasHeight;
     };
     
     bullet.draw = function() {
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     };

     bullet.update = function() {
       bullet.x += bullet.xVelocity;
       bullet.y += bullet.yVelocity;
       bullet.active = bullet.active && bullet.inBounds();
     };

     return bullet;
   };

   var Aliens = function (alien) {
     alien = alien || {};
     alien.alive = true;
     alien.age = Math.floor(Math.random() * 120);
     alien.color = "#00FF00";
     alien.x = 214 / 4 + Math.random() + 214 / 2;
     alien.y = 0;
     alien.velocityX = 0;
     alien.velocityY = 2;
     alien.width = 7;
     alien.height = 3;

     alien.inBounds = function () {
       return alien.x >= 0 && alien.x <= canvasWidth && 
         alien.y >= 0 && alien.y <= canvasHeight;
     };
     
     alien.draw = function() {
       if(alien.alive){
         ctx.fillStyle = this.color;
         ctx.fillRect(this.x, this.y, this.width, this.height);
       }
     };
     
     alien.update = function() {
       alien.x += alien.velocityX;
       alien.y += alien.velocityY;
       alien.velocityX = 3 * Math.sin(alien.age * Math.PI / 64);
       alien.age++;
       alien.alive = alien.alive && alien.inBounds();
     };
     
     alien.explode = function(x, y) {
       var starAmt = Math.random()*20 + 50;
       for(var i = 0; i < starAmt; i++) {
         var dir = Math.random()*2*Math.PI;
         var speed = Math.random()*3 + 2;
         var life = Math.random()*10 + 10;
         stars[stars.length] = new Star(x, y, speed, dir, life);
       }
     };
      
     return alien;

   };

   function removeStars() {
     for(var l = stars.length-1, i = l; i >= 0; i--) {
       if(stars[i].life < 0) {
         stars[i] = stars[stars.length-1];
         stars.length--;
         
       }
     }
   }
   
   function Star(x, y, speed, dir, life) {
     var _this = this;
     
     this.x = x;
     this.y = y;
     
     var xInc = Math.cos(dir) * speed;
     var yInc = Math.sin(dir) * speed;
     
     this.life = life;
    
     this.update = function() {
       this.x += xInc;
       this.y += yInc;
       this.life--;        
    };
   }
   
   function star_clear() {
     ctx.clearRect(0, 0, cWidth, cHeight);
   }
   
   function star_draw() {
     
     ctx.fillStyle = "#00FF00";
     
     removeStars();
     
     for(var i = 0; i < stars.length; i++) {        
       var s = stars[i];
       ctx.fillRect(s.x-1, s.y-1, 1, 1); 
       s.update();
     }        
   }

   var t;

   function star_update() {
    if(t != null)
        clearTimeout(t);
    star_clear();
    star_draw();
    t = setTimeout(star_update, 33);
   }
   star_update();

   function collision(a, b) {
     return a.x < b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y;
   }

   function handleCollisions() {
     bullets.forEach(function(bullet) {
       aliens.forEach(function(alien) {
         if(collision(bullet, alien)) {
           bullet.active = false;


           alien.explode(alien.x, alien.y);
           user.incrementScore();
         }
       });
     });

     aliens.forEach(function(alien){
     if(collision(alien, user)){
         alien.explode();
         user.explode();
       }
     });
   }

   // Key handlers
	 var keyHandlers = {
		 32: 'shoot',
		 37: 'moveLeft',
		 39: 'moveRight'
	 };

	 function handleKeys(){
		 document.addEventListener('keydown', function(e){
		   if( keyHandlers[e.keyCode] ) {
         user.event(keyHandlers[e.keyCode], e);         
       }
     });
	 }

   function update(){

     bullets.forEach(function(bullet){
       bullet.update();
     });

     bullets = bullets.filter(function(bullet){
       return bullet.active;
     });     

     //User friction/velocity.
     user.velocityX *= user.friction;
     user.x += user.velocityX;

     //Aliens
     aliens.forEach(function(alien) {
       alien.update();
     });
     
     aliens = aliens.filter(function(alien) {
       return alien.alive;
     });
     
     if(Math.random() < 0.1) {
       aliens.push(Aliens());
     }

     handleCollisions();
   }
   
   function animate(){
     ctx.clearRect(0, 0, canvasWidth, canvasHeight);

     user.draw();

     bullets.forEach(function(bullet){
       bullet.draw();               
     });

     aliens.forEach(function(alien) {
       alien.draw();
     });
   }

   function draw() {
     setTimeout(function() {
       stats.begin();

       window.requestAnimationFrame(draw);

       update();
       animate();

       stats.end();
     }, interval);
   };

   var user = new User;
   var alien = new Aliens;
   handleKeys();
   draw();
}());
