InputText username;
InputText password;
InputButton login;

String appId = "568077023249265";
String appSecret = "099e3c09ed85db354999f7ebe0289bb4";

Boolean isLoginPage = true;

void setup() {
  size(1280, 768);
  username = new InputText("text", width/2 - 200, height/2 , 400, 40, 24, "Username");
  password = new InputText("password", width/2 - 200, height/2 + 50, 400, 40, 24, "Password");
  login = new InputButton(width/2 - 200, height/2 + 100, 400, 40, 24, "Login");
  username.setTabTo(password);
  password.setBackTabTo(username);
//  facebook.setOAuthAppId("568077023249265", "099e3c09ed85db354999f7ebe0289bb4");
//  facebook.setOAuthPermissions("user_status");
//  facebook.setOAuthAccessToken(new AccessToken("CAAIEqb0tA3EBALnMFVOIQSC5gEDdt0xZC7lcSyTEqiCZC2ddaf4iqDZCAp9K0AP1eI5bvLYyqPBXrgweevPoqmxBw6T6kHRx9XZCYswcZC3pIpMlXrwX3KwH8hXqJzZCH4S3dZCZAtUaKwtic9oWnn38WIIQpU1VFsYkF7ZAS5fF1WnFJgkLhhFZAdXZBSumTeNR7kZD", null));
//  
//  try {
//    // ResponseList<Checkin> results = facebook.searchCheckins();
//    http://graph.facebook.com/oauth/authorize?client_id=
//  } catch(Exception e) {
//    println("Error");
//  }
  
}

void draw(){
  background(255);
  if(isLoginPage) {
    username.update();
    password.update();
    login.update();
  } else {
  }
}


void loginWithFacebook(String username, String password) {
  println(username);
  println(password);
  String [] response = loadStrings("https://graph.facebook.com/oauth/authorize?client_id=" + appId + "& redirect_uri=http://www.facebook.com/connect/login_success.html& scope=publish_stream,create_event");
  println(response);
  // https://graph.facebook.com/oauth/authorize?client_id=MY_API_KEY& redirect_uri=http://www.facebook.com/connect/login_success.html& scope=publish_stream,create_event
}

void mousePressed() {
  if(isLoginPage) {
    username.check(mouseX, mouseY);
    password.check(mouseX, mouseY);
    if(login.isActive){
      loginWithFacebook(username.getText(), password.getText());
    }
  } else {
  }
}

void keyPressed() {
  if(isLoginPage) {
    switch(key) {
      case ENTER:
      case RETURN:
        loginWithFacebook(username.getText(), password.getText());
        break;
      default:
        username.handleKey(key);
        password.handleKey(key);
        break;
    }
  }
}
