import cookie from 'js-cookie'

import {isFunction, updateQuery} from '../utils'


class Client
  constructor: (opts = {}) ->
    @opts =
      debug:    false
      endpoint: 'https://api.hanzo.io'
      session:
        name:    'hzo'
        expires: 7 * 24 * 3600 * 1000

    for k,v of opts
      @opts[k] = v

  getCustomerToken: ->
    if (session = cookie.getJSON @opts.session.name)?
      @customerToken = session.customerToken if session.customerToken?
    @customerToken

  setCustomerToken: (key) ->
    cookie.set @opts.session.name, {customerToken: key}, expires: @opts.session.expires
    @customerToken = key

  deleteCustomerToken: ->
    cookie.set @opts.session.name, {customerToken: null}, expires: @opts.session.expires
    @customerToken = null

  url: (url, data, key) ->
    if isFunction url
      url = url.call @, data

    updateQuery (@opts.endpoint + url), token: key

  log: (args...) ->
    args.unshift 'hanzo.js'
    if @opts.debug and console?
      console.log args...

export default Client