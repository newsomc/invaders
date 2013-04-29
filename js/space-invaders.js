//file:///Users/hcnewsom/Sites/games/space_invaders/index.html

/**
 * Bugs: 
 *  1. Cant move and shoot at the same time.
 *  2. 
 */
(function(){

   var stats = new Stats();
   stats.setMode(0); // 0: fps, 1: ms
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.left = '1215px';
   stats.domElement.style.top = '0px';
   document.body.appendChild( stats.domElement );

   //Globals...encapsulate in an APP class.
   var canvasWidth = 780, canvasHeight = 620,
   c = document.getElementById("space-invaders"),
   ctx = c.getContext("2d"), 
   fps = 60, interval = 1000 / fps, 
   bullets = [], aliens = [], 
   particles = [],
   phase = "waiting";

	 var keyHandlers = {
		 32: 'shoot',
		 37: 'moveLeft',
		 39: 'moveRight',
     83: 'start'
	 };

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
     this.active = true;
     this.lives = 3;
   };

   User.prototype.shoot = function(){
     this.midpoint = {
       x : this.x + this.width / 2,
       y : this.y + this.height / 2
     };

     bullets.push(
       new Bullet({
         speed : 5,
         x : this.midpoint.x,
         y : this.midpoint.y
     }));
   };

   User.prototype.move = function(dir) {
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

   User.prototype.accelerate = function(friction, velocity) {
     this.friction  = friction;
     this.velocityX = velocity;
     this.velocityX *= this.friction;
     this.x += this.velocityX;
   };

   //Needs to be pulled out. Should be moved to an App handler.
   User.prototype.event = function(a, e) {
     if (a == "shoot") {
       this.shoot();
     }
     else if (a == "start"){
       phase = "playing";
     }
     else {
       this.move(a);
     }
   };
   
   User.prototype.draw = function() {
     ctx.fillStyle = this.color;
     ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   User.prototype.explode = function(x, y) {

     if(this.lives > 0){
       var particleAmt = Math.random() * 25 + 50;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random()*2*Math.PI;
         var speed = Math.random()*3 + 2;
         var life  = Math.random()*10 + 10;
         particles[particles.length] = new Particle(x, y, speed, dir, life, this.color);
       }
     }
     else if(this.lives == 0){
       this.active = false;
       var particleAmt = Math.random() * 250 + 350;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random() * 2 * Math.PI;
         var speed = Math.random() * 3 + 2;
         var life  = Math.random() * 10 + 10;
         particles[particles.length] = new Particle(x, y, speed, dir, life, this.color);
       }
     }
   };

   User.prototype.incrementScore = function() {
     this.score ++;
   };

   User.prototype.decrementLives = function() {
     this.lives --;
   };

   /**
    * Bullets.
    */
   var Bullet = function(bullet) {
     this.x = bullet.x;
     this.y = bullet.y;
     this.speed = bullet.speed;
     this.active = true;
     this.xVelocity = 0;
     this.yVelocity = -bullet.speed;
     this.width = 3;
     this.height = 3;
     this.color = "#3366FF";
   };

   Bullet.prototype.inBounds = function() {
     return this.x >= 0 && this.x <= canvasWidth && 
       this.y >= 0 && this.y <= canvasHeight;
   };
     
   Bullet.prototype.draw = function() {
     ctx.fillStyle = this.color;
     ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   Bullet.prototype.update = function() {
     this.x += this.xVelocity;
     this.y += this.yVelocity;
     this.active = this.active && this.inBounds();
   };

   /**
    * Aliens
    */
   var Alien = function(alien) {
     alien = this;
     alien.alive = true;
     alien.age = Math.floor(Math.random() * 120);
     alien.color = "#00FF00";
     alien.x = 214 / 4 + Math.random() + 214 / 2;
     alien.y = 0;
     alien.velocityX = 0;
     alien.velocityY = 2;
     alien.width = 7;
     alien.height = 3;
   };

   Alien.prototype.inBounds = function() {
     return this.x >= 0 && this.x <= canvasWidth && 
       this.y >= 0 && this.y <= canvasHeight;
   };
   
   Alien.prototype.draw = function() {
     if (this.alive) {
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     }
   };
   
   Alien.prototype.update = function() {
     this.x += this.velocityX;
     this.y += this.velocityY;
     this.velocityX = 3 * Math.sin(this.age * Math.PI / 64);
     this.age++;
     this.alive = this.alive && this.inBounds();
   };
   
   Alien.prototype.explode = function(x, y) {
     var particleAmt = Math.random()*20 + 50;
     this.alive = false;
     for (var i = 0; i < particleAmt; i++) {
       var dir = Math.random()*2*Math.PI;
       var speed = Math.random()*3 + 2;
       var life = Math.random()*10 + 10;
       particles[particles.length] = new Particle(x, y, speed, dir, life, alien.color);
     }
   };
   
   //Dealing with explosions.
   var Particle = function(x, y, speed, dir, life, color) {
     this.x = x;
     this.y = y;
     this.life = life;     
     this.color = color;
     this._incX = Math.cos(dir) * speed;
     this._incY = Math.sin(dir) * speed;
   };
   
   Particle.prototype.update = function() {
     this.x += this._incX;
     this.y += this._incY;
     this.life--;
   };

   // Start global particle fncs.
   var drawParticles = function() {
     removeParticles();
     particles.forEach(function(p){
       ctx.fillStyle = p.color;
       ctx.fillRect(p.x-1, p.y-1, 1, 1); 
       p.update();
     });
   };

   var removeParticles = function() {
     for (var l = particles.length-1, i = l; i >= 0; i--) {
       if (particles[i].life < 0) {
         particles[i] = particles[particles.length-1];
         particles.length--;
       }
     }
   };

   var animateParticles = function() {
     var t;
     var h = 0.5, w = 0.5;
     if (t != null) {
       clearTimeout(t);       
     }
     ctx.clearRect(0, 0, w, h);
     drawParticles();
     t = setTimeout(animateParticles, 33);
   };


   var App = function(){

     
   };

   var collision = function(a, b) {
     return a.x < b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y;
   };

   // This is where App should probably start. 
   var handleCollisions = function() {
     bullets.forEach(function(bullet) {
       aliens.forEach(function(alien) {
         if(collision(bullet, alien)) {
           bullet.active = false;
           alien.explode(alien.x, alien.y);
           user.incrementScore();
         }
       });
     });
  
     aliens.forEach(function(alien) {
       if(collision(alien, user)) {
         user.explode(user.x, user.y);
         //This should handled in a more advanced way...
         //user.decrementLives();
       }
     });
   };

   var update = function() {

     bullets.forEach(function(bullet){
       bullet.update();
     });

     bullets = bullets.filter(function(bullet){
       return bullet.active;
     });     

     user.accelerate(user.friction, user.velocityX);

     aliens.forEach(function(alien) {
       alien.update();
     });
     
     aliens = aliens.filter(function(alien) {
       return alien.alive;
     });
     
     if(Math.random() < 0.1) {
       aliens.push(new Alien);
     }

     handleCollisions();
   };
   
   var animate = function() {
     ctx.clearRect(0, 0, canvasWidth, canvasHeight);

     if(user.active){
       user.draw();              
     }

     bullets.forEach(function(bullet){
       bullet.draw();               
     });
     aliens.forEach(function(alien) {
       alien.draw();
     });
   };

   var mainDraw = function() {
     setTimeout(function() {
       stats.begin();
       window.requestAnimationFrame(mainDraw);
       update();
       animate();
       updateScore();
       stats.end();
     }, interval);
   };

   //Score panel
   var updateScore = function() {
     ctx.lineWidth = 0.5;
     ctx.font="9px sans-serif";
     ctx.textAlign = "right";
     ctx.textBaseline = "bottom";
     ctx.fillText("Score: " + user.score, 300, 145);     
     ctx.fillText("Lives: " + user.lives, 300, 135);     
   };

   var updateStatus = function(msg) {
     ctx.lineWidth = 0.5;
     ctx.font="9px sans-serif";
     ctx.fillText(msg, 50, 135);     
   };

   // Key handlers
	 var handleKeys = function() {
		 document.addEventListener('keydown', function(e){
		   if( keyHandlers[e.keyCode] && user.active) {
         user.event(keyHandlers[e.keyCode], e);         
       }
     });
	 };

   var user = new User;
   var alien = new Alien;

   handleKeys();
   mainDraw();
   animateParticles();

 }());
