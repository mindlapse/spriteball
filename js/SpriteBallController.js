// Deps: three.js

var SpriteBallController = (function SpriteBallController() {

	var SWIPE_SPEED = 0.0001;
    var X_AXIS = new THREE.Vector3( 1, 0, 0 );
    var Y_AXIS = new THREE.Vector3( 0, 1, 0 );
    var P2 = THREE.Vector2;
    var P3 = THREE.Vector3;
    var V3 = THREE.Vector3;
    var M4 = THREE.Matrix4;

	/*
	 * spriteBallModel   : A spriteBallModel
	 * dom          : The element to attach touch listeners
	 * touchData    : A TouchData that keeps track of touch data
	 * numPoints    : The number of points in the point cloud.
	 */
	function SpriteBallController(spriteBallModel, dom, touchData, numPoints, radius) {
		this.spriteBallModel = spriteBallModel;
		this.touchData = touchData;
		this.numPoints = numPoints;
		this.radius = radius;
		dom.addEventListener("touchstart",  function(touch) {
			touchData.onTouchStart(touch);
		});
		dom.addEventListener("touchmove",   function(touch) {
			touchData.onTouchMove(touch)
		})
		function onTouchEnd(touch) {
			touchData.onTouchEnd(touch)
		}
		dom.addEventListener("touchend",    onTouchEnd);
		dom.addEventListener("touchcancel", onTouchEnd);
		dom.addEventListener("touchleave",  onTouchEnd);
	}

	_a = new P3();      // Temporary 'registers' for performance
	_b = new P3();
	_b2 = new P3();

	var Util = {

		// Computes the angle between the two unit Vector3s
		getRadians : function getRadians(v3a, v3b) {
			var dot = v3a.dot(v3b);
			var arcDistance = Math.acos(dot);

			if (arcDistance < .0001) {
				arcDistance = .0001;
			}
			return arcDistance;
		},

		/**
		 * Get the direction of the tangent towards unit3a from unit3b (both unit vectors) on a unit sphere.
		 * TODO: Not multithreaded
		 */
		getShortCircleDirection : function getShortCircleDirection(unit3a, unit3b) {

			// W = (B - (A.B)A)
			// result = W / |W|
			_a.copy(unit3a);
			_b.copy(unit3b);
			_b2.copy(unit3b);

			var W = _b.sub(_a.multiplyScalar(_a.dot(_b)));

			if (W.dot(_b2) < 0) {
				W.multiplyScalar(-1);
			}

			var len = W.length();
			if (len > 0.0001) {
				return W.clone().normalize();
			} else {
				return null;
			}
		}

	}


	SpriteBallController.prototype.applyForces = function applyForces() {
		// calculate the distance between each point
		var points = this.spriteBallModel.getVertices();
		var numPoints = this.spriteBallModel.getNumPoints();

		for (var i = 0; i < numPoints; i++) {
			var point = points[i].clone().normalize();
//                if (i != 0) continue;

			var netForce = new V3();

			for (var k = 0; k < numPoints; k++) {

				if (i == k) continue;

				var otherPoint = points[k].clone().normalize();


				// For each point pair calculate the radians between them,
				// this is the distance between them on the sphere.
				var arcDistance = Util.getRadians(point, otherPoint);

				// Calculate the tangent in the direction of the closest path
				var w = Util.getShortCircleDirection(point, otherPoint);

				if (w != null) {
					netForce.add(w.multiplyScalar(Math.PI/arcDistance));
				}
			}

			// Rotate 'point' around the axis perpendicular to the plane formed
			// by the vectors 'point' and 'netForce'.
			var forcePlaneAxis = netForce.clone().cross(point);
			var forceMagnitude = netForce.length();

			point.applyAxisAngle(forcePlaneAxis, Math.min(Math.PI/80,forceMagnitude/150000)).normalize().multiplyScalar(this.radius);    // TODO should this be negative?
			points[i] = point;
		}
		this.spriteBallModel.verticesNeedUpdate();

		return this;
	};

	SpriteBallController.prototype.updateRotation = function updateRotation() {
		var v = this.touchData.getVelocity();
		if (v) {
			var rotation = this.spriteBallModel.getRotation();
			/*
			rotation.x += v.y * SWIPE_SPEED;
			rotation.z += v.x * SWIPE_SPEED;
			*/

//                var m = new M4();
//              m.makeRotationFromEuler(rotation);


			var m = new M4();
			m.makeRotationX(v.x * SWIPE_SPEED);
			//m.makeRotationY(v.y * SWIPE_SPEED);
			var e = new THREE.Euler(0,0,0).setFromRotationMatrix(m);
			rotation.y += e.x;

			m = new M4();
			//m.makeRotationX(v.x * SWIPE_SPEED);
			m.makeRotationY(v.y * SWIPE_SPEED);
			var e = new THREE.Euler(0,0,0).setFromRotationMatrix(m);
			rotation.x += e.y;



			//rotation.x += e.y;
			//rotation.z += e.z;

		}
		return this;
	};

	return SpriteBallController;
})();
