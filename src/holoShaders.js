// The same building blocks as a camera-vector/UV-offset Blender material:
// tangent-space view vector → depth-dependent UV → normal/foil response.
export const holoVertex=`
varying vec2 vUv;
varying vec3 vView;
varying vec3 vNormal;
void main(){
 vUv=uv;
 vec4 mv=modelViewMatrix*vec4(position,1.0);
 vView=-mv.xyz;
 vNormal=normalize(normalMatrix*normal);
 gl_Position=projectionMatrix*mv;
}`;
export const holoFragment=`
uniform sampler2D uMap;
uniform vec2 uLook;
uniform vec3 uTint;
uniform float uCell;
uniform float uTime;
uniform float uFoil;
uniform float uDepth;
uniform float uCutout;
varying vec2 vUv;
varying vec3 vView;
varying vec3 vNormal;
vec4 atlas(vec2 uv){return texture2D(uMap,vec2((clamp(uv.x,.002,.998)+uCell)*.5,clamp(uv.y,.002,.998)));}
float heightAt(vec2 uv){vec3 c=atlas(uv).rgb;return dot(c,vec3(.299,.587,.114));}
vec3 spectrum(float phase){return .53+.47*cos(phase+vec3(0.,2.094,4.188));}
void main(){
 vec2 uv=vUv;
 // Short, bounded parallax-occlusion traversal; cannot sample a neighboring cell.
 vec2 ray=uLook*uDepth;float layer=0.;
 for(int i=0;i<7;i++){float h=heightAt(uv);uv=vUv-ray*(layer-h*.45);layer+=.12;}
 vec4 tex=atlas(uv);
 if(uCutout>.5&&tex.a<.015)discard;
 float hx=heightAt(uv+vec2(.0018,0.))-heightAt(uv-vec2(.0018,0.));
 float hy=heightAt(uv+vec2(0.,.0018))-heightAt(uv-vec2(0.,.0018));
 vec3 N=normalize(vNormal+vec3(-hx,hy,0.)*.9);
 vec3 V=normalize(vView);
 vec3 L=normalize(vec3(-.4,.7,1.));
 float facing=clamp(dot(N,V),0.,1.);
 float fresnel=pow(1.-facing,3.);
 float spec=pow(max(dot(reflect(-L,N),V),0.),30.);
 // Angular diffraction grating, not a uniform rainbow CSS overlay.
 float grooves=(uv.x*1.8+uv.y*.8+heightAt(uv)*.55);
 float angle=dot(uLook,vec2(1.6,-.95))+.17*sin(uTime*.35);
 vec3 foil=spectrum((grooves*2.2+angle)*6.28318);
 float emboss=.5+.5*sin((uv.x-uv.y)*480.+heightAt(uv)*19.);
 float grain=fract(sin(dot(floor(uv*vec2(430.,610.)),vec2(12.9898,78.233)))*43758.5453);
 float sparkle=pow(grain,22.)*pow(max(.0,sin(angle*4.+uv.x*12.-uv.y*9.)),8.);
 float mask=.08+.38*pow(clamp(heightAt(uv),0.,1.),.6);
 vec3 color=tex.rgb*(.96+.09*dot(N,L));
 color+=foil*uFoil*(mask*(.15+.4*spec)+fresnel*.18+emboss*.035+sparkle*.28);
 color+=uTint*spec*.11;
 gl_FragColor=vec4(color,tex.a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
