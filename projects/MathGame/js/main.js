var box = $("#box");
var enemy = $("#enemy");
var enemy2 = $("#enemy2");

var scoreshow = $("#score");
var number;
var number2;
var number3;
var number4;

var score = -1;

var a;
var b;
var c;

var win;
var fail;

scoreshow.empty().text(score);

// MATH

function calculate(){
	a = Math.random()*100;
	b = Math.random()*100;
	c = Math.random() * (30 - -30) + -30;
	a = Math.round(a);
	b = Math.round(b);
	c = Math.round(c);
	box.empty().text(a+"+"+b);

	win = a+b;
	fail = a+b+c;
	enemy.empty().text(win);
	enemy2.empty().text(fail);
}

calculate();
// SPAWN AND KILL
function spawn(){

	score = score +1;
	scoreshow.empty().text(score);


	number = Math.random() * 90;
	number2 = Math.random() * 90;
	number3 = Math.random() * 90;
	number4 = Math.random() * 90;


	number = Math.round(number);
	number2 = Math.round(number2);
	number3 = Math.round(number3);
	number4 = Math.round(number4);

	console.log(number, number2, number3, number4)

	calculate();

	enemy.css("left",number+"%");
	enemy.css("top",number2+"%");
	enemy2.css("left",number3+"%");
	enemy2.css("top",number4+"%");

	enemy.show();
	enemy2.show();

	collisionstart($('#enemy2'), $('#enemy'));
	collisionstart($('#enemy2'), $('#box'));
	collisionstart($('#box'), $('#enemy'));

}
spawn();

function kill(){
	enemy.hide();
	enemy2.hide();
	spawn();
}


// COLLISION CHECK
function collision($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2){
  }else{
  	kill();
  }
}
function collision2($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2){
  }else{
  	$("#fail").show();
  	setTimeout(function(){
  		$("#fail").hide();
  	},1000)
  	score = -1;
  	kill();
  	
  }
}

function collisionstart($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2){
  }else{
   	score = score - 1;
  	spawn();
  	console.log("vollide");
  }
}

// GYRO
window.ondevicemotion = function(event) {
	ax = Math.round(Math.abs(event.accelerationIncludingGravity.x * 1));
	ay = Math.round(Math.abs(event.accelerationIncludingGravity.y * 1));
	az = Math.round(Math.abs(event.accelerationIncludingGravity.z * 1));
	ai = Math.round(event.interval * 100) / 100;
	rR = event.rotationRate;
	if (rR != null) {
		arAlpha = Math.round(rR.alpha);
		arBeta = Math.round(rR.beta);
		arGamma = Math.round(rR.gamma);
	}         }

	window.ondeviceorientation = function(event) {
		alpha = Math.round(event.alpha);
		beta = Math.round(event.beta);
		gamma = Math.round(event.gamma);
		$("#enemy").empty().text("a:"+alpha);
		$("#enemy2").empty().text("b:"+beta);
		$("#box").empty().text("g:"+gamma);
		box.css("left",gamma);
		box.css("top",beta);
		collision($('#box'), $('#enemy'));
		collision2($('#box'), $('#enemy2'));
	}


