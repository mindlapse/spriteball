    SpriteBallModel = (function SpriteBallModel() {

		var GREEN = new THREE.Color(0x00ff00);
		var RESERVED_VERTEX = new THREE.Vector3(0,0,-10000);
	
        function SpriteBallModel(pointCloud, numPoints, reservePoints, radius) {
            this.radius = radius;
            this.numPoints = numPoints;
			this.pointCloud = pointCloud;
			this.reserved = reservePoints;
			this.normalizedPoints = [];
			
			var vertices = pointCloud.geometry.vertices;
            for (var i = 0; i < numPoints; i++) {
				var point = this._getRandomPointOnSphere(radius);
                vertices.push(point);
				this.normalizedPoints.push(point.clone().normalize());
            }
			for (var i = 0; i < this.reserved; i++) {
				vertices.push(RESERVED_VERTEX);
				this.normalizedPoints.push(RESERVED_VERTEX.clone().normalize());
			}
			this.normalizedPoints
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
		
		proto.addSprite = function(texture) {
			if (this.reserved > 0) {
				this.reserved--;
				var pos = this._getRandomPointOnSphere(this.radius);

				var squareGeo = new THREE.Geometry();
				squareGeo.vertices.push(
					new THREE.Vector3( -1, -1, 0 ),
					new THREE.Vector3( -1, 1, 0 ),
					new THREE.Vector3( 1, 1, 0 ),
					new THREE.Vector3( 1, -1, 0),
					new THREE.Vector3( -1, -1, 0)
				);
				var squareMat = new THREE.MeshBasicMaterial( {color: 0x3366ff, map : texture} );
				var sprite = new THREE.Line( squareGeo, squareMat );
				sprite.scale.set(100, 100, 100);
				sprite.lookAt(pos);
				sprite.position.set(pos.x, pos.y, pos.z);
				
			
				this.getVertices()[this.numPoints++] = pos;
				this.verticesNeedUpdate();
				this.pointCloud.add( sprite );
			}
		}

        return SpriteBallModel;
    })();
