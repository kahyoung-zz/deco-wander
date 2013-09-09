class InputButton implements Input{
  PGraphics pg;
  float x;
  float y;
  float textX;
  float textY;
  float textWidth;
  float textHeight;
  float size;
  String placeholder;
  Boolean isActive;
  
  Input tabTo;
  Input backTabTo;
  
  InputButton(float inputX, float inputY, int tWidth, int tHeight, float textSize, String textPlaceholder){
    x = inputX;
    y = inputY;
    textWidth = tWidth;
    textHeight = tHeight;
    placeholder = textPlaceholder;
    size = textSize;
    
    textAlign(LEFT, CENTER);
    storedText = "";
    displayText = "";
    isActive = false;
    textX = x + 10;
    textY = y + textHeight/2;
  }
  
  void update() {
    check(mouseX, mouseY);
    if(isActive) {
      fill(0, 120, 0);
      cursor(HAND);
    } else {
      fill(0, 100, 0);
      cursor(ARROW);
    }
    rect(x, y, textWidth, textHeight);
    textSize(size); 
    textAlign(CENTER, CENTER);
    fill(255);
    text(placeholder, x + textWidth/2, y + textHeight/2);
  }
  
  void check(int mousex, int mousey) {
    if((mousex >= x && mousex <= x + textWidth) && (mousey >= y && mousey <= y + textHeight)) {
      isActive = true;      
    } else {
      isActive = false;
    } 
  }
  
  void setActive(Boolean change) {
    isActive = change;
  }
  
  boolean getActive() {
    return isActive;
  }
  
  void setTabTo(Input tab) {
    tabTo = tab;
  }
  
  void setBackTabTo(Input tab) {
    backTabTo = tab;
  }
}
