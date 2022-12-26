precision highp float;

#define NUMBER_OF_LIGHTS 8

struct lightProperties {
    vec4 position;                  // Default: (0, 0, 1, 0)
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 half_vector;
    vec3 spot_direction;            // Default: (0, 0, -1)
    float spot_exponent;            // Default: 0 (possible values [0, 128]
    float spot_cutoff;              // Default: 180 (possible values [0, 90] or 180)
    float constant_attenuation;     // Default: 1 (value must be >= 0)
    float linear_attenuation;       // Default: 0 (value must be >= 0)
    float quadratic_attenuation;    // Default: 0 (value must be >= 0)
    bool enabled;                   // Deafult: false
};

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

uniform mat4 uPMatrix;

uniform bool uLightEnabled;
uniform bool uLightModelTwoSided;

// uniform vec4 uGlobalAmbient;

uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform materialProperties uFrontMaterial;
uniform sampler2D uSampler;
uniform float timeFactor;
uniform vec3 targetColor;

varying vec3 vNormal;
varying vec3 vLightDir[NUMBER_OF_LIGHTS];
varying vec3 vEyeVec;
varying vec2 vTextureCoord;

vec4 calcDirectionalLight(lightProperties light, vec3 E, vec3 L, vec3 N) {
    float lambertTerm = dot(N, -L);

    vec4 Ia = light.ambient * uFrontMaterial.ambient;

    vec4 Id = vec4(0.0, 0.0, 0.0, 0.0);

    vec4 Is = vec4(0.0, 0.0, 0.0, 0.0);

    if (lambertTerm > 0.0) {
        Id = light.diffuse * uFrontMaterial.diffuse * lambertTerm;

        vec3 R = reflect(L, N);
        float specular = pow( max( dot(R, E), 0.0 ), uFrontMaterial.shininess);

        Is = light.specular * uFrontMaterial.specular * specular;
    }
    return Ia + Id + Is;
}

vec4 calcPointLight(lightProperties light, vec3 lightDir, vec3 E, vec3 N) {
    float dist = length(lightDir);
    vec3 direction = normalize(lightDir);

    vec4 color = calcDirectionalLight(light, E, lightDir, N);
    float att = 1.0 / (light.constant_attenuation + light.linear_attenuation * dist + light.quadratic_attenuation * dist * dist);
    return color * att;
}

vec4 calcSpotLight(lightProperties light, vec3 lightDir, vec3 E, vec3 N)
{
    vec3 direction = normalize(lightDir);
    float spot_factor = dot(direction, light.spot_direction);

    if (spot_factor > light.spot_cutoff) {
        vec4 color = calcPointLight(light, lightDir, E, N);
        return color * (1.0 - (1.0 - spot_factor) * 1.0/(1.0 - light.spot_cutoff));
    }
    else {
        return vec4(0,0,0,0);
    }
}

vec4 lighting(vec3 E, vec3 N) {

    vec4 result = vec4(0.0, 0.0, 0.0, 1.0);

    for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
        if (uLight[i].enabled) {
            if (uLight[i].position.w == 0.0) {
                // Directional Light
                result += calcDirectionalLight(uLight[i], E, normalize(uLight[i].position.xyz), N);
            } else if (uLight[i].spot_cutoff == 180.0) {
                // Point Light
                result += calcPointLight(uLight[i], vLightDir[i], E, N) * 0.5;
            } else {
                result += calcSpotLight(uLight[i], vLightDir[i], E, N);
            }
        }
    }

    return result;
}

void main() {

    // Transformed normal position
	vec3 N = normalize(vNormal);

    vec3 E = normalize(vEyeVec);
	
	vec4 result = lighting(E, N);

	vec4 texColor = texture2D(uSampler, vTextureCoord+vec2(timeFactor*.01,0.0));
    
	vec4 color = result  + (vec4(targetColor, 1)  - result) * timeFactor;

	gl_FragColor = color * texColor;
}