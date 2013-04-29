//file:///Users/hcnewsom/Sites/games/space_invaders/index.html

/**
 * Bugs: 
 *  1. Cant move and shoot at the same time.
 */
(function(){

   var stats = new Stats();
   stats.setMode(0); // 0: fps, 1: ms
   
   // Align stats top-left
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.left = '1215px';
   stats.domElement.style.top = '0px';
   document.body.appendChild( stats.domElement );

   var canvasWidth = 780, canvasHeight = 620,
   c = document.getElementById("space-invaders"),
   ctx = c.getContext("2d"), 
   fps = 60, interval = 1000 / fps, 
   bullets = [], aliens = [], 
   particles = [];

	 var keyHandlers = {
		 32: 'shoot',
		 37: 'moveLeft',
		 39: 'moveRight'
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
     this.lives = 3;
   };

   User.prototype.shoot = function(){
     this.midpoint = {
         x : this.x + this.width / 2,
         y : this.y + this.height / 2
       };

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

   User.prototype.decrementLives = function(){
     this.lives --;
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
       var particleAmt = Math.random()*20 + 50;
       alien.alive = false;
       for (var i = 0; i < particleAmt; i++) {
         var dir = Math.random()*2*Math.PI;
         var speed = Math.random()*3 + 2;
         var life = Math.random()*10 + 10;
         particles[particles.length] = new Particle(x, y, speed, dir, life);
       }
     };

     return alien;
   };

   //Explosions.
   var Particle = function(x, y, speed, dir, life) {

     this.x = x;
     this.y = y;
     this.life = life;     
     
     var incX = Math.cos(dir) * speed;
     var incY = Math.sin(dir) * speed;
    
     this.update = function() {
       this.x += incX;
       this.y += incY;
       this.life--;        
    };

   };
     
   var drawParticles = function() {
     ctx.fillStyle = "#00FF00";
     removeParticles();
     particles.forEach(function(p){
       ctx.fillRect(p.x-1, p.y-1, 1, 1); 
       p.update();
     });
   };

   var removeParticles = function() {
     for(var l = particles.length-1, i = l; i >= 0; i--) {
       if(particles[i].life < 0) {
         particles[i] = particles[particles.length-1];
         particles.length--;
       }
     }
   };

   var animateParticles = function() {
     var t;
     var h = 0.5, w = 0.5;
     if(t != null){
       clearTimeout(t);       
     }
     ctx.clearRect(0, 0, w, h);
     drawParticles();
     t = setTimeout(animateParticles, 33);
   };

   //Collisions.
   function collision(a, b) {
     return a.x < b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y;
   }

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

     aliens.forEach(function(alien){
       if(collision(alien, user)){
         alien.explode();
         user.explode();
         user.decrementLives();
       }
     });
   };

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
       updateScore();
       stats.end();
     }, interval);
   };

   //Score panel
   var updateScore = function(){
     ctx.lineWidth=0.5;
     ctx.font="9px sans-serif";
     ctx.textAlign = "right";
     ctx.textBaseline = "bottom";
     ctx.fillText("Score: " + user.score, 300, 145);     
     ctx.fillText("Lives: " + user.lives, 300, 135);     
   };

   // Key handlers
	 function handleKeys(){
		 document.addEventListener('keydown', function(e){
		   if( keyHandlers[e.keyCode] ) {
         user.event(keyHandlers[e.keyCode], e);         
       }
     });
	 }

   var user = new User;
   var alien = new Aliens;

   handleKeys();
   draw();
   animateParticles();

}());
