Client = require './crowdstart'

if typeof window isnt 'undefined'
  if window.Crowdstart?
    window.Crowdstart.Client  = Client
  else
    window.Crowdstart = Client: Client
else
  module.exports = Client
