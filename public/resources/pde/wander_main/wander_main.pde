String appId = "568077023249265";
String appSecret = "099e3c09ed85db354999f7ebe0289bb4";
String accessToken = js_accessToken;
String userID = js_userId;

void setup() {
  size($(window).width(), $(window).height());
  console.log('hello');
  // Facebook facebook = new FacebookFactory().getInstance();
  // facebook.setOAuthAppId(appId, appSecret);
  // facebook.setOAuthAccessToken(new AccessToken(accessToken, js_accessToken));

  // try {
  //   ResponseList<Checkin> results = facebook.searchCheckins();
  //   println(results);
  // } catch(Exception e) {
  //   println("Error");
  // }
}

void draw(){
  background(255);
}
