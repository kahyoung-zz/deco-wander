void setup() {
  size(100, 100);
  window.setTimeout(function() {
    console.log(window.$scope);
    }, 5000);
}

void draw(){
  background(255);
   ellipse(0, 0, 100, 100);

}
