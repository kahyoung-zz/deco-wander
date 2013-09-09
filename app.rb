require "sinatra"
require 'koala'

get "/" do
  redirect '/index.html'
end

get "/wander" do
  redirect '/wander/index.html'
end
