class InputText implements Input{
  PGraphics pg;
  float x;
  float y;
  float textX;
  float textY;
  float textWidth;
  float textHeight;
  float size;
  String storedText;
  String displayText;
  String textType;
  String placeholder;
  String accessToken;
  Boolean isActive;
  
  Input tabTo;
  Input backTabTo;
  
  InputText(String type, float inputX, float inputY, int tWidth, int tHeight, float textSize, String textPlaceholder){
    textType = type;
    x = inputX;
    y = inputY;
    textWidth = tWidth;
    textHeight = tHeight;
    placeholder = textPlaceholder;
    size = textSize;
    
    storedText = "";
    displayText = "";
    isActive = false;
    textX = x + 10;
    textY = y + textHeight/2;
  }
  
  void update() {
    noFill();
    rect(x, y, textWidth, textHeight);
    textSize(size); 
    textAlign(LEFT, CENTER);
    if(isActive) {
      // This adds a line in the position of where you'll be editing
      fill(0);
      text(displayText+(frameCount/10 % 3 == 0 ? "|" : ""), textX, textY);
    } else {
     if(storedText == "" || storedText == null) {
        fill(0, 50);
        text(placeholder, textX, textY);
      } else {
        fill(0);
        text(displayText, textX, textY);
      }   
    } 
    
    if(accessToken != null){
      displayText = accessToken;
    }
  }
  
  void handleKey(char k) {
    if(isActive) {
      if(k != CODED) {
        switch(k) {
          case BACKSPACE:
            removeChar();
            break;
          case TAB:
            if(tabTo != null) {
              isActive = false;
              tabTo.setActive(true);
            }
            break;
          case ESC:
          case DELETE:
            break;
          case ENTER:
          case RETURN:
            break;
          default:
            addChar(k);
        }
      } else {
        switch(keyCode) {
          case 37:
            println("left");
            break;
          case 39:
            break;
        }
      }
    }
  }
  void addChar(char c) {
    storedText += c;
    if(textType.equals("password")) {
      displayText += "*";
    } else {
      displayText += c;
    }
  }
  
  void removeChar() {
    storedText = text.substring(0,max(0,text.length()-1));
    displayText = displayText.substring(0,max(0,displayText.length()-1));
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
  
  void setTabTo(Input tab) {
    tabTo = tab;
  }
  
  void setBackTabTo(Input tab) {
    backTabTo = tab;
  }
  
  String getText() {
    return storedText;
  }
}
