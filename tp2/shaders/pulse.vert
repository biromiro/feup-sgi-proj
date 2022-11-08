
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;

varying highp vec2 vTextureCoord;
varying highp vec3 vNormal;
varying highp vec3 vEyeVec;
varying highp vec3 vFragPos;

uniform float normScale;

void main() {

	vec3 offset=vec3(0.0,0.0,0.0);
	
	vTextureCoord = aTextureCoord;
	
	offset=aVertexNormal*normScale*timeFactor;

	vec4 vertex = uMVMatrix * vec4(aVertexPosition + offset, 1.0);
	
	vEyeVec = -vec3(vertex.xyz);
	
	vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));

	vFragPos = vec3(uMVMatrix * vec4(aVertexPosition, 1.0));

	gl_Position = uPMatrix * vertex;

}

