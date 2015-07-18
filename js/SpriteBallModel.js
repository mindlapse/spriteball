    SpriteBallModel = (function SpriteBallModel() {

		var GREEN = new THREE.Color(0x00ff00);
		var RESERVED_VERTEX = new THREE.Vector3(0,0,-10000);
	
        function SpriteBallModel(pointCloud, numPoints, reservePoints, radius) {
            this.radius = radius;
            this.numPoints = numPoints;
			this.pointCloud = pointCloud;
			this.reserved = reservePoints;
			
			var vertices = pointCloud.geometry.vertices;
            for (var i = 0; i < numPoints; i++) {
                vertices.push(this._getRandomPointOnSphere(radius));
            }
			for (var i = 0; i < this.reserved; i++) {
				vertices.push(RESERVED_VERTEX);
			}
        }
		
		var randomAngle = function() {
			return Math.random() * 2 * Math.PI;
		}

        var proto = SpriteBallModel.prototype;

        proto._getRandomPointOnSphere = function _getRandomPointOnSphere() {
            var p = X_AXIS.clone().applyAxisAngle(Y_AXIS, randomAngle());
            p.applyAxisAngle(Y_AXIS.clone().cross(p), randomAngle());
            p.multiplyScalar(this.radius);

            return p;
        };
		
		proto.eachVertex = function(elemFn) {
			var vs = this.pointCloud.geometry.vertices;
			for (var i = 0; i < this.numPoints; i++) {
				elemFn(vs[i], i);
			}
		}
		
		proto.getNumPoints = function() {
			return this.numPoints;
		}
		
		proto.getVertices = function() {
			return this.pointCloud.geometry.vertices;
		};
		
		proto.getRotation = function() {
			return this.pointCloud.rotation;
		};
		
		proto.verticesNeedUpdate = function() {
			this.pointCloud.geometry.verticesNeedUpdate = true;
		};
		
		proto.addRandomPointToSphere = function() {
			if (this.reserved > 0) {
				this.reserved--;
				this.getVertices()[this.numPoints++] = this._getRandomPointOnSphere(this.radius);
				this.verticesNeedUpdate();
			}
		}

        return SpriteBallModel;
    })();
