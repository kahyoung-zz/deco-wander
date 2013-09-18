require "sinatra"
require 'koala'

get "/" do
  File.read(File.join('public', 'index.html'))
end

# used by Canvas apps - redirect the POST to be a regular GET
post "/" do
  redirect "/"
end
