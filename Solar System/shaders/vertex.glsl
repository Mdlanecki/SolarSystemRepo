attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec3 v_normal;
varying vec3 v_worldPos;

void main(){
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    mat3 normalMatrix = mat3(transpose(inverse(u_model)));
    v_normal = normalize(normalMatrix * a_normal);


    gl_Position = u_projection * u_view * worldPos;
}