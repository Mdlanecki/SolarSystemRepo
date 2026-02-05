precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPos;

uniform vec3 u_lightPos;
uniform vec3 u_color;

void main(){
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(u_lightPos - v_worldPos);

    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 ambient = 0.2 * u_color;
    vec3 color = u_color * diffuse + ambient;

    gl_FragColor = vec4(color, 1.0);
}