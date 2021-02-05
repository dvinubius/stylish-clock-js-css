const handSecond = document.querySelector('.second-hand');
const handMinute = document.querySelector('.min-hand');
const handHour = document.querySelector('.hour-hand');
var seconds = (new Date()).getSeconds();

const clockDiv = document.querySelector('.clock');
const borderDot = document.querySelector('.borderDot');

var numberBoxes;
var hotBox1;
var hotBox2;

function move() {
	const now = new Date();

	const secondsDegrees = (seconds/60*360);
	handSecond.style.transform = `rotate(${secondsDegrees}deg)`;

	const minutes = now.getMinutes();
	const minutesDegrees = (minutes/60*360 + seconds/60*6);
	handMinute.style.transform = `rotate(${minutesDegrees}deg)`;

	const hours = now.getHours();
	const hoursDegrees = (hours/12*360 + minutes/60*30);
	handHour.style.transform = `rotate(${hoursDegrees}deg) scale(0.8)`;

	updateTextDisplay(seconds % 60);

	// this is used in order to prevend the seconds reset every minute
	// when resetting, the transition in rotation back to 0 degrees makes makes
	// the hand jump back counterclockwise, looking ugly. so we keep the internal
	// second counter just incrementing on and on;
	seconds++; // update seconds
}

window.onload = function() {
	initNumberBoxes();
	setInterval(move, 1000);
	move();
	window.onresize = positionNumberBoxes;
}

/*Sets the text values in the number boxes and positions
all boxes along the clock border */
function initNumberBoxes() {
	// init Content
	numberBoxes = document.querySelectorAll('.numberBox');
	numberBoxes.forEach((box) => {
		var number = Number(box.dataset.number);
		box.querySelector('span').innerHTML = formatClockNumber(number);
	});

	// init Positioning
	positionNumberBoxes();
}

/* HELPER function
To be called once a second in order to update the positions
of the clock hands, as well as the display of the hour numbers*/
function updateTextDisplay(seconds) {
	// display the numberBoxes according to seconds hand position
	// (their opacity changes as the hand )
	updateNumberBoxes();

	// borderDot Positioning
	var borderDotSide = borderDot.offsetWidth;
  /* calculate top and left values for borderDot positioning
		- borderDotSide/2: positioning closer towards the center
		needed so that the outer margin of the borderDot
		is tangent to the outer margin of the clock border*/
	var cssPosValues = getPositionData(seconds, borderDotSide/2);
	// apply css coordinates
	borderDot.style.setProperty('left', cssPosValues.left+"px");
	borderDot.style.setProperty('top', cssPosValues.top+"px");
	//adjust for properly centered display of the dot
	borderDot.style.setProperty('transform', 'translate(-50%, -50%)');
}


/* sets the positions in the .numberBox element styles
  according to the painted clock dimensions.
	Should be called at first paint and after each resize.*/
function positionNumberBoxes() {
	numberBoxes.forEach((box) => {
		var number = Number(box.dataset.number);
		var secondsCorresponding = number*5;

 		var clockBorder = Number(getComputedStyle(clockDiv).
											getPropertyValue('border-left-width').
											replace("px", ""));
		var pullToCenter = clockBorder + box.offsetWidth*0.6;

		var cssPosValues = getPositionData(secondsCorresponding, pullToCenter);
		// apply css coordinates
		box.style.setProperty('left', cssPosValues.left+"px");
		box.style.setProperty('top', cssPosValues.top+"px");
		//adjust for properly centered display of the dot
		box.style.setProperty('transform', 'translate(-50%, -50%)');
	});
}

/* updates the display of the  number boxes-they become more visible
  when the seconds hand is close */
function updateNumberBoxes() {
	// where is the second hand right now?
	var basicSeconds = (seconds % 60);
	var number = Math.floor( basicSeconds / 5);
	var step = basicSeconds % 5;
	if (number == 0)
		number = 12;
	// need to set or to switch hotBoxes?
	if (step == 0 || !(hotBox1 && hotBox2)) { // change assigned hotBoxes
		hotBox1=document.querySelector('div[data-number=\"'+ number +'\"]');
		hotBox2=hotBox1.nextElementSibling || document.querySelector('div[data-number="1"]');
	}
	hotBox1.style.opacity = 0;
	hotBox2.style.opacity = 1;
}

/* HELPER FUNCTION
  Gets top and left values for positioning something at the outer margin
  of the clockDiv Border, in a carthesian system where the origin is
	the center of	the painted clock.
	@param seconds value at that point on the circle
			(what value would the sec hand have, when indicating
			at that point on the circle?)
	@param (optional) distance going back towards the origin,
			from the mentioned margin of the clock div border
	@return {top: number, left:number} corresponding to pixels */
function getPositionData(seconds, distanceBack) {
	// vector direction
	var handPosRadiants = -(seconds/60)*(2*Math.PI) + (0.5*Math.PI);
	var posY = Math.sin(handPosRadiants);
	var posX = Math.cos(handPosRadiants);

	// the computed style of the painted document
	var docStyle = getComputedStyle(document.documentElement);
	// the 2 below are defined in px, taking them directly from :root declaration
	var borderWidth = Number(docStyle.getPropertyValue('--clockBorder'));
	var padding = Number(docStyle.getPropertyValue('--clockPadding'));
	// take radius of the painted clock
	var clockRadiusTotal = clockDiv.offsetWidth/2;
	var clockRadiusInner = clockRadiusTotal - borderWidth;

	/* calculate fullsize coordinates
		- use the (posx, posY) vector for direction
		- optDistance: come back towards the center*/
	var optDistance = -distanceBack || 0;
	var valX = posX*(clockRadiusTotal + optDistance);
	var valY = posY*(clockRadiusTotal + optDistance);


	// calculate the top and left values for the style. calculation starts
	// inside the border-box of the clock div", so excluding the border
	var cssTop = clockRadiusInner  // go to center of the clock
							 -valY; // apply fullsize coordinates
	var cssLeft = clockRadiusInner  // go to center of the clock
							 +valX; // apply fullsize coordinates;

	return {top:cssTop, left:cssLeft};
}




/*@param number type
@return string roman numeral expressing the number*/
function formatClockNumber(number) {
	var text;
	switch (number) {
		case (12):
			text = "XII";
			break;
		case (1):
			text = "I";
			break;
		case (2):
			text = "II";
			break;
		case (3):
		 text = "III";
		 break;
		case (4):
		 text = "IV";
		 break;
		case (5):
		 text = "V";
		 break;
		case (6):
		 text = "VI";
		 break;
		case (7):
		 text = "VII";
		 break;
		case (8):
		 text = "VIII";
		 break;
		case (9):
		 text = "IX";
		 break;
		case (10):
		 text = "X";
		 break;
		case (11):
		 text = "XI";
		 break;
	}
	return text ? text : null;
}
