// Deps: three.js

var TouchData = {
	isTouched       : false,
	lastTouchTime   : null,
	lastTouchPoint  : new THREE.Vector2(0,0),
	velocityInstant : null,
	velocity        : null,

	thisTouchPoint : new THREE.Vector2(0,0),
	// TODO Use intermediate vars to avoid cloning in SaveTouch        _thisPoint : new THREE.Vector2(0,0),
	// TODO        _diff : new THREE.Vector2(0,0);

	saveTouch : function saveTouch(touchEvent) {
		var touch = touchEvent.touches[0];
		var now = new Date().getTime();
		var pos = this.thisTouchPoint;
		pos.x = touch.screenX;
		pos.y = touch.screenY;

		if (this.lastTouchTime != null) {
			// The above if implies that lastTouchPoint is non-null
			var timeDelta = now - this.lastTouchTime;
			if (timeDelta > 100) {   // Go easy
				this.velocity = pos.clone().sub(this.lastTouchPoint).divideScalar(timeDelta/1000);
				this.lastTouchTime = now;
				this.lastTouchPoint.x = pos.x;
				this.lastTouchPoint.y = pos.y;
			}
		} else {
			this.lastTouchTime = now;
			this.lastTouchPoint.x = pos.x;
			this.lastTouchPoint.y = pos.y;
		}
		if (this.velocity != null) {
//                console.log("TD: " + timeDelta + " VX " + this.velocity.x + " VY " + this.velocity.y);
		}
	},

	onTouchStart : function onTouchStart(touch) {
		this.isTouched = true;
		this.saveTouch(touch);
	},

	onTouchMove : function onTouchMove(touch) {
		this.saveTouch(touch);
	},

	onTouchEnd : function onTouchEnd(touch) {
		this.reset();
	},


	getVelocity : function getVelocity() {
		return (this.isTouched) ? this.velocity : 0;
	},

	reset : function reset() {
		this.isTouched       = false;
		this.lastTouchTime   = null;
		this.velocityInstant = null;
		this.velocity        = null;
	}
};
